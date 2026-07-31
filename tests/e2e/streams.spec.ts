import { expect, test } from '@playwright/test'

// One test, and it is here for one reason: it spawns a real ffmpeg against a real
// RTSP feed. Everything else this file used to hold is now in Vitest.
//
//   card contents (codecs, viewers, snapshot pill, record state)
//     -> apps/web/src/features/streams/stream-card.test.tsx
//   the actions menu, its mutations and its deep-link hrefs
//     -> apps/web/src/features/streams/stream-card-menu.test.tsx
//   the grid and the toolbar fleet summary
//     -> apps/web/src/features/streams/live-streams-view.test.tsx
//   top-nav links, the active tab, and locale switching
//     -> apps/web/src/components/app-header.test.tsx
//        apps/web/src/components/app-header.tab-state.test.ts
//
// Those assert against known props or a stub router, so they cannot pass on an
// empty page — which nine of the tests this file used to hold could (ADR 0005).
//
// Unguarded on purpose: scripts/wait-for-mediamtx.mjs gates the suite on
// stream1..5 + front-door being published AND ready, so "no cards" is a failure
// rather than a state to tolerate.

test('taking a snapshot on demand captures a real frame', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('[data-testid="stream-card"]').filter({ hasText: 'stream1' })

  await card.getByRole('button', { name: 'Stream actions' }).click()
  await page.getByRole('menuitem', { name: 'Take snapshot' }).click()

  // The component suite covers the mutation and this toast against a stub. What
  // it cannot cover is whether ffmpeg really pulls a frame off the feed.
  await expect(page.getByText('Snapshot captured')).toBeVisible({ timeout: 20_000 })
})
