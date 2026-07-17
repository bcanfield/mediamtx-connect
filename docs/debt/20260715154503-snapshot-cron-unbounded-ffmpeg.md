---
id: 20260715154503
title: snapshot-cron-unbounded-ffmpeg
principal: 4h
interest: unknown
hotspot: apps/api/src/jobs.ts
business_capability: live-view
payoff_trigger: A user reports CPU load from the recording-thumbnail job (generateScreenshots), which is still unbounded; the snapshot path is now capped
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-15
---

The new captureLiveSnapshots cron spawns one unbounded ffmpeg process per ready stream every 30 seconds, with no concurrency cap or work queue. That is fine at the homelab scale the design assumes (5-20 streams, matching the fake-streams rig), but a 50+ camera deployment gets 50 ffmpeg spawns every 30s. The unbounded loop was chosen deliberately under CLAUDE.md's boring-over-clever rule, mirroring the existing generateScreenshots job which already spawns ffmpeg in an unbounded parallel loop — adding a queue to one job and not the other would be worse. Each capture is SIGKILLed after 15s so a stalled camera cannot pile up processes across ticks, which bounds the worst case per stream but not across streams.

**Resolved for the snapshot path (2026-07-17, ticket 08).** On-demand snapshot (ticket 08) added a *user-triggered* ffmpeg spawn on top of the cron's, so the snapshot path had to be bounded — a button that stacks a spawn on an already-uncapped 30s sweep degrades the server. `captureLiveSnapshots` and the new `captureSnapshot` now acquire a shared permit gate (`MAX_CONCURRENT_CAPTURES = 4`, `apps/api/src/jobs.ts`) before spawning and release it on ffmpeg exit, so the cap counts both sources together — the point the ticket makes about a bound that covers only one. The "mirror generateScreenshots, don't bound one and not the other" symmetry no longer holds, and for a concrete reason: only the snapshot path gained an on-demand trigger. Covered at the api unit-test seam (`jobs.test.ts`: cap enforced across the cron, on-demand counted against the same cap).

**Residual:** `generateScreenshots` (recording-thumbnail extraction) is still an unbounded parallel loop. It is lower risk than the live path was — it runs off already-recorded MP4s on disk, is never user-triggered, and only processes recordings missing a thumbnail — but a large recordings backlog still spawns unbounded ffmpeg. Left as-is; this entry now tracks that job.
