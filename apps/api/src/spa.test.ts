import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Hono } from 'hono'
import { beforeAll, describe, expect, it } from 'vitest'
import { mountSpa } from './spa'

// Replaces spa-fallback.spec.ts (ADR 0005, change 1). That test booted a
// production build and a browser to assert one status code and one content-type
// header; here the static root is a fixture and the app answers in-process.
//
// It also asserts the thing the E2E version could not: that a REAL file is still
// served as itself. `/some/client/route` returning HTML is only half the
// contract — if the fallback shadowed the static handler, that assertion would
// still pass while every JS and CSS asset came back as index.html and the app
// booted to a blank page behind a wall of 200s.

let app: Hono

beforeAll(() => {
  const root = mkdtempSync(join(tmpdir(), 'spa-fixture-'))
  writeFileSync(join(root, 'index.html'), '<!doctype html><title>shell</title>')
  mkdirSync(join(root, 'assets'))
  writeFileSync(join(root, 'assets', 'app.js'), 'console.log(1)')
  writeFileSync(join(root, 'favicon.svg'), '<svg/>')
  app = mountSpa(new Hono(), root)
})

describe('the SPA shell', () => {
  it('serves index.html at the root', async () => {
    const res = await app.request('/')

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
  })

  it('serves index.html for an unknown client route', async () => {
    const res = await app.request('/some/client/route')

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    expect(await res.text()).toContain('<title>shell</title>')
  })

  it('serves index.html for a deep client route', async () => {
    // What a shared link or a hard refresh on /recordings/stream1 hits.
    const res = await app.request('/recordings/stream1')

    expect(res.status).toBe(200)
    expect(await res.text()).toContain('<title>shell</title>')
  })
})

describe('real assets are still themselves', () => {
  it('serves a built asset as JavaScript, not as the shell', async () => {
    const res = await app.request('/assets/app.js')

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('console.log(1)')
  })

  it('serves a root-level static file', async () => {
    const res = await app.request('/favicon.svg')

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('<svg/>')
  })

  it('falls back for a MISSING asset path', async () => {
    // Honest about current behaviour: the catch-all does not special-case
    // /assets, so a stale asset URL gets the shell with a 200 rather than a 404.
    // Asserted so a future change to 404 there is a deliberate decision.
    const res = await app.request('/assets/does-not-exist.js')

    expect(res.status).toBe(200)
    expect(await res.text()).toContain('<title>shell</title>')
  })
})

describe('methods other than GET', () => {
  it('does not answer a POST to an unknown path with the shell', async () => {
    // The fallback is registered with app.get, so a POST must fall through.
    // Answering 200 HTML to a POST would mask a missing API route as success.
    const res = await app.request('/some/client/route', { method: 'POST' })

    expect(res.status).toBe(404)
  })
})
