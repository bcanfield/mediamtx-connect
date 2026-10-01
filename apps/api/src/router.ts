import type { PathTrack, RecordState, Session, SessionProtocol, SessionProtocolStatus } from '@connect/contract'
import type { MediaMtxPath, MediaMtxSession } from './mediamtx'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { contract, MEDIAMTX_MIN_VERSION, SESSION_PROTOCOLS } from '@connect/contract'
import { implement, ORPCError } from '@orpc/server'
import { getAppConfig, updateAppConfig } from './config-store'
import { captureSnapshot } from './jobs'
import { logger } from './logger'
import { mediaMtxApi, MediaMtxError, mediaMtxPlayback } from './mediamtx'
import {
  latestScreenshotMtimeFor,
  latestScreenshotUrlFor,
  listStreamRecordingFiles,
  safeJoin,
  screenshotUrlFor,
  summarizeStreamRecordings,
} from './recordings-fs'

const os = implement(contract)

// Effective record state for one config entry, read in its own failure domain.
// Neither a failed read nor a missing entry (404 — deleted between the paths
// list and this call) says anything about whether MediaMTX is writing files, so
// both resolve to `unknown` rather than to a confident `off` or to the whole
// grid reading as an unreachable server.
async function recordStateFor(api: ReturnType<typeof mediaMtxApi>, confName: string): Promise<RecordState> {
  try {
    const conf = await api.configPathGet(confName)
    if (conf?.record === undefined)
      return 'unknown'
    return conf.record ? 'on' : 'off'
  }
  catch (error) {
    logger.error({ err: error, confName }, 'Failed to read record state for config entry')
    return 'unknown'
  }
}

// `tracks2` carries the codec properties, `tracks` is the bare codec list older
// servers serve instead. Only the former can answer resolution, so a path read
// off the fallback shows codecs without one rather than nothing at all.
function tracksOf(runtime: MediaMtxPath): PathTrack[] {
  if (runtime.tracks2) {
    return runtime.tracks2.map(({ codec, codecProps }) => ({
      codec: codec ?? '',
      resolution: codecProps?.width && codecProps.height
        ? `${codecProps.width}×${codecProps.height}`
        : null,
    }))
  }
  return (runtime.tracks ?? []).map(codec => ({ codec, resolution: null }))
}

// MediaMTX's default `itemsPerPage`; the lists ask for its first page only.
const SESSIONS_PAGE_SIZE = 100

// Folds one protocol's session into the shared row. SRT keeps its real
// counters in `bytesReceived`/`bytesSent` (deprecated aliases everywhere else),
// and an HLS session has no inbound counter and no state: it only ever reads.
const SESSION_STATES: readonly string[] = ['idle', 'read', 'publish']

function toSession(protocol: SessionProtocol, item: MediaMtxSession): Session {
  // A state a later MediaMTX adds reads as idle rather than failing output
  // validation for every row on the page.
  const state = protocol === 'hls'
    ? 'read'
    : SESSION_STATES.includes(item.state ?? '') ? item.state as Session['state'] : 'idle'
  return {
    id: item.id,
    protocol,
    path: item.path,
    remoteAddr: item.remoteAddr,
    state,
    inboundBytes: protocol === 'hls'
      ? null
      : (protocol === 'srt' ? item.bytesReceived : item.inboundBytes) ?? 0,
    outboundBytes: (protocol === 'srt' ? item.bytesSent : item.outboundBytes) ?? 0,
    created: new Date(item.created),
  }
}

// `v1.19.2` → [1, 19, 2]. Anything after the patch number (`-rc1`) is ignored;
// a version that doesn't start with x.y.z (`dev`) has no parts to compare.
function versionParts(version: string): [number, number, number] | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version)
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null
}

function isBelowMinimum(version: string): boolean {
  const parts = versionParts(version)
  const floor = versionParts(MEDIAMTX_MIN_VERSION)
  if (!parts || !floor)
    return false
  const [major, minor, patch] = parts
  const [minMajor, minMinor, minPatch] = floor
  if (major !== minMajor)
    return major < minMajor
  if (minor !== minMinor)
    return minor < minMinor
  return patch < minPatch
}

export const router = os.router({
  health: os.health.handler(() => ({
    status: 'ok' as const,
    uptime: process.uptime(),
  })),

  mediamtx: {
    info: os.mediamtx.info.handler(async () => {
      const config = await getAppConfig()
      try {
        const info = await mediaMtxApi(config).info()
        const version = info?.version ?? null
        return {
          version,
          started: info?.started ? new Date(info.started) : null,
          belowMinimum: version !== null && isBelowMinimum(version),
        }
      }
      catch (error) {
        logger.error({ err: error }, `Error reaching MediaMTX at: ${config.mediaMtxUrl}`)
        return null
      }
    }),
  },

  streams: {
    snapshot: os.streams.snapshot.handler(async ({ input }) => {
      try {
        await captureSnapshot(input.name)
      }
      catch (error) {
        logger.error({ err: error }, `Failed to capture snapshot for ${input.name}`)
        throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to capture snapshot' })
      }
    }),

    list: os.streams.list.handler(async () => {
      const config = await getAppConfig()
      const api = mediaMtxApi(config)

      // The only failure domain that means "MediaMTX is unreachable" — these two
      // calls and nothing else. Record-state reads and snapshot mtimes below
      // report their own failures instead of blanking the grid.
      let live: { items: MediaMtxPath[], hlsAddress: string }
      try {
        const [paths, globalConf] = await Promise.all([
          api.pathsList(),
          api.configGlobalGet(),
        ])
        live = { items: paths.items ?? [], hlsAddress: globalConf.hlsAddress ?? '' }
      }
      catch (error) {
        logger.error({ err: error }, `Error reaching MediaMTX at: ${config.mediaMtxUrl}:${config.mediaMtxApiPort}`)
        return {
          status: 'connection-error' as const,
          mediaMtxUrl: config.mediaMtxUrl,
          mediaMtxApiPort: config.mediaMtxApiPort,
        }
      }

      // Streams share a config entry — normally the one wildcard, `all_others`
      // — so resolve record state per distinct confName rather than per card
      // (ADR 0002). MediaMTX resolves path defaults into whichever entry it
      // serves, so what comes back is already effective config.
      const confNames = [...new Set(live.items.map(p => p.confName ?? ''))]
      const states = await Promise.all(confNames.map(name => recordStateFor(api, name)))
      const recordByConfName = new Map(confNames.map((name, i) => [name, states[i]]))

      return {
        status: 'connected' as const,
        streams: live.items.map(p => ({
          name: p.name ?? '',
          readyTime: p.readyTime ?? null,
          recordState: recordByConfName.get(p.confName ?? '') ?? 'unknown',
          codecs: p.tracks ?? [],
          viewers: p.readers?.length ?? 0,
          // Our own filesystem, not MediaMTX's: read out here so a disk fault
          // throws as a disk fault rather than reporting a healthy server as
          // unreachable.
          snapshotMtime: latestScreenshotMtimeFor(config, p.name ?? ''),
        })),
        hlsAddress: live.hlsAddress,
        remoteMediaMtxUrl: config.remoteMediaMtxUrl,
      }
    }),
  },

  sessions: {
    // Seven list calls per poll, one per protocol, each its own failure domain:
    // a protocol whose server is off answers 404 and the rest still list.
    list: os.sessions.list.handler(async () => {
      const config = await getAppConfig()
      const api = mediaMtxApi(config)
      const results = await Promise.allSettled(SESSION_PROTOCOLS.map(protocol => api.sessionsList(protocol)))

      // Only no HTTP answer at all means MediaMTX is unreachable.
      if (results.every(r => r.status === 'rejected' && !(r.reason instanceof MediaMtxError))) {
        logger.error({ err: (results[0] as PromiseRejectedResult).reason }, `Error reaching MediaMTX at: ${config.mediaMtxUrl}:${config.mediaMtxApiPort}`)
        return {
          status: 'connection-error' as const,
          mediaMtxUrl: config.mediaMtxUrl,
          mediaMtxApiPort: config.mediaMtxApiPort,
        }
      }

      const sessions: Session[] = []
      const protocols: SessionProtocolStatus[] = SESSION_PROTOCOLS.map((protocol, i) => {
        const result = results[i]!
        if (result.status === 'rejected') {
          if (result.reason instanceof MediaMtxError && result.reason.status === 404)
            return { protocol, status: 'disabled', truncated: false }
          logger.error({ err: result.reason, protocol }, 'Failed to list sessions')
          return { protocol, status: 'failed', truncated: false }
        }
        sessions.push(...(result.value.items ?? []).map(item => toSession(protocol, item)))
        return { protocol, status: 'listed', truncated: (result.value.pageCount ?? 0) > 1 }
      })

      // A stable order, so rows don't reshuffle between polls.
      sessions.sort((a, b) =>
        a.path.localeCompare(b.path)
        || SESSION_PROTOCOLS.indexOf(a.protocol) - SESSION_PROTOCOLS.indexOf(b.protocol)
        || a.created.getTime() - b.created.getTime(),
      )

      return { status: 'connected' as const, sessions, protocols, pageSize: SESSIONS_PAGE_SIZE }
    }),

    kick: os.sessions.kick.handler(async ({ input }) => {
      const config = await getAppConfig()
      logger.info({ protocol: input.protocol, id: input.id }, 'Kicking session')
      try {
        await mediaMtxApi(config).sessionsKick(input.protocol, input.id)
      }
      catch (error) {
        if (error instanceof MediaMtxError && error.status === 404)
          throw new ORPCError('NOT_FOUND', { message: 'Session already disconnected' })
        logger.error({ err: error }, 'Failed to kick session')
        throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to kick session' })
      }
    }),
  },

  recordings: {
    // Throws when the recordings directory is unreadable — the web app shows
    // its misconfiguration alert off the query error.
    listStreams: os.recordings.listStreams.handler(async () => {
      const config = await getAppConfig()
      const summary = summarizeStreamRecordings(config.recordingsDirectory)
      return Object.entries(summary).map(([name, s]) => ({
        name,
        count: s.count,
        latestMtime: s.latestMtime,
        screenshotUrl: latestScreenshotUrlFor(config, name),
      }))
    }),

    listForStream: os.recordings.listForStream.handler(async ({ input }) => {
      const config = await getAppConfig()
      const streamDir = safeJoin(config.recordingsDirectory, input.streamName)
      if (!streamDir || !fs.existsSync(streamDir))
        return { recordings: [], totalCount: 0 }

      const files = listStreamRecordingFiles(config.recordingsDirectory, input.streamName)
      const startIndex = (input.page - 1) * input.take
      const pageFiles = files.slice(startIndex, startIndex + input.take)

      const recordings = pageFiles.map((name) => {
        const stat = fs.statSync(path.join(streamDir, name))
        return {
          name,
          createdAt: stat.mtime,
          fileSize: stat.size,
          screenshotUrl: screenshotUrlFor(config, input.streamName, name),
        }
      })

      return { recordings, totalCount: files.length }
    }),

    // The playback server answers only with `playback` on and a path recording
    // fMP4, so both are read first and a missing one is reported, not queried.
    // The format is the path's effective one: its runtime path's entry, its own
    // entry, or path defaults when it has neither (ADR 0002).
    timeline: os.recordings.timeline.handler(async ({ input }) => {
      const config = await getAppConfig()
      const api = mediaMtxApi(config)

      let global: Awaited<ReturnType<typeof api.configGlobalGet>>
      let recordFormat: string | null
      try {
        global = await api.configGlobalGet()
        const runtime = await api.pathsGet(input.streamName)
        const conf = await api.configPathGet(runtime?.confName ?? input.streamName)
          ?? await api.configPathDefaultsGet()
        recordFormat = conf.recordFormat ?? null
      }
      catch (error) {
        logger.error({ err: error }, `Error reaching MediaMTX at: ${config.mediaMtxUrl}:${config.mediaMtxApiPort}`)
        return null
      }

      const playbackEnabled = global.playback ?? false
      if (!playbackEnabled || recordFormat !== 'fmp4')
        return { status: 'unavailable' as const, playbackEnabled, recordFormat }

      try {
        const spans = await mediaMtxPlayback(config, global.playbackAddress)
          .list(input.streamName, input.start, input.end)
        return {
          status: 'available' as const,
          spans: spans.map(span => ({ start: new Date(span.start), duration: span.duration })),
        }
      }
      catch (error) {
        logger.error({ err: error }, 'Failed to list recordings from the playback server')
        throw new ORPCError('BAD_GATEWAY', {
          message: error instanceof MediaMtxError && error.reason
            ? error.reason
            : 'Could not reach MediaMTX\'s playback server',
        })
      }
    }),
  },

  config: {
    app: {
      get: os.config.app.get.handler(async () => getAppConfig()),
      update: os.config.app.update.handler(async ({ input }) => {
        logger.info('Updating client config')
        return updateAppConfig(input)
      }),
    },

    mediamtx: {
      getGlobal: os.config.mediamtx.getGlobal.handler(async () => {
        const config = await getAppConfig()
        try {
          return await mediaMtxApi(config).configGlobalGet()
        }
        catch (error) {
          logger.error({ err: error }, `Error reaching MediaMTX at: ${config.mediaMtxUrl}`)
          return null
        }
      }),

      updateGlobal: os.config.mediamtx.updateGlobal.handler(async ({ input }) => {
        const config = await getAppConfig()
        logger.info('Updating global config')
        try {
          await mediaMtxApi(config).configGlobalPatch(input)
        }
        catch (error) {
          logger.error({ err: error }, 'Failed to update global config')
          if (error instanceof MediaMtxError && error.reason)
            throw new ORPCError('BAD_REQUEST', { message: error.reason })
          throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to update global config' })
        }
      }),

      getPathDefaults: os.config.mediamtx.getPathDefaults.handler(async () => {
        const config = await getAppConfig()
        try {
          return await mediaMtxApi(config).configPathDefaultsGet()
        }
        catch (error) {
          logger.error({ err: error }, `Error reaching MediaMTX at: ${config.mediaMtxUrl}`)
          return null
        }
      }),

      updatePathDefaults: os.config.mediamtx.updatePathDefaults.handler(async ({ input }) => {
        const config = await getAppConfig()
        logger.info('Updating path defaults')
        try {
          await mediaMtxApi(config).configPathDefaultsPatch(input)
        }
        catch (error) {
          logger.error({ err: error }, 'Failed to update path defaults')
          if (error instanceof MediaMtxError && error.reason)
            throw new ORPCError('BAD_REQUEST', { message: error.reason })
          throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to update path defaults' })
        }
      }),

      // The catalog of config entries, joined against the runtime paths so each
      // row can say whether it is live. Both reads are the same failure domain:
      // without either half a row would be missing or would claim idle.
      listPaths: os.config.mediamtx.listPaths.handler(async () => {
        const config = await getAppConfig()
        const api = mediaMtxApi(config)
        try {
          const [entries, runtime] = await Promise.all([api.configPathsList(), api.pathsList()])
          // A runtime path names the entry backing it, so a regex entry is live
          // whenever any of the paths it covers is (ADR 0002).
          const readyConfNames = new Set(
            (runtime.items ?? []).filter(p => p.ready).map(p => p.confName ?? ''),
          )
          return {
            status: 'connected' as const,
            paths: (entries.items ?? []).map((entry) => {
              const name = entry.name ?? ''
              return {
                name,
                source: entry.source ?? null,
                isRegex: name.startsWith('~'),
                active: readyConfNames.has(name),
              }
            }),
          }
        }
        catch (error) {
          logger.error({ err: error }, `Error reaching MediaMTX at: ${config.mediaMtxUrl}:${config.mediaMtxApiPort}`)
          return {
            status: 'connection-error' as const,
            mediaMtxUrl: config.mediaMtxUrl,
            mediaMtxApiPort: config.mediaMtxApiPort,
          }
        }
      }),

      // Creates an entry for a name that has none — `add`, never the
      // materialize-or-patch `updatePathConfig` does: a name already in use has
      // to fail here rather than quietly overwrite the path behind it.
      addPath: os.config.mediamtx.addPath.handler(async ({ input }) => {
        const config = await getAppConfig()
        logger.info({ path: input.name }, 'Adding path config entry')
        try {
          await mediaMtxApi(config).configPathAdd(input.name, {
            source: input.source,
            rtspTransport: input.rtspTransport,
          })
        }
        catch (error) {
          logger.error({ err: error }, 'Failed to add path')
          // A rejected create is the user's to fix, and only MediaMTX knows
          // which part it disliked — pass its own words through.
          if (error instanceof MediaMtxError && error.reason)
            throw new ORPCError('BAD_REQUEST', { message: error.reason })
          throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to add path' })
        }
      }),

      // A wildcard-backed path has no entry under its own name, so its config
      // is reached through the runtime path's confName (ADR 0002). MediaMTX
      // resolves defaults into whichever entry we read, so this is already
      // effective config.
      getPathConfig: os.config.mediamtx.getPathConfig.handler(async ({ input }) => {
        const config = await getAppConfig()
        const api = mediaMtxApi(config)
        try {
          const runtime = await api.pathsGet(input.name)
          const confName = runtime?.confName ?? input.name
          const conf = await api.configPathGet(confName)
          // Neither lookup landed: no runtime path to read a confName off, and
          // no entry under the path's own name. Nothing to resolve — MediaMTX
          // won't say which wildcard entry would cover a name it isn't running.
          if (!conf)
            return { status: 'unresolved' as const }
          return { status: 'resolved' as const, confName, conf }
        }
        catch (error) {
          logger.error({ err: error }, `Error reaching MediaMTX at: ${config.mediaMtxUrl}`)
          return null
        }
      }),

      // Writes the path's own override only — never path defaults, whose blast
      // radius is every stream on the server. A wildcard-backed path has no
      // entry to patch, so the first save materializes one.
      updatePathConfig: os.config.mediamtx.updatePathConfig.handler(async ({ input }) => {
        const config = await getAppConfig()
        const api = mediaMtxApi(config)
        try {
          const existing = await api.configPathGet(input.name)
          if (existing) {
            await api.configPathPatch(input.name, input.conf)
          }
          else {
            logger.info({ path: input.name }, 'Materializing path config entry')
            await api.configPathAdd(input.name, input.conf)
          }
        }
        catch (error) {
          logger.error({ err: error }, 'Failed to update path config')
          // A refused write is the operator's to fix, and MediaMTX's reason
          // names the key it disliked — the form puts it back on that field.
          if (error instanceof MediaMtxError && error.reason)
            throw new ORPCError('BAD_REQUEST', { message: error.reason })
          throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to update path config' })
        }
      }),

      // Runtime health for one path, polled while its detail page is open. A
      // path MediaMTX isn't running (404 → null) and one it is running but that
      // isn't ready are the same answer to an operator: nothing is flowing.
      getPathHealth: os.config.mediamtx.getPathHealth.handler(async ({ input }) => {
        const config = await getAppConfig()
        try {
          const runtime = await mediaMtxApi(config).pathsGet(input.name)
          if (!runtime?.ready)
            return { status: 'idle' as const }
          return {
            status: 'live' as const,
            readyTime: runtime.readyTime ?? null,
            publisher: runtime.source?.type ?? null,
            readers: (runtime.readers ?? []).map(reader => reader.type ?? ''),
            tracks: tracksOf(runtime),
            bytesReceived: runtime.bytesReceived ?? 0,
            bytesSent: runtime.bytesSent ?? 0,
            framesInError: runtime.inboundFramesInError ?? null,
          }
        }
        catch (error) {
          logger.error({ err: error }, `Error reaching MediaMTX at: ${config.mediaMtxUrl}`)
          return null
        }
      }),

      // Read before a delete: MediaMTX drops an entry with live sessions on it
      // without complaint, so the confirmation is the only warning there is.
      getPathConnections: os.config.mediamtx.getPathConnections.handler(async ({ input }) => {
        const config = await getAppConfig()
        try {
          const runtime = await mediaMtxApi(config).pathsGet(input.name)
          return {
            publisher: runtime?.source?.type ?? null,
            readers: (runtime?.readers ?? []).map(reader => reader.type ?? ''),
          }
        }
        catch (error) {
          logger.error({ err: error }, `Error reaching MediaMTX at: ${config.mediaMtxUrl}`)
          return null
        }
      }),

      // The way back from a materialize: delete the path's own entry and it
      // tracks its wildcard again. Only offered once the path has one.
      deletePathConfig: os.config.mediamtx.deletePathConfig.handler(async ({ input }) => {
        const config = await getAppConfig()
        logger.info({ path: input.name }, 'Deleting path config entry')
        try {
          await mediaMtxApi(config).configPathDelete(input.name)
        }
        catch (error) {
          logger.error({ err: error }, 'Failed to delete path config')
          throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to delete path config' })
        }
      }),
    },
  },
})
