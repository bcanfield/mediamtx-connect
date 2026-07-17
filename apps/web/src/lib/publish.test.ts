import { describe, expect, it } from 'vitest'

import { publishTargets, publishUrl } from './publish'

describe('publishTargets', () => {
  it('derives each protocol port from the configured listen address', () => {
    const targets = publishTargets('cam.lan', {
      rtspAddress: ':8554',
      rtmpAddress: ':1935',
      srtAddress: ':8890',
    })
    expect(targets.map(t => t.prefix)).toEqual([
      'rtsp://cam.lan:8554/',
      'rtmp://cam.lan:1935/',
      'srt://cam.lan:8890?streamid=publish:',
    ])
  })

  it('reflects a changed listen port rather than the default', () => {
    // The bug this fixes: a hardcoded port would still read 1935 here.
    const prefixes = publishTargets('cam.lan', { rtmpAddress: ':11935' }).map(t => t.prefix)
    expect(prefixes).toContain('rtmp://cam.lan:11935/')
    expect(prefixes).not.toContain('rtmp://cam.lan:1935/')
  })

  it('keeps only the port from a host-qualified address, pairing it with the browser host', () => {
    const prefixes = publishTargets('cam.lan', { rtspAddress: '0.0.0.0:8555' }).map(t => t.prefix)
    expect(prefixes).toContain('rtsp://cam.lan:8555/')
  })

  it('falls back to MediaMTX defaults when the server reports no addresses', () => {
    expect(publishTargets('cam.lan', null).map(t => t.prefix)).toEqual([
      'rtsp://cam.lan:8554/',
      'rtmp://cam.lan:1935/',
      'srt://cam.lan:8890?streamid=publish:',
    ])
  })
})

describe('publishUrl', () => {
  it('appends the stream name to each target prefix', () => {
    const urls = publishTargets('cam.lan', null).map(t => publishUrl(t, 'front'))
    expect(urls).toEqual([
      'rtsp://cam.lan:8554/front',
      'rtmp://cam.lan:1935/front',
      'srt://cam.lan:8890?streamid=publish:front',
    ])
  })
})
