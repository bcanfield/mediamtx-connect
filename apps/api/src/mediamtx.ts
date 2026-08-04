import type { AppConfig, GlobalConfig, PathConfig, PathDefaults } from '@connect/contract'

// Minimal hand-rolled client for the handful of MediaMTX endpoints this app
// uses (of the full v3 API). Shapes mirror MediaMTX v1.11.3 swagger.
// MediaMTX describes the publisher and every reader the same way: a kind
// (`rtspSession`, `hlsMuxer`, `webRTCSession`) and an opaque id.
export interface MediaMtxPathConnection {
  type: string
  id: string
}

export interface MediaMtxPath {
  name?: string
  confName?: string
  ready?: boolean
  readyTime?: string | null
  tracks?: string[]
  // Whatever is publishing to the path. Null while nothing is.
  source?: MediaMtxPathConnection | null
  readers?: MediaMtxPathConnection[]
  bytesReceived?: number
  bytesSent?: number
}

export interface MediaMtxPathList {
  pageCount?: number
  items?: MediaMtxPath[]
}

// A config entry as the list endpoint serves it: the sparse override plus the
// name it is filed under. `PathConfig` carries neither, so it can't be reused.
export interface MediaMtxPathConf {
  name?: string
  source?: string
}

export interface MediaMtxPathConfList {
  pageCount?: number
  items?: MediaMtxPathConf[]
}

// The create body carries `source`, which `PathConfig` doesn't: that schema is
// the per-path override of path defaults, and `source` is not one of them.
export type MediaMtxPathCreate = PathConfig & {
  source?: string
  rtspTransport?: string
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
    if (res.status === 204 || init?.method === 'PATCH' || init?.method === 'DELETE')
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
  }
}
