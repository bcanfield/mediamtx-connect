/* eslint-disable no-console, node/prefer-global/process */
import pino from 'pino'

/**
 * Centralized logger for the application.
 * All logging should go through this module to maintain consistency
 * and allow ESLint to enforce no direct console usage elsewhere.
 */

// Determine if we're in browser or server environment
const isBrowser = typeof window !== 'undefined'

// Create pino logger for server-side
const pinoLogger = isBrowser
  ? null
  : pino({
      level: process.env.LOG_LEVEL || 'info',
    })

/**
 * Logger interface that works in both browser and server environments
 */
export const logger = {
  /**
   * Log informational messages
   */
  info: (message: string, data?: Record<string, unknown>) => {
    if (isBrowser) {
      if (data) {
        console.log(`[INFO] ${message}`, data)
      }
      else {
        console.log(`[INFO] ${message}`)
      }
    }
    else if (pinoLogger) {
      pinoLogger.info(data ?? {}, message)
    }
  },

  /**
   * Log error messages
   */
  error: (message: string, error?: unknown) => {
    if (isBrowser) {
      if (error) {
        console.error(`[ERROR] ${message}`, error)
      }
      else {
        console.error(`[ERROR] ${message}`)
      }
    }
    else if (pinoLogger) {
      if (error instanceof Error) {
        pinoLogger.error({ err: error }, message)
      }
      else if (error !== undefined) {
        pinoLogger.error({ data: error }, message)
      }
      else {
        pinoLogger.error(message)
      }
    }
  },

  /**
   * Log warning messages
   */
  warn: (message: string, data?: Record<string, unknown>) => {
    if (isBrowser) {
      if (data) {
        console.warn(`[WARN] ${message}`, data)
      }
      else {
        console.warn(`[WARN] ${message}`)
      }
    }
    else if (pinoLogger) {
      pinoLogger.warn(data ?? {}, message)
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (message: string, data?: Record<string, unknown>) => {
    if (isBrowser) {
      // In browser, always show debug in development builds
      // Next.js sets NODE_ENV at build time, so this is safe
      if (process.env.NODE_ENV === 'development') {
        if (data) {
          console.log(`[DEBUG] ${message}`, data)
        }
        else {
          console.log(`[DEBUG] ${message}`)
        }
      }
    }
    else if (pinoLogger) {
      pinoLogger.debug(data ?? {}, message)
    }
  },
}

export default logger
