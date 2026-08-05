import { screen } from '@testing-library/react'
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
