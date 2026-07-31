import type { RecordingStreamSummary } from '@connect/contract'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { RecordingsIndexView } from './recordings-index-view'

// Replaces the recordings.spec.ts index tests (ADR 0005, change 1). Those drove
// a real browser against a seeded data directory to assert on card counts, a
// client-side filter and a keyboard shortcut — none of which need one. The
// `streams` prop IS the fixture here, so `toHaveLength(n)` is exact rather than
// a count read back off whatever the seeder happened to produce.

function summary(name: string, over: Partial<RecordingStreamSummary> = {}): RecordingStreamSummary {
  return {
    name,
    count: 3,
    latestMtime: new Date('2026-07-27T11:30:00Z'),
    screenshotUrl: null,
    ...over,
  }
}

const THREE = [summary('stream1'), summary('stream2'), summary('stream3')]

const cards = () => screen.queryAllByTestId('stream-summary-card')

describe('the stream grid', () => {
  it('renders one card per stream that has recordings', async () => {
    await renderWithProviders(<RecordingsIndexView streams={THREE} />)

    expect(cards()).toHaveLength(3)
    expect(screen.getByText('stream1')).toBeInTheDocument()
  })

  it('links each card to that stream\'s detail page', async () => {
    await renderWithProviders(<RecordingsIndexView streams={[summary('stream1')]} />)

    expect(screen.getByRole('link', { name: /stream1/ })).toHaveAttribute(
      'href',
      '/recordings/stream1',
    )
  })

  it('says how many recordings a stream has', async () => {
    await renderWithProviders(<RecordingsIndexView streams={[summary('stream1', { count: 7 })]} />)

    // Scoped to the card: the toolbar summary says "7 recordings" too, so an
    // unscoped matcher passes on the toolbar alone and never sees the chip.
    expect(screen.getByTestId('stream-summary-card')).toHaveTextContent('7 recordings')
  })

  it('falls back to a placeholder when a stream has no screenshot', async () => {
    await renderWithProviders(<RecordingsIndexView streams={[summary('stream1')]} />)

    // Anchor first: a missing grid would satisfy the negative on its own.
    expect(screen.getByText('stream1')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows the thumbnail when one exists', async () => {
    await renderWithProviders(
      <RecordingsIndexView
        streams={[summary('stream1', { screenshotUrl: '/api/screenshots/stream1/latest.png' })]}
      />,
    )

    expect(screen.getByRole('presentation')).toHaveAttribute(
      'src',
      '/api/screenshots/stream1/latest.png',
    )
  })
})

describe('the toolbar summary', () => {
  it('totals the streams and their recordings', async () => {
    await renderWithProviders(
      <RecordingsIndexView
        streams={[summary('stream1', { count: 2 }), summary('stream2', { count: 5 })]}
      />,
    )

    expect(screen.getByText('2 streams · 7 recordings')).toBeInTheDocument()
  })

  it('singularises a lone stream with a lone recording', async () => {
    await renderWithProviders(<RecordingsIndexView streams={[summary('only', { count: 1 })]} />)

    expect(screen.getByText('1 stream · 1 recording')).toBeInTheDocument()
  })
})

describe('the client-side filter', () => {
  it('narrows the grid to matching streams as you type', async () => {
    const { user } = await renderWithProviders(<RecordingsIndexView streams={THREE} />)

    await user.type(screen.getByRole('searchbox', { name: 'Filter streams' }), 'stream2')

    expect(cards()).toHaveLength(1)
    expect(screen.getByText('stream2')).toBeInTheDocument()
  })

  it('matches case-insensitively on a substring', async () => {
    const { user } = await renderWithProviders(
      <RecordingsIndexView streams={[summary('Front-Door'), summary('garage')]} />,
    )

    await user.type(screen.getByRole('searchbox', { name: 'Filter streams' }), 'DOOR')

    expect(cards()).toHaveLength(1)
    expect(screen.getByText('Front-Door')).toBeInTheDocument()
  })

  it('explains an empty result instead of rendering a bare grid', async () => {
    const { user } = await renderWithProviders(<RecordingsIndexView streams={THREE} />)

    await user.type(
      screen.getByRole('searchbox', { name: 'Filter streams' }),
      'definitely-no-such-stream',
    )

    expect(cards()).toHaveLength(0)
    expect(screen.getByRole('heading', { name: 'No matching streams' })).toBeInTheDocument()
  })

  it('restores every card when the filter is cleared', async () => {
    const { user } = await renderWithProviders(<RecordingsIndexView streams={THREE} />)
    const filter = screen.getByRole('searchbox', { name: 'Filter streams' })

    await user.type(filter, 'stream2')
    expect(cards()).toHaveLength(1)
    await user.clear(filter)

    expect(cards()).toHaveLength(3)
  })
})

describe('the / shortcut', () => {
  it('focuses the filter from anywhere on the page', async () => {
    const { user } = await renderWithProviders(<RecordingsIndexView streams={THREE} />)
    const filter = screen.getByRole('searchbox', { name: 'Filter streams' })
    expect(filter).not.toHaveFocus()

    await user.keyboard('/')

    expect(filter).toHaveFocus()
  })

  it('types a literal / once the filter already has focus', async () => {
    const { user } = await renderWithProviders(<RecordingsIndexView streams={THREE} />)
    const filter = screen.getByRole('searchbox', { name: 'Filter streams' })

    await user.click(filter)
    await user.keyboard('/')

    // The handler bails on INPUT targets, so the key reaches the field. Swallowing
    // it there would make a stream whose name contains "/" unfilterable.
    expect(filter).toHaveValue('/')
  })
})
