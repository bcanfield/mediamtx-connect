# Ideas: Observability & Operations

> **Status: ideas, not implemented.** Brainstorm only — nothing in this file is shipped. Shipped features live in [`docs/FEATURES.md`](../FEATURES.md). See [`00-index.md`](./00-index.md) for context.

MediaMTX exposes a Prometheus-compatible `/metrics` endpoint (default `:9998`), Go `pprof` endpoints (default `:9999/debug/pprof/{heap,profile,goroutine}`), structured logs (`logDestinations: [stdout|file|syslog]` with `logFile`/`sysLogPrefix`/`logLevel`), and a Control API (default `:9997` — `configGlobalGet`/`configGlobalSet`, `paths/list`, `rtspsessions/list`, `hlsmuxers/list`, `webrtcsessions/list`, `srtconns/list`, `rtmpconns/list`, `recordings/list`). MediaMTX Connect today only knows about one server and surfaces almost none of this. The ideas below turn that raw signal into product surface area: a self-contained observability stack (no external Prometheus required), an operations console (config snapshots, hot reload, restart, diagnostics bundles), and a path to multi-server, alerting, SLA, and cost reporting — without forcing the user to stand up Grafana, Prometheus, or Loki on the side.

## Prometheus scraping & built-in metrics

- **In-app `/metrics` scraper.** Periodically `fetch` MediaMTX `:9998/metrics`, parse the Prometheus exposition format, and store the latest sample in memory keyed by metric + labels. No external Prometheus required. Building block: `metrics: yes`.
- **Live metrics dashboard page.** New route `/observability/metrics` showing tiles for `paths`, `paths_readers`, `hls_sessions`, `rtsp_sessions`, `rtmp_conns`, `webrtc_sessions`, `srt_conns`. Refreshes every 5s via TanStack Query polling.
- **Per-protocol session breakdown.** Donut chart of active sessions split by `hls_sessions` / `rtsp_sessions` / `rtmp_conns` / `webrtc_sessions` / `srt_conns`. One number means nothing — the mix tells the operator who their users are.
- **Bytes in/out gauge.** Derive bitrate from `paths_inbound_bytes` / `paths_outbound_bytes` deltas across two scrape windows; render as Mbps live tiles.
- **Frame-error counter.** Surface `paths_inbound_frames_in_error` and `hls_muxers_outbound_frames_discarded` as a "stream health" indicator on each path card.
- **Per-path label drill-down.** Clicking a metric tile filters to one `path=` label and shows its per-path series — uses MediaMTX's built-in `[name]`/`[path]` labels.
- **SRT deep stats panel.** SRT exposes 40+ counters (RTT, retransmits, buffer, loss). Hide them behind a "Show advanced SRT stats" disclosure on the SRT connection row. Building block: `srt_conns`.
- **WebRTC quality panel.** Surface `webrtc_sessions` jitter/loss/RTCP counts so users can diagnose "the stream is choppy" without `chrome://webrtc-internals`.
- **Cardinality guard.** If MediaMTX is exposing 10k+ path labels (e.g., dynamic paths), warn the user and show only the top-N — protects the browser from rendering a 50MB chart.

## Metrics export, passthrough, OTel

- **Re-export `/api/metrics`.** Proxy MediaMTX `:9998/metrics` through MediaMTX Connect with auth applied, so users can scrape one endpoint instead of poking holes for `:9998`. Building block: `metrics`.
- **App-level metrics on the same endpoint.** Augment the passthrough with MediaMTX Connect's own counters (cron run count, thumbnail-gen duration, DB query latency) using `prom-client`.
- **OpenTelemetry exporter.** Add an OTLP exporter that pushes scraped MediaMTX metrics + app metrics to any OTLP collector (Datadog, Honeycomb, Grafana Cloud, New Relic). Configurable via env.
- **Datadog/StatsD bridge.** Translate scraped Prometheus families to StatsD lines for shops still on `dogstatsd`.
- **Health-probe presets page.** Generate ready-to-paste Uptime Kuma / Pingdom / Datadog Synthetics configs (URL, expected JSON shape, headers) targeting `/api/health` and the new `/api/metrics`. Building block: `apiAddress`.

## Historical metrics (rollups)

- **SQLite rollup table.** New Prisma model `MetricSample(metric, labels, value, ts)` plus `MetricRollup1m/5m/1h/1d`. Cron downsamples in place; keeps 7d at 1m, 90d at 1h.
- **"Last 24h" charts on the dashboard.** Time-series area chart for paths/sessions/bytes that survives MediaMTX restarts, since MediaMTX itself only exposes counters since process start.
- **Postgres-as-Marketplace upgrade path.** When data exceeds SQLite's comfort zone, swap to Vercel Marketplace Neon Postgres without changing the UI — single Prisma migration. Building block: `metrics` scraper.
- **Live activity sparklines.** Each `stream-card` and recording row gets a 60-pixel sparkline of the last 15 min of `paths_outbound_bytes` for that path. Tiny but addictive.
- **Heatmap: day-of-week × hour-of-day.** 7×24 grid colored by avg sessions or bytes-out, rendered from rollups. Answers "when do people watch?" at a glance.
- **Top-N reports.** "Top 10 most-watched paths last 24h / 7d / 30d" by `paths_outbound_bytes` or peak `paths_readers`. Downloadable as CSV.
- **Codec / source-type breakdown over time.** Pull `MTX_SOURCE_TYPE` from `runOnReady` hooks into a `PathEvent` table; chart the mix over time.

## Alerts & notifications

- **Alert rule builder.** UI to create rules over scraped metrics: `paths < 1 for 5m`, `rtsp_sessions > 50`, `paths_inbound_frames_in_error rate > 0.1/s`. Stored in DB; evaluated by a new cron.
- **Multi-channel notifiers.** Discord/Slack webhook, email (Resend), generic webhook, PagerDuty Events v2. Per-rule channel selection.
- **Alert silencing & maintenance windows.** Mute by path, by rule, by time range. Required for any operator who owns a pager.
- **Alert history page.** Timeline of fired/resolved alerts with the metric snapshot at fire time and the configGlobalGet snapshot. Building block: `metrics` + `configGlobalGet`.
- **"Stream went offline" alert preset.** One-click rule that watches `paths{name=...} == 0` for any path that was previously up — uses `runOnNotReady` as a low-latency signal too.
- **Mobile push via PWA.** `next-pwa` + Web Push API so on-call gets a phone buzz without paying for PagerDuty.
- **Alert digest email.** Daily 8am summary of all fires — for low-pager-fatigue teams.

## SLA / uptime / cost

- **Per-stream uptime %.** Compute uptime windows from `runOnReady`/`runOnNotReady` hook events stored in DB; show 24h / 7d / 30d / quarter SLO numbers per path.
- **PDF SLA report.** "Stream X had 99.84% uptime in October" exported via headless browser print or `@react-pdf/renderer` for customer-facing teams.
- **Error-budget burn rate panel.** Classic Google SRE 4-window burn rate visualization on a per-path basis.
- **Egress cost calculator.** Configurable `$/GB`; multiply by sum of `paths_outbound_bytes` over the period. Per-path and per-protocol cost rows.
- **Bandwidth budget alarms.** Per-path or global "alert at 80% of N TB/month" rule that fires off scraped `paths_outbound_bytes`. Building block: `metrics`.
- **Geo distribution map.** Plot reader IPs from `rtspsessions/list` / `webrtcsessions/list` against a bundled MaxMind GeoLite2 country DB on a Leaflet world map.

## Log management

- **MediaMTX log tail viewer.** When `logDestinations: [file]` + `logFile` is mounted readable to MediaMTX Connect, stream the file via SSE with a level filter (`error|warn|info|debug`). Falls back to "logs not accessible — set `logDestinations: [file]` and bind-mount" empty state.
- **Log level toggle from UI.** PATCH `configGlobalSet` with the new `logLevel`; show the change took effect (no restart needed — MediaMTX hot-reloads).
- **Pino app-log viewer.** Tail MediaMTX Connect's own Pino logs (last 1k lines, level filter, free-text search) — useful for debugging cron jobs without `docker logs`.
- **Combined timeline.** Interleave MediaMTX log lines with app log lines on one timestamp-sorted view for correlation. Use trace IDs when present.
- **Search across rolled logs.** If MediaMTX is rotating to `mediamtx.log.1`, `.2`, etc., index them in SQLite FTS for fast grep.
- **Syslog destination wizard.** UI to configure `logDestinations: [syslog]` + `sysLogPrefix` and verify a journalctl tail matches.

## Profiling & debugging (pprof)

- **pprof launcher panel.** Buttons for "CPU 15s", "CPU 30s", "Heap snapshot", "Goroutine dump" — server-side fetches `:9999/debug/pprof/profile?seconds=15` etc., stores the resulting `.pb.gz` in `tmp/`. Building block: `pprof: yes`.
- **In-browser flamegraph.** Render the captured CPU profile with `speedscope` or `pprof-rs-wasm` so the operator never has to install `go tool pprof`.
- **Heap-diff view.** Capture two heaps a configurable interval apart, show the delta — "MediaMTX is leaking, where?" answered in two clicks.
- **Goroutine count time series.** Periodically scrape `:9999/debug/pprof/goroutine?debug=1` (gives a count) and chart it; spikes precede most "MediaMTX got slow" reports.
- **Auto-profile on alert.** When an alert fires (e.g., CPU > 90%), automatically capture a 30s CPU profile and attach it to the alert — postmortems stop being archaeology.
- **Disabled-pprof helper card.** If `pprof: no`, show a one-click "enable pprof" that PATCHes the config and reloads.

## Server / process / disk health

- **Process resource panel.** CPU/RSS/file-descriptor count of MediaMTX best-effort: read `/proc/<pid>/stat` when running on the same host, or call Docker Engine API `/containers/<id>/stats` when given a Docker socket. Building block: `runOnInit` to capture the PID early.
- **Disk usage breakdown.** Sunburst or stacked bar of `recordingsPath` vs `screenshots/` vs everything else under the data volume, with per-path subtotals from `recordings/list`.
- **Disk-full guard.** Pre-flight check: warn if free space < N hours of expected recording bytes (estimated from rolling ingress rate × recording paths).
- **fsync / write-latency probe.** Touch a file in `recordingsPath` every minute and chart write time — catches "NFS got slow" before recordings start dropping.
- **Time-sync drift check.** Periodically hit MediaMTX `paths/list` and compare `Date` response header to local clock; warn at >2s drift since recordings rely on clock alignment.
- **Connection health probe.** Ping the MediaMTX API every 60s, chart RTT, alert on three consecutive failures. Building block: `apiAddress`.

## Diagnostics & support

- **One-click diagnostics bundle.** Zip containing: redacted `configGlobalGet`, last 1k lines of MediaMTX log, last 1k lines of Pino log, current `/metrics` snapshot, `recordings/list`, `paths/list`, MediaMTX version, OS info. Drops to `~/Downloads`.
- **Sensitive-value redactor.** Bundle generation auto-replaces `*Pass`, `authJWTJWKS`, `authHTTPAddress` with `***` so users can DM bundles in support channels safely.
- **System info card.** MediaMTX version, build hash, Go version, platform, uptime — sourced from a small `/v3/system` poll plus `runOnInit`-captured timestamp.
- **Disaster recovery runbook generator.** Reads current config; outputs a printable one-pager with the right `curl` commands for restart, reload, restore, common failures.

## Multi-server management

- **`Server` model.** Drop `mediaMtxUrl` env-only config; introduce `Server { id, name, url, apiPort, metricsPort, pprofPort, role: PRIMARY|SECONDARY }`. Persisted in DB.
- **Server switcher in sidebar.** Combobox at top of `app-sidebar.tsx` to flip the active server. All existing pages scope to the selected server.
- **Aggregate "All servers" dashboard.** Sum `paths`, `*_sessions`, `paths_outbound_bytes` across every registered server — useful for fleets.
- **Per-server inventory page.** Table: name, URL, version, uptime, num CPUs (from pprof goroutine `GOMAXPROCS`), active paths, active sessions, last-scrape status. Building block: `metrics` + `apiAddress`.
- **Server registration wizard.** Test API reachability, test `/metrics`, test `/debug/pprof/`, write the row only if all green. Saves an hour of "why isn't it showing up".
- **Federation map.** Graph view of all registered servers with edges showing which paths source-mirror from where (using `source: rtsp://other-server/...` config patterns).
- **Failover view.** Designate primary + N secondaries per path; show a colored chip indicating who's currently serving (based on which `/v3/paths/list` lists it as `ready`).
- **Cluster config push.** "Apply this `configGlobalSet` to servers A, B, C" with diff preview before commit. Building block: `configGlobalSet`.
- **Cluster config drift detector.** Cron diffs `configGlobalGet` of every secondary against the primary; surfaces drift as alerts.
- **Per-server credential vault.** Encrypted-at-rest storage of API auth headers per `Server` row.

## Config lifecycle (snapshots, import, reload, restart)

- **Config snapshot table.** New `ConfigSnapshot { server, yaml, createdAt, createdBy, message }`. Snapshot automatically before every `configGlobalSet`.
- **One-click rollback.** "Restore" button on any snapshot — diff modal, then `configGlobalSet` of the old yaml. Hot-reload preserves clients. Building block: `configGlobalSet`.
- **Config diff viewer.** Side-by-side YAML diff between any two snapshots (current and any historical). Uses `react-diff-viewer-continued`.
- **Config export.** Download `mediamtx.yml` of the current state straight from `configGlobalGet`.
- **Config import.** Upload a yaml, validate against `generated.ts` types, dry-run diff, then apply. Building block: `configGlobalSet`.
- **Reload control + last-reload chip.** Track `lastReloadAt` per server; show "reloaded 3m ago" chip on the topbar. MediaMTX reloads on `configGlobalSet` — no extra call needed.
- **Restart MediaMTX.** Optional Docker socket integration: `POST /containers/<id>/restart`. Behind a "Dangerous actions" toggle.
- **Maintenance mode.** Temporarily set `authMethod: internal` + a deny-all internal user, or PATCH per-path `publishUser`/`readUser` to a sentinel — to block new clients during upgrades. Restored on exit.
- **Hot-reload preview.** Before saving, show "this change will/won't disconnect existing clients" based on which fields changed (e.g., `rtspAddress` change requires restart, `paths.*` does not).

## Versioning, updates, changelog

- **MediaMTX version chip.** Topbar chip showing detected MediaMTX version (parse from `/metrics` `# HELP` headers or a dedicated probe).
- **Update available banner.** Daily cron polls GitHub Releases via `gh api repos/bluenviron/mediamtx/releases/latest`; banner when `latest > current`.
- **In-app changelog viewer.** Render the GitHub release body as Markdown in a side sheet — saves a tab.
- **Outdated-by-N-versions warning.** Bigger banner with a "security release" flag if any release between current and latest mentions CVE/security.
- **Connect's own self-update notice.** Same pattern for `mediamtx-connect` itself.

## Hooks-driven event log

- **`PathEvent` table.** Wire MediaMTX hooks (`runOnReady`, `runOnNotReady`, `runOnRead`, `runOnUnread`, `runOnRecordSegmentCreate`, `runOnRecordSegmentComplete`) to POST to a new `/api/hooks/event` endpoint; persist for analytics.
- **Hook configuration UI.** Generate the right `runOn*` shell command lines (with the curl POST + token) for users to paste into `configGlobal`. Saves them from getting the env-var names wrong.
- **Live event stream page.** SSE feed of all path events with filter chips. Better than tailing logs.
- **Connect/disconnect counter.** Derived from `runOnConnect`/`runOnDisconnect` events; chart concurrent clients across time without relying on protocol-specific counters.
- **Recording-segment timeline.** Use `runOnRecordSegmentCreate`/`Complete` to render a real-time timeline of segment births/closures — handy for debugging "why is my recording 0 bytes".

## Network topology & flow

- **Path flow diagram.** Auto-generated graph: publishers (from `paths/list` `source` field) → MediaMTX → readers (from `*_sessions/list`). Edges labeled with current bitrate from `paths_inbound_bytes` deltas.
- **Sankey of bytes.** Bytes-in by source × bytes-out by protocol; visually answers "where is my traffic going?"
- **Per-client trace.** Click a session in `rtspsessions/list`; see its full lifecycle (connect → read → bytes-over-time → disconnect) reconstructed from hooks + metrics.
- **Stream-tree view.** When MediaMTX paths reference each other (`source: redirect`/`rtsp://localhost/other`), render the dependency tree.

## Backup / restore

- **Backup wizard.** One screen to take an encrypted tarball of: configGlobal, Prisma DB, recordings dir, screenshots dir. Push to S3, GCS, or Vercel Blob.
- **Scheduled backups.** Cron entry that snapshots nightly, retains N days, prunes the rest.
- **Restore flow.** Upload a backup; preview manifest; restore sequentially with progress. DB restore goes through `prisma migrate resolve`.
- **Backup integrity probe.** Weekly cron that downloads the latest backup, untars to `/tmp`, verifies checksums, deletes — confirms backups actually restore.

## Misc operations

- **Auth audit log.** Persist every `configGlobalSet` (who, when, what diff) — required for SOC2-curious customers.
- **API token manager.** Generate per-user tokens for `/api/*`, scope them, revoke. Stored hashed.
- **Quiet-hours scheduler.** PATCH `paths.*.record: no` between 02:00–06:00 globally; saves disk on low-value periods.
- **Bulk path actions.** Multi-select on the paths table; "delete N paths", "enable recording on N paths" via batched `configPathsPatch`.
- **Per-path tag system.** UI tags persisted in DB (MediaMTX's config has no tag field); used to filter dashboards and route alerts ("alert me only for tagged: production").
- **Saved views.** Named filter+sort combos on the paths/sessions/recordings tables — bookmarkable URLs.
- **Keyboard shortcut palette.** `cmd-k` to jump to any path, server, or page. Operations console muscle memory.
- **Read-only "viewer" role.** RBAC: viewers see metrics + logs, can't mutate config. Required when sharing dashboards with stakeholders.
- **Embed mode.** `?embed=1` query param strips chrome and renders a single chart full-bleed — paste into Notion/Confluence/TV dashboards.
- **TV-wall mode.** Rotating full-screen view of N most important charts; auto-cycle every 15s. For NOC monitors.
