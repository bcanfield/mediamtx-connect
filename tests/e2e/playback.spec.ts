import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

// The only spec that opens a real peer connection: everything else about WHEP
// is tested at the seam (apps/web/src/lib/whep.test.ts) against a fake
// RTCPeerConnection, which cannot tell us that MediaMTX answers our offer or
// that ICE completes. A broken WebRTC path falls back to HLS and plays video
// either way, so without this the regression is invisible.

// H264 + Opus, wildcard-backed, and no other spec mutates it. Opus is the
// reason it's this stream: it's the one codec every WebRTC stack must
// implement, so the negotiation can't fail over a codec a browser build lacks —
// what's under test is the playback protocol, not the decoder.
const STREAM = 'stream3'

function cardFor(page: Page, name: string) {
  return page.locator('[data-testid="stream-card"]').filter({ hasText: name })
}

// LOW-LAT rather than AUTO: it's the explicit ask for WebRTC, so landing on HLS
// is something the card has to own up to. AUTO expresses no preference and says
// nothing when it falls back.
async function playInLowLatency(page: Page) {
  await page.goto('/')
  await page.getByRole('radio', { name: 'LOW-LAT' }).click()

  const card = cardFor(page, STREAM)
  await card.getByRole('button', { name: `Play ${STREAM}` }).click()
  return card
}

test.describe('Live playback protocol', () => {
  test('plays over WebRTC and the pill reports it', async ({ page }) => {
    const card = await playInLowLatency(page)

    // The player only reports 'webrtc' once waitForConnected resolves, so this
    // is ICE actually completing against MediaMTX on 8189/udp — not merely a
    // WHEP POST that got an answer.
    await expect(card.getByText('WEBRTC', { exact: true })).toBeVisible({ timeout: 20_000 })
    await expect(card.getByText('WEBRTC UNAVAILABLE')).toBeHidden()

    // The pill repeats what the player told it; this is the media itself.
    // hls.js drives `src`, so a MediaStream here can only have come from
    // the peer connection's ontrack.
    const trackCount = await card.locator('video').evaluate(
      video => ((video as HTMLVideoElement).srcObject as MediaStream | null)?.getTracks().length ?? 0,
    )
    expect(trackCount).toBeGreaterThan(0)
  })

  test('falls back to HLS and says so when WHEP is unreachable', async ({ page }) => {
    // What a blocked WebRTC port looks like from the browser: the signalling
    // POST never lands. Everything after it is the player's own fallback.
    await page.route('**/whep', route => route.abort('connectionfailed'))

    const card = await playInLowLatency(page)

    await expect(card.getByText('HLS', { exact: true })).toBeVisible({ timeout: 20_000 })
    // The honest half: LOW-LAT asked for WebRTC and didn't get it, so the card
    // says WebRTC was unavailable rather than quietly reading HLS.
    await expect(card.getByText('WEBRTC UNAVAILABLE')).toBeVisible()
  })
})
