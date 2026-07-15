import type { AppConfig, GlobalConfig } from '@connect/contract'

// Minimal hand-rolled client for the three MediaMTX endpoints this app uses
// (of the full v3 API). Shapes mirror MediaMTX v1.11.3 swagger.
export interface MediaMtxPath {
  name?: string
  confName?: string
  ready?: boolean
  readyTime?: string | null
  tracks?: string[]
  bytesReceived?: number
  bytesSent?: number
}

export interface MediaMtxPathList {
  pageCount?: number
  items?: MediaMtxPath[]
}

export function mediaMtxApi(config: Pick<AppConfig, 'mediaMtxUrl' | 'mediaMtxApiPort'>) {
  const base = `${config.mediaMtxUrl}:${config.mediaMtxApiPort}/v3`

  async function request<T>(route: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${base}${route}`, init)
    if (!res.ok)
      throw new Error(`MediaMTX ${init?.method ?? 'GET'} ${route} responded ${res.status}`)
    if (res.status === 204 || init?.method === 'PATCH')
      return undefined as T
    return await res.json() as T
  }

  return {
    pathsList: () => request<MediaMtxPathList>('/paths/list'),
    configGlobalGet: () => request<GlobalConfig>('/config/global/get'),
    configGlobalPatch: (conf: GlobalConfig) =>
      request<void>('/config/global/patch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conf),
      }),
  }
}
