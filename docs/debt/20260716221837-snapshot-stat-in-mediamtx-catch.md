---
id: 20260716221837
title: snapshot-stat-in-mediamtx-catch
principal: 2h
interest: unknown
hotspot: apps/api/src/router.ts
business_capability: live-view
payoff_trigger: a stream grid reporting "Can't reach MediaMTX" while MediaMTX is demonstrably up
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-16
---

`streams.list` now reads our own filesystem for snapshot age (`latestScreenshotMtimeFor`, one `statSync` per stream) from inside the try/catch whose catch returns `connection-error` with the MediaMTX URL. An fs throw would therefore blank the whole stream grid and blame MediaMTX for a local disk problem — the screenshots directory going unreadable, or the cleanup job unlinking a PNG in the microseconds between the resolver's `existsSync` and the `statSync`.

Took it because the resolver guards with `existsSync` and the race window is vanishingly small, and because wrapping each stat in a defensive try/catch is exactly the fallback-for-things-that-can't-happen CLAUDE.md bans. The honest fix is structural: resolve snapshot mtimes outside the block that means "MediaMTX is unreachable", so a disk fault reports as a disk fault.

Same catch and same blast radius as `20260716162534-record-read-can-blank-stream-grid.md` — worth paying off together.
