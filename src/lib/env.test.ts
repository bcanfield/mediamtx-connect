import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

async function loadEnv() {
  return await import('./env')
}

describe('env', () => {
  it('applies defaults when nothing is set', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('LOG_LEVEL', undefined)
    vi.stubEnv('BACKEND_SERVER_MEDIAMTX_URL', undefined)
    vi.stubEnv('MEDIAMTX_API_PORT', undefined)
    vi.stubEnv('REMOTE_MEDIAMTX_URL', undefined)
    vi.stubEnv('MEDIAMTX_RECORDINGS_DIR', undefined)
    vi.stubEnv('MEDIAMTX_SCREENSHOTS_DIR', undefined)

    const { env } = await loadEnv()

    expect(env.LOG_LEVEL).toBe('info')
    expect(env.BACKEND_SERVER_MEDIAMTX_URL).toBe('http://mediamtx')
    expect(env.MEDIAMTX_API_PORT).toBe('9997')
    expect(env.REMOTE_MEDIAMTX_URL).toBe('http://localhost')
    expect(env.MEDIAMTX_RECORDINGS_DIR).toBe('/recordings')
    expect(env.MEDIAMTX_SCREENSHOTS_DIR).toBe('/screenshots')
  })

  it('reads provided values', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('LOG_LEVEL', 'debug')
    vi.stubEnv('BACKEND_SERVER_MEDIAMTX_URL', 'http://mediamtx')
    vi.stubEnv('MEDIAMTX_API_PORT', '8080')

    const { env } = await loadEnv()

    expect(env.NODE_ENV).toBe('production')
    expect(env.LOG_LEVEL).toBe('debug')
    expect(env.BACKEND_SERVER_MEDIAMTX_URL).toBe('http://mediamtx')
    expect(env.MEDIAMTX_API_PORT).toBe('8080')
  })

  it('rejects invalid LOG_LEVEL', async () => {
    vi.stubEnv('LOG_LEVEL', 'verbose')
    await expect(loadEnv()).rejects.toThrow(/Invalid environment variables/)
  })

  it('rejects invalid NODE_ENV', async () => {
    vi.stubEnv('NODE_ENV', 'staging')
    await expect(loadEnv()).rejects.toThrow(/Invalid environment variables/)
  })

  it('exposes runtime flags', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CI', 'true')
    const prod = await loadEnv()
    expect(prod.isProduction).toBe(true)
    expect(prod.isDevelopment).toBe(false)
    expect(prod.isTest).toBe(false)
    expect(prod.isCI).toBe(true)

    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('CI', '')
    const test = await loadEnv()
    expect(test.isTest).toBe(true)
    expect(test.isProduction).toBe(false)
    expect(test.isCI).toBe(false)
  })
})
