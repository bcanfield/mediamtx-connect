import { describe, expect, it } from 'vitest'
import { codecSupport, compatFor, READ_PROTOCOLS } from './codec-compat'

// The table is transcribed knowledge, so what these guard is the transcription
// as much as the logic: every claim below is a row of MediaMTX 1.19.3's own
// per-protocol codec tables (docs/4-read/*), and a wrong cell here is a wrong
// answer to "why won't my stream play".

function verdicts(codecs: string[]) {
  return Object.fromEntries(compatFor(codecs).map(row => [row.protocol, row.verdict]))
}

describe('codec support per read protocol', () => {
  // The pass-through protocol: MediaMTX forwards RTP as it arrives, so a codec
  // it has no muxer for still reaches an RTSP reader.
  it('carries anything over RTSP, including codecs no other protocol takes', () => {
    expect(codecSupport('rtsp', 'M-JPEG')).toBe('carried')
    expect(codecSupport('rtsp', 'Generic')).toBe('carried')
  })

  it('takes AV1 over RTMP, which Enhanced RTMP added', () => {
    expect(codecSupport('rtmp', 'AV1')).toBe('carried')
  })

  it('drops VP8 from RTMP and SRT while WebRTC keeps it', () => {
    expect(codecSupport('rtmp', 'VP8')).toBe('dropped')
    expect(codecSupport('srt', 'VP8')).toBe('dropped')
    expect(codecSupport('webrtc', 'VP8')).toBe('carried')
  })

  // The signature silent-stream bug: WebRTC's audio set is Opus/G722/G711, so
  // an AAC source reaches a browser as video with no sound.
  it('drops AAC from WebRTC while every other protocol carries it', () => {
    expect(codecSupport('webrtc', 'MPEG-4 Audio')).toBe('dropped')
    expect(codecSupport('hls', 'MPEG-4 Audio')).toBe('carried')
    expect(codecSupport('rtmp', 'MPEG-4 Audio')).toBe('carried')
    expect(codecSupport('srt', 'MPEG-4 Audio')).toBe('carried')
  })

  it('drops G711 from HLS and SRT, which is why an intercom source is silent there', () => {
    expect(codecSupport('hls', 'G711')).toBe('dropped')
    expect(codecSupport('srt', 'G711')).toBe('dropped')
    expect(codecSupport('webrtc', 'G711')).toBe('carried')
  })
})

describe('verdict for a codec mix', () => {
  it('is green everywhere for an H264 + AAC stream except WebRTC, which has no AAC', () => {
    expect(verdicts(['H264', 'MPEG-4 Audio'])).toEqual({
      rtsp: 'plays',
      rtmp: 'plays',
      hls: 'plays',
      webrtc: 'partial',
      srt: 'plays',
    })
  })

  // Nothing left to mux is a different answer from "you lose the audio", so it
  // gets its own verdict rather than collapsing into partial.
  it('blocks a protocol that can carry none of the tracks', () => {
    const srt = compatFor(['AV1'])?.find(row => row.protocol === 'srt')

    expect(srt?.verdict).toBe('blocked')
    expect(srt?.dropped).toEqual(['AV1'])
  })

  it('reports partial with only the codecs that are actually dropped', () => {
    const webrtc = compatFor(['H264', 'MPEG-4 Audio'])?.find(row => row.protocol === 'webrtc')

    expect(webrtc?.verdict).toBe('partial')
    expect(webrtc?.dropped).toEqual(['MPEG-4 Audio'])
  })

  // A path with two video medias of the same codec would otherwise repeat a
  // column, and say nothing more than the first one did.
  it('collapses a repeated codec into one column', () => {
    const rtsp = compatFor(['H264', 'H264', 'Opus']).find(row => row.protocol === 'rtsp')

    expect(rtsp?.codecs.map(c => c.codec)).toEqual(['H264', 'Opus'])
  })

  // An idle path publishes no tracks. Every row would read green off an empty
  // mix, which is a claim about a stream that isn't there.
  it('answers nothing at all for a path with no tracks', () => {
    expect(compatFor([])).toEqual([])
  })

  it('answers for every read protocol', () => {
    expect(compatFor(['H264']).map(row => row.protocol)).toEqual([...READ_PROTOCOLS])
  })
})
