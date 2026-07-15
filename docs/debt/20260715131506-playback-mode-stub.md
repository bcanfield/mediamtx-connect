---
id: 20260715131506
title: playback-mode-stub
principal: unknown
interest: unknown
hotspot: apps/web/src/features/streams/live-streams-view.tsx
business_capability: live-view
payoff_trigger: adding a WebRTC (WHEP) or MP4-compat playback path to VideoPlayer
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-15
---

The Live View playback-mode segmented control (AUTO / LOW-LAT / COMPAT, board 2a) persists to localStorage('playbackMode') and logs, but the player is HLS-only so the mode changes no behavior. LOW-LAT implies WebRTC/WHEP and COMPAT implies plain HLS/MP4 — both need player work before the toggle is honest.
