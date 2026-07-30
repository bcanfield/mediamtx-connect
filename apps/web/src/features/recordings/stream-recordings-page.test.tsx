import type { Recording } from '@connect/contract'
import type { StubApi } from '@/test/rpc-server'
import { screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { createRpcServer } from '@/test/rpc-server'
import { StreamRecordingsPage } from './stream-recordings-page'

// Replaces the recordings.spec.ts detail tests (ADR 0005, change 1) — the
// breadcrumb, the day grouping, the totals and the empty/error states. Only the
// inline <video> playing real MP4 bytes stays in Playwright; everything here is
// rendered output over a known page of recordings.
//
// Day grouping is the reason this suite is worth having at all. The E2E version
// could only assert "a section header exists", because it ran against whatever
// mtimes the seeder produced; with the dates in the fixture we can assert that
// two recordings on one day group together and a third on another day does not.

function rec(name: string, createdAt: string, over: Partial<Recording> = {}): Recording {
  return { name, createdAt: new Date(createdAt), fileSize: 1024, screenshotUrl: null, ...over }
}

// Fixed, distant dates so the labels are the absolute "other" form rather than
// today/yesterday, which would change meaning depending on when the suite runs.
const TWO_DAYS = [
  rec('2026-03-14_10-00-00.mp4', '2026-03-14T10:00:00Z'),
  rec('2026-03-14_18-30-00.mp4', '2026-03-14T18:30:00Z'),
  rec('2026-03-15_09-00-00.mp4', '2026-03-15T09:00:00Z'),
]

let recordings: Recording[] = TWO_DAYS
let totalCount = TWO_DAYS.length
let fail = false

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', streams: [] }),
  recordingsForStream: () => {
    if (fail)
      throw new Error('recordings directory unreadable')
    return { recordings, totalCount }
  },
}

const server = createRpcServer(stub)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  recordings = TWO_DAYS
  totalCount = TWO_DAYS.length
  fail = false
})
afterAll(() => server.close())

const rows = () => screen.queryAllByTestId('recording-row')

async function renderPage(streamName = 'stream1') {
  const view = await renderWithProviders(<StreamRecordingsPage streamName={streamName} />)
  await screen.findByRole('heading', { name: streamName, level: 1 })
  return view
}

describe('the breadcrumb', () => {
  it('links back to the recordings index', async () => {
    await renderPage()

    const crumb = screen.getByRole('navigation', { name: 'breadcrumb' })
    expect(within(crumb).getByRole('link', { name: 'Recordings' })).toHaveAttribute(
      'href',
      '/recordings',
    )
  })

  it('shows the current stream as the trailing crumb', async () => {
    await renderPage('front-door')

    expect(
      within(screen.getByRole('navigation', { name: 'breadcrumb' })).getByText('front-door'),
    ).toBeInTheDocument()
  })

  it('renders for a stream with no recordings at all', async () => {
    recordings = []
    totalCount = 0
    await renderPage('non-existent-stream')

    // The E2E version of this only checked the page didn't crash. Same intent,
    // plus the assertion that the empty state is genuinely empty.
    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument()
    expect(rows()).toHaveLength(0)
  })
})

describe('the recording list', () => {
  it('renders a row per recording', async () => {
    await renderPage()

    expect(await screen.findByText(/3 recordings/)).toBeInTheDocument()
    expect(rows()).toHaveLength(3)
  })

  it('offers to play each recording', async () => {
    await renderPage()

    const first = (await screen.findAllByTestId('recording-row'))[0]!
    expect(within(first).getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })

  it('groups rows by the day they were recorded', async () => {
    await renderPage()
    await screen.findByText(/3 recordings/)

    // Two distinct days in the fixture, so exactly two group headings. Dates
    // outside today/yesterday carry the weekday and year, which is what makes an
    // old recording locatable at a glance.
    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings).toHaveLength(2)
    expect(headings.map(h => h.textContent)).toEqual([
      'Sat, March 14, 2026',
      'Sun, March 15, 2026',
    ])
  })

  it('puts same-day recordings under one heading', async () => {
    await renderPage()
    await screen.findByText(/3 recordings/)

    const groups = screen.getAllByRole('heading', { level: 2 }).map(h => h.closest('section')!)
    expect(within(groups[0]!).getAllByTestId('recording-row')).toHaveLength(2)
    expect(within(groups[1]!).getAllByTestId('recording-row')).toHaveLength(1)
  })
})

describe('failure to read the directory', () => {
  it('explains the error instead of rendering an empty list', async () => {
    fail = true
    await renderPage()

    expect(await screen.findByText('Could not read recordings')).toBeInTheDocument()
    expect(rows()).toHaveLength(0)
  })
})
