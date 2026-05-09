# Ideas: Recordings & Playback

MediaMTX persists every published path to disk as a stream of fragmented MP4 (or MPEG-TS) segments under a templated `recordPath`, prunes them via `recordDeleteAfter`, and ships an entirely separate **playback HTTP server** (`playback: yes`, default `:9996`) with two endpoints — `GET /list?path=…&start=…&end=…` returning concatenable runs of segments, and `GET /get?path=…&start=…&duration=…&format=fmp4|mp4` that seeks into one or many segments and streams a stitched fMP4/MP4 back to the client. The control API also exposes `GET /v3/recordings/list`, `GET /v3/recordings/get/{name}`, and `DELETE /v3/recordings/deletesegment?path=…&start=…`. The current MediaMTX Connect UI only browses individual segment files and plays each in isolation; almost the entire playback-server feature surface, plus retention, segmentation, and hook-driven workflows, is unexposed. The ideas below assume we wire the playback server in alongside the existing API client and treat segments as time intervals rather than files.

## 1. Timeline & scrubber UI

- **Continuous timeline per stream.** Render a horizontal track per path with concatenated runs (the natural output of `playback /list`) drawn as solid blocks and gaps drawn as voids; click a position to seek. Source: `playback /list`, `recordings/get`.
- **Multi-day timeline with day rails.** Stack day rows (00:00–24:00) so an operator can scan a week at once, similar to security-NVR review screens. Source: `playback /list?start=&end=`.
- **Zoomable timeline (week → minute).** Pinch/scroll zoom that re-issues `/list` with narrower `start`/`end` windows so we don't ship a week of millisecond data on first load. Source: `playback /list`.
- **Now-line and live tail.** Draw a moving "now" cursor and auto-scroll while a path is recording; show the in-progress (open) segment with a striped style. Source: `recordings/list` polling, `runOnRecordSegmentCreate`.
- **Segment-boundary markers.** Tick marks at each `recordSegmentDuration` boundary so operators recognize where seek points are guaranteed to be keyframe-clean. Source: `recordSegmentDuration`.
- **Hover thumbnail strip on the scrubber.** Sprite-sheet preview frames every N seconds across the visible window, generated lazily by ffmpeg from the stitched `playback /get` output. Source: `playback /get` + ffmpeg.
- **Concatenability indicator.** Color blocks differently when adjacent segments share track init (so they stitch losslessly) vs. those that broke continuity (codec change, gap > segment length). Source: `segmentFMP4CanBeConcatenated` semantics in `playback /list`.

## 2. Stitched / multi-segment playback

- **Seamless cross-segment player.** Replace the current single-MP4 `<video>` with a player that calls `playback /get?path=&start=&duration=` and plays the server-stitched fMP4 directly — zero JS-side concat. Source: `playback /get`.
- **Seek anywhere on a path.** Treat each path as one infinite virtual recording: a click anywhere on the timeline issues a `/get` with `duration` clamped to the visible window. Source: `playback /get`.
- **Variable-speed review.** 0.25×–16× playback using the HTML video element's `playbackRate` over the stitched stream (no server work needed). Source: `playback /get`.
- **Skip-ahead by N seconds button.** Re-issues `/get` with new `start` when the user jumps past the buffered duration; cheap because the server seeks within the segment. Source: `playback /get` (advances `start` by N).
- **Frame-step (next/prev frame).** Pause + use `requestVideoFrameCallback` to step; for cross-keyframe jumps, request a tight `/get` window. Source: `playback /get`.
- **MP4 vs fMP4 player auto-pick.** Use `format=mp4` when the consumer is a download or older browser, `fmp4` for in-browser streaming. Source: `playback /get?format=`.
- **Live → playback handoff.** When the live stream ends, fade into the most recent recording at the same wall-clock so the viewer keeps watching seamlessly. Source: `runOnNotReady` + `playback /get`.

## 3. Calendar & heatmap views

- **Month calendar with recording density.** Each day cell colored by total recorded seconds; click a day to land on the timeline at 00:00 of that day. Source: `playback /list?start=&end=` summed by day.
- **Year heatmap (GitHub-style).** 365-cell grid per stream for at-a-glance retention coverage. Source: `playback /list`.
- **Hour-of-day histogram.** "When does this camera see activity?" — bar chart of recorded minutes per hour bucket. Source: `playback /list` aggregated client-side.
- **Multi-stream calendar overlay.** Stack streams vertically per day so an operator sees which paths were online when. Source: `recordings/list`.

## 4. Multi-stream synchronized playback

- **NVR-style 2×2 / 3×3 grid.** N players locked to the same `start` clock; one scrubber drives all of them via parallel `/get` calls. Source: `playback /get` (one per pane).
- **Followed-clock scrubbing.** Dragging the timeline issues debounced `/get` requests to all panes with the same `start`, so they stay in lockstep within a part-duration. Source: `recordPartDuration` + `playback /get`.
- **Cross-stream sync diff.** Indicator showing how far apart two cameras' clocks drift over a window (helps detect NTP issues). Source: segment `start` timestamps from `playback /list`.
- **"Camera tour" mode.** Auto-cycle through streams at the same wall-clock every 10s, pausing when motion is detected. Source: `playback /get` + segment-create hooks.

## 5. Time-range export & clip creation

- **Time-range download.** Pick start + duration → server returns a single MP4 via `playback /get?format=mp4`; show progress and let the user download. Source: `playback /get?format=mp4`.
- **In-point / out-point clip tool.** Drag two handles on the scrubber; "Create clip" calls `/get` with the picked window and stores the result as a named clip in our DB. Source: `playback /get`.
- **Bulk export queue.** Queue multiple `/get` jobs (cross-day, cross-stream) and run them serially with a progress dashboard so the UI doesn't block. Source: `playback /get`.
- **Export presets.** "Last 5 minutes," "From this segment to now," "Whole hour around event" — single-click templates that compute `start`/`duration`. Source: `playback /get`.
- **Stitch across paths (composite export).** Side-by-side ffmpeg stitch from N `/get` streams into one grid MP4, run server-side. Source: N × `playback /get` + ffmpeg.
- **Watermark / burn-in on export.** Optional ffmpeg pass that burns timestamp, path name, and a custom string onto the exported MP4. Source: `playback /get` piped to ffmpeg `-vf drawtext`.

## 6. Bookmarks, chapters, annotations

- **Manual bookmarks.** Click "bookmark" while watching to drop a labeled timestamp into our DB; rendered as pins on the scrubber. Source: local DB + `playback /get` `start` offsets.
- **Chapter markers from hook events.** Render `runOnRecordSegmentCreate` / `runOnRecordSegmentComplete` events as chapters along the timeline. Source: hook log + `playback /list`.
- **External-event overlay.** Ingest webhook events (door open, motion sensor, ALPR hit) and pin them as scrubber markers. Source: app webhook + `MTX_SEGMENT_PATH` correlation.
- **Comment threads on a moment.** Multiple operators can attach notes to a `(path, start)` tuple; useful for compliance review. Source: local DB.
- **Tagged segments.** Flag a `(path, start..start+duration)` window with tags (incident, false-alarm, training); filterable in search. Source: local DB + `playback /list`.

## 7. Search across recordings

- **Global "what was happening at T" search.** One time picker → grid of every path's `/get?start=T&duration=Δ` thumbnails, ordered by stream. Source: parallel `playback /get` + thumbnail extraction.
- **Time-range filter on the recordings index.** Add `?from=&to=` to our existing `/recordings` page so users can narrow to "today 2 PM – 3 PM." Source: `playback /list?start=&end=`.
- **Free-text path search.** Fuzzy search over path names returned by `recordings/list` (already paginated). Source: `recordings/list?itemsPerPage=&page=`.
- **Saved searches.** Persist `(streams, time-range, tags)` as a named query for daily review routines. Source: local DB.
- **Cross-day jump.** "Go to 09:00 yesterday on this camera" command palette action. Source: `playback /get`.

## 8. Per-stream recording configuration (path editor)

- **Toggle `record: yes`/`no`.** Switch on a path card; persists via `PATCH /v3/config/paths/patch/{name}`. Source: `record`.
- **`recordFormat` toggle (fmp4 ⇄ mpegts) with explainer.** Inline copy: "fMP4 supports playback server, MPEG-TS does not (per source code)." Source: `recordFormat`, `seekAndMux` MPEG-TS-not-supported branch.
- **`recordSegmentDuration` slider (1m–24h).** Visualize the trade-off: shorter → more files, finer scrubbing; longer → fewer files. Source: `recordSegmentDuration`.
- **`recordPartDuration` field with RPO copy.** Show "data loss window if process crashes = this value." Source: `recordPartDuration` (default `1s`).
- **`recordMaxPartSize` field.** Default 50 MB; expose with a tooltip about RAM use during recording. Source: `recordMaxPartSize`.
- **`recordPath` builder with placeholder chips.** Drag `%path %Y %m %d %H %M %S %f %s %z` chips into a template; live preview shows resolved path; lint-warn if `%path` is missing or `%f` missing while playback is on. Source: `recordPath` validation in `conf/path.go`.
- **Path validation preview.** Mirror the server's own checks (must contain `%path`; must contain `%s` or full date+time; `recordDeleteAfter` ≥ `recordSegmentDuration`) so users see errors before saving. Source: `conf/path.go` validations.
- **Per-path overrides vs. defaults.** Show a diff between this path and `pathDefaults` so users see what's customized. Source: `/v3/config/pathdefaults`.

## 9. Retention & storage management

- **`recordDeleteAfter` editor with preview.** Slider (off / 1h / 1d / 7d / 30d / custom) plus "this would delete X GB right now" computed from `recordings/list`. Source: `recordDeleteAfter`.
- **Per-path retention overrides.** Different streams keep different histories (lobby = 7 days, parking = 30 days). Source: `recordDeleteAfter` per path.
- **Storage usage dashboard.** Disk used per stream, per day, per format; sortable. Source: stat segment files referenced in `recordings/list`.
- **Projected fill date.** Rolling 7-day average bytes/day → "disk full in N days at current rate." Source: filesystem `df` + `recordings/list`.
- **Disk-pressure auto-prune toggle.** "When free space < 10%, delete oldest segments first" — UI on top of `recordings/deletesegment`. Source: `DELETE /v3/recordings/deletesegment`.
- **Bulk delete by date range.** Pick `(path, from, to)`; we iterate `/list` and call `DELETE /v3/recordings/deletesegment?path=&start=` per segment. Source: `recordings/deletesegment`.
- **Bulk delete across all paths.** "Delete everything older than X days" with a typed-confirmation gate. Source: iterate `recordings/list` × `deletesegment`.
- **Archive-then-delete flow.** Export selected window via `playback /get`, upload to S3/NFS, only then call `deletesegment`. Source: `playback /get` + `recordings/deletesegment`.
- **Storage quota per path.** Soft cap (e.g. 50 GB per camera); UI warns and offers to prune oldest above the cap. Source: `recordings/list` size aggregation.

## 10. Recording health & integrity

- **Gap detector.** Highlight intervals on the timeline where the stream was supposed to be on (per `runOnReady`/`runOnNotReady` log) but no segment exists. Source: `playback /list` gaps + ready hooks.
- **Concatenation-break alerts.** When `/list` returns multiple entries for an "always recording" path, surface why (codec change, restart, gap) and link to the moment. Source: `playback /list` (each entry = a non-concat run).
- **Failed-segment surfacing.** Watch hook output for `runOnRecordSegmentComplete` non-zero exits; mark those segments as suspect on the timeline. Source: `runOnRecordSegmentComplete`.
- **Format-mismatch warning.** Detect when a path is `recordFormat: mpegts` but `playback: yes` is on and warn that playback-server features won't work for it. Source: source-code constraint in `seekAndMux`.
- **Open-segment monitor.** Show how long the current `recordPartDuration`-sized part has been buffered without flushing — long values risk RPO violations. Source: `recordPartDuration` + filesystem mtime.
- **Clock-drift detector.** Compare segment `start` timestamps to ingest time; flag paths whose source clock skews. Source: `playback /list` `start` field.

## 11. Hooks-driven workflows

- **Hook editor in the path UI.** First-class fields for `runOnRecordSegmentCreate`, `runOnRecordSegmentComplete`, `runOnReady`, `runOnNotReady`, `runOnDemand`, `runOnUnDemand`, with token chips for `MTX_PATH`, `MTX_SEGMENT_PATH`, `MTX_SEGMENT_DURATION`, `RTSP_PORT`. Source: hook fields in `conf/path.go`.
- **Built-in hook recipes.** One-click templates: "auto-thumbnail to S3 on segment complete," "post Slack on stream offline," "run motion-detection job per segment." Source: `runOnRecordSegmentComplete`.
- **Live hook log viewer.** Tail stdout/stderr of running hooks per path; correlate to the segment that triggered them. Source: hooks + `MTX_SEGMENT_PATH`.
- **Hook → bookmark bridge.** A hook can `curl` our app to drop a chapter at the segment it just produced. Source: `runOnRecordSegmentCreate` + app webhook.
- **On-demand recording UI.** Surface `runOnDemand`/`runOnUnDemand` with the start-timeout/close-after fields and explain "starts the publisher only when a reader/recorder asks." Source: `runOnDemand`, `runOnDemandStartTimeout`, `runOnDemandCloseAfter`.
- **Event-triggered recording windows.** Hook receives motion → calls our API → we enable `record: yes` for N minutes via path patch, then disable. Source: `runOnReady` + `/v3/config/paths/patch`.

## 12. Multi-thumbnail, preview & UX polish

- **N evenly spaced thumbnails per recording card.** Today we show one frame; instead show 3–5 frames sampled across the segment via `playback /get` mini-windows. Source: `playback /get` short windows + ffmpeg.
- **Animated preview-on-hover.** GIF/WebP made from 5 frames over the segment's duration; previews are cached and pruned with the segment. Source: `playback /get` + ffmpeg.
- **First-motion thumbnail.** When a motion-detection hook is configured, prefer that timestamp for the thumbnail instead of frame 0. Source: hook + `playback /get`.
- **Thumbnail backfill job.** Cron that walks `recordings/list`, fills missing thumbnails for everything inside the retention window. Source: `recordings/list`.
- **Skeleton timeline while loading.** Render expected day extents from `recordings/list` segment `start`s before the heavy `/list?start=&end=` request returns. Source: `recordings/list` + `playback /list`.

## 13. Sharing & access

- **Signed share link with expiry.** Generate `/share/{token}` that proxies a fixed `(path, start, duration)` to `playback /get` for non-app viewers; tokens expire and are revocable. Source: `playback /get` behind our proxy.
- **Embed iframe snippet.** Copyable HTML for embedding a clip in an external dashboard. Source: signed-link route.
- **Per-clip ACL.** Limit who can view a saved clip (org members, single email link, public-with-password). Source: app DB + signed-link route.
- **Audit log of plays.** Record `(user, path, start, duration, bytes)` for every server-side `/get` we proxy — useful for compliance / chain-of-custody. Source: app proxy of `playback /get`.

## 14. Mobile & player ergonomics

- **PWA-first playback page.** Full-screen, swipe-to-seek, double-tap-to-skip-10s, picture-in-picture toggle. Source: `playback /get` + browser PiP API.
- **Keyboard-driven review.** J/K/L (rewind/pause/forward), `,`/`.` for frame-step, `[`/`]` for in/out, `b` for bookmark — speeds up incident review. Source: client only.
- **Offline-cached clips.** Service worker caches recently played stitched outputs for offline review. Source: SW + `playback /get`.
- **Low-bandwidth mode.** Request narrower `duration` chunks and a downscaled re-encode (server-side ffmpeg pass) over `/get`. Source: `playback /get` + ffmpeg.

## 15. Power-user / niche

- **Side-by-side compare slider.** Two `/get` streams from the same path different days, dragged with a wipe handle (good for "what changed?"). Source: 2 × `playback /get`.
- **Diff-against-baseline.** Pixel-diff between today's frame and yesterday's at the same wall-clock — flags scene changes, camera tampering. Source: `playback /get` + image-diff.
- **MPEG-TS legacy export.** For paths set to `recordFormat: mpegts`, expose the raw segment files for download (since playback server can't stitch them yet). Source: `recordings/get/{name}` + raw file.
- **`%f` enforcement helper.** When the user enables `playback: yes` globally, scan all paths' `recordPath` and offer to add `%f` (microseconds) where missing — the server rejects the config otherwise. Source: validation in `conf/path.go`.
- **Schema-aware path-template tester.** Paste a sample wall-clock and see exactly which file it would write to. Source: `recordPath` placeholders.
- **Segment list export.** Download the raw `recordings/get/{name}` JSON (segments with `start`s) as CSV for external analysis. Source: `recordings/get/{name}`.
- **Long-term archive to object storage.** Background worker reads `recordings/list`, uploads segment files to S3 with the same path layout, then calls `deletesegment`. Source: `recordings/get/{name}` + `recordings/deletesegment`.
- **Cold/warm tiering.** Fast SSD for last 24 h (kept by `recordDeleteAfter`), cheap object store for older — UI shows where each segment lives. Source: app worker on top of the prior idea.
- **Playback-server health card.** On the dashboard, show whether `playback: yes` is enabled, on which `playbackAddress`, with TLS or not, and CORS origins — most operators forget to enable it. Source: `playback`, `playbackAddress`, `playbackEncryption`, `playbackAllowOrigins`.
- **TLS-cert helper for playback.** UI for setting `playbackServerKey` / `playbackServerCert` paths with a "test connection" button. Source: `playbackServerKey`, `playbackServerCert`.
- **Trusted-proxy editor.** Field to populate `playbackTrustedProxies` for deployments behind a reverse proxy that sets `X-Forwarded-Proto`. Source: `playbackTrustedProxies` (used by `urlScheme` in `on_list.go`).
- **Per-path "open recordings folder" shortcut.** For ops on the same host, deep-link the OS file manager to the resolved `recordPath` parent directory. Source: `recordPath` + path resolver.
- **Recording recipe presets.** One-click presets — "CCTV 24/7" (1 h segments, 30 d retention, fmp4), "Event-only" (`runOnDemand` + 5 min segments), "Forensics-grade" (5 min segments, 1 s parts, 1 y retention). Source: combinations of `record*` and `runOnDemand*` fields.
