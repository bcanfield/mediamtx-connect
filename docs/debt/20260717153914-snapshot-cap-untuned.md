---
id: 20260717153914
title: snapshot-cap-untuned
principal: 2h
interest: unknown
hotspot: apps/api/src/jobs.ts
business_capability: live-view
payoff_trigger: someone benchmarks snapshot capture load, or reports the cron sweep being too slow / too aggressive at their camera count
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-17
---

`MAX_CONCURRENT_CAPTURES = 4` (apps/api/src/jobs.ts) is an untuned magic constant. The shared snapshot concurrency gate needed *a* cap to satisfy ticket 08's "bounded" requirement, and 4 was chosen conservatively without benchmarking against real ffmpeg RTSP capture load or actual camera-count deployments. It is low enough to protect the server, but it means a 20+ camera cron sweep now serializes into several waves where it previously spawned every ready stream at once. A future reader will ask "why 4?" and the honest answer is that it was reasoned, not measured. Bump it (or derive it from CPU count) once there is a real load signal.
