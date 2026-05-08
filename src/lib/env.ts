import { z } from 'zod'

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
  CI: z.string().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  BACKEND_SERVER_MEDIAMTX_URL: z.string().default('http://localhost'),
  MEDIAMTX_API_PORT: z.string().default('9997'),
  REMOTE_MEDIAMTX_URL: z.string().default('http://localhost'),
  MEDIAMTX_RECORDINGS_DIR: z.string().default('./test-data/recordings'),
  MEDIAMTX_SCREENSHOTS_DIR: z.string().default('./test-data/screenshots'),
})

const clientSchema = z.object({})

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_RUNTIME: process.env.NEXT_RUNTIME,
  CI: process.env.CI,
  LOG_LEVEL: process.env.LOG_LEVEL,
  BACKEND_SERVER_MEDIAMTX_URL: process.env.BACKEND_SERVER_MEDIAMTX_URL,
  MEDIAMTX_API_PORT: process.env.MEDIAMTX_API_PORT,
  REMOTE_MEDIAMTX_URL: process.env.REMOTE_MEDIAMTX_URL,
  MEDIAMTX_RECORDINGS_DIR: process.env.MEDIAMTX_RECORDINGS_DIR,
  MEDIAMTX_SCREENSHOTS_DIR: process.env.MEDIAMTX_SCREENSHOTS_DIR,
}

const serverEnvResult = serverSchema.safeParse(processEnv)
if (!serverEnvResult.success) {
  const formatted = serverEnvResult.error.flatten()
  throw new Error(`Invalid environment variables: ${JSON.stringify(formatted.fieldErrors)}`)
}

const clientEnvResult = clientSchema.safeParse(processEnv)
if (!clientEnvResult.success) {
  const formatted = clientEnvResult.error.flatten()
  throw new Error(`Invalid client environment variables: ${JSON.stringify(formatted.fieldErrors)}`)
}

export const env = serverEnvResult.data
export const clientEnv = clientEnvResult.data

export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'
export const isCI = Boolean(env.CI)
