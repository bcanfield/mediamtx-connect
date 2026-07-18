# MediaMTX Connect — Complete Feature Inventory

> **Living source of truth.** This document describes the *current* feature state of the app. Every shipped capability, route, oRPC procedure, background job, schema, integration, and developer-facing convenience belongs here.

## Maintenance contract

**Update this file in the same change that adds, removes, or changes a feature.** A PR that ships product behavior without updating this doc is incomplete.

When you change the codebase:

- **Add a feature** → add bullet(s) under the right section, with a one-line description and a backticked file-path citation.
- **Change a feature** → update the existing bullet (don't append a new one). Keep file paths current.
- **Remove a feature** → delete the bullet. Don't leave "removed" tombstones.
- **Add a route / API / oRPC procedure / schema / cron** → also update the corresponding catalog table (§10 Routing Map, §11 oRPC Procedures, §12 Schemas, §4 Background Jobs).
- **Add a new feature *domain*** (e.g., auth, storage, analytics) → add a new top-level section, update §19, and reflect it in `CLAUDE.md`'s domain table.

Keep entries factual and present-tense. No roadmap items, no "coming soon." Reserved-but-empty domains live only in §19.

Unshipped ideas — brainstorm only — live in [`docs/ideas/`](./ideas/00-index.md). Never copy from there into this file until the work is actually merged.

Sources reviewed at last full audit: source tree, `README.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `package.json`, Dockerfile, compose files, oRPC contract, MediaMTX API integration, Playwright suites. Architecture migrated from Next.js to the Vite + Hono + oRPC monorepo per `docs/MIGRATION.md`.

---

## 1. Live Streaming

### 1.1 Live View page (`/`)
- **Live streams dashboard** — grid of all active MediaMTX paths (14px gap, density-driven columns), fetched via TanStack Query. `apps/web/src/features/streams/live-view-page.tsx`
- **MediaMTX path discovery** — the api calls MediaMTX `v3/paths/list` and resolves the connection state server-side into a discriminated union (`connection-error` vs `connected`). `apps/api/src/router.ts` (`streams.list`)
- **Designed connection states** (per the design handoff, board 1c) — server-unreachable renders a centered red-tinted panel with the MediaMTX URL in mono, "Open App Config" + "Retry" buttons, and a visible auto-retry countdown (15 s); zero streams renders a dashed panel with publish-URL hints (RTSP/RTMP/SRT) in a mono code well, their ports built from the server's own listen addresses by the shared `publishTargets` (§1.2.3) rather than hardcoded; missing playback URL renders an amber banner above the grid with cards at 75 % opacity and Play disabled. `apps/web/src/features/streams/live-view-states.tsx`
- **Toolbar** — stream-count summary on the left ("N streams · M playing"); playback-mode segmented control (AUTO / LOW-LAT / COMPAT, persisted in `localStorage('playbackMode')`, §1.3.1) and 2/3/4 density segmented control (persisted in `localStorage('liveDensity')`) on the right. `apps/web/src/features/streams/live-streams-view.tsx`
- **"Stream online since" metadata** — `readyTime` renders as "online since {time} · {uptime}" on the card footer meta line.

### 1.2 Stream cards
- **Overlay-zone media tile** — 16:9 media area with reserved overlay zones (design handoff §3): top-left status pills (LIVE with pulsing dot + playback-protocol pill while playing, §1.3.1; SNAPSHOT while idle), bottom-left codec chips + bottom-right telemetry + bottom scrim. Every zone is an optional prop that renders only when its data shows up, so a stream missing any of it still lays out (§1.2.2). Nothing passes resolution or bitrate yet: resolution is deferred on scope rather than for lack of data (the path list's `tracks2` carries it), while bitrate is published as a cumulative counter where the design wants a rate (`docs/debt/20260715131524-missing-media-metadata-chips.md`). Latest screenshot loads via `/media/screenshots/{streamName}/latest`; the missing-thumbnail state is a diagonal-stripe placeholder with a mono "no snapshot yet" caption. `apps/web/src/features/streams/stream-card.tsx`
- **Record state indicator** — a card's footer shows "· ● REC" whenever the stream is *effectively* recording: its own override merged over path defaults, as MediaMTX resolves it. Inherited `true` is the stock setup, so a card reading only the stream's own (usually absent) entry would claim OFF while MediaMTX writes files (ADR 0002). `apps/web/src/features/streams/stream-card.tsx`
- **Play / Stop** — footer buttons (outline Play / primary Stop) plus a centered 46 px circular play affordance on idle cards.
- **URL-state-driven selection** — `?play=foo,bar` typed search param (TanStack Router `validateSearch`) tracks which streams are live, so the active set survives reload/share.
- **Stream actions menu** — `MoreHorizontal` `DropdownMenu` grouped per the design's extension contract: [Open stream detail, View recordings, Take snapshot] / [Record, Copy publish URLs, Share & embed…] / [Edit path config, Edit hooks]. "View recordings", "Take snapshot" (§1.2.4), "Record" (§1.2.1), "Copy publish URLs" (§1.2.3), "Edit path config" (deep-links to `/config/mediamtx/paths/{name}`, §3.4) and "Edit hooks" (the same route with `?section=pathHooks`, §3.4) are functional; the two remaining — "Open stream detail" and "Share & embed…" — are stubs that log via the shared logger and show a "Not implemented yet" toast, deferred by design (`docs/debt/20260715131447-stream-card-action-stubs.md`). `apps/web/src/features/streams/stream-card.tsx`

#### 1.2.1 Record toggle
- **Per-stream record toggle** — the actions menu's "Record" item shows effective ON/OFF and flips it for that one stream, via `config.mediamtx.updatePathConfig` (§3.4). It writes the path's own `{record}` override only: path defaults are the other place `record` lives, and writing them from a card would start or stop recording for every stream on the server (ADR 0002). A wildcard-backed stream — the normal case — has no entry to patch, so the first toggle materializes a sparse one; the live session survives it, unlike a hook write. Failures toast and leave the state alone. `apps/web/src/features/streams/stream-card.tsx`
- **One read per distinct `confName`** — `streams.list` resolves record state for the whole grid by reading each *distinct* `confName` once (normally one, the `all_others` wildcard), not once per card. MediaMTX resolves path defaults into whichever entry it serves, so the read is already effective config. `apps/api/src/router.ts` (`streams.list`)

#### 1.2.2 Card metadata chips
- **Codec chips** — a ready stream's codecs render as chips in the card's bottom-left zone, from the `tracks` the path list returns on every poll. An idle path publishes no tracks and its zone stays empty. `apps/web/src/features/streams/stream-card.tsx`
- **Viewer count** — the bottom-right telemetry zone shows how many readers MediaMTX has on the path, whatever protocol they read over. Nobody watching is the resting state and reads "0 viewers": the count is always known, so it's shown rather than hidden. `apps/web/src/features/streams/stream-card.tsx`
- **Snapshot age** — an idle card's SNAPSHOT pill carries the age of the frame it's showing ("SNAPSHOT · 2 MINUTES AGO" — the pill uppercases), from the mtime of the PNG our own capture job wrote, not a MediaMTX concern. Localized relative time, so the design's compact "· 14s ago" reads as "· 14 SECONDS AGO"; a fresh capture reads "· NOW". Rendered with `useFormatter().relativeTime` against a `useNow` that ticks on the connection poll, since both the capture and the grid refresh underneath it. The pill only renders once a snapshot exists, so its age is always known. `apps/web/src/features/streams/stream-card.tsx`
- **No new MediaMTX calls** — `tracks` and `readers` were already in the `v3/paths/list` response `streams.list` polls; they were dropped at the contract boundary. Lighting the chips up widened `StreamSchema` and the api client's `MediaMtxPath`, and added no request. `packages/contract/src/index.ts`, `apps/api/src/mediamtx.ts`
- **One "latest snapshot" resolver** — `latestScreenshotPathFor` decides which PNG is a stream's latest (live.png, else the newest recording thumbnail by name). The `/media/screenshots/{name}/latest` route, the recordings screenshot-URL helper, and the card's snapshot age all read it, so they can't disagree about which file is current — the URL helper used to answer from any non-dot file and could hand back a URL the route then 404'd. `apps/api/src/recordings-fs.ts`

#### 1.2.3 Publish URLs
- **Copy publish URLs** — the actions menu's "Copy publish URLs" item copies this stream's RTSP/RTMP/SRT publish URLs (one per line) to the clipboard, then toasts success or, if the browser blocks clipboard access, failure. `apps/web/src/features/streams/stream-card.tsx`
- **One builder, ports from config** — `publishTargets` builds the URLs from the server's own listen addresses (`rtspAddress`/`rtmpAddress`/`srtAddress` off global config), keeping only the port and pairing it with the browser-facing host, so an operator who changed a listen address is pointed at the right one. The same builder feeds the zero-streams hints (§1.1), so the copy action and the empty-state can never disagree on a port; MediaMTX defaults (8554/1935/8890) apply only when the server reports no address. `apps/web/src/lib/publish.ts`

#### 1.2.4 On-demand snapshot
- **Take snapshot now** — the actions menu's "Take snapshot" item captures a frame for that one stream immediately via the `streams.snapshot` mutation (§11), rather than waiting up to 30s for the next cron tick. On success the card's idle thumbnail is force-refreshed (a bumped `?v=` query, since the file path is stable and `Cache-Control: no-store` alone won't make a mounted `<img>` re-request) and the grid is invalidated so the snapshot-age pill moves; on failure — e.g. an offline stream MediaMTX can't grab a frame from — it toasts an error. The menu item disables while a capture is in flight. `apps/web/src/features/streams/stream-card.tsx`
- **Reuses the cron's capture, under a shared cap** — `streams.snapshot` calls `captureSnapshot` (`apps/api/src/jobs.ts`), the same RTSP-frame capture the live snapshot cron runs (§4). MediaMTX has no snapshot endpoint, so this wraps the protocol it already serves. The on-demand spawn and the cron's per-stream spawns acquire one shared concurrency gate (`MAX_CONCURRENT_CAPTURES = 4`), so the cap counts both together — a user-triggered capture can't stack ffmpeg on top of an already-uncapped 30s sweep. The mutation awaits the ffmpeg exit and throws on non-zero, which the card surfaces (`docs/debt/20260715154503-snapshot-cron-unbounded-ffmpeg.md`). `apps/api/src/jobs.ts`, `apps/api/src/router.ts` (`streams.snapshot`)

### 1.3 Video player
- **HLS.js streaming** — adaptive bitrate playback in any modern browser. `apps/web/src/components/video-player.tsx`
- **Native HLS fallback** — uses `<video>` native HLS where supported (Safari).
- **Live-edge sync** — caps `maxLiveSyncPlaybackRate` at 1.5× to stay near the live edge.
- **Automatic media-error recovery** — calls `recoverMediaError` immediately on every `MEDIA_ERROR`, in place, with no teardown.
- **Fatal-error escalation** — any other fatal error logs, destroys the HLS instance, and rebuilds it after 2 s.
- **Autoplay-muted on manifest parse** — works around browser autoplay policies. Live tiles render chrome-free (no native controls); stop/start happens through the card.

#### 1.3.1 WebRTC (WHEP) playback and the mode toggle
- **LOW-LAT plays over WebRTC** — the player reads the stream from MediaMTX's own WHEP endpoint (`{remoteMediaMtxUrl}{webrtcAddress}/{stream}/whep`) instead of HLS. Any stream MediaMTX serves can be read over WebRTC whatever it was published over, so this needs no server-side work. `apps/web/src/lib/whep.ts`
- **AUTO prefers WebRTC, COMPAT forces HLS** — AUTO tries WebRTC and drops to HLS silently; COMPAT never reaches for WebRTC and is exactly the HLS path above. `apps/web/src/lib/playback.ts` (`resolveTransport`)
- **Falls back rather than fails** — blocked UDP, no route to the WebRTC port, or a stalled connection (8 s cap) all fall back to HLS at connect time, and a session that connects and then drops mid-stream (route change, `failed` ICE) falls back too rather than freezing the card — a playing stream beats a black one. `webrtc: false` server-side or an empty `webrtcAddress` skips the attempt entirely. `apps/web/src/components/video-player.tsx`
- **The pill reports the transport in use, not the one requested** — the player reports what actually connected and the card renders that (`WEBRTC` / `HLS`, `CONNECTING` while negotiating). It is never inferred from the mode: a LOW-LAT attempt beaten by a firewall is playing HLS and says so. It is a *playback* protocol, unrelated to the source protocol. `apps/web/src/features/streams/stream-card.tsx`
- **LOW-LAT announces a fallback, AUTO doesn't** — falling back under LOW-LAT adds a `WEBRTC UNAVAILABLE` pill, since low latency was asked for and not delivered. AUTO expresses no preference, so the same fallback is silent.
- **No latency figure** — the design's pill nominally carries one, but no single number is measurable across both transports (hls.js reports distance-from-live-edge; WebRTC's `getStats` reports jitter-buffer delay — different things). The protocol label ships without it rather than hardcode a decorative "~0.4s".
- **Per-card transport** — each card negotiates its own peer connection and honors the mode independently, so the camera wall can have several playing at once. Changing the mode renegotiates every playing card.
- **No new contract surface** — the WebRTC address and MediaMTX's own `webrtcICEServers2` come from the existing `config.mediamtx.getGlobal` (§3.3); they are server-wide, so they never belonged on `streams.list`. `apps/web/src/features/streams/live-view-page.tsx`
- **Hand-rolled WHEP client** — one POST of a fully-gathered SDP offer, one DELETE of the session resource on teardown; no dependency (ADR 0003). Unit-tested in node against a fake `RTCPeerConnection`. `apps/web/src/lib/whep.test.ts`

---

## 2. Recordings

### 2.1 Recordings index (`/recordings`)
- **All-streams recording grid** — every subdirectory of the recordings mount renders as a whole-card-clickable tile: 16:9 thumbnail with a mono timestamp pill (top-right) and an "N RECORDINGS" chip (bottom-left), footer with name, "latest <relative time>" via `useFormatter`, and an arrow affordance. `apps/web/src/features/recordings/recordings-index-page.tsx`, `apps/web/src/features/recordings/recordings-index-view.tsx`
- **Toolbar** — totals summary ("N streams · M recordings") on the left; a 280 px filter input with search-icon prefix and a `/` keyboard-hint badge on the right. Pressing `/` anywhere focuses the filter; filtering is client-side and instant.
- **Empty / error states** — dashed panel with an "Enable recording" CTA into the MediaMTX path defaults (§3.3) when no recordings exist (`apps/web/src/features/recordings/recordings-index-empty.tsx`); red-tinted `StatusPanel` with the mono directory path and "Open App Config" CTA when the mount is unreadable (`apps/web/src/features/recordings/recordings-index-page.tsx`).
- **`summarizeStreamRecordings`** — api-side fs helper returns `{count, latestMtime}` per subdirectory in one walk. `apps/api/src/recordings-fs.ts`

### 2.2 Per-stream recording browser (`/recordings/{streamname}`)
- **Reading-width layout** — content centered at max 920 px with a `Breadcrumb` (Recordings / {stream}, mono stream name) and a header showing the stream name + total recording count. `apps/web/src/features/recordings/stream-recordings-page.tsx`
- **Paginated recording list** — `?page` and `?take` typed search params, default 10/page.
- **Day-grouped sections** — mono uppercase eyebrow headers ("TODAY — JULY 15" / "YESTERDAY — …" / formatted day) with a hairline underline.
- **Pagination bar** — "Showing 1–10 of N" (mono) on the left; chevron prev/next + numbered pages with ellipses on the right, active page filled. Navigates via TanStack Router search params.
- **Reverse-chronological sort** — newest recordings first. `apps/api/src/recordings-fs.ts`

### 2.3 Recording rows
- **Row layout** — 118 px 16:9 thumbnail (click-to-play), time-of-day title, file-size meta, and Play + download icon buttons on the right; hover raises the border. `apps/web/src/features/recordings/recording-row.tsx`
- **Expanding inline player** — Play swells the row into a full-width video card with a custom seekbar (3 px track, blue fill, white knob via Radix Slider), play/pause and mono time readouts; Close (primary) collapses it. `?play=` URL param tracks open recordings. `apps/web/src/features/recordings/recording-player.tsx`
- **Download with live progress row** — `fetch` + `ReadableStream` streaming into a 3 px blue progress bar with a mono status line ("downloading… X MB of Y MB · Z MB/s") and a Cancel button (AbortController); success/failure surfaces as a toast. `apps/web/src/features/recordings/use-recording-download.ts`

### 2.4 Recording streaming endpoint
- **`GET /media/recordings/{streamName}/{file}`** — serves MP4 with `Content-Type: video/mp4` and real HTTP Range support (206 partial content, `Content-Range`), for in-browser playback + seeking. With `?download`, adds `Content-Disposition: attachment` for the download button. `apps/api/src/media.ts`
- **Path safety + 404s** — resolved paths must stay inside the recordings mount; file existence validated before stream open.

### 2.5 Thumbnails / screenshots
- **`GET /media/screenshots/{streamName}/latest`** — serves `live.png` (the periodic live snapshot, see §4) when present; otherwise the newest recording thumbnail, or plain 404 when the stream has neither (cards fall back via `onError`). `apps/api/src/media.ts`
- **`GET /media/screenshots/{streamName}/{file}.png`** — serves a specific recording's thumbnail.
- **`Cache-Control: no-store`** — set on every screenshot response so the freshest snapshot is always served.
- **Stream-scoped storage** — thumbnails live under `<screenshotsDirectory>/<streamName>/`: one `live.png` per stream, plus one PNG per recording named after its MP4.

---

## 3. Configuration

### 3.1 App config — `/config`
- **Narrow single-column form** — max 640 px, centered, with mono uppercase eyebrow section headers ("MEDIAMTX CONNECTION", "STORAGE"); labels above 38 px inputs with mono value text and help text below. `apps/web/src/features/client-config/client-config-page.tsx`, `apps/web/src/features/client-config/client-config-form.tsx`
- **Playback URL hero field** — `remoteMediaMtxUrl` sits in an amber-bordered callout with a "REQUIRED FOR LIVE PLAYBACK" pill badge (board 2d) since it's the field that unlocks live playback.
- **React Hook Form + Zod validation** with on-blur validation and Sonner toast feedback (success: `App Config saved`). `apps/web/src/features/client-config/client-config.schemas.ts`
- **Editable fields**:
  - `mediaMtxUrl` — internal/container hostname for MediaMTX API.
  - `mediaMtxApiPort` — API port (default 9997), fixed-width input.
  - `remoteMediaMtxUrl` — browser-reachable HLS endpoint (the hero "Playback URL").
  - `recordingsDirectory` — mount path for MP4s.
  - `screenshotsDirectory` — mount path for thumbnails.
- **`config.app.get` / `config.app.update` oRPC procedures** with TanStack Query invalidation after save. `apps/api/src/router.ts`, `apps/api/src/config-store.ts`
- **Floating save bar** — the shared `SaveBar` mounts only while the form is dirty: amber dot + "n unsaved changes (· m fields need attention)", Reset (ghost) + Save (disabled while invalid). `apps/web/src/components/save-bar.tsx`

### 3.2 MediaMTX global server config — `/config/mediamtx/global`
- **MediaMTX `GlobalConf` editor** — 65 controls across eight sections: 58 field rows, 6 protocol enable switches (`api`, `rtsp`, `rtmp`, `hls`, `webrtc`, `srt`), and the `webrtcICEServers2` rows. `GlobalConfigSchema` mirrors MediaMTX v1.11.3, minus the `record*` group — MediaMTX serves those from path defaults, not global, so they live on the path-defaults scope (§3.3, ADR 0002). `apps/web/src/features/mediamtx-config/mediamtx-config-form.tsx`, `apps/web/src/features/mediamtx-config/sections.ts`, `packages/contract/src/index.ts` (`GlobalConfigSchema`)
- **Scroll-with-rail layout (not tabs)** — a sticky 200 px "ON THIS PAGE" anchor rail beside one continuously scrolling form of eight sections (Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC, SRT), driven by a data descriptor. Rail rows scroll-spy the active section (IntersectionObserver) and show a red error-count pill or a mono "OFF" label for disabled protocols. On mobile the rail collapses to a sticky horizontal chip row. `apps/web/src/features/mediamtx-config/sections.ts`, `apps/web/src/hooks/use-scroll-spy.ts`
- **`ConfigFieldRow`** — 280 px fixed key column (MediaMTX config key verbatim in Geist Mono, never localized per `docs/I18N.md`, with an amber dirty dot) + localized help text below + control column (mono inputs full-width, switches right-aligned), hairline row separators. `apps/web/src/features/mediamtx-config/config-field-row.tsx`
- **Per-field localized help text** — `Config.mediamtxForm.help.*` messages describe every exposed key.
- **Protocol section header switches** — API/RTSP/RTMP/HLS/WebRTC/SRT sections carry an ENABLED/OFF mono label + `Switch` in the header; while off, the header dims to 55 % and the fields collapse to "n options hidden while off".
- **List fields use newline-split Textarea** — `logDestinations`, `protocols`, `authMethods`, `hlsTrustedProxies`, `webrtcTrustedProxies`, `webrtcIPsFromInterfacesList`, `webrtcAdditionalHosts`. One value per line.
- **WebRTC ICE servers field array** — repeatable [url | username | password] input rows with a remove ✕ per row and a dashed "+ Add ICE server" button. `apps/web/src/features/mediamtx-config/ice-servers-rows.tsx`
- **Pending-changes bar** — the shared `SaveBar` with dirty-key chips (mono pills named by config key; erroring keys turn red with a ✕), Discard (ghost) + "Save to server" (primary). `apps/web/src/components/save-bar.tsx`
- **Live read/write through MediaMTX HTTP API** — `config.mediamtx.getGlobal` (`v3/config/global/get`) + `config.mediamtx.updateGlobal` (`v3/config/global/patch`). `apps/api/src/router.ts`, `apps/api/src/mediamtx.ts`
- **Toast feedback** on success/error (success: `MediaMTX config saved`); submit gated on dirty + valid.

### 3.3 MediaMTX path defaults — `/config/mediamtx/path-defaults`
- **Path-defaults editor** — the settings every MediaMTX path inherits, on the scope MediaMTX actually serves them from (`v3/config/pathdefaults`). A Recording section (a `record` header switch plus `recordPath`, `recordFormat`, `recordPartDuration`, `recordSegmentDuration`, `recordDeleteAfter`) and a Path Hooks section (the 15 `runOn*` keys, §3.4). Route is a *sibling* of the per-path route, not `paths/defaults`, which would reserve `defaults` as a path name (ADR 0002). `apps/web/src/features/mediamtx-config/path-defaults-page.tsx`, `apps/web/src/features/mediamtx-config/sections.ts` (`PATH_DEFAULTS_SCOPE`)
- **Scope-parameterized rail form** — `MediaMTXConfigForm` takes a `ConfigScope` (schema + section descriptors) and a save procedure, and serves the global, path-defaults and per-path pages from one implementation: same rail, scroll-spy, dirty tracking, save bar and toasts. Hands `onSave` the changed keys alongside the full values, so a scope can save a sparse override instead of the whole config. `apps/web/src/features/mediamtx-config/mediamtx-config-form.tsx`
- **Live read/write through MediaMTX HTTP API** — `config.mediamtx.getPathDefaults` (`v3/config/pathdefaults/get`) + `config.mediamtx.updatePathDefaults` (`v3/config/pathdefaults/patch`). The PATCH is sparse: only the surfaced keys are sent, so unlisted path-defaults keys are left untouched. `apps/api/src/router.ts`, `apps/api/src/mediamtx.ts`
- **"Enable recording" CTA target** — the recordings empty state links here, where recording can actually be enabled. `apps/web/src/features/recordings/recordings-index-empty.tsx`

### 3.4 MediaMTX path config — `/config/mediamtx/paths/$name`
- **Per-path editor** — one stream's own settings, reached from that stream's card ("Edit path config"). Same Recording and Path Hooks sections as path defaults: both scopes are the same key set, one applied server-wide and one to a single path (ADR 0002). `apps/web/src/features/mediamtx-config/path-config-page.tsx`, `apps/web/src/features/mediamtx-config/sections.ts` (`PATH_CONFIG_SCOPE`)
- **Path hooks** — the 15 `runOn*` commands MediaMTX fires on a path's own lifecycle (`runOnInit`, `runOnDemand*`, `runOnReady`/`runOnNotReady`, `runOnRead`/`runOnUnread`, `runOnRecordSegmentCreate`/`Complete`), in a Path Hooks section on both path scopes. The server-wide `runOnConnect`/`runOnDisconnect` fire per client connection and stay on the global page (§3.2) — they are the only genuinely global hooks. **Saving a hook restarts the path and disconnects its publisher** (verified on v1.19.2; a `record*` save does not), and the form does not say so: `docs/debt/20260716155826-hook-write-drops-publisher.md`. `apps/web/src/features/mediamtx-config/sections.ts` (`PATH_SECTIONS`), `packages/contract/src/index.ts` (`PathDefaultsSchema`)
- **Section deep-link** — `?section=` lands the page on one section, scrolling past the rest; the card's "Edit hooks" is this route with `?section=pathHooks`. Path config and path hooks are one object and one write — the card menu splits them for the operator only. `apps/web/src/main.tsx`, `apps/web/src/features/mediamtx-config/mediamtx-config-form.tsx` (`initialSection`)
- **Effective config, never a raw scope** — the page shows the path's own overrides merged over path defaults, so an inherited value renders as its real value rather than as unset. MediaMTX resolves defaults into the entry it serves, so the merge is its own. A wildcard-backed path has no entry under its own name (`config/paths/get/$name` → 404); its config is reached through the runtime path's `confName`, and the subheader names the entry the values come from. `apps/api/src/router.ts` (`getPathConfig`)
- **Materialize-on-save** — saving a change to a wildcard-backed stream creates its config entry (`config/paths/add`), overriding only the keys that changed; a path that already has an entry is patched instead. A `record*` save is non-disruptive against v1.19.2 — the live session keeps its `readyTime` and does not reconnect — but a `runOn*` save restarts the path (see Path hooks above). Because the override is sparse, untouched keys keep tracking path defaults — a later change to a default still reaches the stream. `apps/api/src/router.ts` (`updatePathConfig`), `apps/api/src/mediamtx.ts`
- **Live read/write through MediaMTX HTTP API** — `config.mediamtx.getPathConfig` (`v3/paths/get` + `v3/config/paths/get`) + `config.mediamtx.updatePathConfig` (`v3/config/paths/add`|`patch`). `apps/api/src/router.ts`, `apps/api/src/mediamtx.ts`

---

## 4. Background Jobs (`apps/api/src/jobs.ts`)

- **First-run bootstrap** — creates `config.json` from env vars (`BACKEND_SERVER_MEDIAMTX_URL`, `MEDIAMTX_API_PORT`, `REMOTE_MEDIAMTX_URL`, `MEDIAMTX_RECORDINGS_DIR`, `MEDIAMTX_SCREENSHOTS_DIR`) and ensures `recordingsDirectory` / `screenshotsDirectory` exist on server boot. After the file exists, the `/config` UI is the source of truth — re-setting env vars takes effect only after deleting `config.json`. `apps/api/src/config-store.ts`
- **Env / Config drift warning** — on subsequent boots, for each bootstrap env var that the operator has *explicitly* set in the environment (raw `process.env` via `rawEnv` in `apps/api/src/env.ts`, distinct from schema defaults), if its value differs from the corresponding stored config value a single structured `WARN` log lists each mismatch and reminds the operator that env only seeds the first boot.
- **Live snapshot cron** — every 30 seconds (`*/30 * * * * *`) lists MediaMTX paths and, for each `ready` one, grabs a single frame off the RTSP feed (`rtsp://<mediaMtxUrl host>:<rtspAddress port>/<path>`) into `<screenshotsDirectory>/<streamName>/live.png`. MediaMTX exposes no snapshot endpoint, so this wraps the protocol it already serves. Written via tmp+rename so `/latest` never serves a half-written file; each `ffmpeg` is SIGKILLed after 15s so a stalled camera can't pile up processes. Also runs once on boot. This is what backs the card's "first capture in ~30s" copy — snapshots do **not** require recording to be enabled. The per-stream captures and the on-demand `captureSnapshot` (§1.2.4) acquire a **shared concurrency gate** (`MAX_CONCURRENT_CAPTURES = 4`) before spawning and release it on ffmpeg exit, so the two sources are bounded together rather than either running unbounded (`docs/debt/20260715154503-snapshot-cron-unbounded-ffmpeg.md`).
- **Thumbnail generation cron** — every 30 minutes (`*/30 * * * *`) scans the recordings tree for MP4s without a sibling PNG and spawns `ffmpeg -ss 00:00:00 -i <file>.mp4 -frames:v 1 <file>.png`. Non-blocking, parallel. Also runs once on boot. Backs the per-recording thumbnails in the recordings list.
- **Screenshot retention cron** — daily at midnight (`0 0 0 * * *`) deletes thumbnails older than 2 days, per stream subdirectory. A live stream's `live.png` is refreshed every 30s so it never ages out; once a stream goes offline its last frame survives 2 days, then the card falls back to a recording thumbnail (or the "no snapshot yet" placeholder).
- **Pino-structured logging** of every spawn / deletion.

---

## 5. Health, Observability, and System

- **`GET /api/health`** — JSON health endpoint with config-store readability check; returns 200 healthy or 503 unhealthy. Used by the Docker `HEALTHCHECK`. `apps/api/src/server.ts`
- **Pino logger** — structured logs across the api; a console-backed logger in the web app; `console.*` lint-banned elsewhere. `apps/api/src/logger.ts`, `apps/web/src/lib/logger.ts`
- **Centralized env loader** — `apps/api/src/env.ts` validates env via t3-env + Zod: the five bootstrap vars (see §4) plus `PORT` (default `3000`), `LOG_LEVEL` (default `info`, consumed by `apps/api/src/logger.ts`), and `NODE_ENV`. The web app has no runtime env — its only build-time read is `import.meta.env.DEV` in `apps/web/src/lib/logger.ts`; everything else flows through the API.
- **Client data fetching via TanStack Query** — data-driven pages always refetch on mount, so the UI reflects fresh server state.

---

## 6. Data Layer

- **JSON config store (no database)** — the app's five settings persist in `$DATA_DIR/config.json`, Zod-validated on read and write, written atomically (temp file + rename). `apps/api/src/config-store.ts`
- **Env-seeded first boot** — see §4; every bootstrap var has a default, so a fresh clone and a bare `docker run` both boot with zero configuration. Defaults are picked by `NODE_ENV`: production uses the container mounts (`/data`, `/recordings`, `/screenshots`) and the compose hostname (`http://mediamtx`); dev writes under `<repo>/.dev-data/*` and reaches MediaMTX on `http://127.0.0.1`. The dev dirs are resolved from `env.ts` via `import.meta.url`, so they're the same absolute path whether the api runs from `apps/api` (tsx) or the repo root (built bundle) — no cwd-relative surprises. Env vars are optional first-boot overrides, not required input. `apps/api/src/env.ts`

---

## 7. MediaMTX API Integration

- **Hand-rolled typed client** for the three endpoints the app uses: `v3/paths/list`, `v3/config/global/get`, `v3/config/global/patch` (fetch-based, shapes mirror MediaMTX v1.11.3 swagger). `apps/api/src/mediamtx.ts`
- **Only the api talks to MediaMTX's API** — the browser reaches MediaMTX directly only for HLS playback via `remoteMediaMtxUrl`.

---

## 8. UI System / Shared Components

### 8.1 shadcn/ui primitives (`apps/web/src/components/ui/`)
- Layout / nav: Breadcrumb.
- Content: Card, AspectRatio, Progress, Badge.
- Inputs: Button, Input, Textarea, Switch, Label, ToggleGroup, Toggle.
- Surfaces: Popover, DropdownMenu, Dialog, Command.
- Form: RHF integration (FormField, FormControl, FormMessage, FormDescription, FormItem, FormLabel).
- Toast: Sonner `Toaster` mounted in the root route; callsites import `toast` directly from `sonner`.
- Primitives are tuned to the Geist spec: 6 px buttons/inputs, 8 px menus, 12 px cards (hairline border, no shadow), blue focus ring (`border + 3 px soft ring`).

### 8.2 Shared components (`apps/web/src/components/`)
- **AppHeader** — global two-row top-nav shell (design handoff §2): row 1 with the logo mark (mono "M" square) + "MediaMTX Connect" wordmark, connection status, LocaleSwitcher, ModeToggle; row 2 with route tabs (Live — with a red dot while streams are live —, Recordings | App Config, MediaMTX Config) styled as underline tabs, horizontally scrollable on mobile. `apps/web/src/components/app-header.tsx`
- **ConnectionStatus** — polling dot + mono "connected"/"offline" label (`aria-live`), backed by the shared `useConnectionState` hook (15 s `streams.list` poll). `apps/web/src/components/connection-status.tsx`, `apps/web/src/hooks/use-connection-state.ts`
- **SaveBar** — shared floating pending-changes bar for both config pages: amber dot + summary, optional mono dirty-key chips, Discard/Reset + Save. Renders only while dirty. `apps/web/src/components/save-bar.tsx`
- **PageLayout** — page title (20 px, negative tracking) + subheader + content in a width-variant container (7xl default, 1060 px wide, 920 px reading, 640 px narrow), 28 px gutters. `apps/web/src/components/page-layout.tsx`
- **ModeToggle** — single-click Light ↔ Dark theme toggle backed by the in-app `ThemeProvider`. Uses the View Transitions API to play a circle-reveal clip-path animation centered on the button (graceful fallback when the API is unsupported). `apps/web/src/components/mode-toggle.tsx`
- **VideoPlayer** — shared player: HLS.js, or WebRTC/WHEP with HLS fallback depending on the playback mode (see §1.3). `apps/web/src/components/video-player.tsx`
- **StatusPanel** — shared panel behind the designed empty / error / disconnected states on the live and recordings screens (§1.1, §2.1). `apps/web/src/components/status-panel.tsx`
- **mediaCardShell** — shared class string giving stream cards and recording summary cards one media-tile shell. `apps/web/src/components/media-card.ts`
- **ThemeProvider** — in-app theme context (light/dark/system), dark default, `class`-based, persisted to `localStorage`. Paired with an inline pre-bundle script in `index.html` that sets the `<html>` class before first paint to avoid a theme flash. `apps/web/src/components/theme-provider.tsx`, `apps/web/index.html`
- **ServiceWorker** — registers `/sw.js` for offline / PWA support, with browser-capability guard. `apps/web/src/components/service-worker.tsx`
- **LocaleSwitcher** — see §9.

### 8.3 Lib (`apps/web/src/lib/`, `apps/web/src/`)
- **`cn`** — Tailwind class merger. `apps/web/src/lib/utils.ts`
- **`logger`** — browser console wrapper. `apps/web/src/lib/logger.ts`
- **`orpc`** — typed `ContractRouterClient` + TanStack Query utils; the only way the web app calls the JSON API. `apps/web/src/orpc.ts`
- **`@/i18n/navigation`** — `href`-based `Link`/`usePathname`/`useRouter` compat layer over TanStack Router, preserving the old component surface. `apps/web/src/i18n/navigation.ts`

### 8.4 Recordings filesystem helpers
- **`summarizeStreamRecordings` / `listStreamRecordingFiles` / screenshot path, URL and mtime helpers** — api-side fs helpers used by the recordings procedures, the media routes, and the card's snapshot age (§1.2.2). `apps/api/src/recordings-fs.ts`

### 8.5 Application chrome
- **Top-nav shell** — `AppHeader` (sticky, hairline bottom border) above a full-width `<main>` wraps every route via the TanStack Router root route. `apps/web/src/main.tsx`
- **Root route** — Sonner Toaster mount, ThemeProvider, ServiceWorker registration, `I18nProvider`, and the router itself (code-based route tree). `apps/web/src/main.tsx`
- **Global CSS** — Tailwind 4 with the Geist (Vercel) design tokens from the design handoff mapped onto shadcn CSS variables: dark default (`#0a0a0a` canvas, `#111` cards, `#262626` hairlines, inverted-ink primary button) + first-class light palette, plus semantic extensions (`--link`, `--warning`, `--live`, `--mute`, `--faint`, border/surface tiers). Geist Sans + Geist Mono self-hosted via `@font-face` from `apps/web/public/fonts/`. Two dark values are lightened from the handoff hexes to pass WCAG AA contrast (`--faint`, `--link` — noted inline). `apps/web/src/globals.css`

---

## 9. Theming, Accessibility, PWA, Internationalization

- **Dark / Light theme** — persisted to `localStorage` via the in-app `ThemeProvider`, dark default. Toggled by `ModeToggle` (single-click, View Transitions API circle-reveal).
- **Web App Manifest** — installable PWA. App name, theme color `#0a0a0a`, `display: standalone`, 512×512 maskable + rounded icons, `start_url: /`. `apps/web/public/manifest.webmanifest`
- **Service worker registration** — offline-friendly shell. `apps/web/src/components/service-worker.tsx`, `apps/web/public/sw.js`
- **Radix-based UI primitives** — keyboard nav, focus management, ARIA wired in via shadcn/ui.
- **Internationalization (i18n)** — `use-intl` (next-intl's framework-agnostic core). Supported locales (30 total): `en` (default); plus `es`, `zh` (Simplified), `it`, `de`, `ru`, `fr`, `pt`, `ja`, `pl`, `ko`, `tr`, `nl`, `cs`, `zh-tw` (Traditional Chinese), `pt-br` (Brazilian Portuguese), `id`, `ro`, `sv`, `da`, `no`, `fi`, `el`, `hu`, `uk`, `vi`, `tl`, `th`, `hi`, `bn`. The locale is a client-side setting (persisted in `localStorage('locale')`, initialized from `navigator.languages`) — URLs carry no locale prefix. English messages are bundled eagerly; other locales lazy-load as their own chunks. `<html lang>` is set on switch. Date / time / relative-time formatting uses `useFormatter` for locale-aware output. `apps/web/src/i18n/provider.tsx`, `apps/web/src/i18n/locales.ts`, `apps/web/messages/{locale}.json`
- **Locale switcher** — header icon button opening a searchable combobox (Popover + Command). Type to filter the 30 languages; the list is height-capped and scrolls so it never runs off screen. Sits next to ModeToggle, preserves the current route when switching. `apps/web/src/components/locale-switcher.tsx`
- **Localized README** — `README.md` (English source, at repo root) + `docs/i18n/README.{locale}.md` for every other supported locale. Each carries a centered language strip with flag emoji + native name (current locale bolded). Developer-facing docs (this file, `CONTRIBUTING.md`, `ARCHITECTURE.md`, `CLAUDE.md`, etc.) intentionally remain English-only.
- **README translation staleness guard** — `docs/i18n/.translation-status.json` records the source `README.md` hash plus per-locale "last synced at hash" entries. `scripts/readme-i18n-check.mjs` (run via `pnpm i18n:check`) fails CI when the source hash drifts from any locale's recorded hash or when a locale README file is missing.
- **Translation onboarding & guard** — `docs/I18N.md` documents the full "add a new language" workflow and translation policy. `scripts/i18n-check.mjs` (run via `pnpm i18n:check`) compares every non-English locale against `apps/web/messages/en.json` and fails when keys are missing or extra. Wired into CI alongside `lint` / `typecheck`.

---

## 10. Routing Map

SPA routes (TanStack Router, `apps/web/src/main.tsx`):

| Route | Purpose | Component |
|-------|---------|-----------|
| `/` | Live View — stream grid | `apps/web/src/features/streams/live-view-page.tsx` |
| `/recordings` | All-streams recording index | `apps/web/src/features/recordings/recordings-index-page.tsx` |
| `/recordings/{streamname}` | Per-stream paginated browser | `apps/web/src/features/recordings/stream-recordings-page.tsx` |
| `/config` | Client app config | `apps/web/src/features/client-config/client-config-page.tsx` |
| `/config/mediamtx/global` | MediaMTX server config | `apps/web/src/features/mediamtx-config/mediamtx-config-page.tsx` |
| `/config/mediamtx/path-defaults` | MediaMTX path defaults (recording) | `apps/web/src/features/mediamtx-config/path-defaults-page.tsx` |
| `/config/mediamtx/paths/{name}` | One path's effective config | `apps/web/src/features/mediamtx-config/path-config-page.tsx` |

HTTP endpoints (Hono, `apps/api/src/server.ts` + `apps/api/src/media.ts`):

| Route | Purpose |
|-------|---------|
| `/rpc/*` | oRPC procedures (see §11) |
| `/api/health` | Health endpoint |
| `/media/screenshots/{streamName}/latest` | Latest stream thumbnail |
| `/media/screenshots/{streamName}/{file}.png` | Specific recording thumbnail |
| `/media/recordings/{streamName}/{file}` | MP4 stream (Range-capable); `?download` for attachment |
| `/manifest.webmanifest`, `/sw.js`, `/*` | PWA statics + SPA shell (static serve + fallback) |

---

## 11. oRPC Procedures (catalog)

Defined in `packages/contract/src/index.ts`, implemented in `apps/api/src/router.ts`, consumed via `apps/web/src/orpc.ts`.

| Procedure | Kind | What it does |
|-----------|------|--------------|
| `health` | query | Status + process uptime. |
| `streams.list` | query | MediaMTX paths (with effective record state) + hlsAddress + remote URL, or a typed `connection-error` state. |
| `streams.snapshot` | mutation | Captures a frame for one stream on demand off its RTSP feed, under the shared capture cap; throws on failure (§1.2.4). |
| `recordings.listStreams` | query | Per-stream `{count, latestMtime, screenshotUrl}` summaries; throws on unreadable mount. |
| `recordings.listForStream` | query | Paginated recording metadata (`page`, `take`) + total count for a stream. |
| `config.app.get` | query | Reads the config store. |
| `config.app.update` | mutation | Validates + persists app settings atomically. |
| `config.mediamtx.getGlobal` | query | Fetches MediaMTX `GlobalConf` via API; `null` when unreachable. |
| `config.mediamtx.updateGlobal` | mutation | Patches `GlobalConf` changes to MediaMTX; throws on failure. |
| `config.mediamtx.getPathDefaults` | query | Fetches MediaMTX path defaults via API; `null` when unreachable. |
| `config.mediamtx.updatePathDefaults` | mutation | Sparse-patches path defaults to MediaMTX; throws on failure. |
| `config.mediamtx.getPathConfig` | query | Resolves one path's effective config through its `confName`; `null` when unreachable or unknown. |
| `config.mediamtx.updatePathConfig` | mutation | Writes a path's sparse override, materializing its entry on first save; throws on failure. |

---

## 12. Validation Schemas

All in `packages/contract/src/index.ts` (the only place API shapes are defined):

- **`AppConfigSchema`** — coerced types, non-empty strings, positive port, nullable remote URL.
- **`GlobalConfigSchema`** — full MediaMTX `GlobalConf` mirror with optional fields and coercion across logging, transports (RTSP/RTMP/HLS/WebRTC/SRT), API/metrics/profiling, recording, and ICE servers.
- **`HealthSchema`** — `{status: 'ok', uptime}`, the `health` procedure's output.
- **`StreamSchema`** — `{name, readyTime, recording, codecs, viewers, snapshotMtime}`, the element type of `StreamsStateSchema`'s connected branch. `recording` is effective state — the path's own override merged over path defaults (§1.2.1). `codecs`/`viewers` come straight off the polled path list; `snapshotMtime` is ours, not MediaMTX's (§1.2.2).
- **`StreamsStateSchema`** — discriminated union for the live view connection state.
- **`RecordingSchema` / `RecordingStreamSummarySchema`** — recording metadata with native `Date` values preserved over the wire by oRPC's serializer.
- Localized form-message variants live feature-side: `apps/web/src/features/client-config/client-config.schemas.ts`.

---

## 13. Docker & Runtime

### 13.1 Production image (`Dockerfile`)
- **Turborepo-pruned multi-stage build** — `turbo prune --docker` → pnpm install with BuildKit store cache → `turbo build` → `pnpm deploy --legacy --prod` for a self-contained output.
- **Single process serves everything** — Hono serves the SPA build from `/app/public`, the oRPC API, and media streaming on port 3000.
- **Runtime: `node:22-bookworm-slim` + ffmpeg** — ffmpeg is required for thumbnail generation; see `docs/MIGRATION.md` §5 for the distroless trade-off.
- **Pre-created mount points** — `/recordings`, `/screenshots`, `/data` (config.json), owned by the non-root `node` user.
- **Production-shaped env defaults** — bootstrap env vars (`BACKEND_SERVER_MEDIAMTX_URL=http://mediamtx`, `MEDIAMTX_API_PORT=9997`, `REMOTE_MEDIAMTX_URL=http://localhost`, `MEDIAMTX_RECORDINGS_DIR=/recordings`, `MEDIAMTX_SCREENSHOTS_DIR=/screenshots`) come from the Zod schema in `apps/api/src/env.ts`, so `docker run` with no env produces a valid first-boot seed. Override at `docker run` time to skip the in-app `/config` step.
- **Non-root `node` user**.
- **Port 3000** + node-based `HEALTHCHECK` against `/api/health` (30 s interval, 10 s timeout, 3 retries) — no curl in the image.

### 13.2 Compose stacks
- **`docker-compose.yml`** — full prod stack: `mediamtx` (v1.19.2) + `mediamtx-connect`, shared `mtx` bridge network, named volumes for `/data` and `/screenshots`, read-only-mounted `mediamtx.yml`, exposed ports `3000 / 8554 (RTSP) / 1935 (RTMP) / 8888 (HLS) / 8889 (WebRTC/WHEP signalling) / 8189-udp (WebRTC ICE) / 8890-udp (SRT) / 9997 (API)`, dependency ordering. The app container sets four of the five bootstrap env vars; `REMOTE_MEDIAMTX_URL` is left to its `http://localhost` schema default, which is correct only when the browser and the stack share a host — deployments reached from another machine must set it (see §3.1). The host recordings path comes from `${MEDIAMTX_RECORDINGS_DIR}`, which compose resolves against the repo root: set it to an absolute path.
- **`docker-compose.dev.yml`** — dev variant: MediaMTX on the `bluenviron/mediamtx:*-ffmpeg` image mounting the dev-only **`mediamtx.dev.yml`** (a diverse named-camera fleet generated in-server via `runOnInit`/`runOnDemand`), plus the always-on **`fake-streams`** publisher for the wildcard-backed `stream1..5`. `pnpm dev` starts it; no profile flag.
- **`mediamtx.dev.yml`** — dev-only MediaMTX config that mirrors `mediamtx.yml`'s base settings and adds a diverse stream fleet to exercise the feature surface: multiple codecs (H264 / H265 / M-JPEG), audio (AAC / Opus / none), mixed resolutions and frame rates, always-on vs on-demand (`runOnDemand`) vs offline (no source), named-entry vs wildcard-backed paths, and a per-path `record` override. Not shipped in the image.

### 13.3 Multi-arch
- **`linux/amd64` + `linux/arm64`** images published on release via `.github/workflows/docker.yml`.

### 13.4 Sample `mediamtx.yml`
- Sample configuration that explicitly enables the API (`api: yes`), HLS (`hls: yes`), WebRTC (`webrtc: yes` + `webrtcAddress`, for WHEP playback — §1.3.1), permissive `authInternalUsers` for the Docker bridge network, and recording via `pathDefaults.record` + `recordPath`, plus an `all_others` catch-all path. RTSP, RTMP, and SRT are served by MediaMTX's own defaults rather than by any key in this file. `mediamtx.yml`
- **`webrtcAdditionalHosts: [127.0.0.1]`** — in Docker, MediaMTX gathers ICE candidates from its own container interfaces, which a browser on the host cannot route to; WHEP then negotiates successfully and never connects, and the player falls back to HLS. This advertises the published host port instead. It carries the same caveat as `REMOTE_MEDIAMTX_URL` (§3.1): `localhost` is correct only when the browser and the stack share a host — reaching the stack from another machine means putting that host's address here. `mediamtx.yml`

---

## 14. Examples (in-repo recipes)

- **`examples/fake-streams/`** — Dockerized test rig that publishes five wildcard-backed RTSP streams (`stream1..5`) from ffmpeg `lavfi` sources, each with a different codec/resolution/audio mix. No video files. Used by `pnpm dev` and CI; the named/on-demand cameras live in `mediamtx.dev.yml`.
- **`examples/raspberry-pi-camera/`** — GStreamer pipeline + ALSA audio capture + Docker compose for streaming a Raspberry Pi camera into MediaMTX.

---

## 15. Testing & Quality

### 15.0 Vitest unit tests (`apps/api/src/*.test.ts`)
- **`jobs.test.ts`** — the live snapshot cron: only `ready` paths are captured, paths without a name are skipped, the RTSP url is built from the configured host + `rtspAddress` port (with an `:8554` fallback), tmp+rename on ffmpeg exit 0, tmp discarded on failure, a stalled ffmpeg SIGKILLed at 15s, and no kill for one that already exited. Plus the shared concurrency cap (§1.2.4): the cron never runs more ffmpeg at once than the cap, an on-demand `captureSnapshot` is counted against the same cap, and on-demand capture resolves on ffmpeg success / rejects on failure. Sibling modules are mocked with factories; timers are faked and the gate is reset between cases. `apps/api/src/jobs.test.ts`
- **`media.test.ts`** — `/screenshots/{streamName}/latest` resolution: `live.png` wins while a stream runs (and the directory is never read), the newest recording thumbnail is picked out of deliberately unsorted `readdir` output once it doesn't, non-png files are ignored, missing directory / no-pngs both 404, a stream name escaping the screenshots root is rejected even when the escaped file exists, and every response carries `Cache-Control: no-store`. Routes are driven through `media.request()`; `node:fs` is faked over `importActual`. `apps/api/src/media.test.ts`
- **`config-store.test.ts`** — the settings store: `updateAppConfig` writes via tmp+rename (asserting the rename lands after the write) and creates `DATA_DIR` first, an invalid config is rejected before any file is touched; `bootstrapConfig` seeds from env only on first boot, leaves an existing `config.json` alone when env disagrees, and warns about drift **only** for vars the operator explicitly set — a value that differs merely because it came from a schema default is not drift. `apps/api/src/config-store.test.ts`
- **`router.test.ts`** — `streams.list` record state: an inherited `true` surfaces as recording when only path defaults enable it (the stock setup), a stream with its own entry reports that entry's state, and the whole grid costs one `configPathGet` per distinct `confName` rather than one per stream. `streams.snapshot` delegates to `captureSnapshot` for the named stream and surfaces a capture failure as an error. `apps/api/src/router.test.ts`
- **Scope** — `apps/api` only; `apps/web` and `packages/contract` have no unit runner yet (`docs/debt/`). Rationale and alternatives: `docs/adr/0001-reintroduce-vitest-for-api-unit-tests.md`. Layer-choice guidance: `docs/TESTING.md`.

### 15.1 Playwright E2E (`tests/e2e/`)
- **`streams.spec.ts`** — top-nav tabs + active state, the designed Live View states (unreachable / no streams / playback banner / grid), toolbar summary, stream-card playback buttons + actions menu, codec/viewer/snapshot-age chips, the record toggle and path-config/hooks deep-links, and the on-demand snapshot action reporting a success toast.
- **`recordings.spec.ts`** — index states, totals summary + `/`-shortcut filter, client-side filtering, card navigation, day-grouped rows, inline player open/close with URL tracking, breadcrumb navigation.
- **`config.spec.ts`** — App Config form fields + hero badge, save-bar mount/dirty gating, edit + save round-trip with reload-and-verify, MediaMTX page verbatim keys, pending-changes chips, section rail.
- **`api.spec.ts`** — `/api/health`, `/media/*` streaming/download/screenshot behavior including Range requests and traversal rejection, SPA fallback.
- **`i18n.spec.ts`** — default English, locale switcher round-trip, persistence across reloads, translated nav.
- **`a11y.spec.ts`** — axe-core accessibility smoke.
- **`mediamtx.spec.ts`** — MediaMTX connectivity smoke tests.
- **`path-defaults.spec.ts`** — the path-defaults page: Recording + Path Hooks sections, edit + save round-trip against live MediaMTX, restoring what it wrote.
- **`path-config.spec.ts`** — the per-path page: effective config inherited from the wildcard entry, path-scoped hooks only, `?section=pathHooks` deep link, a hook write, and a save that materializes a sparse entry without restarting the session.
- **`record-toggle.spec.ts`** — the card's record toggle: a card reports state inherited from path defaults (the stock setup); stopping one stream materializes its own override while path defaults, the wildcard entry, other cards, and the live session all stay put; starting one that already has an entry patches it in place.
- **Runner config** (`playwright.config.ts`) — Chromium (+ Firefox/WebKit/mobile for UI specs), 1280×720, parallel workers, 2 retries in CI and 1 locally, HTML reporter, traces on first retry, screenshots on failure, `webServer: node apps/api/dist/server.mjs` against `http://localhost:3000` with test-shaped env. The three specs that write to live MediaMTX (`path-defaults`, `path-config`, `record-toggle`) stay out of the UI-spec pattern deliberately: one browser is the correct number for a spec that mutates shared server state (`docs/TESTING.md`).

### 15.2 Linting & types
- **ESLint 10 + `@antfu/eslint-config`** (lint + format in one tool) with custom rules:
  - `console.*` ban — forces use of the shared loggers.
  - i18n hardcoded-string ban in `apps/web/src/features/**` and `apps/web/src/components/**`.
  - shadcn primitive rule relaxations scoped to `apps/web/src/components/ui/**`.
- **`tsc --noEmit` per package** via `pnpm typecheck` (Turborepo).

### 15.3 Scripts (root `package.json`)
| Script | Purpose |
|--------|---------|
| `pnpm dev` | Starts MediaMTX + fake streams (Docker), seeds sample data into `.dev-data/` (`predev`), then runs web (5173) + api (3000) via turbo. Zero config. |
| `pnpm dev:stop` | Stop the dev Docker stack (MediaMTX + fake streams). |
| `pnpm build` | Turbo-cached build of all packages + SPA copy into `apps/api/public`. |
| `pnpm typecheck` | TypeScript type check per package. |
| `pnpm lint` / `lint:fix` | ESLint check / autofix. |
| `pnpm i18n:check` | Message-key parity + README translation staleness (runs both checks below). |
| `pnpm i18n:check:messages` | Message-key parity only (`scripts/i18n-check.mjs`). |
| `pnpm i18n:check:readme` | README translation staleness only (`scripts/readme-i18n-check.mjs`). |
| `pnpm test` | Vitest unit suites across packages (turbo). |
| `pnpm test:e2e` | Playwright suite (needs a prior build). |
| `pnpm test:e2e:dev` | Playwright suite in UI mode. |
| `pnpm release` | semantic-release. |

### 15.4 Helper scripts (`scripts/`)
- **`seed-fixtures.mjs`** — cross-platform Node script (no deps, no ffmpeg) that copies the committed `tests/fixtures/{recordings,screenshots}` into a `--target` dir (default `<repo>/.dev-data`) if empty. Runs as `predev` for dev and via Playwright `globalSetup` for e2e. Idempotent — never clobbers a dir that already has content.
- **`i18n-check.mjs` / `readme-i18n-check.mjs`** — the two i18n CI guards.

---

## 16. CI / Release / Repo Hygiene

- **GitHub Actions CI** (`.github/workflows/ci.yml`) — lint, typecheck, i18n guards, build, Playwright E2E against a real MediaMTX with fake streams, Docker image smoke test.
- **Docker publishing** (`.github/workflows/docker.yml`) — multi-arch `bcanfield/mediamtx-connect` + GHCR on release.
- **`semantic-release`** — `release.config.js` automates semver, changelog, and GitHub releases. `CHANGELOG.md` is auto-maintained.
- **Renovate** — `renovate.json` configured for automated dependency PRs.
- **MIT licensed** — `LICENSE`.
- **Contribution guide** — `CONTRIBUTING.md`.
- **Architecture doc** — `ARCHITECTURE.md`; stack rationale in `docs/STACK.md`; migration record in `docs/MIGRATION.md`.
- **Project conventions** — `AGENTS.md`, `docs/PROJECT-STRUCTURE.md`.
- **Demo GIF** — `.github/assets/demo.gif` referenced from README.

---

## 17. Tech Stack (at a glance)

| Layer | Technology |
|------|------------|
| Monorepo | pnpm workspaces + Turborepo, versions centralized in the pnpm catalog |
| Frontend | Vite + React 19 + TanStack Router (SPA) |
| Data fetching | TanStack Query over an oRPC contract (`@connect/contract`) |
| Backend | Hono on Node 22, bundled with tsdown |
| API typing | oRPC contract-first + Zod v4 (zero codegen, native `Date` over the wire) |
| Language | TypeScript 6.0 (strict, verified against tsc 7) |
| Styling | Tailwind CSS 4, shadcn/ui (Radix UI) |
| Forms | React Hook Form 7 + Zod 4 |
| Video (browser) | HLS.js 1.6.x + native WebRTC (WHEP, no dependency) |
| Video (server) | ffmpeg (live snapshots + recording thumbnails) |
| Settings storage | JSON file (`config.json`), atomic writes — no database |
| Logging | Pino (api), console wrapper (web) |
| Scheduling | node-cron |
| Icons | Lucide React |
| i18n | `use-intl` (client-side locale, 30 languages) |
| Testing | Playwright (E2E) + Vitest (api unit) |
| Linting | ESLint 10 + `@antfu/eslint-config` |
| Packaging | Docker (turbo-pruned multi-stage, multi-arch, single image) |
| Release | semantic-release, Renovate |

---

## 18. Capability Highlights (TL;DR for product/marketing)

- Watch every MediaMTX stream live in the browser (HLS) without installing anything.
- Browse, preview, play, and download recordings, with auto-generated thumbnails and seek-capable streaming.
- Edit *every* MediaMTX server-config option from a typed, validated web form — no YAML required.
- Reconfigure the app itself (URLs, mount paths) from the same UI; no container restart needed.
- Healthcheck endpoint, structured logs, scheduled background jobs, and PWA install — production-ready out of the box.
- Multi-arch Docker images (amd64/arm64), one-command stand-up via Docker Compose, single-process deploy (API + SPA + media from one container).
- Dark/light/system theming, responsive grids, mobile nav, accessible Radix primitives, 30 languages.
- End-to-end type safety from Zod contract to React components with zero codegen.
- End-to-end test suite, semantic-release pipeline, Renovate-managed deps.
- Domain-driven feature layout that's prebuilt to absorb future capabilities (auth, storage management, analytics, integrations).
