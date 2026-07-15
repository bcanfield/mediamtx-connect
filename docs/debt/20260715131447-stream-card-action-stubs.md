---
id: 20260715131447
title: stream-card-action-stubs
principal: unknown
interest: unknown
hotspot: apps/web/src/features/streams/stream-card.tsx
business_capability: live-view
payoff_trigger: first user request for any of the 7 actions, or when the matching MediaMTX API surface (snapshot, per-path record, path config) gets wrapped
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-15
---

The StreamCard actions menu ships 7 stubbed items (open stream detail, take snapshot, record toggle, copy publish URLs, share & embed, edit path config, edit hooks) that only log and toast "Not implemented yet". The grouping mirrors design board 1h's extension contract, so the menu shape is final but the behaviors are absent. Only "View recordings" is functional today.
