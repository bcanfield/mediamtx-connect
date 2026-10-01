import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { MediaMTXConfigForm } from './mediamtx-config-form'
import { globalScope, PATH_DEFAULTS_SCOPE, pathConfigScope } from './sections'

const GLOBAL_SCOPE = globalScope({ required: 'This field is required', mustBePositive: 'Must be greater than 0' })

// Saving a runOn* key makes MediaMTX re-create the path, which drops the
// publisher, while a record* save leaves the session alone (ADR 0002's
// consequence, verified on v1.19.2). The two sections sit behind identical save
// bars, so the warning is the only thing telling them apart.
const WARNING = /Saving a hook restarts the path/

const noop = vi.fn(async () => {})

describe('path hooks save warning', () => {
  it('warns on the per-path scope', async () => {
    await renderWithProviders(
      <MediaMTXConfigForm scope={pathConfigScope('nope')} conf={{}} onSave={noop} />,
    )

    expect(screen.getByRole('heading', { name: 'Path Hooks' })).toBeInTheDocument()
    expect(screen.getByText(WARNING)).toBeInTheDocument()
  })

  it('warns on the path-defaults scope', async () => {
    await renderWithProviders(
      <MediaMTXConfigForm scope={PATH_DEFAULTS_SCOPE} conf={{}} onSave={noop} />,
    )

    expect(screen.getByRole('heading', { name: 'Path Hooks' })).toBeInTheDocument()
    expect(screen.getByText(WARNING)).toBeInTheDocument()
  })

  it('leaves the Recording section unwarned', async () => {
    await renderWithProviders(
      <MediaMTXConfigForm scope={PATH_DEFAULTS_SCOPE} conf={{ record: true }} onSave={noop} />,
    )

    expect(screen.getByRole('heading', { name: 'Recording' })).toBeInTheDocument()
    expect(screen.getAllByText(WARNING)).toHaveLength(1)
  })

  it('leaves the global hooks section unwarned', async () => {
    await renderWithProviders(
      <MediaMTXConfigForm scope={GLOBAL_SCOPE} conf={{}} onSave={noop} />,
    )

    expect(screen.getByRole('heading', { name: 'Hooks' })).toBeInTheDocument()
    expect(screen.queryByText(WARNING)).not.toBeInTheDocument()
  })
})

// The global scope PATCHes the whole form, so whatever a cleared field holds is
// what MediaMTX receives. It refuses `[""]` for most list keys and `0` for every
// number key, and `udpMaxPayloadSize: 0` makes it exit.
describe('cleared global fields', () => {
  const saveButton = () => screen.getByRole('button', { name: 'Save to server' })

  it('saves an emptied list as []', async () => {
    const onSave = vi.fn(async (_values: unknown) => {})
    const { user } = await renderWithProviders(
      <MediaMTXConfigForm
        scope={GLOBAL_SCOPE}
        conf={{ webrtc: true, webrtcAdditionalHosts: ['10.0.0.5'] }}
        onSave={onSave}
      />,
    )

    await user.clear(screen.getByRole('textbox', { name: 'webrtcAdditionalHosts' }))
    await user.click(saveButton())

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    expect(onSave.mock.calls[0]![0]).toMatchObject({ webrtcAdditionalHosts: [] })
  })

  it('trims a list and drops its blank lines on blur', async () => {
    const onSave = vi.fn(async (_values: unknown) => {})
    const { user } = await renderWithProviders(
      <MediaMTXConfigForm scope={GLOBAL_SCOPE} conf={{ hls: true, hlsTrustedProxies: [] }} onSave={onSave} />,
    )
    const textarea = screen.getByRole('textbox', { name: 'hlsTrustedProxies' })

    await user.type(textarea, '10.0.0.0/8{Enter}{Enter}')
    await user.tab()

    expect(textarea).toHaveValue('10.0.0.0/8')
    await user.click(saveButton())
    await waitFor(() => expect(onSave).toHaveBeenCalled())
    expect(onSave.mock.calls[0]![0]).toMatchObject({ hlsTrustedProxies: ['10.0.0.0/8'] })
  })

  it('marks an emptied number field required and holds the save', async () => {
    const { user } = await renderWithProviders(
      <MediaMTXConfigForm scope={GLOBAL_SCOPE} conf={{ writeQueueSize: 512 }} onSave={noop} />,
    )

    await user.clear(screen.getByRole('spinbutton', { name: 'writeQueueSize' }))
    await user.tab()

    expect(await screen.findByText('This field is required')).toBeInTheDocument()
    expect(screen.getByText(/1 field needs attention/)).toBeInTheDocument()
    expect(saveButton()).toBeDisabled()
  })

  it('refuses a number that is not positive', async () => {
    const { user } = await renderWithProviders(
      <MediaMTXConfigForm scope={GLOBAL_SCOPE} conf={{ udpMaxPayloadSize: 1472 }} onSave={noop} />,
    )
    const input = screen.getByRole('spinbutton', { name: 'udpMaxPayloadSize' })

    await user.clear(input)
    await user.type(input, '0')
    await user.tab()

    expect(await screen.findByText('Must be greater than 0')).toBeInTheDocument()
    expect(saveButton()).toBeDisabled()
  })
})
