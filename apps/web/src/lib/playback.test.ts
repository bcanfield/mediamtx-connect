import { describe, expect, it } from 'vitest'

import { hlsUrlFor, isPlaybackMode, resolveTransport, whepUrlFor } from './playback'

describe('isPlaybackMode', () => {
  it('accepts the three modes and rejects anything else', () => {
    expect(isPlaybackMode('auto')).toBe(true)
    expect(isPlaybackMode('low-lat')).toBe(true)
    expect(isPlaybackMode('compat')).toBe(true)
    expect(isPlaybackMode('lowlat')).toBe(false)
    expect(isPlaybackMode(null)).toBe(false)
  })
})

describe('hlsUrlFor', () => {
  it('joins the remote url, the hls port suffix and the stream index', () => {
    expect(hlsUrlFor('http://cam.lan', ':8888', 'front')).toBe('http://cam.lan:8888/front/index.m3u8')
  })

  it('encodes the stream name', () => {
    expect(hlsUrlFor('http://cam.lan', ':8888', 'front door')).toBe('http://cam.lan:8888/front%20door/index.m3u8')
  })
})

describe('whepUrlFor', () => {
  it('builds the MediaMTX whep endpoint for the stream', () => {
    expect(whepUrlFor('http://cam.lan', ':8889', 'front')).toBe('http://cam.lan:8889/front/whep')
  })

  it('is null when webrtc has no address, so callers cannot build a bogus url', () => {
    expect(whepUrlFor('http://cam.lan', '', 'front')).toBeNull()
    expect(whepUrlFor('', ':8889', 'front')).toBeNull()
  })
})

describe('resolveTransport', () => {
  const whep = 'http://cam.lan:8889/front/whep'

  it('never reaches for webrtc in compat, even when whep is available', () => {
    expect(resolveTransport('compat', whep)).toBe('hls')
  })

  it('prefers webrtc in auto and low-lat', () => {
    expect(resolveTransport('auto', whep)).toBe('webrtc')
    expect(resolveTransport('low-lat', whep)).toBe('webrtc')
  })

  it('falls to hls when the server serves no whep url, whatever the mode asks for', () => {
    expect(resolveTransport('auto', null)).toBe('hls')
    expect(resolveTransport('low-lat', null)).toBe('hls')
  })
})
