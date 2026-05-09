# Ideas: HTTP API Surface

This document brainstorms UI features for **MediaMTX Connect** that derive from the MediaMTX HTTP Control API v3 (defined in `api/openapi.yaml` upstream). The app today only consumes `v3/pathsList`, `v3/configGlobalGet`, and `v3/configGlobalSet` — leaving the full session, connection, recording, path-CRUD, path-defaults, info, and JWKS surfaces unused. Below, every endpoint group is mapped to concrete UI ideas. Schemas are rich (RTSP jitter, SRT RTT/loss/buffers, WebRTC ICE candidates, HLS muxer activity, codec props with width/height/profile/level), so most ideas just need a table or chart wired to a periodic poll.

## General / Info

- **Server identity card on the dashboard** — top-of-page header showing MediaMTX version + uptime computed from `started`, with a "new version available" badge if a release tag in the upstream repo is newer. `v3/info`.
- **Multi-instance switcher** — let the UI manage several MediaMTX hosts; use `v3/info` as the connectivity probe and to label each instance with its version. `v3/info`.
- **Compatibility guard** — when the connected server reports an older version than the schemas the UI was built against, show a non-blocking banner explaining which features may be missing. `v3/info`.

## Authentication

- **JWKS refresh button on the auth-config screen** — one click triggers a manual JWKS pull, with a toast on success/failure and a "last refreshed at" timestamp persisted in local state. `v3/auth/jwks/refresh`.
- **Periodic JWKS health check** — schedule the refresh on a cron-style interval from the UI (e.g., every 15 min) and surface failures as a sidebar warning. `v3/auth/jwks/refresh`.
- **JWT troubleshooter** — paste a JWT, refresh JWKS, then decode header/claims client-side and explain why MediaMTX would accept or reject it. `v3/auth/jwks/refresh`, `v3/configGlobalGet`.

## Configuration — global

- **Patch-vs-replace toggle** — global config form offers a "save full" (replace) vs "save changed fields only" (patch) mode, defaulting to patch for safety. `v3/config/global/patch`.
- **Diff preview before save** — render a JSON diff (current server value vs form value) inside the save-confirmation modal. `v3/config/global/get`, `v3/config/global/patch`.
- **Deprecated-field linter** — highlight any deprecated keys still set (e.g., `protocols`, `rtspDisable`, `webrtcICEServers`) and offer a one-click migration to the modern field. `v3/config/global/get`, `v3/config/global/patch`.

## Configuration — path defaults

- **Dedicated "Path defaults" editor** — same form components as the per-path editor but bound to `pathdefaults`, so new paths inherit sane org-wide settings. `v3/config/pathdefaults/get`, `v3/config/pathdefaults/patch`.
- **"Apply defaults to all paths" wizard** — bulk-patch every path config so it matches the current defaults, with a per-path opt-out checklist. `v3/config/pathdefaults/get`, `v3/config/paths/list`, `v3/config/paths/patch/{name}`.
- **Defaults vs override badges** — in the path config UI, mark each field as "inherited from defaults" or "overridden", with one-click revert. `v3/config/pathdefaults/get`, `v3/config/paths/get/{name}`.

## Configuration — paths CRUD

- **Path creation wizard** — multi-step form (name → source type → record settings → hooks → auth) that emits a single `add` call; templates for "RTSP camera", "RPi camera", "WHEP redirect", "Always-available file". `v3/config/paths/add/{name}`.
- **Path editor with patch/replace mode toggle** — same form, two save semantics: patch for tweaks, replace for full rewrites; surface the choice with copy that explains the difference. `v3/config/paths/patch/{name}`, `v3/config/paths/replace/{name}`.
- **Inline rename** — rename via delete-then-add inside a single optimistic transaction, restoring on failure. `v3/config/paths/delete/{name}`, `v3/config/paths/add/{name}`.
- **Bulk delete with confirm-by-typing** — multi-select rows in the path list, confirm by typing the count, then issue parallel deletes with a progress bar. `v3/config/paths/list`, `v3/config/paths/delete/{name}`.
- **Clone path** — duplicate an existing path config under a new name; useful for fleets of similar cameras. `v3/config/paths/get/{name}`, `v3/config/paths/add/{name}`.
- **Import/export YAML for a single path** — paste-in YAML to add, copy-out YAML for sharing or version control. `v3/config/paths/get/{name}`, `v3/config/paths/add/{name}`, `v3/config/paths/replace/{name}`.
- **Bulk patch by filter** — select all paths whose source matches a regex (e.g. `rtsp://10.0.*`) and patch a common field (e.g. `recordSegmentDuration`) in one action. `v3/config/paths/list`, `v3/config/paths/patch/{name}`.
- **Path search & filter** — filter the path table by name regex, source scheme, `record` on/off, `sourceOnDemand` on/off, hooks present. `v3/config/paths/list`.
- **Hooks editor with snippet library** — focused editor for the `runOn*` fields with curated examples (Discord webhook, S3 upload, ffmpeg transcode). `v3/config/paths/get/{name}`, `v3/config/paths/patch/{name}`.
- **Raspberry Pi camera tuner** — a dedicated form panel for `rpiCamera*` knobs (exposure, AWB, AfMode, bitrate, codec, text overlay) with live-feed preview when source is `rpiCameraSource`. `v3/config/paths/patch/{name}`.
- **Always-available builder** — UI to assemble `alwaysAvailableTracks` (codec + sample rate + channels) plus an optional `alwaysAvailableFile` upload helper. `v3/config/paths/patch/{name}`.

## Paths — runtime view

- **Per-path detail page** — single page showing source type/ID, current readers, online time, codec + width/height/profile/level for each track, in/out byte counters, frames-in-error. `v3/paths/get/{name}`.
- **Live track inspector** — render `tracks2` as a card grid (one card per codec) with codec-specific properties (e.g. H.264 1920x1080 high@4.0, Opus 2-channel). `v3/paths/get/{name}`.
- **Path "is the camera up?" indicator** — combine `available`, `online`, `availableTime` to render a green/yellow/red dot plus human-friendly uptime. `v3/paths/list`, `v3/paths/get/{name}`.
- **Reader fan-out diagram** — small graph for each path: source → MediaMTX → list of readers (RTSP/RTMP/HLS/WebRTC/SRT) with counts and protocol icons. `v3/paths/get/{name}`.
- **Top-talkers leaderboard** — busiest paths by `outboundBytes` and by reader count over the polling window, refreshing every N seconds. `v3/paths/list`.
- **Stale-source warning** — list paths where `available=false` for >X minutes, suggesting a misconfigured upstream. `v3/paths/list`.
- **Inbound-error heatmap** — color-grade each path by `inboundFramesInError` rate to spot flaky cameras. `v3/paths/list`.

## RTSP — connections & sessions

- **RTSP sessions table** — columns: id, path, state (idle/read/publish), user, remoteAddr, transport (UDP/TCP/multicast), profile, in/out bytes, jitter, RTP loss%. `v3/rtspsessions/list`.
- **RTSP session drawer** — click a row to open a side panel with full counters (RTP/RTCP packets, packets-in-error, jitter, conns), and a "kick" button. `v3/rtspsessions/get/{id}`, `v3/rtspsessions/kick/{id}`.
- **Kick session with reason capture** — confirm dialog with optional reason logged locally for the audit trail (server itself doesn't accept a reason). `v3/rtspsessions/kick/{id}`.
- **RTSP connections list** — separate from sessions; show tunnel type (TCP, HTTP, etc.), bound session id, and bytes. `v3/rtspconns/list`, `v3/rtspconns/get/{id}`.
- **Jitter / packet-loss alerts** — flag any RTSP session whose `inboundRTPPacketsJitter` or loss ratio crosses a configurable threshold. `v3/rtspsessions/list`.
- **Auto-kick rogue clients** — opt-in rule engine: if a session has been `idle` for >X minutes or sending zero bytes, kick it automatically. `v3/rtspsessions/list`, `v3/rtspsessions/kick/{id}`.

## RTSPS — connections & sessions

- **Mirror RTSP table for RTSPS** — same UI as RTSP, but tagged with a TLS lock icon, populated from the RTSPS endpoints. `v3/rtspsconns/list`, `v3/rtspssessions/list`, `v3/rtspssessions/kick/{id}`.
- **TLS-only filter** — toggle on a "secure transports only" view that hides plaintext RTSP/RTMP rows from the unified sessions dashboard. `v3/rtspssessions/list`, `v3/rtmpsconns/list`.

## RTMP / RTMPS — connections

- **RTMP connections table** — id, path, state (idle/read/publish), user, remoteAddr, in/out bytes, frames-discarded; click for detail panel. `v3/rtmpconns/list`, `v3/rtmpconns/get/{id}`.
- **Discarded-frames warning** — surface non-zero `outboundFramesDiscarded` as a red badge per RTMP connection (player can't keep up). `v3/rtmpconns/list`.
- **Kick & ban (local)** — kick an RTMP connection and add its `remoteAddr` to a UI-managed deny list (the deny list is enforced via `authInternalUsers` ips field, not stored server-side as a ban). `v3/rtmpconns/kick/{id}`, `v3/config/global/patch`.
- **RTMPS-specific table** — same shape, separate route, TLS badge. `v3/rtmpsconns/list`, `v3/rtmpsconns/get/{id}`, `v3/rtmpsconns/kick/{id}`.

## HLS — muxers & sessions

- **HLS muxers panel** — table per active muxer: path, created, last request, outbound bytes, frames discarded; idle muxers (no `lastRequest` in N minutes) get dimmed. `v3/hlsmuxers/list`, `v3/hlsmuxers/get/{name}`.
- **HLS sessions list with CDN flag** — show each viewer session (id, path, remoteAddr, user, isCDN, outbound bytes); group rows by `isCDN=true` to separate edge nodes from end-viewers. `v3/hlssessions/list`, `v3/hlssessions/get/{id}`.
- **Kick HLS viewer** — same kick affordance as other protocols; useful when a single misbehaving CDN edge is hammering the origin. `v3/hlssessions/kick/{id}`.
- **HLS muxer activity sparkline** — per-muxer mini chart of `outboundBytes` delta vs polling tick. `v3/hlsmuxers/list`.

## WebRTC — sessions

- **WebRTC sessions board** — cards showing PC-established status, local/remote ICE candidates, state (read/publish), bytes, RTP packets, loss, jitter. `v3/webrtcsessions/list`, `v3/webrtcsessions/get/{id}`.
- **ICE candidate visualizer** — for each session, show the candidate pair (host/srflx/relay) with a tiny diagram explaining the route — useful when STUN/TURN is misconfigured. `v3/webrtcsessions/get/{id}`.
- **"Stuck on negotiating" alert** — flag sessions where `peerConnectionEstablished=false` for >X seconds. `v3/webrtcsessions/list`.
- **Kick WebRTC session** — typical confirm-then-kick UI; particularly useful for one-off WHIP test publishers. `v3/webrtcsessions/kick/{id}`.

## SRT — connections

- **SRT connections table with link-quality column** — show `mbpsReceiveRate`, `msRTT`, `packetsReceivedLossRate`, `packetsRetrans`; sort by link health. `v3/srtconns/list`, `v3/srtconns/get/{id}`.
- **SRT live diagnostics drawer** — graphs of RTT, send/receive rate, link capacity, flow window over the last minute, computed from periodic polls. `v3/srtconns/get/{id}`.
- **Buffer utilization gauge** — per-connection gauges for sender / receiver buffer fill (`bytesSendBuf` vs `bytesAvailSendBuf`, `bytesReceiveBuf` vs `bytesAvailReceiveBuf`). `v3/srtconns/get/{id}`.
- **Encryption-failure detector** — non-zero `packetsReceivedUndecrypt` highlighted as a passphrase-mismatch warning. `v3/srtconns/list`.
- **Kick SRT publisher** — same pattern as the others. `v3/srtconns/kick/{id}`.

## Recordings

- **All-recordings index with per-path rollup** — table aggregating each path's segment count and total span; group cards by path. `v3/recordings/list`.
- **Per-path recordings timeline** — horizontal segments view (each `RecordingSegment.start` becomes a tick) with drag-to-zoom. `v3/recordings/get/{name}`.
- **Delete a single segment with confirm + reason** — local-only reason field for audit, then call the delete endpoint. `v3/recordings/deletesegment`.
- **Bulk segment delete by date range** — pick "before YYYY-MM-DD" and delete all matching segments via parallel calls, with a progress bar. `v3/recordings/get/{name}`, `v3/recordings/deletesegment`.
- **Storage usage estimate** — multiply segment count × `recordSegmentDuration` from PathConf to estimate retention; flag paths exceeding configurable budget. `v3/recordings/list`, `v3/config/paths/list`.
- **Recording-on-but-no-segments warning** — paths with `record=true` but empty `segments` array for >X hours imply a broken recorder. `v3/config/paths/list`, `v3/recordings/list`.
- **Retention policy preview** — given `recordDeleteAfter`, show which segments will disappear in the next 24 h. `v3/config/paths/get/{name}`, `v3/recordings/get/{name}`.

## Cross-cutting / dashboards

- **Unified live-sessions dashboard** — single page that fans out polls to every `*sessionsList` and `*connsList` endpoint and renders a protocol-tagged table with shared columns (path, user, remoteAddr, in/out bytes, started). `v3/rtspsessions/list`, `v3/rtspssessions/list`, `v3/rtmpconns/list`, `v3/rtmpsconns/list`, `v3/hlssessions/list`, `v3/webrtcsessions/list`, `v3/srtconns/list`.
- **Health summary card** — counts of: paths in use, paths with no source, total active sessions per protocol, total bytes/sec across protocols. `v3/paths/list`, all `*list` endpoints.
- **Protocol-mix donut chart** — viewer breakdown by protocol (HLS / WebRTC / RTSP / RTMP / SRT) on the dashboard. All `*sessionsList` + `*connsList` endpoints.
- **Bandwidth sparkline per session** — every row in any session table includes a 60-second mini chart of bytes-delta computed from poll history. All `*list` endpoints.
- **Geo lookup overlay** — annotate each session's `remoteAddr` with a country flag and city via a server-side IP-to-geo proxy; cluster on a world map view. All `*list` endpoints with `remoteAddr`.
- **Live event feed** — diff successive polls of `*list` endpoints to synthesize a stream of events: session-start, session-end, publish-start, publish-stop. All `*list` endpoints.
- **API explorer / playground** — built-in panel that lets a power user pick any operation from the OpenAPI spec, fill parameters, and call it; results pretty-printed JSON with copy button. Every endpoint.
- **Audit log** — local DB table that records every UI-initiated mutation (config patches, kicks, deletes) with user, timestamp, before/after snapshot. `v3/config/global/patch`, `v3/config/paths/patch/{name}`, all `*kick`, `v3/recordings/deletesegment`.
- **Saved views** — let users save filter+column configurations on the sessions dashboard and the path index (e.g., "RTSP cameras with high jitter"). All `*list` endpoints.
- **Polling rate control** — per-page setting for poll interval (with a reasonable floor) so heavy dashboards don't hammer the API. All `*list` endpoints.
- **Paginated list views** — every `*List` endpoint exposes `pageCount`/`itemCount`; build a real paginator instead of fetching everything at once. All `*list` endpoints.
- **CSV export** — any session/connection/recording table can export the current filtered set to CSV for offline analysis. All `*list` endpoints.
- **Webhook simulator** — given a path's `runOn*` config, send a fake hook payload to the configured URL to verify it without waiting for a real event. `v3/config/paths/get/{name}`.
