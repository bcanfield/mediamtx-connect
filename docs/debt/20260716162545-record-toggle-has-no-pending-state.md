---
id: 20260716162545
title: record-toggle-has-no-pending-state
principal: 2h
interest: unknown
hotspot: apps/web/src/features/streams/stream-card.tsx
business_capability: live-view
payoff_trigger: first report of the record toggle appearing to do nothing, or of a double-toggle landing the wrong state
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-16
---

The stream card's record toggle has no pending or optimistic state. `updatePathConfig.isPending` is unused: the dropdown closes on click and the card keeps rendering the old ON/OFF until the `streams.list` invalidation settles, so a slow write reads as a no-op. Reopening the menu before it settles and clicking again fires a second write computed from the same stale `recording`, so two clicks can race to opposing values.

Narrow in practice — the menu closes immediately, so re-clicking means deliberately reopening it inside the round-trip window — and the design handoff (board 1h) pins the menu item's shape, which a spinner would change. Deferred rather than guessing at undesigned pending affordance.
