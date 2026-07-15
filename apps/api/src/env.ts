import process from 'node:process'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

// Defaults are production-shaped (matching the published Docker image /
// bundled compose). For local dev, override via the environment.
export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().int().default(3000),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    DATA_DIR: z.string().default('/data'),
    BACKEND_SERVER_MEDIAMTX_URL: z.string().default('http://mediamtx'),
    MEDIAMTX_API_PORT: z.string().default('9997'),
    REMOTE_MEDIAMTX_URL: z.string().default('http://localhost'),
    MEDIAMTX_RECORDINGS_DIR: z.string().default('/recordings'),
    MEDIAMTX_SCREENSHOTS_DIR: z.string().default('/screenshots'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})

// Raw process.env values for the bootstrap vars — `undefined` means the
// operator did NOT set them, so callers can distinguish "explicit" from
// "schema default" when warning about env/config drift.
export const rawEnv = {
  BACKEND_SERVER_MEDIAMTX_URL: process.env.BACKEND_SERVER_MEDIAMTX_URL,
  MEDIAMTX_API_PORT: process.env.MEDIAMTX_API_PORT,
  REMOTE_MEDIAMTX_URL: process.env.REMOTE_MEDIAMTX_URL,
  MEDIAMTX_RECORDINGS_DIR: process.env.MEDIAMTX_RECORDINGS_DIR,
  MEDIAMTX_SCREENSHOTS_DIR: process.env.MEDIAMTX_SCREENSHOTS_DIR,
}
