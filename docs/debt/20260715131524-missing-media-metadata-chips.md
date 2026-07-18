---
id: 20260715131524
title: missing-media-metadata-chips
principal: unknown
interest: unknown
hotspot: packages/contract/src/index.ts
business_capability: recordings
payoff_trigger: per-recording duration/codec (needs ffprobe); the live-stream chips no longer belong here (see correction)
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-15
---

Two designed data chips are omitted because the contract lacks the data: idle stream cards show a bare "SNAPSHOT" pill without the mocked age ("· 14s ago" — needs snapshot mtime), and recording rows show start time + file size only where board 2c specifies a time range, duration stamp on the thumb, and codec in the meta line (needs ffprobe-style metadata). StreamCard's overlay zones and the row layout already reserve the space.

**Correction (2026-07-16, verified against the live v1.19.2 API).** This entry conflates two problems with different causes, and is only right about one of them.

*Wrong for the live-stream chips.* They do not need ffprobe or any new MediaMTX call. `GET /v3/paths/list` — which `streams.list` already calls on every poll — returns `tracks: ['H264','MPEG-4 Audio']` (the codec chips) and `readers` (the "3 viewers" telemetry) today. The data is fetched and then discarded at the contract boundary: `StreamSchema` narrows each path to `{name, readyTime, recording}` (ticket 04 added `recording`; `tracks` and `readers` are still dropped), and `MediaMtxPath` in `apps/api/src/mediamtx.ts` does not even declare `readers` or `source`. Snapshot age is likewise not a MediaMTX concern — it is the mtime of the PNG our own cron writes in `apps/api/src/jobs.ts`. Lighting these up is a contract-widening job, not a metadata-acquisition one.

**Resolved for the live-stream chips (2026-07-16, ticket 05).** Codecs, viewers and snapshot age now ship — see `docs/FEATURES.md` §1.2.2. The correction above was right: it cost a contract widening and no new MediaMTX call. What remains open here is only the recording-row half below.

*Still right for the recording rows.* Per-recording duration and codec are genuinely absent and do need ffprobe against the MP4. That part of this entry stands and keeps the payoff trigger.

*Still absent for live streams, and re-homed.* Resolution is not in `/v3/paths/list`; bitrate is (`bytesReceived` is a cumulative counter, while board 2c specifies a rate like "4.2 Mb/s", which needs two samples over time); latency ("~0.4s") has no source. These stay deferred. The protocol pill moves to the playback-mode work: `source.type` (`rtspSession`) describes how a stream is *published*, not how we *play it back*, and the mock's "WEBRTC · ~0.4s" is a playback-protocol label — see `docs/adr/0002-three-mediamtx-config-scopes.md` for the source/playback protocol distinction. (The pill half of this shipped in ticket 06; see the 2026-07-17 note above.)

**Protocol pill resolved, latency still deferred (2026-07-17, ticket 06).** The protocol pill shipped with the WHEP playback path — it reports the transport the player actually connected on (`WEBRTC` / `HLS`), which is the playback-protocol label this entry asked for, and it is measured rather than inferred from the mode. See `docs/FEATURES.md` §1.3.1. The mock's companion latency figure ("~0.4s") did **not** ship and stays deferred here: hls.js exposes distance-from-live-edge and WebRTC's `getStats` exposes jitter-buffer delay, which are different quantities, so there is no single honest number to put next to the label. Reviving it needs a defined metric first, not a player change. Resolution and bitrate stand as written below.

**Correction to the correction (2026-07-16, ticket 05).** *Resolution is in `/v3/paths/list` after all* — the claim above (and in `.scratch/stubbed-affordances/spec.md`, which inherited it) is wrong. v1.19.2 serves a `tracks2` array alongside `tracks`, and its H264 entry carries `codecProps: {width: 560, height: 320, profile, level}`, verified on the live server on 2026-07-16. So the resolution chip is the same contract-widening job the other chips turned out to be, not a deferral for lack of data. Ticket 05 scoped itself to `tracks`/`readers` and left it out, so it stays open — but on scope grounds, not because the server can't answer. The bitrate and latency deferrals stand as written.
