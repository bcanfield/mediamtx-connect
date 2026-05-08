/* eslint-disable no-console */
import pino from 'pino'

import { env, isDevelopment } from './env'

const isBrowser = typeof window !== 'undefined'

const pinoLogger = isBrowser
  ? null
  : pino({ level: env.LOG_LEVEL })

export const logger = {
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

  debug: (message: string, data?: Record<string, unknown>) => {
    if (isBrowser) {
      if (isDevelopment) {
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
