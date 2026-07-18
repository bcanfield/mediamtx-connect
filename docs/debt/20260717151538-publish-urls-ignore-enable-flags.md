---
id: 20260717151538
title: publish-urls-ignore-enable-flags
principal: 1h
interest: operator confusion per disabled-protocol publish attempt
hotspot: apps/web/src/lib/publish.ts
business_capability: live-view
payoff_trigger: unknown
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-17
---

publishTargets always emits RTSP/RTMP/SRT publish URLs and never consults MediaMTX's rtsp/rtmp/srt enable flags in global config, so an operator who disabled a protocol still gets a URL (both in the card's copy action and the zero-streams hints) that won't accept a publisher. Kept deliberately for parity with the prior empty-state hints, which also showed all three unconditionally, and because ticket 07's scope was "derive from listen addresses," not protocol enablement. Symptom would be a copied rtmp:// URL that silently fails to connect when rtmp: false.
