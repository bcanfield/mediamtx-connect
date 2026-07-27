import type { StreamCardProps } from './stream-card'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { StreamCard } from './stream-card'

// These replace the streams.spec.ts tests that read
// `if (await card.count() > 0) { ...assert... }` — nine of them, run in five
// browsers, every one green whether or not the grid rendered anything. Here the
// props ARE the fixture, so the assertions are unconditional (ADR 0005).

const BASE: StreamCardProps = {
  streamName: 'stream1',
  remoteMediaMtxUrl: 'http://localhost',
  publishTargets: [],
  playbackMode: 'auto',
  recording: false,
}

async function renderCard(props: Partial<StreamCardProps> = {}, path = '/') {
  return renderWithProviders(<StreamCard {...BASE} {...props} />, { path })
}

describe('stream identity and playback affordance', () => {
  it('names the stream and offers to play it', async () => {
    await renderCard()

    expect(screen.getByText('stream1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play stream1' })).toBeInTheDocument()
  })

  it('reads as idle with no readyTime', async () => {
    await renderCard()

    expect(screen.getByText('idle')).toBeInTheDocument()
  })

  it('reports how long a ready stream has been online', async () => {
    await renderCard({ readyTime: '2026-07-27T10:00:00Z' })

    expect(screen.getByText(/^online since/)).toBeInTheDocument()
  })
})

describe('overlay telemetry', () => {
  it('lists every codec the stream publishes', async () => {
    await renderCard({ codecs: ['H264', 'Opus'] })

    expect(screen.getByText('H264')).toBeInTheDocument()
    expect(screen.getByText('Opus')).toBeInTheDocument()
  })

  it('renders no codec chips when MediaMTX reports no tracks', async () => {
    await renderCard({ codecs: [] })

    // Anchor: proves the card rendered, so the negative below can't pass on an empty DOM.
    expect(screen.getByText('stream1')).toBeInTheDocument()
    expect(screen.queryByText('H264')).not.toBeInTheDocument()
  })

  // Nobody watching is the normal resting state; the count is always known, so
  // a card that hides the zero is hiding information rather than saving space.
  it('shows a zero viewer count rather than omitting it', async () => {
    await renderCard({ viewers: 0 })

    expect(screen.getByText(/0 viewers/)).toBeInTheDocument()
  })

  it('pluralizes a single viewer', async () => {
    await renderCard({ viewers: 1 })

    expect(screen.getByText(/1 viewer(?!s)/)).toBeInTheDocument()
  })

  it('omits the viewer zone entirely when the count is unknown', async () => {
    await renderCard({ viewers: undefined })

    // Anchor: proves the card rendered, so the negative below can't pass on an empty DOM.
    expect(screen.getByText('stream1')).toBeInTheDocument()
    expect(screen.queryByText(/viewers?/)).not.toBeInTheDocument()
  })
})

describe('snapshot age pill', () => {
  // A bare "SNAPSHOT" is the bug this guards: whenever the pill is on screen
  // the capture time is known, so it has to say how old the frame is.
  it('states the age when a snapshot exists', async () => {
    await renderCard({ snapshotMtime: new Date('2026-07-27T11:58:00Z') })

    expect(screen.getByText(/^SNAPSHOT · \S/)).toBeInTheDocument()
  })

  it('shows a bare pill with no age when nothing has been captured', async () => {
    await renderCard({ snapshotMtime: null })

    expect(screen.getByText('SNAPSHOT')).toBeInTheDocument()
    expect(screen.queryByText(/SNAPSHOT · /)).not.toBeInTheDocument()
  })

  // The empty state is keyed off the thumbnail request failing, not off
  // snapshotMtime — the file can be absent while the API still reports a time.
  it('explains the wait when the thumbnail fails to load', async () => {
    await renderCard()
    fireEvent.error(document.querySelector('img')!)

    expect(await screen.findByText(/no snapshot yet/)).toBeInTheDocument()
  })
})

describe('record state', () => {
  // The bug this exists to catch: a card reporting only the stream's own
  // (absent) override reads OFF while MediaMTX writes files to disk.
  it('badges a recording stream', async () => {
    await renderCard({ recording: true })

    expect(screen.getByText(/REC/)).toBeInTheDocument()
  })

  it('shows no REC badge when recording is off', async () => {
    await renderCard({ recording: false })

    // Anchor: proves the card rendered, so the negative below can't pass on an empty DOM.
    expect(screen.getByText('stream1')).toBeInTheDocument()
    expect(screen.queryByText(/REC/)).not.toBeInTheDocument()
  })
})

describe('live state from the URL', () => {
  it('offers to stop a stream listed in ?play', async () => {
    await renderCard({}, '/?play=stream1')

    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
  })

  it('leaves other streams idle when a sibling is playing', async () => {
    await renderCard({}, '/?play=stream2')

    expect(screen.getByRole('button', { name: 'Play stream1' })).toBeInTheDocument()
  })
})
