---
id: 20260716155826
title: hook-write-drops-publisher
principal: 1d
interest: one dropped stream per operator who saves a hook without knowing
hotspot: apps/web/src/features/mediamtx-config/path-config-page.tsx, apps/web/src/features/mediamtx-config/sections.ts (pathHooks section)
business_capability: mediamtx-config
payoff_trigger: first operator reports a stream dropping when they save a hook, or the record toggle (ticket 04) ships and needs the same 'this restarts the stream' affordance
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-16
---

Saving a runOn* path hook disconnects the stream's publisher, and the form says nothing about it. Verified against the live v1.19.2 container while building ticket 03: POST config/paths/add/<name> {"runOnReady":"echo ready"} flips the runtime path from ready=true to ready=false and clears readyTime, while the same call with {"recordFormat":"mpegts"} leaves readyTime untouched. MediaMTX evidently re-creates the path to arm the hook. ADR 0002's "Materializing is non-disruptive" was verified with a record-only write and does not generalize — the per-path surface now has one section that is safe to save and one that kicks the publisher, with identical save bars.

The e2e spec works around this rather than fixing it: the hooks write test targets a publisher-less path (e2e-hooks), because doing it to a fixture stream deletes that stream for every later spec (examples/fake-streams/ffmpeg-test.sh publishes once and never reconnects). That workaround is a live reminder the behavior is real. What is missing is operator-facing: the Path Hooks section should warn that saving restarts the stream, and ticket 04's record toggle will want the same treatment if it ever writes a hook.
