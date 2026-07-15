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
- **Designed connection states** (per the design handoff, board 1c) — server-unreachable renders a centered red-tinted panel with the MediaMTX URL in mono, "Open App Config" + "Retry" buttons, and a visible auto-retry countdown (15 s); zero streams renders a dashed panel with publish-URL hints (RTSP/RTMP/SRT) in a mono code well; missing playback URL renders an amber banner above the grid with cards at 75 % opacity and Play disabled. `apps/web/src/features/streams/live-view-states.tsx`
- **Toolbar** — stream-count summary on the left ("N streams · M playing"); playback-mode segmented control (AUTO / LOW-LAT / COMPAT, persisted in `localStorage('playbackMode')` — currently a logged stub, the player is HLS-only) and 2/3/4 density segmented control (persisted in `localStorage('liveDensity')`) on the right. `apps/web/src/features/streams/live-streams-view.tsx`
- **"Stream online since" metadata** — `readyTime` renders as "online since {time} · {uptime}" on the card footer meta line.

### 1.2 Stream cards
- **Overlay-zone media tile** — 16:9 media area with reserved overlay zones (design handoff §3): top-left status pills (LIVE with pulsing dot + protocol pill while playing, SNAPSHOT while idle), bottom-left codec chips + bottom-right telemetry (render only when the data exists; backed by optional props so future fields don't reflow), bottom scrim. Latest screenshot loads via `/media/screenshots/{streamName}/latest`; the missing-thumbnail state is a diagonal-stripe placeholder with a mono "no snapshot yet" caption. `apps/web/src/features/streams/stream-card.tsx`
- **Play / Stop** — footer buttons (outline Play / primary Stop) plus a centered 46 px circular play affordance on idle cards.
- **URL-state-driven selection** — `?play=foo,bar` typed search param (TanStack Router `validateSearch`) tracks which streams are live, so the active set survives reload/share.
- **Stream actions menu** — `MoreHorizontal` `DropdownMenu` grouped per the design's extension contract: [Open stream detail, View recordings, Take snapshot] / [Record with ON/OFF state, Copy publish URLs, Share & embed…] / [Edit path config, Edit hooks]. Only "View recordings" is functional; the rest are stubs that log via the shared logger and show a "Not implemented yet" toast. `apps/web/src/features/streams/stream-card.tsx`

### 1.3 HLS video player
- **HLS.js streaming** — adaptive bitrate playback in any modern browser. `apps/web/src/components/video-player.tsx`
- **Native HLS fallback** — uses `<video>` native HLS where supported (Safari).
- **Live-edge sync** — caps `liveSyncPlaybackRate` at 1.5× to stay near the live edge.
- **Automatic media-error recovery** — retries via `recoverMediaError` with a 2 s debounce.
- **Fatal-error escalation** — destroys and rebuilds the HLS instance on unrecoverable errors.
- **Autoplay-muted on manifest parse** — works around browser autoplay policies. Live tiles render chrome-free (no native controls); stop/start happens through the card.

---

## 2. Recordings

### 2.1 Recordings index (`/recordings`)
- **All-streams recording grid** — every subdirectory of the recordings mount renders as a whole-card-clickable tile: 16:9 thumbnail with a mono timestamp pill (top-right) and an "N RECORDINGS" chip (bottom-left), footer with name, "latest <relative time>" via `useFormatter`, and an arrow affordance. `apps/web/src/features/recordings/recordings-index-page.tsx`, `apps/web/src/features/recordings/recordings-index-view.tsx`
- **Toolbar** — totals summary ("N streams · M recordings") on the left; a 280 px filter input with search-icon prefix and a `/` keyboard-hint badge on the right. Pressing `/` anywhere focuses the filter; filtering is client-side and instant.
- **Empty / error states** — dashed panel with an "Enable recording" CTA into the MediaMTX config when no recordings exist; red-tinted panel with the mono directory path and "Open App Config" CTA when the mount is unreadable. `apps/web/src/features/recordings/recordings-index-empty.tsx`
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
- **`GET /media/screenshots/{streamName}/latest`** — returns the most recent PNG for a stream as `image/png`, or plain 404 when missing (cards fall back via `onError`). `apps/api/src/media.ts`
- **`GET /media/screenshots/{streamName}/{file}.png`** — serves a specific recording's thumbnail.
- **`Cache-Control: no-store`** — set on every screenshot response so the freshest snapshot is always served.
- **Stream-scoped storage** — thumbnails live under `<screenshotsDirectory>/<streamName>/`.

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
- **Comprehensive MediaMTX `GlobalConf` editor** — ~75 fields, every option exposed by MediaMTX v1.11.3 covered by the schema. `apps/web/src/features/mediamtx-config/mediamtx-config-form.tsx`, `packages/contract/src/index.ts` (`GlobalConfigSchema`)
- **Scroll-with-rail layout (not tabs)** — a sticky 200 px "ON THIS PAGE" anchor rail beside one continuously scrolling form of eight sections (Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC, SRT), driven by a data descriptor. Rail rows scroll-spy the active section (IntersectionObserver) and show a red error-count pill or a mono "OFF" label for disabled protocols. On mobile the rail collapses to a sticky horizontal chip row. `apps/web/src/features/mediamtx-config/sections.ts`, `apps/web/src/hooks/use-scroll-spy.ts`
- **`ConfigFieldRow`** — 280 px fixed key column (MediaMTX config key verbatim in Geist Mono, never localized per `docs/I18N.md`, with an amber dirty dot) + localized help text below + control column (mono inputs full-width, switches right-aligned), hairline row separators. `apps/web/src/features/mediamtx-config/config-field-row.tsx`
- **Per-field localized help text** — `Config.mediamtxForm.help.*` messages describe every exposed key.
- **Protocol section header switches** — API/RTSP/RTMP/HLS/WebRTC/SRT sections carry an ENABLED/OFF mono label + `Switch` in the header; while off, the header dims to 55 % and the fields collapse to "n options hidden while off".
- **List fields use newline-split Textarea** — `logDestinations`, `protocols`, `authMethods`, `hlsTrustedProxies`, `webrtcTrustedProxies`, `webrtcIPsFromInterfacesList`, `webrtcAdditionalHosts`. One value per line.
- **WebRTC ICE servers field array** — repeatable [url | username | password] input rows with a remove ✕ per row and a dashed "+ Add ICE server" button. `apps/web/src/features/mediamtx-config/ice-servers-rows.tsx`
- **Pending-changes bar** — the shared `SaveBar` with dirty-key chips (mono pills named by config key; erroring keys turn red with a ✕), Discard (ghost) + "Save to server" (primary). `apps/web/src/components/save-bar.tsx`
- **Live read/write through MediaMTX HTTP API** — `config.mediamtx.getGlobal` (`v3/config/global/get`) + `config.mediamtx.updateGlobal` (`v3/config/global/patch`). `apps/api/src/router.ts`, `apps/api/src/mediamtx.ts`
- **Toast feedback** on success/error (success: `MediaMTX config saved`); submit gated on dirty + valid.

---

## 4. Background Jobs (`apps/api/src/jobs.ts`)

- **First-run bootstrap** — creates `config.json` from env vars (`BACKEND_SERVER_MEDIAMTX_URL`, `MEDIAMTX_API_PORT`, `REMOTE_MEDIAMTX_URL`, `MEDIAMTX_RECORDINGS_DIR`, `MEDIAMTX_SCREENSHOTS_DIR`) and ensures `recordingsDirectory` / `screenshotsDirectory` exist on server boot. After the file exists, the `/config` UI is the source of truth — re-setting env vars takes effect only after deleting `config.json`. `apps/api/src/config-store.ts`
- **Env / Config drift warning** — on subsequent boots, for each bootstrap env var that the operator has *explicitly* set in the environment (raw `process.env` via `rawEnv` in `apps/api/src/env.ts`, distinct from schema defaults), if its value differs from the corresponding stored config value a single structured `WARN` log lists each mismatch and reminds the operator that env only seeds the first boot.
- **Thumbnail generation cron** — every 30 minutes (`*/30 * * * *`) scans the recordings tree for MP4s without a sibling PNG and spawns `ffmpeg -ss 00:00:00 -i <file>.mp4 -frames:v 1 <file>.png`. Non-blocking, parallel. Also runs once on boot.
- **Screenshot retention cron** — daily at midnight (`0 0 0 * * *`) deletes thumbnails older than 2 days, per stream subdirectory.
- **Pino-structured logging** of every spawn / deletion.

---

## 5. Health, Observability, and System

- **`GET /api/health`** — JSON health endpoint with config-store readability check; returns 200 healthy or 503 unhealthy. Used by the Docker `HEALTHCHECK`. `apps/api/src/server.ts`
- **Pino logger** — structured logs across the api; a console-backed logger in the web app; `console.*` lint-banned elsewhere. `apps/api/src/logger.ts`, `apps/web/src/lib/logger.ts`
- **Centralized env loader** — `apps/api/src/env.ts` validates env via t3-env + Zod. The web app has no env access at all.
- **Client data fetching via TanStack Query** — data-driven pages always refetch on mount, so the UI reflects fresh server state.

---

## 6. Data Layer

- **JSON config store (no database)** — the app's five settings persist in `$DATA_DIR/config.json`, Zod-validated on read and write, written atomically (temp file + rename). `apps/api/src/config-store.ts`
- **Env-seeded first boot** — see §4; sensible production-shaped defaults (`http://mediamtx`, port `9997`) come from the env schema. The three dir vars — `DATA_DIR`, `MEDIAMTX_RECORDINGS_DIR`, `MEDIAMTX_SCREENSHOTS_DIR` — default to their container paths (`/data`, `/recordings`, `/screenshots`) only when `NODE_ENV=production`; elsewhere they are required, so a missing value fails env validation up front instead of an ENOENT on the first config write or a silently empty recordings list. Relative values resolve against the api's cwd (`apps/api`), not the repo root. `apps/api/src/env.ts`

---

## 7. MediaMTX API Integration

- **Hand-rolled typed client** for the three endpoints the app uses: `v3/paths/list`, `v3/config/global/get`, `v3/config/global/patch` (fetch-based, shapes mirror MediaMTX v1.11.3 swagger). `apps/api/src/mediamtx.ts`
- **Only the api talks to MediaMTX's API** — the browser reaches MediaMTX directly only for HLS playback via `remoteMediaMtxUrl`.

---

## 8. UI System / Shared Components

### 8.1 shadcn/ui primitives (`apps/web/src/components/ui/`)
- Layout / nav: Breadcrumb.
- Content: Card, AspectRatio, Skeleton, Progress, Badge.
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
- **VideoPlayer** — shared HLS.js component (see §1.3). `apps/web/src/components/video-player.tsx`
- **ThemeProvider** — in-app theme context (light/dark/system), dark default, `class`-based, persisted to `localStorage`. Paired with an inline pre-bundle script in `index.html` that sets the `<html>` class before first paint to avoid a theme flash. `apps/web/src/components/theme-provider.tsx`, `apps/web/index.html`
- **ServiceWorker** — registers `/sw.js` for offline / PWA support, with browser-capability guard. `apps/web/src/components/service-worker.tsx`
- **LocaleSwitcher** — see §9.

### 8.3 Lib (`apps/web/src/lib/`, `apps/web/src/`)
- **`cn`** — Tailwind class merger. `apps/web/src/lib/utils.ts`
- **`logger`** — browser console wrapper. `apps/web/src/lib/logger.ts`
- **`orpc`** — typed `ContractRouterClient` + TanStack Query utils; the only way the web app calls the JSON API. `apps/web/src/orpc.ts`
- **`@/i18n/navigation`** — `href`-based `Link`/`usePathname`/`useRouter` compat layer over TanStack Router, preserving the old component surface. `apps/web/src/i18n/navigation.ts`

### 8.4 Recordings filesystem helpers
- **`summarizeStreamRecordings` / `listStreamRecordingFiles` / screenshot-URL helpers** — api-side fs helpers used by the recordings procedures. `apps/api/src/recordings-fs.ts`

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
| `streams.list` | query | MediaMTX paths + hlsAddress + remote URL, or a typed `connection-error` state. |
| `recordings.listStreams` | query | Per-stream `{count, latestMtime, screenshotUrl}` summaries; throws on unreadable mount. |
| `recordings.listForStream` | query | Paginated recording metadata (`page`, `take`) + total count for a stream. |
| `config.app.get` | query | Reads the config store. |
| `config.app.update` | mutation | Validates + persists app settings atomically. |
| `config.mediamtx.getGlobal` | query | Fetches MediaMTX `GlobalConf` via API; `null` when unreachable. |
| `config.mediamtx.updateGlobal` | mutation | Patches `GlobalConf` changes to MediaMTX; throws on failure. |

---

## 12. Validation Schemas

All in `packages/contract/src/index.ts` (the only place API shapes are defined):

- **`AppConfigSchema`** — coerced types, non-empty strings, positive port, nullable remote URL.
- **`GlobalConfigSchema`** — full MediaMTX `GlobalConf` mirror with optional fields and coercion across logging, transports (RTSP/RTMP/HLS/WebRTC/SRT), API/metrics/profiling, recording, and ICE servers.
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
- **`docker-compose.yml`** — full prod stack: `mediamtx` (v1.19.2) + `mediamtx-connect`, shared `mtx` bridge network, named volume for `/data`, read-only-mounted `mediamtx.yml`, exposed ports `3000 / 8554 (RTSP) / 1935 (RTMP) / 8888 (HLS) / 8889-8890 (WebRTC) / 9997 (API)`, dependency ordering. The app container sets the bootstrap env vars so first-boot seeding produces correct values.
- **`docker-compose.dev.yml`** — dev variant with optional `fake-streams` service behind `--profile streams` for offline testing.

### 13.3 Multi-arch
- **`linux/amd64` + `linux/arm64`** images published on release via `.github/workflows/docker.yml`.

### 13.4 Sample `mediamtx.yml`
- Pre-wired configuration enabling RTSP, RTMP, HLS, WebRTC, SRT, recording, and the API. `mediamtx.yml`

---

## 14. Examples (in-repo recipes)

- **`examples/fake-streams/`** — Dockerized test rig that publishes 5 synthetic RTSP streams via ffmpeg, used for offline development.
- **`examples/raspberry-pi-camera/`** — GStreamer pipeline + ALSA audio capture + Docker compose for streaming a Raspberry Pi camera into MediaMTX.

---

## 15. Testing & Quality

### 15.1 Playwright E2E (`tests/e2e/`)
- **`streams.spec.ts`** — top-nav tabs + active state, the designed Live View states (unreachable / no streams / playback banner / grid), toolbar summary, stream-card playback buttons + actions menu.
- **`recordings.spec.ts`** — index states, totals summary + `/`-shortcut filter, client-side filtering, card navigation, day-grouped rows, inline player open/close with URL tracking, breadcrumb navigation.
- **`config.spec.ts`** — App Config form fields + hero badge, save-bar mount/dirty gating, edit + save round-trip with reload-and-verify, MediaMTX page verbatim keys, pending-changes chips, section rail.
- **`api.spec.ts`** — `/api/health`, `/media/*` streaming/download/screenshot behavior including Range requests and traversal rejection, SPA fallback.
- **`i18n.spec.ts`** — default English, locale switcher round-trip, persistence across reloads, translated nav.
- **`a11y.spec.ts`** — axe-core accessibility smoke.
- **`mediamtx.spec.ts`** — MediaMTX connectivity smoke tests.
- **Runner config** (`playwright.config.ts`) — Chromium (+ Firefox/WebKit/mobile for UI specs), 1280×720, parallel workers, retries in CI, HTML reporter, traces on first retry, screenshots on failure, `webServer: node apps/api/dist/server.mjs` against `http://localhost:3000` with test-shaped env.

### 15.2 Linting & types
- **ESLint 10 + `@antfu/eslint-config`** (lint + format in one tool) with custom rules:
  - `console.*` ban — forces use of the shared loggers.
  - i18n hardcoded-string ban in `apps/web/src/features/**` and `apps/web/src/components/**`.
  - shadcn primitive rule relaxations scoped to `apps/web/src/components/ui/**`.
- **`tsc --noEmit` per package** via `pnpm typecheck` (Turborepo).

### 15.3 Scripts (root `package.json`)
| Script | Purpose |
|--------|---------|
| `pnpm dev` | web (5173) + api (3000) dev servers via turbo. |
| `pnpm build` | Turbo-cached build of all packages + SPA copy into `apps/api/public`. |
| `pnpm typecheck` | TypeScript type check per package. |
| `pnpm lint` / `lint:fix` | ESLint check / autofix. |
| `pnpm i18n:check` | Message-key parity + README translation staleness. |
| `pnpm test:e2e` | Playwright suite (needs a prior build). |
| `pnpm setup` | Run `./scripts/setup-dev.sh`. |
| `pnpm dev:all` | Start MediaMTX (with fake streams) and the dev servers together; tears the stack down on exit. |
| `pnpm mediamtx` / `mediamtx:stop` | Start / stop MediaMTX with fake test streams. |
| `pnpm setup:test-data` | Generate sample recordings for tests. |
| `pnpm release` | semantic-release. |

### 15.4 Helper scripts (`scripts/`)
- **`setup-dev.sh`** — bootstraps a dev environment (pnpm install + test data).
- **`setup-test-data.sh`** — generates sample recordings for tests. Sources `.env` and writes fixtures to `MEDIAMTX_RECORDINGS_DIR` / `MEDIAMTX_SCREENSHOTS_DIR` (or the test defaults), so fixtures and seeded config never disagree.
- **`start-mediamtx.sh`** — wraps the dev compose flow.
- **`dev-all.sh`** — runs `start-mediamtx.sh` then `pnpm dev`, with a trap that brings the dev compose stack down on exit.
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
| Video (browser) | HLS.js 1.6.x |
| Video (server) | ffmpeg (thumbnails) |
| Settings storage | JSON file (`config.json`), atomic writes — no database |
| Logging | Pino (api), console wrapper (web) |
| Scheduling | node-cron |
| Icons | Lucide React |
| i18n | `use-intl` (client-side locale, 30 languages) |
| Testing | Playwright |
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
