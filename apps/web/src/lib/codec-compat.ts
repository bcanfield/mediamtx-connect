// MediaMTX routes one source to many readers and never re-encodes on the way
// out, so a track the reader's protocol can't carry is simply dropped. That is
// the whole of "why won't my stream play over X" — this module is the table
// that answers it.

/**
 * The MediaMTX release the table below was transcribed from. Pinned because
 * codec support moves between releases (Enhanced RTMP brought AV1/VP9/H265 to
 * RTMP, for one), so the answer is only true against a stated version.
 *
 * Source: https://github.com/bluenviron/mediamtx/tree/v1.19.3/docs/4-read
 */
export const MEDIAMTX_CODEC_TABLE_VERSION = '1.19.3'

/** Where FFmpeg re-encoding is documented, for a mix no reader can take as-is. */
export const MEDIAMTX_TRANSCODE_DOCS
  = 'https://github.com/bluenviron/mediamtx/blob/v1.19.3/docs/2-features/07-remuxing-reencoding-compression.md'

/**
 * The protocols MediaMTX serves readers over. Low-Latency HLS is not a column
 * of its own: it is the same HLS muxer with `hlsVariant: lowLatency`, and the
 * variant changes latency, not which codecs get muxed.
 */
export const READ_PROTOCOLS = ['rtsp', 'rtmp', 'hls', 'webrtc', 'srt'] as const

export type ReadProtocol = (typeof READ_PROTOCOLS)[number]

// Proper nouns — not translated (docs/I18N.md).
export const READ_PROTOCOL_LABELS: Record<ReadProtocol, string> = {
  rtsp: 'RTSP',
  rtmp: 'RTMP',
  hls: 'HLS',
  webrtc: 'WebRTC',
  srt: 'SRT',
}

// Codec names exactly as MediaMTX reports them in a path's `tracks`
// (internal/formatlabel), so a track can be looked up without normalizing.
// `'any'` for RTSP is MediaMTX's own wording — it forwards RTP as it arrives,
// so its documented list ends with "any RTP-compatible codec".
const CARRIED: Record<ReadProtocol, readonly string[] | 'any'> = {
  rtsp: 'any',
  rtmp: ['AV1', 'VP9', 'H265', 'H264', 'Opus', 'FLAC', 'MPEG-4 Audio', 'MPEG-1/2 Audio', 'AC3', 'G711', 'LPCM'],
  hls: ['AV1', 'VP9', 'H265', 'H264', 'Opus', 'FLAC', 'MPEG-4 Audio', 'KLV'],
  webrtc: ['AV1', 'VP9', 'VP8', 'H265', 'H264', 'Opus', 'G722', 'G711', 'KLV'],
  srt: ['H265', 'H264', 'MPEG-4 Video', 'MPEG-1/2 Video', 'Opus', 'MPEG-4 Audio', 'MPEG-1/2 Audio', 'AC3', 'KLV'],
}

export type CodecSupport = 'carried' | 'dropped'

/** Whether `protocol` can serve a track MediaMTX labels `codec`. */
export function codecSupport(protocol: ReadProtocol, codec: string): CodecSupport {
  const carried = CARRIED[protocol]
  return carried === 'any' || carried.includes(codec) ? 'carried' : 'dropped'
}

/**
 * `plays` — every track survives. `partial` — some do, so a reader gets a
 * stream that is missing its video or its sound. `blocked` — none do, so there
 * is nothing to serve.
 */
export type ProtocolVerdict = 'plays' | 'partial' | 'blocked'

export interface ProtocolCompat {
  protocol: ReadProtocol
  verdict: ProtocolVerdict
  /** One entry per distinct codec, in the order the tracks were reported. */
  codecs: { codec: string, support: CodecSupport }[]
  /** The codecs behind a `partial` or `blocked` verdict. */
  dropped: string[]
}

/**
 * The distinct codecs a path publishes, in the order MediaMTX reported them.
 * Two video medias of the same codec are one column, not two.
 */
export function codecMix(codecs: string[]): string[] {
  return [...new Set(codecs)]
}

/**
 * The compatibility matrix for one path's current codec mix — a row per read
 * protocol. Empty for a path with no tracks: MediaMTX only knows a path's
 * codecs while a source is connected, and a guess would be worse than nothing.
 */
export function compatFor(codecs: string[]): ProtocolCompat[] {
  const mix = codecMix(codecs)
  if (mix.length === 0)
    return []

  return READ_PROTOCOLS.map((protocol) => {
    const supported = mix.map(codec => ({ codec, support: codecSupport(protocol, codec) }))
    const dropped = supported.filter(c => c.support === 'dropped').map(c => c.codec)
    return {
      protocol,
      verdict: dropped.length === 0 ? 'plays' : dropped.length === mix.length ? 'blocked' : 'partial',
      codecs: supported,
      dropped,
    }
  })
}
