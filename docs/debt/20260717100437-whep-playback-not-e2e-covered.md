---
id: 20260717100437
title: whep-playback-not-e2e-covered
principal: 1w
interest: unknown
hotspot: apps/web/src/components/video-player.tsx
business_capability: live-view
payoff_trigger: an E2E environment with live MediaMTX and a browser that can hold a WebRTC session, or the first WHEP regression that reaches a user
quadrant: prudent-deliberate
category: testing
ai_authored: true
created: 2026-07-17
---

The WHEP negotiation is unit-tested against a fake RTCPeerConnection, but nothing exercises the real transport end to end: no test clicks Play, opens a peer connection to MediaMTX, and asserts the pill reads WEBRTC. The E2E suite runs against committed MP4/PNG fixtures with no MediaMTX process, and streams.spec.ts guards its assertions behind `if (await card.isVisible())`, so it passes vacuously when nothing is publishing. The transport selection, the fallback-to-HLS path, and the pill's honesty are therefore only verified at the seams, not in a browser. A regression that breaks WebRTC playback would fall back to HLS and stay green.

**Resolved (2026-07-27, issue 211).** `tests/e2e/playback.spec.ts` clicks Play on `stream3` in LOW-LAT against the CI MediaMTX, waits for the peer connection to reach `connected`, and asserts the pill reads `WEBRTC` with a `MediaStream` on the `<video>` — hls.js drives `src`, so that distinguishes the two transports rather than trusting the label. Its second test aborts the WHEP POST (what a blocked WebRTC port looks like from the browser) and asserts the HLS pill *and* the `WEBRTC UNAVAILABLE` pill, which is the honesty half. The `if (await card.isVisible())` guards this entry named are gone independently: ADR 0005 deleted them and made a conditional in a Playwright `test()` body a lint error. Two things this does not cover and that stay open: the ICE-timeout fallback (blocked UDP after a successful negotiation — `page.route` can only cut the signalling), and any browser but chromium (see `docs/TESTING.md` § E2E projects).
