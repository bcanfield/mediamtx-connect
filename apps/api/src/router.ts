import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { contract } from '@connect/contract'
import { implement, ORPCError } from '@orpc/server'
import { getAppConfig, updateAppConfig } from './config-store'
import { captureSnapshot } from './jobs'
import { logger } from './logger'
import { mediaMtxApi } from './mediamtx'
import {
  latestScreenshotMtimeFor,
  latestScreenshotUrlFor,
  listStreamRecordingFiles,
  screenshotUrlFor,
  summarizeStreamRecordings,
} from './recordings-fs'

const os = implement(contract)

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
      try {
        const [paths, globalConf] = await Promise.all([
          api.pathsList(),
          api.configGlobalGet(),
        ])
        const items = paths.items ?? []

        // Streams share a config entry — normally the one wildcard, `all_others`
        // — so resolve record state per distinct confName rather than per card
        // (ADR 0002). MediaMTX resolves path defaults into whichever entry it
        // serves, so what comes back is already effective config.
        const confNames = [...new Set(items.map(p => p.confName ?? ''))]
        const confs = await Promise.all(confNames.map(name => api.configPathGet(name)))
        const recordByConfName = new Map(
          confNames.map((name, i) => [name, confs[i]?.record ?? false]),
        )

        return {
          status: 'connected' as const,
          streams: items.map(p => ({
            name: p.name ?? '',
            readyTime: p.readyTime ?? null,
            recording: recordByConfName.get(p.confName ?? '') ?? false,
            codecs: p.tracks ?? [],
            viewers: p.readers?.length ?? 0,
            snapshotMtime: latestScreenshotMtimeFor(config, p.name ?? ''),
          })),
          hlsAddress: globalConf.hlsAddress ?? '',
          remoteMediaMtxUrl: config.remoteMediaMtxUrl,
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
          if (!conf)
            return null
          return { confName, conf }
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
    },
  },
})
