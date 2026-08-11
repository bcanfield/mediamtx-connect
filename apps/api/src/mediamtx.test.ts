import { afterEach, describe, expect, it, vi } from 'vitest'
import { mediaMtxApi } from './mediamtx'

// The client is nothing but URL composition, method/header choice and error
// mapping, so `fetch` is stubbed rather than a MediaMTX being booted.
const fetchMock = vi.fn<typeof fetch>()
vi.stubGlobal('fetch', fetchMock)

const api = mediaMtxApi({ mediaMtxUrl: 'http://127.0.0.1', mediaMtxApiPort: 9997 })

type Api = typeof api

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 })
}

/** The URL and init the client passed to `fetch` on its most recent call. */
function lastRequest() {
  const [url, init] = fetchMock.mock.lastCall ?? []
  return { url, init }
}

afterEach(() => {
  vi.resetAllMocks()
})

describe('reads', () => {
  it.each([
    { name: 'pathsList', route: '/v3/paths/list', call: (a: Api) => a.pathsList() },
    { name: 'configGlobalGet', route: '/v3/config/global/get', call: (a: Api) => a.configGlobalGet() },
    { name: 'configPathDefaultsGet', route: '/v3/config/pathdefaults/get', call: (a: Api) => a.configPathDefaultsGet() },
    { name: 'configPathsList', route: '/v3/config/paths/list', call: (a: Api) => a.configPathsList() },
    { name: 'pathsGet', route: '/v3/paths/get/stream1', call: (a: Api) => a.pathsGet('stream1') },
    { name: 'configPathGet', route: '/v3/config/paths/get/stream1', call: (a: Api) => a.configPathGet('stream1') },
  ])('$name reads $route off the configured server', async ({ route, call }) => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }))

    await call(api)

    expect(lastRequest().url).toBe(`http://127.0.0.1:9997${route}`)
  })

  it('returns the parsed body', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ pageCount: 1, items: [{ name: 'stream1' }] }))

    await expect(api.pathsList()).resolves.toEqual({ pageCount: 1, items: [{ name: 'stream1' }] })
  })

  // A path name is a free-form MediaMTX key; unescaped it would change the route.
  it('escapes a path name into the URL', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}))

    await api.pathsGet('cam/one two')

    expect(lastRequest().url).toBe('http://127.0.0.1:9997/v3/paths/get/cam%2Fone%20two')
  })
})

describe('writes', () => {
  it.each([
    {
      name: 'configGlobalPatch',
      route: '/v3/config/global/patch',
      method: 'PATCH',
      body: { rtmpAddress: ':1936' },
      call: (a: Api) => a.configGlobalPatch({ rtmpAddress: ':1936' }),
    },
    {
      name: 'configPathDefaultsPatch',
      route: '/v3/config/pathdefaults/patch',
      method: 'PATCH',
      body: { record: true },
      call: (a: Api) => a.configPathDefaultsPatch({ record: true }),
    },
    {
      name: 'configPathAdd',
      route: '/v3/config/paths/add/cam%2Fone',
      method: 'POST',
      body: { record: true },
      call: (a: Api) => a.configPathAdd('cam/one', { record: true }),
    },
    {
      name: 'configPathPatch',
      route: '/v3/config/paths/patch/cam%2Fone',
      method: 'PATCH',
      body: { record: false },
      call: (a: Api) => a.configPathPatch('cam/one', { record: false }),
    },
  ])('$name sends $method $route as JSON', async ({ route, method, body, call }) => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await call(api)

    const { url, init } = lastRequest()
    expect(url).toBe(`http://127.0.0.1:9997${route}`)
    expect(init).toEqual({
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  })

  it('deletes an entry without sending a body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await api.configPathDelete('cam/one')

    const { url, init } = lastRequest()
    expect(url).toBe('http://127.0.0.1:9997/v3/config/paths/delete/cam%2Fone')
    expect(init).toEqual({ method: 'DELETE' })
  })

  // MediaMTX answers a successful write with an empty 200 body, so parsing it
  // as JSON would throw on a call that in fact succeeded.
  it.each([
    { name: 'a patch', call: (a: Api) => a.configPathPatch('stream1', { record: true }) },
    { name: 'a delete', call: (a: Api) => a.configPathDelete('stream1') },
  ])('resolves $name against an empty body', async ({ call }) => {
    fetchMock.mockResolvedValue(new Response('', { status: 200 }))

    await expect(call(api)).resolves.toBeUndefined()
  })

  it('resolves a 204 without a body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(api.configPathAdd('stream1', { record: true })).resolves.toBeUndefined()
  })
})

describe('error paths', () => {
  it('rejects when the server does not respond at all', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))

    await expect(api.pathsList()).rejects.toThrow('fetch failed')
  })

  it('names the route and status when a read fails', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 500 }))

    await expect(api.pathsList()).rejects.toThrow('MediaMTX GET /paths/list responded 500')
  })

  it('names the method when a write fails', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 400 }))

    await expect(api.configGlobalPatch({ rtmpAddress: ':1936' }))
      .rejects
      .toThrow('MediaMTX PATCH /config/global/patch responded 400')
  })

  // 404 is a real answer for the per-path reads, not a failure: a
  // wildcard-backed path has no config entry under its own name (ADR 0002).
  it.each([
    { name: 'pathsGet', call: (a: Api) => a.pathsGet('stopped') },
    { name: 'configPathGet', call: (a: Api) => a.configPathGet('stream1') },
  ])('$name answers null on 404', async ({ call }) => {
    fetchMock.mockResolvedValue(new Response('', { status: 404 }))

    await expect(call(api)).resolves.toBeNull()
  })

  it('still rejects a per-path read on a non-404 failure', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 500 }))

    await expect(api.configPathGet('stream1'))
      .rejects
      .toThrow('MediaMTX GET /config/paths/get/stream1 responded 500')
  })
})
