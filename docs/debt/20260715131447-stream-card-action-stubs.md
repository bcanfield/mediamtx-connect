---
id: 20260715131447
title: stream-card-action-stubs
principal: unknown
interest: unknown
hotspot: apps/web/src/features/streams/stream-card.tsx
business_capability: live-view
payoff_trigger: first user request for any of the 6 remaining actions, or when the matching MediaMTX API surface (snapshot, per-path record) gets wrapped
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-15
---

The StreamCard actions menu ships 6 stubbed items (open stream detail, take snapshot, record toggle, copy publish URLs, share & embed, edit hooks) that only log and toast "Not implemented yet". The grouping mirrors design board 1h's extension contract, so the menu shape is final but the behaviors are absent. "View recordings" and "Edit path config" are functional today.

2026-07-16: "Edit path config" paid off — it deep-links to `/config/mediamtx/paths/{name}` (ticket 02). "Edit hooks" (ticket 03) targets the same route with the hooks section preselected, and the record toggle (ticket 04) writes the per-path override that route now exposes.

2026-07-16: "Edit hooks" paid off (ticket 03) — same route, `?section=pathHooks`. 5 stubs left: open stream detail, take snapshot, record toggle, copy publish URLs, share & embed. Tickets 04 (record toggle) and 08 (snapshot) claim two more.

2026-07-16: "Record" paid off (ticket 04) — the menu item now shows effective record state and writes the stream's own `{record}` override through `updatePathConfig`, materializing a sparse entry for wildcard-backed streams. The hard-wired `OFF` is gone: `StreamSchema.recording` carries effective state, resolved one read per distinct `confName`. 4 stubs left: open stream detail, take snapshot, copy publish URLs, share & embed. Ticket 08 (snapshot) claims one more.
