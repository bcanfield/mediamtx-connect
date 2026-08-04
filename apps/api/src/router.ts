import type { RecordState } from '@connect/contract'
import type { MediaMtxPath } from './mediamtx'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { contract } from '@connect/contract'
import { implement, ORPCError } from '@orpc/server'
import { getAppConfig, updateAppConfig } from './config-store'
import { captureSnapshot } from './jobs'
import { logger } from './logger'
import { mediaMtxApi, MediaMtxError } from './mediamtx'
import {
  latestScreenshotMtimeFor,
  latestScreenshotUrlFor,
  listStreamRecordingFiles,
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

export const router = os.router({
  health: os.health.handler(() => ({
    status: 'ok' as const,
    uptime: process.uptime(),
  })),

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
      const streamDir = path.join(config.recordingsDirectory, input.streamName)
      if (!fs.existsSync(streamDir))
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
          throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to update path config' })
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
