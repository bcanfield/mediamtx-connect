import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

// Every var has a default, so a fresh clone runs with zero configuration:
// `pnpm dev` and `docker compose up` both boot without an .env file. Env vars
// only *seed* the first boot — the /config UI owns these values afterwards
// (config-store.ts), so treat them as optional overrides, not required input.
//
// Defaults differ by environment because a host path and a container path can
// never be the same string. Production writes to the image's mount points and
// reaches MediaMTX over the compose network; dev writes under <repo>/.dev-data
// and reaches the dev MediaMTX on localhost. The dev dirs resolve from this
// file, so they're the same absolute path whether the api is launched from
// apps/api (tsx) or the repo root (built bundle) — no more cwd-relative `../..`.
const isProduction = process.env.NODE_ENV === 'production'

function devDataDir(name: string) {
  return fileURLToPath(new URL(`../../../.dev-data/${name}`, import.meta.url))
}

function dir(name: string, prod: string) {
  return z.string().default(isProduction ? prod : devDataDir(name))
}

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().int().default(3000),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    DATA_DIR: dir('data', '/data'),
    BACKEND_SERVER_MEDIAMTX_URL: z
      .string()
      .default(isProduction ? 'http://mediamtx' : 'http://127.0.0.1'),
    MEDIAMTX_API_PORT: z.string().default('9997'),
    REMOTE_MEDIAMTX_URL: z.string().default('http://localhost'),
    MEDIAMTX_RECORDINGS_DIR: dir('recordings', '/recordings'),
    MEDIAMTX_SCREENSHOTS_DIR: dir('screenshots', '/screenshots'),
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
