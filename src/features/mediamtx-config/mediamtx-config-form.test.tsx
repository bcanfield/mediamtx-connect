// @vitest-environment jsdom
import type { GlobalConf } from '@/lib/mediamtx/generated'

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const updateGlobalConfig = vi.fn()
const toast = vi.fn()

vi.mock('./mediamtx-config.actions', () => ({ updateGlobalConfig }))
vi.mock('@/components/ui/use-toast', () => ({ useToast: () => ({ toast }) }))

const { MediaMTXConfigForm } = await import('./mediamtx-config-form')

const baseConfig: GlobalConf = {
  logLevel: 'info',
  api: true,
  hls: true,
}

beforeEach(() => {
  updateGlobalConfig.mockReset()
  toast.mockReset()
})

afterEach(() => {
  cleanup()
})

function getLogLevelInput() {
  return screen.getByLabelText('Log Level') as HTMLInputElement
}

describe('mediaMTXConfigForm', () => {
  it('disables submit until the form is dirty', async () => {
    render(<MediaMTXConfigForm globalConf={baseConfig} />)
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
  })

  it('calls updateGlobalConfig with the edited values on submit', async () => {
    updateGlobalConfig.mockResolvedValue(true)
    const user = userEvent.setup()
    render(<MediaMTXConfigForm globalConf={baseConfig} />)

    const logLevel = getLogLevelInput()
    await user.clear(logLevel)
    await user.type(logLevel, 'debug')

    const submit = screen.getByRole('button', { name: 'Submit' })
    await waitFor(() => expect(submit).toBeEnabled())
    await user.click(submit)

    await waitFor(() =>
      expect(updateGlobalConfig).toHaveBeenCalledWith({
        globalConfig: expect.objectContaining({ logLevel: 'debug' }),
      }),
    )
  })

  it('fires a success toast when the action returns true', async () => {
    updateGlobalConfig.mockResolvedValue(true)
    const user = userEvent.setup()
    render(<MediaMTXConfigForm globalConf={baseConfig} />)

    await user.type(getLogLevelInput(), '!')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({ title: 'Updated Global Config' }),
    )
  })

  it('fires a destructive toast when the action returns false', async () => {
    updateGlobalConfig.mockResolvedValue(false)
    const user = userEvent.setup()
    render(<MediaMTXConfigForm globalConf={baseConfig} />)

    await user.type(getLogLevelInput(), '!')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'There was an issue updating the Global Config',
        }),
      ),
    )
  })

  it('renders even when no globalConf is supplied', () => {
    render(<MediaMTXConfigForm />)
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
  })
})
