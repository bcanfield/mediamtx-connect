import type { RecordingSpan } from '@connect/contract'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { ClipDownload } from './clip-download'

// Local times on a browser-local day; the component project runs in UTC.
const DAY = new Date(2026, 2, 14)
const MORNING: RecordingSpan = { start: new Date(2026, 2, 14, 9, 0, 15), duration: 1800 }
const AFTERNOON: RecordingSpan = { start: new Date(2026, 2, 14, 14, 0, 20), duration: 7200 }

const fetchMock = vi.fn<typeof fetch>()
let saved: string[] = []

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockResolvedValue(new Response('mp4-bytes'))
  saved = []
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    saved.push(this.download)
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

/**
 * MediaMTX's /get with format=mp4: no Content-Length, and nothing at all until
 * the muxer has indexed the range. `send` pushes a chunk, `finish` ends it.
 * Aborting the request errors the body, as a real fetch does.
 */
function slowResponse() {
  let controller!: ReadableStreamDefaultController<Uint8Array>
  const body = new ReadableStream<Uint8Array>({
    start: (c) => {
      controller = c
    },
  })
  fetchMock.mockImplementation(async (_url, init) => {
    init?.signal?.addEventListener('abort', () => controller.error(new DOMException('Aborted', 'AbortError')))
    return new Response(body)
  })
  return {
    send: (bytes: number) => controller.enqueue(new Uint8Array(bytes)),
    finish: () => controller.close(),
  }
}

async function renderClip(selected: RecordingSpan | null = null) {
  return renderWithProviders(
    <ClipDownload streamName="stream1" day={DAY} spans={[MORNING, AFTERNOON]} selected={selected} />,
  )
}

const requested = () => String(fetchMock.mock.calls[0]?.[0])

describe('presets', () => {
  it('downloads the last 5 minutes of the latest span as plain MP4', async () => {
    const { user } = await renderClip()

    await user.click(screen.getByRole('button', { name: 'Last 5 min' }))
    await user.click(screen.getByRole('button', { name: 'Download' }))

    await waitFor(() => expect(saved).toEqual(['stream1_2026-03-14_15-55-20.mp4']))
    expect(requested()).toBe('/media/playback/get?path=stream1&start=2026-03-14T15%3A55%3A20.000Z&duration=300&format=mp4')
  })

  it('downloads the last hour', async () => {
    const { user } = await renderClip()

    await user.click(screen.getByRole('button', { name: 'Last 1 h' }))
    await user.click(screen.getByRole('button', { name: 'Download' }))

    await waitFor(() => expect(requested()).toBe('/media/playback/get?path=stream1&start=2026-03-14T15%3A00%3A20.000Z&duration=3600&format=mp4'))
  })
})

describe('a custom range', () => {
  it('requests the start on the selected day and the duration in seconds', async () => {
    const { user } = await renderClip()

    await user.click(screen.getByRole('button', { name: 'Custom' }))
    // user-event's typing doesn't land the typed value in a time input.
    fireEvent.change(screen.getByLabelText('Start'), { target: { value: '10:15:30' } })
    const minutes = screen.getByLabelText('Duration (min)')
    await user.clear(minutes)
    await user.type(minutes, '2')
    await user.click(screen.getByRole('button', { name: 'Download' }))

    await waitFor(() => expect(requested()).toBe('/media/playback/get?path=stream1&start=2026-03-14T10%3A15%3A30.000Z&duration=120&format=mp4'))
  })

  it('starts at the latest span when nothing is playing', async () => {
    const { user } = await renderClip()

    await user.click(screen.getByRole('button', { name: 'Custom' }))

    expect(screen.getByLabelText('Start')).toHaveValue('14:00:20')
  })

  it('starts at the span open in the player', async () => {
    const { user } = await renderClip(MORNING)

    await user.click(screen.getByRole('button', { name: 'Custom' }))

    expect(screen.getByLabelText('Start')).toHaveValue('09:00:15')
  })

  it('won\'t download more than an hour', async () => {
    const { user } = await renderClip()

    await user.click(screen.getByRole('button', { name: 'Custom' }))
    const minutes = screen.getByLabelText('Duration (min)')
    await user.clear(minutes)
    await user.type(minutes, '61')

    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled()
  })
})

describe('progress', () => {
  it('says it is preparing until the first byte, then counts bytes with no total', async () => {
    const response = slowResponse()
    const { user } = await renderClip()

    await user.click(screen.getByRole('button', { name: 'Download' }))
    expect(await screen.findByText('Preparing clip…')).toBeInTheDocument()

    response.send(2048)
    expect(await screen.findByText(/^2 kB received · .+\/s$/)).toBeInTheDocument()
    expect(screen.queryByText('Preparing clip…')).not.toBeInTheDocument()

    response.finish()
    expect(await screen.findByText('Clip downloaded')).toBeInTheDocument()
  })

  it('cancels the request', async () => {
    slowResponse()
    const { user } = await renderClip()

    await user.click(screen.getByRole('button', { name: 'Download' }))
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(fetchMock.mock.calls[0]![1]!.signal!.aborted).toBe(true)
    expect(await screen.findByRole('button', { name: 'Download' })).toBeInTheDocument()
    expect(screen.queryByText('Clip download failed')).not.toBeInTheDocument()
  })
})

describe('failures', () => {
  it('says there are no recordings in the range on a 404', async () => {
    fetchMock.mockResolvedValue(new Response('Recording not found', { status: 404 }))
    const { user } = await renderClip()

    await user.click(screen.getByRole('button', { name: 'Download' }))

    expect(await screen.findByText('No recordings in this range')).toBeInTheDocument()
    expect(screen.queryByText('Clip download failed')).not.toBeInTheDocument()
  })

  it('reports any other failure', async () => {
    fetchMock.mockResolvedValue(new Response('Could not reach MediaMTX\'s playback server', { status: 502 }))
    const { user } = await renderClip()

    await user.click(screen.getByRole('button', { name: 'Download' }))

    expect(await screen.findByText('Clip download failed')).toBeInTheDocument()
  })
})
