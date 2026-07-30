import type { AppConfig } from '@connect/contract'
import type { RpcInputs, StubApi } from '@/test/rpc-server'
import { screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { ClientConfigForm } from './client-config-form'

// Replaces the App Config half of config.spec.ts (ADR 0005, change 1): the field
// inventory, the hero playback badge, editability, the descriptions, and the
// save-bar's dirty-state logic including the round trip that "persists after
// reload" was really checking. Three of those E2E tests wrapped their assertion
// in `if`, so they passed whether or not the form rendered.
//
// The save round trip is the interesting one. In Playwright it needed a real
// server, a reload, and a comparison against whatever was on disk; here the
// mutation input is asserted directly, which is both stricter and the thing that
// would actually break if a contract field were renamed.

const updateAppConfig = vi.fn<(input: RpcInputs['config']['app']['update']) => void>()

const CONFIG: AppConfig = {
  mediaMtxUrl: 'http://127.0.0.1',
  mediaMtxApiPort: 9997,
  remoteMediaMtxUrl: 'http://localhost',
  recordingsDirectory: '/recordings',
  screenshotsDirectory: '/screenshots',
}

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', streams: [] }),
  updateAppConfig,
}

const server = createRpcServer(stub)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

const renderForm = () => renderWithProviders(<ClientConfigForm clientConfig={CONFIG} />)

const saveBar = () => screen.queryByTestId('save-bar')

describe('the form', () => {
  it('renders a field per app-config key, seeded from the server', async () => {
    await renderForm()

    expect(screen.getByLabelText('MediaMTX URL')).toHaveValue('http://127.0.0.1')
    expect(screen.getByLabelText('API port')).toHaveValue(9997)
    expect(screen.getByLabelText('Playback URL')).toHaveValue('http://localhost')
    expect(screen.getByLabelText('Recordings directory')).toHaveValue('/recordings')
    expect(screen.getByLabelText('Screenshots directory')).toHaveValue('/screenshots')
  })

  it('groups the fields under section headings', async () => {
    await renderForm()

    expect(screen.getByRole('heading', { name: 'MediaMTX connection' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Storage' })).toBeInTheDocument()
  })

  it('flags the playback URL as required for live playback', async () => {
    await renderForm()

    expect(screen.getByText('Required for live playback')).toBeInTheDocument()
  })

  it('explains what each field does', async () => {
    await renderForm()

    expect(screen.getByText(/The port of the MediaMTX API/)).toBeInTheDocument()
    expect(screen.getByText(/Live playback loads streams from here/)).toBeInTheDocument()
  })

  it('accepts edits', async () => {
    const { user } = await renderForm()
    const url = screen.getByLabelText('MediaMTX URL')

    await user.clear(url)
    await user.type(url, 'http://mediamtx')

    expect(url).toHaveValue('http://mediamtx')
  })
})

describe('the save bar', () => {
  it('stays hidden while the form is pristine', async () => {
    await renderForm()

    // Anchor: the form is definitely rendered, so the negative is not vacuous.
    expect(screen.getByLabelText('MediaMTX URL')).toBeInTheDocument()
    expect(saveBar()).not.toBeInTheDocument()
  })

  it('appears once a field changes', async () => {
    const { user } = await renderForm()

    await user.type(screen.getByLabelText('MediaMTX URL'), 'x')

    expect(await screen.findByTestId('save-bar')).toBeInTheDocument()
  })

  it('counts the changed fields', async () => {
    const { user } = await renderForm()

    await user.type(screen.getByLabelText('MediaMTX URL'), 'x')
    await user.type(screen.getByLabelText('Recordings directory'), 'y')

    expect(await screen.findByText('2 unsaved changes')).toBeInTheDocument()
  })

  it('goes away again when the edit is reset', async () => {
    const { user } = await renderForm()
    await user.type(screen.getByLabelText('MediaMTX URL'), 'x')
    await screen.findByTestId('save-bar')

    // This form labels its discard action "Reset"; the MediaMTX forms say
    // "Discard". Both come from Config.saveBar, so the label is not incidental.
    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(saveBar()).not.toBeInTheDocument()
    expect(screen.getByLabelText('MediaMTX URL')).toHaveValue('http://127.0.0.1')
  })

  it('reports a field that fails validation', async () => {
    const { user } = await renderForm()
    const url = screen.getByLabelText('MediaMTX URL')

    await user.clear(url)
    await user.tab()

    expect(await screen.findByText(/1 field needs attention/)).toBeInTheDocument()
  })
})

describe('saving', () => {
  it('sends the whole config, with the edit applied', async () => {
    const { user } = await renderForm()
    const port = screen.getByLabelText('API port')

    await user.clear(port)
    await user.type(port, '9998')
    await user.click(await screen.findByRole('button', { name: /Save/ }))

    // `satisfies` on the literal: vitest's toHaveBeenCalledWith is not strictly
    // typed, so without it a renamed contract field still compiles here.
    await vi.waitFor(() =>
      expect(updateAppConfig).toHaveBeenCalledWith({
        ...CONFIG,
        mediaMtxApiPort: 9998,
      } satisfies RpcInputs['config']['app']['update']),
    )
  })

  it('confirms the save and clears the bar', async () => {
    const { user } = await renderForm()
    await user.type(screen.getByLabelText('Recordings directory'), '/x')

    await user.click(await screen.findByRole('button', { name: /Save/ }))

    expect(await screen.findByText('App Config saved')).toBeInTheDocument()
  })
})
