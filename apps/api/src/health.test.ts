import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAppConfig } from './config-store'
import { health } from './health'

vi.mock('./config-store', () => ({ getAppConfig: vi.fn() }))

const CONFIG = {
  mediaMtxUrl: 'http://127.0.0.1',
  mediaMtxApiPort: 9997,
  remoteMediaMtxUrl: 'http://localhost',
  recordingsDirectory: '/rec',
  screenshotsDirectory: '/shots',
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('health endpoint', () => {
  it('reports healthy with a parseable timestamp when the config store reads', async () => {
    vi.mocked(getAppConfig).mockResolvedValue(CONFIG)

    const res = await health.request('/health')
    const body = await res.json() as { status: string, timestamp: string, error?: string }

    expect(res.status).toBe(200)
    expect(body.status).toBe('healthy')
    expect(Number.isNaN(new Date(body.timestamp).getTime())).toBe(false)
  })

  // The Docker HEALTHCHECK reads this. Reporting healthy while the config store
  // is unreadable would keep a broken container in a load balancer — the whole
  // reason the endpoint touches the store rather than returning a constant.
  it('reports unhealthy with 503 when the config store throws', async () => {
    vi.mocked(getAppConfig).mockRejectedValue(new Error('config.json is corrupt'))

    const res = await health.request('/health')
    const body = await res.json() as { status: string, timestamp: string, error?: string }

    expect(res.status).toBe(503)
    expect(body.status).toBe('unhealthy')
    expect(body.error).toBe('config.json is corrupt')
  })
})
