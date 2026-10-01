import type { GlobalConfig } from '@connect/contract'

// MediaMTX's default publish ports, used only when the server hasn't reported a
// listen address (e.g. its global config is briefly unreachable). A configured
// address always wins — hardcoding the port regardless is the bug this fixes.
const DEFAULT_PORTS = {
  rtsp: 8554,
  rtsps: 8322,
  rtmp: 1935,
  rtmps: 1936,
  srt: 8890,
  hls: 8888,
  webrtc: 8889,
} as const

// Publishers and players connect from the operator's network, so this is the
// browser-facing MediaMTX URL, never the one the API reaches it at
// (`http://mediamtx` under docker-compose). Only the hostname: each protocol
// brings its own port.
export function publishHost(remoteMediaMtxUrl: string | null): string {
  if (!remoteMediaMtxUrl)
    return window.location.hostname
  try {
    return new URL(remoteMediaMtxUrl).hostname
  }
  catch {
    return remoteMediaMtxUrl
  }
}

export interface PublishTarget {
  /** Protocol label, e.g. "RTSP". A brand name — not translated (see I18N.md). */
  protocol: string
  /** The URL up to where the stream name goes; append a name for a full URL. */
  prefix: string
}

// MediaMTX listen addresses are `host:port`, with the host usually empty
// (`:8554`). We keep the configured port and pair it with the browser-facing
// host, so an operator who changed a listen address is pointed at the right one.
function portOf(address: string | undefined, fallback: number): number {
  if (!address)
    return fallback
  const colon = address.lastIndexOf(':')
  if (colon === -1)
    return fallback
  const port = Number.parseInt(address.slice(colon + 1), 10)
  return Number.isNaN(port) ? fallback : port
}

// The one builder for a server's publish URLs, shared by the card's copy action
// and the empty-state hints so the two can never disagree on a port.
//
// A protocol the server doesn't serve is left out entirely — its URL would look
// valid and then silently refuse the publisher. MediaMTX's toggles default to
// on, so only an explicit `false` drops a target: a missing flag (or a global
// config we couldn't read) keeps it, same as the port fallback above.
export function publishTargets(host: string, global: GlobalConfig | null | undefined): PublishTarget[] {
  const targets: PublishTarget[] = []
  if (global?.rtsp !== false)
    targets.push({ protocol: 'RTSP', prefix: `rtsp://${host}:${portOf(global?.rtspAddress, DEFAULT_PORTS.rtsp)}/` })
  if (global?.rtmp !== false)
    targets.push({ protocol: 'RTMP', prefix: `rtmp://${host}:${portOf(global?.rtmpAddress, DEFAULT_PORTS.rtmp)}/` })
  if (global?.srt !== false)
    targets.push({ protocol: 'SRT', prefix: `srt://${host}:${portOf(global?.srtAddress, DEFAULT_PORTS.srt)}?streamid=publish:` })
  return targets
}

export function publishUrl(target: PublishTarget, streamName: string): string {
  return `${target.prefix}${streamName}`
}

// The path page's publish & read panel. Snippets and client names are code, not
// copy: they're rendered untranslated (I18N.md brand-name rule), and each one
// holds the endpoint's URL verbatim so what's copied matches what's shown.
export interface Snippet {
  client: string
  text: string
  /** A caveat the panel shows under the snippet, as a message key. */
  note?: 'whipTracks'
}

export interface EndpointLink {
  /** What the panel labels the link: the URL itself, or one of MediaMTX's own pages. */
  kind: 'systemPlayer' | 'browserPublish' | 'hlsPage' | 'webrtcPage'
  href: string
}

export interface Endpoint {
  protocol: string
  url: string
  snippets: Snippet[]
  links: EndpointLink[]
}

type Encryption = GlobalConfig['rtmpEncryption']

// MediaMTX's `*Encryption` modes: `strict` serves only the TLS listener,
// `optional` serves both, and anything else (including unset) serves only the
// plain one.
function servesPlain(mode: Encryption): boolean {
  return mode !== 'strict'
}
function servesSecure(mode: Encryption): boolean {
  return mode === 'strict' || mode === 'optional'
}

// Path names are limited to `[0-9a-zA-Z_./-]` by MediaMTX, so none of these
// URLs needs encoding, and `cams/front` keeps its slash. SRT's `?`/`&` do need
// quoting in a shell, which is why its snippets wrap the URL.
interface Urls {
  rtsp: string
  rtsps: string
  rtmp: string
  rtmps: string
  srtPublish: string
  srtRead: string
  hlsBase: string
  webrtcBase: string
}

function urlsFor(host: string, path: string, global: GlobalConfig | null | undefined): Urls {
  const hlsScheme = global?.hlsEncryption ? 'https' : 'http'
  const webrtcScheme = global?.webrtcEncryption ? 'https' : 'http'
  const srt = `srt://${host}:${portOf(global?.srtAddress, DEFAULT_PORTS.srt)}`
  return {
    rtsp: `rtsp://${host}:${portOf(global?.rtspAddress, DEFAULT_PORTS.rtsp)}/${path}`,
    rtsps: `rtsps://${host}:${portOf(global?.rtspsAddress, DEFAULT_PORTS.rtsps)}/${path}`,
    rtmp: `rtmp://${host}:${portOf(global?.rtmpAddress, DEFAULT_PORTS.rtmp)}/${path}`,
    rtmps: `rtmps://${host}:${portOf(global?.rtmpsAddress, DEFAULT_PORTS.rtmps)}/${path}`,
    srtPublish: `${srt}?streamid=publish:${path}&pkt_size=1316`,
    srtRead: `${srt}?streamid=read:${path}`,
    hlsBase: `${hlsScheme}://${host}:${portOf(global?.hlsAddress, DEFAULT_PORTS.hls)}/${path}`,
    webrtcBase: `${webrtcScheme}://${host}:${portOf(global?.webrtcAddress, DEFAULT_PORTS.webrtc)}/${path}`,
  }
}

// Same toggle rule as `publishTargets`: only an explicit `false` hides one.
function serves(global: GlobalConfig | null | undefined) {
  return {
    rtsp: global?.rtsp !== false && servesPlain(global?.rtspEncryption),
    rtsps: global?.rtsp !== false && servesSecure(global?.rtspEncryption),
    rtmp: global?.rtmp !== false && servesPlain(global?.rtmpEncryption),
    rtmps: global?.rtmp !== false && servesSecure(global?.rtmpEncryption),
    srt: global?.srt !== false,
    hls: global?.hls !== false,
    webrtc: global?.webrtc !== false,
  }
}

// Shapes from MediaMTX's docs/3-publish (FFmpeg, GStreamer, OBS Studio pages).
function ffmpegPublish(format: string, url: string) {
  return { client: 'ffmpeg', text: `ffmpeg -re -stream_loop -1 -i file.mp4 -c copy -f ${format} ${url}` }
}
function obs(service: string, url: string, streamKey: boolean) {
  return { client: 'OBS', text: `Service: ${service}\nServer: ${url}${streamKey ? '\nStream key:' : ''}` }
}

export function publishEndpoints(host: string, path: string, global: GlobalConfig | null | undefined): Endpoint[] {
  const urls = urlsFor(host, path, global)
  const on = serves(global)
  const endpoints: Endpoint[] = []
  if (on.rtsp) {
    endpoints.push({
      protocol: 'RTSP',
      url: urls.rtsp,
      snippets: [
        ffmpegPublish('rtsp', urls.rtsp),
        {
          client: 'GStreamer',
          text: `gst-launch-1.0 rtspclientsink name=s location=${urls.rtsp} filesrc location=file.mp4 ! qtdemux name=d d.video_0 ! queue ! s.sink_0 d.audio_0 ! queue ! s.sink_1`,
        },
      ],
      links: [],
    })
  }
  if (on.rtsps)
    endpoints.push({ protocol: 'RTSPS', url: urls.rtsps, snippets: [ffmpegPublish('rtsp', urls.rtsps)], links: [] })
  if (on.rtmp)
    endpoints.push({ protocol: 'RTMP', url: urls.rtmp, snippets: [ffmpegPublish('flv', urls.rtmp), obs('Custom...', urls.rtmp, true)], links: [] })
  if (on.rtmps)
    endpoints.push({ protocol: 'RTMPS', url: urls.rtmps, snippets: [ffmpegPublish('flv', urls.rtmps), obs('Custom...', urls.rtmps, true)], links: [] })
  if (on.srt) {
    endpoints.push({
      protocol: 'SRT',
      url: urls.srtPublish,
      snippets: [
        ffmpegPublish('mpegts', `'${urls.srtPublish}'`),
        {
          client: 'GStreamer',
          text: `gst-launch-1.0 -v mpegtsmux name=mux ! srtsink uri='${urls.srtPublish}' videotestsrc ! video/x-raw,width=1280,height=720,format=I420 ! x264enc speed-preset=ultrafast bitrate=3000 key-int-max=60 ! video/x-h264,profile=high ! mux. audiotestsrc ! audioconvert ! avenc_aac ! mux.`,
        },
      ],
      links: [],
    })
  }
  if (on.webrtc) {
    const whip = `${urls.webrtcBase}/whip`
    endpoints.push({
      protocol: 'WebRTC (WHIP)',
      url: whip,
      snippets: [
        // WebRTC carries neither AAC nor every H264 profile, so this one
        // transcodes where the others copy.
        {
          client: 'ffmpeg',
          text: `ffmpeg -re -stream_loop -1 -i file.mp4 -c:v libx264 -pix_fmt yuv420p -preset ultrafast -b:v 600k -c:a libopus -ar 48000 -ac 2 -b:a 128k -f whip ${whip}`,
          note: 'whipTracks',
        },
        obs('WHIP', whip, false),
      ],
      links: [{ kind: 'browserPublish', href: `${urls.webrtcBase}/publish` }],
    })
  }
  return endpoints
}

// Shapes from MediaMTX's docs/4-read.
function playerSnippets(url: string, withFfmpeg: boolean): Snippet[] {
  return [
    ...withFfmpeg ? [{ client: 'ffmpeg', text: `ffmpeg -i ${url} -c copy out.mp4` }] : [],
    { client: 'ffplay', text: `ffplay ${url}` },
    { client: 'VLC', text: `vlc ${url}` },
  ]
}

export function readEndpoints(host: string, path: string, global: GlobalConfig | null | undefined): Endpoint[] {
  const urls = urlsFor(host, path, global)
  const on = serves(global)
  const endpoints: Endpoint[] = []
  // `rtsp://` and `srt://` have OS handlers (VLC registers both); `rtmp://` mostly doesn't.
  if (on.rtsp)
    endpoints.push({ protocol: 'RTSP', url: urls.rtsp, snippets: playerSnippets(urls.rtsp, true), links: [{ kind: 'systemPlayer', href: urls.rtsp }] })
  // VLC can't read RTSPS (MediaMTX docs/4-read/10-vlc.md), and VLC is the
  // usual handler a system-player link would land in.
  if (on.rtsps)
    endpoints.push({ protocol: 'RTSPS', url: urls.rtsps, snippets: playerSnippets(urls.rtsps, true).filter(s => s.client !== 'VLC'), links: [] })
  if (on.rtmp)
    endpoints.push({ protocol: 'RTMP', url: urls.rtmp, snippets: playerSnippets(urls.rtmp, true), links: [] })
  if (on.rtmps)
    endpoints.push({ protocol: 'RTMPS', url: urls.rtmps, snippets: playerSnippets(urls.rtmps, true), links: [] })
  if (on.srt)
    endpoints.push({ protocol: 'SRT', url: urls.srtRead, snippets: playerSnippets(`'${urls.srtRead}'`, true), links: [{ kind: 'systemPlayer', href: urls.srtRead }] })
  if (on.hls)
    endpoints.push({ protocol: 'HLS', url: `${urls.hlsBase}/index.m3u8`, snippets: playerSnippets(`${urls.hlsBase}/index.m3u8`, false), links: [{ kind: 'hlsPage', href: urls.hlsBase }] })
  if (on.webrtc)
    endpoints.push({ protocol: 'WebRTC (WHEP)', url: `${urls.webrtcBase}/whep`, snippets: [], links: [{ kind: 'webrtcPage', href: urls.webrtcBase }] })
  return endpoints
}
