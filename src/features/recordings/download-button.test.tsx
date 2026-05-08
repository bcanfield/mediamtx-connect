// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const toast = vi.fn()
const axiosFn = vi.fn()
const loggerError = vi.fn()

vi.mock('axios', () => ({ default: (...args: unknown[]) => axiosFn(...args) }))
vi.mock('@/components/ui/use-toast', () => ({ useToast: () => ({ toast }) }))
vi.mock('@/lib/logger', () => ({ logger: { error: loggerError, info: vi.fn(), debug: vi.fn() } }))

const { DownloadButton } = await import('./download-button')

beforeEach(() => {
  toast.mockReset()
  axiosFn.mockReset()
  loggerError.mockReset()
  vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:fake'), revokeObjectURL: vi.fn() })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('downloadButton', () => {
  it('calls the download endpoint with the right URL', async () => {
    axiosFn.mockResolvedValue({ status: 200, data: new Blob(['x']) })
    const user = userEvent.setup()
    render(<DownloadButton streamName="camera1" filePath="2025-01-01_00-00-00.mp4" />)

    await user.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(axiosFn).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: '/api/camera1/2025-01-01_00-00-00.mp4/download-recording',
          responseType: 'blob',
        }),
      ),
    )
  })

  it('creates an object URL on a successful download and shows no error toast', async () => {
    axiosFn.mockResolvedValue({ status: 200, data: new Blob(['video']) })
    const user = userEvent.setup()
    render(<DownloadButton streamName="camera1" filePath="a.mp4" />)

    await user.click(screen.getByRole('button'))

    await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled())
    expect(toast).not.toHaveBeenCalled()
  })

  it('fires a destructive toast and logs when the response is not 200', async () => {
    axiosFn.mockResolvedValue({ status: 500, statusText: 'Server Error', data: null })
    const user = userEvent.setup()
    render(<DownloadButton streamName="camera1" filePath="a.mp4" />)

    await user.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'Error downloading video',
        }),
      ),
    )
    expect(loggerError).toHaveBeenCalled()
  })

  it('fires a destructive toast and logs when the request rejects', async () => {
    axiosFn.mockRejectedValue(new Error('network down'))
    const user = userEvent.setup()
    render(<DownloadButton streamName="camera1" filePath="a.mp4" />)

    await user.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'destructive' }),
      ),
    )
    expect(loggerError).toHaveBeenCalled()
  })

  it('drives the progress bar from the axios onDownloadProgress callback', async () => {
    axiosFn.mockImplementation((opts: { onDownloadProgress?: (e: { progress: number }) => void }) => {
      opts.onDownloadProgress?.({ progress: 0.42 })
      opts.onDownloadProgress?.({ progress: undefined as unknown as number })
      return Promise.resolve({ status: 200, data: new Blob(['v']) })
    })
    const user = userEvent.setup()
    render(<DownloadButton streamName="camera1" filePath="a.mp4" />)

    await user.click(screen.getByRole('button'))
    await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled())
  })

  it('disables the button while a download is in flight', async () => {
    let resolveDownload: ((v: unknown) => void) | undefined
    axiosFn.mockReturnValue(new Promise((r) => {
      resolveDownload = r
    }))
    const user = userEvent.setup()
    render(<DownloadButton streamName="camera1" filePath="a.mp4" />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toBeDisabled()

    resolveDownload?.({ status: 200, data: new Blob(['v']) })
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled())
  })
})
