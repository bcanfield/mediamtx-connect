import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { MediaMTXConfigForm } from './mediamtx-config-form'
import { GLOBAL_SCOPE, PATH_DEFAULTS_SCOPE, pathConfigScope } from './sections'

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

// MediaMTX's current lifecycle hooks (v1.21.1). The old "ready" names are
// deprecated aliases it no longer serves, so rows under them opened blank.
const PATH_HOOKS = ['runOnAvailable', 'runOnUnavailable', 'runOnOnline', 'runOnOffline']

describe('path hooks', () => {
  it.each([
    ['per-path', pathConfigScope('nope')],
    ['path-defaults', PATH_DEFAULTS_SCOPE],
  ])('renders the available and online hooks on the %s scope', async (_, scope) => {
    await renderWithProviders(
      <MediaMTXConfigForm scope={scope} conf={{}} onSave={noop} />,
    )

    for (const name of PATH_HOOKS)
      expect(screen.getByRole('textbox', { name })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'runOnOnlineRestart' })).toBeInTheDocument()
    expect(screen.getByText(WARNING)).toBeInTheDocument()
  })
})

// MediaMTX refuses `""` for these and fails the whole save, so the control
// offers exactly the values it accepts and has no empty state.
describe('enum fields', () => {
  const served = { rtspEncryption: 'no', rtmpEncryption: 'optional', authMethod: 'internal' } as const

  it.each(Object.entries(served))('shows the served %s as the selected choice', async (name, value) => {
    await renderWithProviders(
      <MediaMTXConfigForm scope={GLOBAL_SCOPE} conf={served} onSave={noop} />,
    )

    const group = screen.getByRole('radiogroup', { name })
    expect(within(group).getByRole('radio', { name: value })).toBeChecked()
  })

  it.each([
    ['rtspEncryption', 'strict'],
    ['rtmpEncryption', 'strict'],
    ['authMethod', 'http'],
  ])('saves another %s choice', async (name, next) => {
    const onSave = vi.fn<(values: unknown, changed: unknown) => Promise<void>>(async () => {})
    const view = await renderWithProviders(
      <MediaMTXConfigForm scope={GLOBAL_SCOPE} conf={served} onSave={onSave} />,
    )

    await view.user.click(within(screen.getByRole('radiogroup', { name })).getByRole('radio', { name: next }))
    await view.user.click(screen.getByRole('button', { name: 'Save to server' }))

    await vi.waitFor(() => expect(onSave).toHaveBeenCalled())
    expect(onSave.mock.calls[0]).toEqual([
      expect.objectContaining({ [name]: next }),
      { [name]: next },
    ])
  })

  it('keeps the choice when the selected option is pressed again', async () => {
    const view = await renderWithProviders(
      <MediaMTXConfigForm scope={GLOBAL_SCOPE} conf={served} onSave={noop} />,
    )

    const group = screen.getByRole('radiogroup', { name: 'rtspEncryption' })
    await view.user.click(within(group).getByRole('radio', { name: 'no' }))

    expect(within(group).getByRole('radio', { name: 'no' })).toBeChecked()
    expect(screen.queryByTestId('save-bar')).not.toBeInTheDocument()
  })
})

describe('allow-origin lists', () => {
  it.each(['hlsAllowOrigins', 'webrtcAllowOrigins'])('round-trips %s as a one-line list', async (name) => {
    const onSave = vi.fn<(values: unknown, changed: unknown) => Promise<void>>(async () => {})
    const view = await renderWithProviders(
      <MediaMTXConfigForm scope={GLOBAL_SCOPE} conf={{ [name]: ['*'] }} onSave={onSave} />,
    )

    const field = screen.getByRole('textbox', { name })
    expect(field).toHaveValue('*')

    // Saving an unrelated key still sends the whole global config through the
    // schema, so the list has to come out the other side as MediaMTX served it.
    await view.user.type(screen.getByRole('textbox', { name: 'logLevel' }), 'debug')
    await view.user.click(screen.getByRole('button', { name: 'Save to server' }))

    await vi.waitFor(() => expect(onSave).toHaveBeenCalled())
    expect(onSave.mock.calls[0]![0]).toEqual(expect.objectContaining({ [name]: ['*'] }))
  })

  it.each(['hlsAllowOrigins', 'webrtcAllowOrigins'])('takes one %s entry per line', async (name) => {
    const onSave = vi.fn<(values: unknown, changed: unknown) => Promise<void>>(async () => {})
    const view = await renderWithProviders(
      <MediaMTXConfigForm scope={GLOBAL_SCOPE} conf={{ [name]: ['https://a.lan'] }} onSave={onSave} />,
    )

    await view.user.type(screen.getByRole('textbox', { name }), '{Enter}https://b.lan')
    await view.user.click(screen.getByRole('button', { name: 'Save to server' }))

    await vi.waitFor(() => expect(onSave).toHaveBeenCalled())
    expect(onSave.mock.calls[0]![1]).toEqual({ [name]: ['https://a.lan', 'https://b.lan'] })
  })
})

// A destination's stream key belongs to one account, so `forward` is edited per
// path and never from path defaults, where it would push every stream to it.
describe('forwarding scope', () => {
  it('is a section of a path\'s own config', async () => {
    await renderWithProviders(
      <MediaMTXConfigForm scope={pathConfigScope('nope')} conf={{}} onSave={noop} />,
    )

    expect(screen.getByRole('heading', { name: 'Forwarding' })).toBeInTheDocument()
  })

  it('is not a section of path defaults', async () => {
    await renderWithProviders(
      <MediaMTXConfigForm scope={PATH_DEFAULTS_SCOPE} conf={{}} onSave={noop} />,
    )

    expect(screen.getByRole('heading', { name: 'Recording' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Forwarding' })).not.toBeInTheDocument()
  })
})
