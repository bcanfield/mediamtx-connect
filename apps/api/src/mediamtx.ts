import type { AppConfig, GlobalConfig, PathConfig, PathDefaults, SessionProtocol } from '@connect/contract'

// Minimal hand-rolled client for the handful of MediaMTX endpoints this app
// uses (of the full v3 API). Key names mirror MediaMTX v1.21.1; CI runs 1.20.0.
interface MediaMtxPathReader {
  type?: string
  id?: string
}

// `tracks2` superseded the plain `tracks` string list in v1.19: same codecs,
// plus the properties the codec was negotiated with. Only video codecs carry
// dimensions, and MediaMTX sends `codecProps: null` for the ones that don't.
export interface MediaMtxPathTrack {
  codec?: string
  codecProps?: { width?: number, height?: number } | null
}

export interface MediaMtxPath {
  name?: string
  confName?: string
  // Whatever is publishing right now, by session type. Null while nothing is.
  source?: { type?: string, id?: string } | null
  ready?: boolean
  readyTime?: string | null
  tracks?: string[]
  tracks2?: MediaMtxPathTrack[]
  readers?: MediaMtxPathReader[]
  bytesReceived?: number
  bytesSent?: number
  // Added after v1.11.3, so absent on the older servers this client still talks
  // to — and an absent counter is not a counter reading zero.
  inboundFramesInError?: number
}

export interface MediaMtxInfo {
  version?: string
  started?: string
}

export interface MediaMtxPathList {
  pageCount?: number
  items?: MediaMtxPath[]
}

// A config entry as the list endpoint serves it: the sparse override plus the
// name it is filed under. `PathConfig` carries neither, so it can't be reused.
interface MediaMtxPathConf {
  name?: string
  source?: string
}

export interface MediaMtxPathConfList {
  pageCount?: number
  items?: MediaMtxPathConf[]
}

// The create body also carries `rtspTransport`, which the per-path editor
// doesn't surface — only the guided add writes it.
export type MediaMtxPathCreate = PathConfig & {
  rtspTransport?: string
}

// One session or conn off any protocol's list, with only the fields we read.
// Which byte counters are real differs by protocol: SRT counts in
// `bytesReceived`/`bytesSent`, the rest in `inboundBytes`/`outboundBytes` (their
// `bytes*` are deprecated aliases). HLS sessions have no `state` and no inbound.
// MediaMTX always sends id, created, remoteAddr and path on every protocol.
export interface MediaMtxSession {
  id: string
  created: string
  remoteAddr: string
  state?: string
  path: string
  inboundBytes?: number
  outboundBytes?: number
  bytesReceived?: number
  bytesSent?: number
}

export interface MediaMtxSessionList {
  pageCount?: number
  items?: MediaMtxSession[]
}

// The legacy route names: v1.20.0, the shipped image, serves only these, and
// v1.21 still serves them next to its new category routes. RTSP is `sessions`,
// not `conns` — only a session carries a path and state, and only it kicks.
// HLS is sessions (one per reader), not muxers.
const SESSION_ROUTES: Record<SessionProtocol, string> = {
  rtsp: '/rtspsessions',
  rtsps: '/rtspssessions',
  rtmp: '/rtmpconns',
  rtmps: '/rtmpsconns',
  srt: '/srtconns',
  webrtc: '/webrtcsessions',
  hls: '/hlssessions',
}

// MediaMTX answers a rejected write with `{"error": "..."}`. That reason — a
// name already in use, a source it can't parse — is the only thing that says
// what to change, so it rides along on the throw instead of being flattened
// into a status code.
export class MediaMtxError extends Error {
  constructor(readonly status: number, readonly reason: string | null, request: string) {
    super(`MediaMTX ${request} responded ${status}${reason ? `: ${reason}` : ''}`)
  }
}

async function errorReason(res: Response): Promise<string | null> {
  // Anything between us and MediaMTX can answer with something that isn't its
  // error envelope — a proxy's HTML 502, say.
  try {
    const body = await res.json() as { error?: string }
    return body.error ?? null
  }
  catch {
    return null
  }
}

export function mediaMtxApi(config: Pick<AppConfig, 'mediaMtxUrl' | 'mediaMtxApiPort'>) {
  const base = `${config.mediaMtxUrl}:${config.mediaMtxApiPort}/v3`

  async function request<T>(route: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${base}${route}`, init)
    if (!res.ok)
      throw new MediaMtxError(res.status, await errorReason(res), `${init?.method ?? 'GET'} ${route}`)
    if (res.status === 204 || (init?.method !== undefined && init.method !== 'GET'))
      return undefined as T
    return await res.json() as T
  }

  // 404 is a real answer for the per-path endpoints, not a failure: a
  // wildcard-backed path has no config entry under its own name (ADR 0002).
  async function requestOrNull<T>(route: string): Promise<T | null> {
    const res = await fetch(`${base}${route}`)
    if (res.status === 404)
      return null
    if (!res.ok)
      throw new MediaMtxError(res.status, await errorReason(res), `GET ${route}`)
    return await res.json() as T
  }

  const jsonHeaders = { 'Content-Type': 'application/json' }

  return {
    // 404 on MediaMTX older than v1.15.2, which has no /v3/info.
    info: () => requestOrNull<MediaMtxInfo>('/info'),
    pathsList: () => request<MediaMtxPathList>('/paths/list'),
    pathsGet: (name: string) =>
      requestOrNull<MediaMtxPath>(`/paths/get/${encodeURIComponent(name)}`),
    configGlobalGet: () => request<GlobalConfig>('/config/global/get'),
    configGlobalPatch: (conf: GlobalConfig) =>
      request<void>('/config/global/patch', {
        method: 'PATCH',
        headers: jsonHeaders,
        body: JSON.stringify(conf),
      }),
    configPathDefaultsGet: () => request<PathDefaults>('/config/pathdefaults/get'),
    configPathDefaultsPatch: (conf: PathDefaults) =>
      request<void>('/config/pathdefaults/patch', {
        method: 'PATCH',
        headers: jsonHeaders,
        body: JSON.stringify(conf),
      }),

    configPathsList: () => request<MediaMtxPathConfList>('/config/paths/list'),
    // Returns the entry with path defaults already resolved into it — this is
    // effective config, not the raw override set. Null when no entry exists.
    configPathGet: (name: string) =>
      requestOrNull<PathConfig>(`/config/paths/get/${encodeURIComponent(name)}`),
    // Creates an entry for a path that had none. The body is a sparse override:
    // omitted keys keep tracking path defaults, and live sessions are untouched.
    configPathAdd: (name: string, conf: MediaMtxPathCreate) =>
      request<void>(`/config/paths/add/${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(conf),
      }),
    configPathPatch: (name: string, conf: PathConfig) =>
      request<void>(`/config/paths/patch/${encodeURIComponent(name)}`, {
        method: 'PATCH',
        headers: jsonHeaders,
        body: JSON.stringify(conf),
      }),
    // Removes the entry entirely; the path falls back to the wildcard that
    // covers it. 404 when there is no entry under this name.
    configPathDelete: (name: string) =>
      request<void>(`/config/paths/delete/${encodeURIComponent(name)}`, { method: 'DELETE' }),

    // First page only (MediaMTX's default, 100 items). A disabled protocol
    // isn't routed at all, so its list rejects with a 404 MediaMtxError.
    sessionsList: (protocol: SessionProtocol) =>
      request<MediaMtxSessionList>(`${SESSION_ROUTES[protocol]}/list`),
    // 404 when the session has already gone.
    sessionsKick: (protocol: SessionProtocol, id: string) =>
      request<void>(`${SESSION_ROUTES[protocol]}/kick/${encodeURIComponent(id)}`, { method: 'POST' }),
  }
}

// One continuous run of recording segments, as the playback server's /list
// serves it. `url` is built from the Host header of *our* request, so it names
// a host only the api can reach.
export interface MediaMtxPlaybackSpan {
  start: string
  duration: number
  url?: string
}

// MediaMTX listen addresses are `host:port` with the host usually empty
// (`:9996`). The api reaches MediaMTX on `mediaMtxUrl`, so only the port is kept.
function portOf(address: string | undefined, fallback: number): number {
  const port = Number.parseInt(address?.split(':').pop() ?? '', 10)
  return Number.isNaN(port) ? fallback : port
}

// MediaMTX's playback server: a separate listener from the v3 API, indexing a
// path's recording segments into spans and serving any span as one fMP4. Its
// address comes from global config, so the caller reads that first.
export function mediaMtxPlayback(config: Pick<AppConfig, 'mediaMtxUrl'>, playbackAddress: string | undefined) {
  const base = `${config.mediaMtxUrl}:${portOf(playbackAddress, 9996)}`

  return {
    // 404 is the playback server's answer for a range with no segments in it.
    list: async (path: string, start: Date, end: Date): Promise<MediaMtxPlaybackSpan[]> => {
      const query = new URLSearchParams({ path, start: start.toISOString(), end: end.toISOString() })
      const res = await fetch(`${base}/list?${query}`)
      if (res.status === 404)
        return []
      if (!res.ok)
        throw new MediaMtxError(res.status, await errorReason(res), 'GET /list')
      return await res.json() as MediaMtxPlaybackSpan[]
    },

    // The OK response itself, so the caller can stream its body: a span can be
    // hours of video. `start` is passed through as the RFC 3339 string it came as.
    get: async (params: { path: string, start: string, duration: number, format: 'fmp4' | 'mp4' }): Promise<Response> => {
      const query = new URLSearchParams({
        path: params.path,
        start: params.start,
        duration: String(params.duration),
        format: params.format,
      })
      const res = await fetch(`${base}/get?${query}`)
      if (!res.ok)
        throw new MediaMtxError(res.status, await errorReason(res), 'GET /get')
      return res
    },
  }
}
