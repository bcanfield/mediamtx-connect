---
id: 20260715131524
title: missing-media-metadata-chips
principal: unknown
interest: unknown
hotspot: packages/contract/src/index.ts
business_capability: recordings
payoff_trigger: extending the contract with snapshot mtime and per-recording duration/codec (ffprobe or MediaMTX path metadata)
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-15
---

Two designed data chips are omitted because the contract lacks the data: idle stream cards show a bare "SNAPSHOT" pill without the mocked age ("· 14s ago" — needs snapshot mtime), and recording rows show start time + file size only where board 2c specifies a time range, duration stamp on the thumb, and codec in the meta line (needs ffprobe-style metadata). StreamCard's overlay zones and the row layout already reserve the space.
