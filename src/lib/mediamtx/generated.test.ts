import type { GlobalConf } from './generated'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { Api } from './generated'

const baseUrl = 'http://mediamtx-test:9997'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function api() {
  return new Api({ baseUrl })
}

describe('pathsList', () => {
  it('issues a GET to /v3/paths/list and returns the parsed body', async () => {
    const payload = {
      itemCount: 1,
      pageCount: 1,
      items: [{ name: 'camera1' }],
    }
    server.use(
      http.get(`${baseUrl}/v3/paths/list`, ({ request }) => {
        expect(new URL(request.url).search).toBe('')
        return HttpResponse.json(payload)
      }),
    )

    const resp = await api().v3.pathsList({}, { cache: 'no-store' })
    expect(resp.status).toBe(200)
    expect(resp.data).toEqual(payload)
  })

  it('forwards page and itemsPerPage as query params', async () => {
    let captured: URLSearchParams | undefined
    server.use(
      http.get(`${baseUrl}/v3/paths/list`, ({ request }) => {
        captured = new URL(request.url).searchParams
        return HttpResponse.json({ itemCount: 0, pageCount: 0, items: [] })
      }),
    )

    await api().v3.pathsList({ page: 2, itemsPerPage: 50 })
    expect(captured?.get('page')).toBe('2')
    expect(captured?.get('itemsPerPage')).toBe('50')
  })

  it('throws on 5xx responses', async () => {
    server.use(
      http.get(`${baseUrl}/v3/paths/list`, () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 })),
    )

    await expect(api().v3.pathsList()).rejects.toMatchObject({
      status: 500,
      error: { error: 'boom' },
    })
  })

  it('throws on network errors', async () => {
    server.use(http.get(`${baseUrl}/v3/paths/list`, () => HttpResponse.error()))
    await expect(api().v3.pathsList()).rejects.toBeInstanceOf(TypeError)
  })
})

describe('configGlobalGet', () => {
  it('issues a GET to /v3/config/global/get and returns the parsed body', async () => {
    const conf: GlobalConf = { logLevel: 'info', api: true, hls: true }
    server.use(
      http.get(`${baseUrl}/v3/config/global/get`, () => HttpResponse.json(conf)),
    )

    const resp = await api().v3.configGlobalGet({ cache: 'no-store' })
    expect(resp.status).toBe(200)
    expect(resp.data).toEqual(conf)
  })

  it('throws on 4xx with the error body attached', async () => {
    server.use(
      http.get(`${baseUrl}/v3/config/global/get`, () =>
        HttpResponse.json({ error: 'unauthorized' }, { status: 401 })),
    )

    await expect(api().v3.configGlobalGet()).rejects.toMatchObject({
      status: 401,
      error: { error: 'unauthorized' },
    })
  })
})

describe('configGlobalSet', () => {
  it('issues a PATCH to /v3/config/global/patch with a JSON body', async () => {
    let receivedBody: unknown
    let contentType: string | null = null
    server.use(
      http.patch(`${baseUrl}/v3/config/global/patch`, async ({ request }) => {
        contentType = request.headers.get('content-type')
        receivedBody = await request.json()
        return new HttpResponse(null, { status: 200 })
      }),
    )

    const patch: GlobalConf = { logLevel: 'debug', hls: false }
    const resp = await api().v3.configGlobalSet(patch)
    expect(resp.status).toBe(200)
    expect(receivedBody).toEqual(patch)
    expect(contentType).toMatch(/application\/json/)
  })

  it('throws on 4xx', async () => {
    server.use(
      http.patch(`${baseUrl}/v3/config/global/patch`, () =>
        HttpResponse.json({ error: 'invalid field' }, { status: 400 })),
    )

    await expect(api().v3.configGlobalSet({ logLevel: 'info' })).rejects.toMatchObject({
      status: 400,
    })
  })
})

describe('apiConfig', () => {
  it('honors a custom baseUrl', async () => {
    const otherBase = 'http://other-host:1234'
    server.use(
      http.get(`${otherBase}/v3/paths/list`, () =>
        HttpResponse.json({ itemCount: 0, pageCount: 0, items: [] })),
    )

    const resp = await new Api({ baseUrl: otherBase }).v3.pathsList()
    expect(resp.status).toBe(200)
  })
})
