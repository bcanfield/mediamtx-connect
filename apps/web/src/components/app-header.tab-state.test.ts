import { describe, expect, it } from 'vitest'
import { isActiveRoute } from './nav-active'

// The tab-highlighting rule, at the layer it actually lives: a pure function of
// pathname and href. Asserting it through a rendered header would test TanStack
// Router's own `aria-current` (prefix-matched, so `/config` is "active" on
// `/config/mediamtx/global`) rather than this.
//
// The exact-match arms are the whole point. `/config` and `/config/mediamtx/*`
// are separate tabs sitting next to each other, and a prefix rule would light
// both of them at once on every MediaMTX config page.

describe('the live tab', () => {
  it('is active only on the index', () => {
    expect(isActiveRoute('/', '/')).toBe(true)
  })

  it('is not active on any deeper route', () => {
    expect(isActiveRoute('/recordings', '/')).toBe(false)
    expect(isActiveRoute('/config', '/')).toBe(false)
  })
})

describe('the App Config tab', () => {
  it('is active on exactly /config', () => {
    expect(isActiveRoute('/config', '/config')).toBe(true)
  })

  it('is NOT active on a MediaMTX config route', () => {
    // A prefix rule would return true here and light both config tabs.
    expect(isActiveRoute('/config/mediamtx/global', '/config')).toBe(false)
    expect(isActiveRoute('/config/mediamtx/paths/stream1', '/config')).toBe(false)
  })
})

describe('the MediaMTX Config tab', () => {
  it('is active on its own route', () => {
    expect(isActiveRoute('/config/mediamtx/global', '/config/mediamtx/global')).toBe(true)
  })

  it('stays active across the MediaMTX config sub-routes', () => {
    // Prefix matching is wanted here: path-defaults and per-path pages belong to
    // this tab, so it must not go dark when you navigate within the section.
    expect(isActiveRoute('/config/mediamtx/global/extra', '/config/mediamtx/global')).toBe(true)
  })
})

describe('the recordings tab', () => {
  it('is active on the index and on a stream detail page', () => {
    expect(isActiveRoute('/recordings', '/recordings')).toBe(true)
    expect(isActiveRoute('/recordings/stream1', '/recordings')).toBe(true)
  })
})

describe('an unresolved pathname', () => {
  it('activates nothing', () => {
    // usePathname can be null before the router settles; a `null` that matched
    // `/` would flash the wrong tab as current on every first paint.
    expect(isActiveRoute(null, '/')).toBe(false)
    expect(isActiveRoute(null, '/config')).toBe(false)
  })
})
