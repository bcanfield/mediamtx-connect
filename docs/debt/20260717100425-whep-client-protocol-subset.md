---
id: 20260717100425
title: whep-client-protocol-subset
principal: 2d
interest: unknown
hotspot: apps/web/src/lib/whep.ts
business_capability: live-view
payoff_trigger: MediaMTX requires trickle ICE for WHEP reads, or the app grows authenticated playback (If-Match / bearer tokens)
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-17
---

The hand-rolled WHEP client implements only the subset MediaMTX needs for anonymous reads: one POST of a fully-gathered SDP offer and one DELETE on teardown. It omits trickle ICE (the PATCH candidates path), If-Match/ETag on the session resource, and any auth header. ADR 0003 accepts this deliberately — MediaMTX requires none of it today, and the HLS fallback bounds the blast radius. The failure mode is quiet rather than loud: a server that required trickle or auth would reject the offer, the player would log a warning and fall back to HLS, and LOW-LAT would silently never deliver WebRTC.
