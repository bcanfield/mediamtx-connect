---
id: 20260715154503
title: snapshot-cron-unbounded-ffmpeg
principal: 4h
interest: unknown
hotspot: apps/api/src/jobs.ts
business_capability: live-view
payoff_trigger: A user reports CPU load from the snapshot cron, or someone runs more than ~25 concurrent streams
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-15
---

The new captureLiveSnapshots cron spawns one unbounded ffmpeg process per ready stream every 30 seconds, with no concurrency cap or work queue. That is fine at the homelab scale the design assumes (5-20 streams, matching the fake-streams rig), but a 50+ camera deployment gets 50 ffmpeg spawns every 30s. The unbounded loop was chosen deliberately under CLAUDE.md's boring-over-clever rule, mirroring the existing generateScreenshots job which already spawns ffmpeg in an unbounded parallel loop — adding a queue to one job and not the other would be worse. Each capture is SIGKILLed after 15s so a stalled camera cannot pile up processes across ticks, which bounds the worst case per stream but not across streams.
