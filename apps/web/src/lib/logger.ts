/* eslint-disable no-console */

// Browser-side logger; the api has its own Pino logger. console.* is banned
// outside this file.
const isDev = import.meta.env.DEV

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    data ? console.log(`[INFO] ${message}`, data) : console.log(`[INFO] ${message}`)
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    data ? console.warn(`[WARN] ${message}`, data) : console.warn(`[WARN] ${message}`)
  },
  error: (message: string, error?: unknown) => {
    error !== undefined ? console.error(`[ERROR] ${message}`, error) : console.error(`[ERROR] ${message}`)
  },
  debug: (message: string, data?: Record<string, unknown>) => {
    if (!isDev)
      return
    data ? console.log(`[DEBUG] ${message}`, data) : console.log(`[DEBUG] ${message}`)
  },
}
