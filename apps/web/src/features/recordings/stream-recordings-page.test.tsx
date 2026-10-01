import type { PathDefaults, Recording, RecordingTimeline } from '@connect/contract'
import type { RpcInputs, StubApi } from '@/test/rpc-server'
import { ORPCError } from '@orpc/server'
import { screen, waitFor, within } from '@testing-library/react'
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

// Local times: the timeline lays out a browser-local day. The component
// project runs in UTC, the same zone the test IntlProvider formats in.
const TEN_TO_ELEVEN = { start: new Date(2026, 2, 14, 10, 0, 0), duration: 3600 }
const HALF_TWO_TO_FOUR = { start: new Date(2026, 2, 14, 14, 30, 0), duration: 5400 }

const STOCK_PATH_DEFAULTS: PathDefaults = {
  recordFormat: 'mpegts',
  recordPath: '/recordings/%path/%Y-%m-%d_%H-%M-%S',
}

let recordings: Recording[] = TWO_DAYS
let totalCount = TWO_DAYS.length
let fail = false
let timeline: () => RecordingTimeline | null = () => ({ status: 'available', spans: [] })
let pathDefaults: PathDefaults = STOCK_PATH_DEFAULTS
let timelineInputs: Array<RpcInputs['recordings']['timeline']> = []
// Both scopes' writes in one list, so a test can assert their order.
let writes: Array<[string, unknown]> = []
let refuseGlobal: string | null = null

const stub: StubApi = {
  streamsList: () => ({ status: 'connected', streams: [] }),
  recordingsForStream: () => {
    if (fail)
      throw new Error('recordings directory unreadable')
    return { recordings, totalCount }
  },
  recordingsTimeline: (input) => {
    timelineInputs.push(input)
    return timeline()
  },
  pathDefaults: () => pathDefaults,
  updatePathDefaults: (input) => {
    writes.push(['updatePathDefaults', input])
  },
  updateGlobalConfig: (input) => {
    writes.push(['updateGlobal', input])
    if (refuseGlobal)
      throw new ORPCError('BAD_REQUEST', { message: refuseGlobal })
  },
}

const server = createRpcServer(stub)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  recordings = TWO_DAYS
  totalCount = TWO_DAYS.length
  fail = false
  timeline = () => ({ status: 'available', spans: [] })
  pathDefaults = STOCK_PATH_DEFAULTS
  timelineInputs = []
  writes = []
  refuseGlobal = null
})
afterAll(() => server.close())

const rows = () => screen.queryAllByTestId('recording-row')

async function renderPage(streamName = 'stream1', path = '/') {
  const view = await renderWithProviders(<StreamRecordingsPage streamName={streamName} />, { path })
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
    expect(await screen.findByText('0 recordings')).toBeInTheDocument()
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

describe('the day timeline', () => {
  const MARCH_14 = '/?day=2026-03-14'

  async function renderDay() {
    timeline = () => ({ status: 'available', spans: [TEN_TO_ELEVEN, HALF_TWO_TO_FOUR] })
    const view = await renderPage('stream1', MARCH_14)
    await screen.findByRole('list', { name: 'Recorded spans' })
    return view
  }

  it('draws a block per recorded span on the 24-hour track, leaving the gap empty', async () => {
    await renderDay()

    const blocks = within(screen.getByRole('group', { name: '24-hour timeline' })).getAllByRole('button')
    expect(blocks).toHaveLength(2)
    // 10:00 is 10/24 of the way along, and an hour is 1/24 wide.
    expect(blocks[0]).toHaveStyle({ left: '41.66666666666667%', width: '4.166666666666666%' })
    expect(blocks[1]).toHaveStyle({ left: '60.416666666666664%', width: '6.25%' })
  })

  it('lists each span with its start, end and duration', async () => {
    await renderDay()

    const rows = within(screen.getByRole('list', { name: 'Recorded spans' })).getAllByRole('listitem')
    expect(rows.map(row => row.textContent)).toEqual([
      '10:00:00 AM – 11:00:00 AM · 1 hr',
      '02:30:00 PM – 04:00:00 PM · 1 hr 30 min',
    ])
  })

  // Asked for the bounds of the browser-local day, which /list clips spans to.
  it('asks for the day in the ?day search param', async () => {
    await renderDay()

    expect(timelineInputs.at(-1)).toEqual({
      streamName: 'stream1',
      start: new Date(2026, 2, 14),
      end: new Date(2026, 2, 15),
    } satisfies RpcInputs['recordings']['timeline'])
  })

  it('says so on a day with no recordings, rather than drawing a blank track', async () => {
    timeline = () => ({ status: 'available', spans: [] })
    await renderPage('stream1', MARCH_14)

    expect(await screen.findByText('No recordings on this day.')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Recorded spans' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Download clip' })).not.toBeInTheDocument()
  })

  it('offers a clip download under a day with recordings', async () => {
    await renderDay()

    const clip = screen.getByRole('region', { name: 'Download clip' })
    expect(within(clip).getByRole('button', { name: 'Last 5 min' })).toBeInTheDocument()
  })

  it('steps back to the previous local day', async () => {
    const { user } = await renderDay()

    await user.click(screen.getByRole('button', { name: 'Previous day' }))

    await waitFor(() => expect(timelineInputs.at(-1)).toEqual({
      streamName: 'stream1',
      start: new Date(2026, 2, 13),
      end: new Date(2026, 2, 14),
    }))
  })

  it('steps forward to the next local day', async () => {
    const { user } = await renderDay()

    await user.click(screen.getByRole('button', { name: 'Next day' }))

    await waitFor(() => expect(timelineInputs.at(-1)).toEqual({
      streamName: 'stream1',
      start: new Date(2026, 2, 15),
      end: new Date(2026, 2, 16),
    }))
  })

  it('plays a span through the api\'s playback proxy', async () => {
    const { user, container } = await renderDay()

    await user.click(screen.getByRole('button', { name: /^10:00:00 AM – 11:00:00 AM/ }))

    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      '/media/playback/get?path=stream1&start=2026-03-14T10%3A00%3A00.000Z&duration=3600',
    )
  })

  it('plays a span from its block on the track too', async () => {
    const { user, container } = await renderDay()

    const track = screen.getByRole('group', { name: '24-hour timeline' })
    await user.click(within(track).getAllByRole('button')[1]!)

    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      '/media/playback/get?path=stream1&start=2026-03-14T14%3A30%3A00.000Z&duration=5400',
    )
  })

  // Streamed fMP4 reports an infinite duration, so the span's own length is
  // the only one there is.
  it('shows the span\'s length in the player\'s time readout', async () => {
    const { user } = await renderDay()

    await user.click(screen.getByRole('button', { name: /^02:30:00 PM – 04:00:00 PM/ }))

    expect(await screen.findByText('90:00')).toBeInTheDocument()
  })

  it('shows the playback server\'s own reason when it refuses', async () => {
    timeline = () => {
      throw new ORPCError('BAD_GATEWAY', { message: 'authentication failed' })
    }
    await renderPage('stream1', MARCH_14)

    expect(await screen.findByText('authentication failed')).toBeInTheDocument()
    expect(screen.getByText('Could not read the recording timeline')).toBeInTheDocument()
  })
})

describe('the guided playback card', () => {
  const OFF: RecordingTimeline = { status: 'unavailable', playbackEnabled: false, recordFormat: 'mpegts' }

  async function renderCard() {
    timeline = () => OFF
    const view = await renderPage('stream1', '/?day=2026-03-14')
    await screen.findByRole('heading', { name: 'Turn on recording playback' })
    return view
  }

  const changes = () =>
    within(screen.getByRole('list', { name: 'Changes to make' }))
      .getAllByRole('listitem')
      .map(item => item.textContent)

  it('lists exactly the keys it will change, and keeps the file list below', async () => {
    await renderCard()

    expect(changes()).toEqual([
      'recordFormat: mpegts → fmp4',
      'recordPath: /recordings/%path/%Y-%m-%d_%H-%M-%S → /recordings/%path/%Y-%m-%d_%H-%M-%S-%f',
      'playback: false → true',
    ])
    expect(await screen.findAllByTestId('recording-row')).toHaveLength(3)
  })

  it('leaves out what is already in place', async () => {
    pathDefaults = { recordFormat: 'fmp4', recordPath: '/recordings/%path/%Y-%m-%d_%H-%M-%S-%f' }
    timeline = () => ({ status: 'unavailable', playbackEnabled: false, recordFormat: 'fmp4' })
    await renderPage('stream1', '/?day=2026-03-14')
    await screen.findByRole('heading', { name: 'Turn on recording playback' })

    expect(changes()).toEqual(['playback: false → true'])
  })

  // MediaMTX refuses `playback` while any recordPath lacks %f, so path
  // defaults go first.
  it('writes path defaults first, then turns playback on, and shows the timeline', async () => {
    const { user } = await renderCard()
    timeline = () => (writes.length === 2
      ? { status: 'available', spans: [TEN_TO_ELEVEN] }
      : OFF)

    await user.click(screen.getByRole('button', { name: 'Apply changes' }))

    expect(await screen.findByRole('list', { name: 'Recorded spans' })).toBeInTheDocument()
    expect(writes).toEqual([
      ['updatePathDefaults', {
        recordFormat: 'fmp4',
        recordPath: '/recordings/%path/%Y-%m-%d_%H-%M-%S-%f',
      } satisfies RpcInputs['config']['mediamtx']['updatePathDefaults']],
      ['updateGlobal', { playback: true } satisfies RpcInputs['config']['mediamtx']['updateGlobal']],
    ])
  })

  it('writes only the path defaults keys that need it', async () => {
    pathDefaults = { recordFormat: 'fmp4', recordPath: '/recordings/%path/%Y-%m-%d_%H-%M-%S' }
    timeline = () => ({ status: 'unavailable', playbackEnabled: false, recordFormat: 'fmp4' })
    const { user } = await renderPage('stream1', '/?day=2026-03-14')

    await user.click(await screen.findByRole('button', { name: 'Apply changes' }))

    await waitFor(() => expect(writes).toEqual([
      ['updatePathDefaults', { recordPath: '/recordings/%path/%Y-%m-%d_%H-%M-%S-%f' }],
      ['updateGlobal', { playback: true }],
    ]))
  })

  it('shows MediaMTX\'s reason when it refuses, and claims nothing', async () => {
    refuseGlobal = '\'recordPath\' must contain %f'
    const { user } = await renderCard()

    await user.click(screen.getByRole('button', { name: 'Apply changes' }))

    expect(await screen.findByText('\'recordPath\' must contain %f')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Turn on recording playback' })).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Recorded spans' })).not.toBeInTheDocument()
  })

  // Writing path defaults wouldn't reach a path that sets its own format.
  it('writes nothing for a path that overrides recordFormat, and links to its config', async () => {
    pathDefaults = { recordFormat: 'fmp4', recordPath: '/recordings/%path/%Y-%m-%d_%H-%M-%S-%f' }
    timeline = () => OFF
    await renderPage('stream1', '/?day=2026-03-14')

    const link = await screen.findByRole('link', { name: 'Open this path\'s recording config' })
    expect(link).toHaveAttribute('href', '/config/mediamtx/paths/stream1?section=recording')
    expect(screen.queryByRole('button', { name: 'Apply changes' })).not.toBeInTheDocument()
    expect(writes).toEqual([])
  })
})
