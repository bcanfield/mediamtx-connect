import { screen, waitFor, within } from '@testing-library/react'
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

// MediaMTX validates path defaults as the `all_others` entry and refuses both
// switches there, so the section is only offered where a save can succeed.
describe('resilience', () => {
  const KEYS = ['alwaysAvailable', 'alwaysAvailableFile', 'sourceOnDemand', 'sourceOnDemandStartTimeout', 'sourceOnDemandCloseAfter']

  it('renders the five keys with the restart warning on the per-path scope', async () => {
    await renderWithProviders(
      <MediaMTXConfigForm scope={pathConfigScope('nope')} conf={{}} onSave={noop} />,
    )

    const section = screen.getByRole('heading', { name: 'Resilience' }).closest('section')!
    expect(within(section).getAllByTestId(/^field-/).map(row => row.dataset.testid))
      .toEqual(KEYS.map(key => `field-${key}`))
    expect(within(section).getByText(/Saving any of these restarts the path/)).toBeInTheDocument()
  })

  it('leaves it off the path-defaults scope', async () => {
    await renderWithProviders(
      <MediaMTXConfigForm scope={PATH_DEFAULTS_SCOPE} conf={{}} onSave={noop} />,
    )

    expect(screen.queryByRole('heading', { name: 'Resilience' })).not.toBeInTheDocument()
    for (const key of KEYS)
      expect(screen.queryByTestId(`field-${key}`)).not.toBeInTheDocument()
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
