// @vitest-environment jsdom
import type { Config } from '@prisma/client'

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const updateClientConfig = vi.fn()
const toastSuccess = vi.fn()
const toastError = vi.fn()

vi.mock('./client-config.actions', () => ({ updateClientConfig }))
vi.mock('sonner', () => ({
  toast: { success: toastSuccess, error: toastError },
}))

const { ClientConfigForm } = await import('./client-config-form')

const baseConfig: Config = {
  id: 1,
  mediaMtxUrl: 'http://mediamtx',
  mediaMtxApiPort: 9997,
  remoteMediaMtxUrl: 'http://localhost:8888',
  recordingsDirectory: '/recordings',
  screenshotsDirectory: '/screenshots',
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
}

beforeEach(() => {
  updateClientConfig.mockReset()
  toastSuccess.mockReset()
  toastError.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('clientConfigForm', () => {
  it('disables submit until the form is dirty', async () => {
    render(<ClientConfigForm clientConfig={baseConfig} />)
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
  })

  it('enables submit after a valid edit and calls the action with the new values', async () => {
    updateClientConfig.mockResolvedValue(true)
    const user = userEvent.setup()
    render(<ClientConfigForm clientConfig={baseConfig} />)

    const url = screen.getByDisplayValue('http://mediamtx')
    await user.clear(url)
    await user.type(url, 'http://other')

    const submit = screen.getByRole('button', { name: 'Submit' })
    await waitFor(() => expect(submit).toBeEnabled())
    await user.click(submit)

    await waitFor(() =>
      expect(updateClientConfig).toHaveBeenCalledWith({
        clientConfig: expect.objectContaining({ mediaMtxUrl: 'http://other' }),
      }),
    )
  })

  it('fires a success toast when the action returns true', async () => {
    updateClientConfig.mockResolvedValue(true)
    const user = userEvent.setup()
    render(<ClientConfigForm clientConfig={baseConfig} />)

    await user.type(screen.getByDisplayValue('http://mediamtx'), 'X')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith('Updated Client Config'),
    )
  })

  it('fires a destructive toast when the action returns false', async () => {
    updateClientConfig.mockResolvedValue(false)
    const user = userEvent.setup()
    render(<ClientConfigForm clientConfig={baseConfig} />)

    await user.type(screen.getByDisplayValue('http://mediamtx'), 'X')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'There was an issue updating the Client Config',
        expect.objectContaining({ description: expect.any(String) }),
      ),
    )
  })

  it('blocks submit when a required field is cleared', async () => {
    const user = userEvent.setup()
    render(<ClientConfigForm clientConfig={baseConfig} />)

    const url = screen.getByDisplayValue('http://mediamtx')
    await user.clear(url)
    url.blur()

    const submit = screen.getByRole('button', { name: 'Submit' })
    await waitFor(() => expect(submit).toBeDisabled())
    expect(updateClientConfig).not.toHaveBeenCalled()
  })
})
