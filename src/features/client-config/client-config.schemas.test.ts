import { describe, expect, it } from 'vitest'

import { ClientConfigSchema } from './client-config.schemas'

const valid = {
  id: 1,
  mediaMtxUrl: 'http://mediamtx',
  mediaMtxApiPort: 9997,
  remoteMediaMtxUrl: 'http://localhost:8888',
  recordingsDirectory: '/recordings',
  screenshotsDirectory: '/screenshots',
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
}

describe('clientConfigSchema', () => {
  it('parses a fully-typed config', () => {
    expect(ClientConfigSchema.parse(valid)).toMatchObject(valid)
  })

  it('coerces id and port from strings', () => {
    const parsed = ClientConfigSchema.parse({
      ...valid,
      id: '7',
      mediaMtxApiPort: '8080',
    })
    expect(parsed.id).toBe(7)
    expect(parsed.mediaMtxApiPort).toBe(8080)
  })

  it('coerces ISO date strings to Date', () => {
    const parsed = ClientConfigSchema.parse({
      ...valid,
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    })
    expect(parsed.createdAt).toBeInstanceOf(Date)
    expect(parsed.updatedAt).toBeInstanceOf(Date)
  })

  it('allows null remoteMediaMtxUrl', () => {
    expect(() =>
      ClientConfigSchema.parse({ ...valid, remoteMediaMtxUrl: null }),
    ).not.toThrow()
  })

  it('rejects empty mediaMtxUrl', () => {
    expect(() =>
      ClientConfigSchema.parse({ ...valid, mediaMtxUrl: '' }),
    ).toThrow()
  })

  it('rejects empty recordingsDirectory and screenshotsDirectory', () => {
    expect(() =>
      ClientConfigSchema.parse({ ...valid, recordingsDirectory: '' }),
    ).toThrow()
    expect(() =>
      ClientConfigSchema.parse({ ...valid, screenshotsDirectory: '' }),
    ).toThrow()
  })

  it('rejects non-positive ports', () => {
    expect(() =>
      ClientConfigSchema.parse({ ...valid, mediaMtxApiPort: 0 }),
    ).toThrow()
    expect(() =>
      ClientConfigSchema.parse({ ...valid, mediaMtxApiPort: -1 }),
    ).toThrow()
  })
})
