import type { Stream } from '@connect/contract'
import { screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { LiveStreamsView } from './live-streams-view'

// Replaces the grid-level tests from streams.spec.ts (ADR 0005, change 1): one
// card per stream, and the toolbar fleet summary. The card's own contents are
// already covered by stream-card.test.tsx; this is about the view around it.
//
// The E2E versions asserted `/\d+ streams? · \d+ playing/` — a regex that passes
// on any two numbers, including "0 streams · 0 playing" on a page that failed to
// load. Here the stream list is the fixture, so the text is exact.

function stream(name: string, over: Partial<Stream> = {}): Stream {
  return {
    name,
    readyTime: '2026-07-27T10:00:00Z',
    recordState: 'off',
    codecs: [],
    viewers: 0,
    snapshotMtime: null,
    ...over,
  }
}

const FLEET = [stream('stream1'), stream('stream2'), stream('front-door')]

function renderView(streams: Stream[] = FLEET, path = '/') {
  return renderWithProviders(
    <LiveStreamsView
      streams={streams}
      hlsAddress=":8888"
      remoteMediaMtxUrl="http://localhost"
      publishTargets={[]}
    />,
    { path },
  )
}

const cards = () => screen.queryAllByTestId('stream-card')

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())

describe('the grid', () => {
  it('renders one card per stream', async () => {
    await renderView()

    expect(cards()).toHaveLength(3)
    for (const name of ['stream1', 'stream2', 'front-door'])
      expect(screen.getByText(name)).toBeInTheDocument()
  })

  it('renders nothing but the toolbar when the fleet is empty', async () => {
    await renderView([])

    // Anchor on the toolbar so the empty grid is a real assertion rather than a
    // failed render.
    expect(screen.getByText('0 streams · 0 playing')).toBeInTheDocument()
    expect(cards()).toHaveLength(0)
  })
})

describe('the toolbar summary', () => {
  it('counts the fleet', async () => {
    await renderView()

    expect(screen.getByText('3 streams · 0 playing')).toBeInTheDocument()
  })

  it('counts the streams currently playing from the URL', async () => {
    await renderView(FLEET, '/?play=stream1,stream2')

    expect(screen.getByText('3 streams · 2 playing')).toBeInTheDocument()
  })

  it('singularises a fleet of one', async () => {
    await renderView([stream('only')])

    expect(screen.getByText('1 stream · 0 playing')).toBeInTheDocument()
  })
})

describe('the density control', () => {
  it('remembers the chosen density', async () => {
    const { user } = await renderView()

    await user.click(screen.getByRole('radio', { name: '4' }))

    expect(localStorage.getItem('liveDensity')).toBe('4')
  })

  it('starts from the stored density', async () => {
    localStorage.setItem('liveDensity', '2')

    await renderView()

    expect(screen.getByRole('radio', { name: '2' })).toHaveAttribute('data-state', 'on')
  })

  it('falls back to the default when the stored value is nonsense', async () => {
    localStorage.setItem('liveDensity', 'wide')

    await renderView()

    expect(screen.getByRole('radio', { name: '3' })).toHaveAttribute('data-state', 'on')
  })
})
