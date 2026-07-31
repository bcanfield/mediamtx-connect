import type { StubApi } from '@/test/rpc-server'
import { screen, waitFor, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { AppHeader } from './app-header'

// Replaces i18n.spec.ts (5 tests) and the three navigation tests from
// streams.spec.ts (ADR 0005, change 1). Locale is a client-side setting — there
// is no URL locale prefix — so all of it is localStorage, an on-demand message
// import and the `lang` attribute. None of that needs a browser, and every one of
// those E2E tests carried a `waitForLoadState('networkidle')` plus a 10s timeout
// to paper over the message fetch.
//
// These use the app's REAL I18nProvider (`realI18n`), not the harness's fixed
// English one, or there would be nothing to switch.

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', streams: [] }),
}
const server = createRpcServer(stub)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
beforeEach(() => {
  localStorage.clear()
  document.documentElement.lang = ''
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// By role alone, not by accessible name: the nav's own aria-label is translated
// too ("Primary" → "Principal"), so keying on the English name would make every
// post-switch assertion fail for the wrong reason. AppHeader renders one nav.
const nav = () => screen.getByRole('navigation')

async function renderHeader(path = '/') {
  return renderWithProviders(<AppHeader />, { path, realI18n: true })
}

/** Open the switcher and choose a language by its native name. */
async function switchTo(user: ReturnType<typeof renderHeader> extends Promise<infer R> ? R extends { user: infer U } ? U : never : never, language: string) {
  await user.click(screen.getByRole('button', { name: 'Switch language' }))
  await user.click(await screen.findByRole('option', { name: language }))
}

describe('primary navigation', () => {
  it('links to every top-level section', async () => {
    await renderHeader()

    const links = within(nav()).getAllByRole('link')
    expect(links.map(a => a.getAttribute('href'))).toEqual([
      '/',
      '/recordings',
      '/config',
      '/config/mediamtx/global',
    ])
  })

  it('names every tab', async () => {
    await renderHeader()

    // Which tab reads as current is `isActiveRoute`'s job and is covered in
    // app-header.tab-state.test.ts — asserting aria-current here would be
    // asserting TanStack Link's prefix matching, not ours.
    expect(within(nav()).getAllByRole('link').map(a => a.textContent)).toEqual([
      'Live',
      'Recordings',
      'App Config',
      'MediaMTX Config',
    ])
  })

  it('shows the brand and a link home', async () => {
    await renderHeader('/recordings')

    expect(screen.getByText('MediaMTX')).toBeInTheDocument()
    expect(screen.getByText('Connect')).toBeInTheDocument()
  })
})

describe('locale switching', () => {
  it('serves English by default', async () => {
    await renderHeader()

    await waitFor(() => expect(document.documentElement.lang).toBe('en'))
    expect(within(nav()).getByRole('link', { name: 'Recordings' })).toBeInTheDocument()
  })

  it('switches the document language', async () => {
    const { user } = await renderHeader()

    await switchTo(user, 'Español')

    await waitFor(() => expect(document.documentElement.lang).toBe('es'))
  })

  it('translates the nav', async () => {
    const { user } = await renderHeader()

    await switchTo(user, 'Español')

    expect(await within(nav()).findByRole('link', { name: 'Grabaciones' })).toBeInTheDocument()
    expect(within(nav()).getByRole('link', { name: 'En vivo' })).toBeInTheDocument()
  })

  it('persists the choice to localStorage', async () => {
    const { user } = await renderHeader()

    await switchTo(user, 'Español')

    // What made the E2E "persists across reloads" test pass; asserting the
    // stored value directly needs no reload.
    await waitFor(() => expect(localStorage.getItem('locale')).toBe('es'))
  })

  it('starts in the stored locale on a later visit', async () => {
    localStorage.setItem('locale', 'es')

    await renderHeader()

    expect(await within(nav()).findByRole('link', { name: 'Grabaciones' })).toBeInTheDocument()
  })

  it('leaves the current route alone', async () => {
    const { user } = await renderHeader('/config')

    await switchTo(user, 'Español')
    await within(nav()).findByRole('link', { name: 'Grabaciones' })

    // Switching locale must not navigate: the nav hrefs are locale-independent,
    // and a switch that reset you to `/` would lose your place.
    expect(within(nav()).getByRole('link', { name: 'Configuración de la app' })).toHaveAttribute(
      'href',
      '/config',
    )
  })

  it('ignores a stored value that is not a supported locale', async () => {
    localStorage.setItem('locale', 'not-a-locale')

    await renderHeader()

    expect(await within(nav()).findByRole('link', { name: 'Recordings' })).toBeInTheDocument()
  })
})
