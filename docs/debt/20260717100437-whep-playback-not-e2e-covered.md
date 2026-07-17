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
