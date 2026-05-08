import { describe, expect, it } from 'vitest'

import { GlobalConfigSchema } from './mediamtx-config.schemas'

describe('globalConfigSchema', () => {
  it('accepts an empty object (every field optional)', () => {
    expect(() => GlobalConfigSchema.parse({})).not.toThrow()
  })

  it('coerces numeric fields from strings', () => {
    const parsed = GlobalConfigSchema.parse({
      writeQueueSize: '512',
      udpMaxPayloadSize: '1472',
      hlsSegmentCount: '7',
      multicastRTPPort: '8002',
    })
    expect(parsed.writeQueueSize).toBe(512)
    expect(parsed.udpMaxPayloadSize).toBe(1472)
    expect(parsed.hlsSegmentCount).toBe(7)
    expect(parsed.multicastRTPPort).toBe(8002)
  })

  it('parses nested webrtcICEServers2', () => {
    const parsed = GlobalConfigSchema.parse({
      webrtcICEServers2: [
        { url: 'stun:stun.l.google.com:19302' },
        { url: 'turn:turn.example.com', username: 'u', password: 'p' },
      ],
    })
    expect(parsed.webrtcICEServers2).toHaveLength(2)
    expect(parsed.webrtcICEServers2?.[1]?.username).toBe('u')
  })

  it('parses string array fields', () => {
    const parsed = GlobalConfigSchema.parse({
      logDestinations: ['stdout', 'file'],
      protocols: ['tcp', 'udp'],
      authMethods: ['basic'],
    })
    expect(parsed.logDestinations).toEqual(['stdout', 'file'])
    expect(parsed.protocols).toEqual(['tcp', 'udp'])
  })

  it('rejects wrong types for booleans', () => {
    expect(() =>
      GlobalConfigSchema.parse({ rtsp: 'yes' }),
    ).toThrow()
  })

  it('rejects non-array logDestinations', () => {
    expect(() =>
      GlobalConfigSchema.parse({ logDestinations: 'stdout' }),
    ).toThrow()
  })
})
