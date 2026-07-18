import type { AppConfig } from '@connect/contract'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { AppConfigSchema } from '@connect/contract'
import { env, rawEnv } from './env'
import { logger } from './logger'

const configPath = path.join(env.DATA_DIR, 'config.json')

export async function getAppConfig(): Promise<AppConfig> {
  const raw = await readFile(configPath, 'utf8')
  return AppConfigSchema.parse(JSON.parse(raw))
}

export async function updateAppConfig(config: AppConfig): Promise<AppConfig> {
  const parsed = AppConfigSchema.parse(config)
  await mkdir(env.DATA_DIR, { recursive: true })
  const tmp = `${configPath}.tmp`
  await writeFile(tmp, `${JSON.stringify(parsed, null, 2)}\n`)
  await rename(tmp, configPath)
  return parsed
}

// Seed config from env on first boot. After that the /config UI owns these
// values — re-setting env vars won't override an existing file.
export async function bootstrapConfig(): Promise<AppConfig> {
  let config: AppConfig
  if (!existsSync(configPath)) {
    config = await updateAppConfig({
      mediaMtxUrl: env.BACKEND_SERVER_MEDIAMTX_URL,
      mediaMtxApiPort: Number.parseInt(env.MEDIAMTX_API_PORT, 10),
      remoteMediaMtxUrl: env.REMOTE_MEDIAMTX_URL,
      recordingsDirectory: env.MEDIAMTX_RECORDINGS_DIR,
      screenshotsDirectory: env.MEDIAMTX_SCREENSHOTS_DIR,
    })
    logger.info({ config }, 'Seeded config from env')
  }
  else {
    config = await getAppConfig()

    // Only flag vars the operator explicitly set — schema defaults aren't
    // drift, they're just the absence of a runtime override.
    const candidates: Array<{ var: keyof typeof rawEnv, env: string, stored: string }> = [
      { var: 'BACKEND_SERVER_MEDIAMTX_URL', env: env.BACKEND_SERVER_MEDIAMTX_URL, stored: config.mediaMtxUrl },
      { var: 'MEDIAMTX_API_PORT', env: env.MEDIAMTX_API_PORT, stored: String(config.mediaMtxApiPort) },
      { var: 'REMOTE_MEDIAMTX_URL', env: env.REMOTE_MEDIAMTX_URL, stored: config.remoteMediaMtxUrl ?? '' },
      { var: 'MEDIAMTX_RECORDINGS_DIR', env: env.MEDIAMTX_RECORDINGS_DIR, stored: config.recordingsDirectory },
      { var: 'MEDIAMTX_SCREENSHOTS_DIR', env: env.MEDIAMTX_SCREENSHOTS_DIR, stored: config.screenshotsDirectory },
    ]
    const drift = candidates.filter(c => rawEnv[c.var] !== undefined && c.env !== c.stored)

    if (drift.length > 0) {
      logger.warn(
        { drift },
        'Env values differ from stored config. Env vars only seed the first boot — the /config UI is authoritative afterwards. To apply env values, delete config.json or update the config in the UI.',
      )
    }
  }

  await mkdir(config.recordingsDirectory, { recursive: true })
  await mkdir(config.screenshotsDirectory, { recursive: true })
  return config
}
