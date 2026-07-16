import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { contract } from '@connect/contract'
import { implement, ORPCError } from '@orpc/server'
import { getAppConfig, updateAppConfig } from './config-store'
import { logger } from './logger'
import { mediaMtxApi } from './mediamtx'
import {
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
    list: os.streams.list.handler(async () => {
      const config = await getAppConfig()
      const api = mediaMtxApi(config)
      try {
        const [paths, globalConf] = await Promise.all([
          api.pathsList(),
          api.configGlobalGet(),
        ])
        return {
          status: 'connected' as const,
          streams: (paths.items ?? []).map(p => ({
            name: p.name ?? '',
            readyTime: p.readyTime ?? null,
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
    },
  },
})
