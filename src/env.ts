import { z } from 'zod'

/**
 * Server-side environment variables schema
 * These are only available on the server
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
  CI: z.string().optional(),

  // Database
  DATABASE_URL: z.string().default('file:./prisma/dev.db'),

  // MediaMTX configuration (used in seed.ts)
  BACKEND_SERVER_MEDIAMTX_URL: z.string().default('http://localhost'),
  MEDIAMTX_API_PORT: z.string().default('9997'),
  REMOTE_MEDIAMTX_URL: z.string().default('http://localhost'),
  MEDIAMTX_RECORDINGS_DIR: z.string().default('./test-data/recordings'),
  MEDIAMTX_SCREENSHOTS_DIR: z.string().default('./test-data/screenshots'),
})

/**
 * Client-side environment variables schema
 * These are exposed to the browser (must be prefixed with NEXT_PUBLIC_)
 */
const clientSchema = z.object({
  // Add NEXT_PUBLIC_ prefixed variables here if needed
})

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_RUNTIME: process.env.NEXT_RUNTIME,
  CI: process.env.CI,
  DATABASE_URL: process.env.DATABASE_URL,
  BACKEND_SERVER_MEDIAMTX_URL: process.env.BACKEND_SERVER_MEDIAMTX_URL,
  MEDIAMTX_API_PORT: process.env.MEDIAMTX_API_PORT,
  REMOTE_MEDIAMTX_URL: process.env.REMOTE_MEDIAMTX_URL,
  MEDIAMTX_RECORDINGS_DIR: process.env.MEDIAMTX_RECORDINGS_DIR,
  MEDIAMTX_SCREENSHOTS_DIR: process.env.MEDIAMTX_SCREENSHOTS_DIR,
}

// Validate and export server environment
const serverEnvResult = serverSchema.safeParse(processEnv)

if (!serverEnvResult.success) {
  const formatted = serverEnvResult.error.flatten()
  throw new Error(`Invalid environment variables: ${JSON.stringify(formatted.fieldErrors)}`)
}

// Validate client environment
const clientEnvResult = clientSchema.safeParse(processEnv)

if (!clientEnvResult.success) {
  const formatted = clientEnvResult.error.flatten()
  throw new Error(`Invalid client environment variables: ${JSON.stringify(formatted.fieldErrors)}`)
}

/**
 * Server environment variables - use this for server-side code
 */
export const env = serverEnvResult.data

/**
 * Client environment variables - use this for client-side code
 * These are safe to expose to the browser
 */
export const clientEnv = clientEnvResult.data

/**
 * Helper to check if we're in production
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Helper to check if we're in development
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * Helper to check if we're in test environment
 */
export const isTest = env.NODE_ENV === 'test'

/**
 * Helper to check if we're running in CI
 */
export const isCI = Boolean(env.CI)
