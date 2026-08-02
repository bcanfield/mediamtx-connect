import { describe, expect, it } from 'vitest'
import { composeRtspSource, maskSourceCredentials } from './rtsp-source'

const PARTS = {
  host: 'cam.lan',
  port: 554,
  streamPath: 'Streaming/Channels/101',
  username: '',
  password: '',
}

describe('composeRtspSource', () => {
  it('composes host, port and stream path', () => {
    expect(composeRtspSource(PARTS)).toBe('rtsp://cam.lan:554/Streaming/Channels/101')
  })

  it('puts credentials before the host', () => {
    expect(composeRtspSource({ ...PARTS, username: 'admin', password: 'hunter2' }))
      .toBe('rtsp://admin:hunter2@cam.lan:554/Streaming/Channels/101')
  })

  // The reason the wizard exists: a hand-written URL with this password in it
  // ends at the `@`, and MediaMTX pulls from a host that isn't the camera.
  it('percent-encodes credentials that would otherwise cut the URL', () => {
    expect(composeRtspSource({ ...PARTS, username: 'a/b', password: 'p@ss:w/rd' }))
      .toBe('rtsp://a%2Fb:p%40ss%3Aw%2Frd@cam.lan:554/Streaming/Channels/101')
  })

  it('leaves the colon off a username with no password', () => {
    expect(composeRtspSource({ ...PARTS, username: 'admin' }))
      .toBe('rtsp://admin@cam.lan:554/Streaming/Channels/101')
  })

  it('normalizes a leading slash on the stream path', () => {
    expect(composeRtspSource({ ...PARTS, streamPath: '/live/0' }))
      .toBe('rtsp://cam.lan:554/live/0')
  })
})

describe('maskSourceCredentials', () => {
  it('hides the password and keeps the username', () => {
    expect(maskSourceCredentials('rtsp://admin:hunter2@cam.lan:554/live'))
      .toBe('rtsp://admin:••••••••@cam.lan:554/live')
  })

  it('masks to a fixed width so the password length does not leak', () => {
    expect(maskSourceCredentials('rtsp://admin:a@cam.lan/live'))
      .toBe(maskSourceCredentials('rtsp://admin:aaaaaaaaaaaaaaaa@cam.lan/live'))
  })

  it('leaves a source without credentials alone', () => {
    expect(maskSourceCredentials('rtsp://cam.lan:554/live')).toBe('rtsp://cam.lan:554/live')
    expect(maskSourceCredentials('publisher')).toBe('publisher')
  })
})
