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
- **Live streams dashboard** — grid of all active MediaMTX paths, fetched via TanStack Query. `apps/web/src/features/streams/live-view-page.tsx`
- **MediaMTX path discovery** — the api calls MediaMTX `v3/paths/list` and resolves the connection state server-side into a discriminated union (`connection-error` vs `connected`). `apps/api/src/router.ts` (`streams.list`)
- **Connection diagnostics** — distinguishes API connection error vs. no streams vs. streams-but-no-remote-URL; the destructive case shows a `Cannot connect to MediaMTX` `Alert`, the others render the shared `EmptyState` with a CTA into Config. `apps/web/src/features/streams/live-view-page.tsx`
- **"Stream online since" metadata** — exposes `readyTime` per path inline on the card subtitle.
- **Density toggle** — `LiveStreamsView` exposes a 2/3/4-column ToggleGroup; the choice persists in `localStorage('liveDensity')`. `apps/web/src/features/streams/live-streams-view.tsx`

### 1.2 Stream cards
- **16:9 thumbnail tile** — shows latest screenshot via `/media/screenshots/{streamName}/latest` inside a shadcn `AspectRatio`, with an icon fallback on load error. `apps/web/src/features/streams/stream-card.tsx`
- **Play / Stop toggle** — primary action button swaps between thumbnail and live HLS player.
- **LIVE indicator** — when actively playing, a destructive `Badge` with a pulsing dot anchors the card header.
- **URL-state-driven selection** — `?play=foo,bar` typed search param (TanStack Router `validateSearch`) tracks which streams are live, so the active set survives reload/share.
- **Stream actions menu** — kebab `DropdownMenu` exposes "View recordings" (and is the extension point for future per-stream actions). `apps/web/src/features/streams/stream-card.tsx`

### 1.3 HLS video player
- **HLS.js streaming** — adaptive bitrate playback in any modern browser. `apps/web/src/components/video-player.tsx`
- **Native HLS fallback** — uses `<video>` native HLS where supported (Safari).
- **Live-edge sync** — caps `liveSyncPlaybackRate` at 1.5× to stay near the live edge.
- **Automatic media-error recovery** — retries via `recoverMediaError` with a 2 s debounce.
- **Fatal-error escalation** — destroys and rebuilds the HLS instance on unrecoverable errors.
- **Autoplay-muted on manifest parse** — works around browser autoplay policies.

---

## 2. Recordings

### 2.1 Recordings index (`/recordings`)
- **All-streams recording grid** — every subdirectory of the recordings mount renders as a 16:9 card with the stream's most recent screenshot, name, recording count, and "Latest <relative time>" via `useFormatter`. `apps/web/src/features/recordings/recordings-index-page.tsx`, `apps/web/src/features/recordings/recordings-index-view.tsx`
- **Client-side stream search** — Input above the grid filters cards by stream name in place.
- **Drill-in "View" button per stream** — routes to `/recordings/{streamname}`.
- **Misconfiguration alert** — destructive `Alert` when the `recordings.listStreams` query errors (unreadable directory); missing-recordings case uses `EmptyState` with `MTX_RECORD=yes` hint. `apps/web/src/features/recordings/recordings-index-empty.tsx`
- **`summarizeStreamRecordings`** — api-side fs helper returns `{count, latestMtime}` per subdirectory in one walk. `apps/api/src/recordings-fs.ts`

### 2.2 Per-stream recording browser (`/recordings/{streamname}`)
- **Paginated recording list** — `?page` and `?take` typed search params, default 10/page. `apps/web/src/features/recordings/stream-recordings-page.tsx`
- **Day-grouped sections** — recordings on the current page render under "Today" / "Yesterday" / formatted-day headings.
- **shadcn `Pagination`** — prev/next + numbered window of ±2 pages, navigating via TanStack Router search params.
- **Breadcrumb** — `Recordings → {streamName}` in the inset top bar.
- **Reverse-chronological sort** — newest recordings first. `apps/api/src/recordings-fs.ts`

### 2.3 Recording cards
- **16:9 thumbnail** — auto-generated PNG served by URL (`screenshotUrl` from the api; no base64 inlining); falls back to an icon when missing. `apps/web/src/features/recordings/recording-card.tsx`
- **Time-of-day title + size** — `HH:mm:ss` on the left, MB on the right (the day is in the section heading, not on every card).
- **Inline playback** — primary Play/Stop button swaps the thumbnail for an MP4 `<video>` against the media endpoint. `?play=` URL param tracks which recordings are open.
- **Download button with progress bar** — `fetch` + `ReadableStream` chunk counting, 0–100 % progress, browser save dialog, error toast. `apps/web/src/features/recordings/download-button.tsx`

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

### 3.1 Client (app) config — `/config`
- **Card-wrapped settings form** — single Card with title "Application Settings", two grouped sections ("MediaMTX connection" and "Storage") separated by a `Separator`, footer with Reset + Submit. `apps/web/src/features/client-config/client-config-page.tsx`, `apps/web/src/features/client-config/client-config-form.tsx`
- **React Hook Form + Zod validation** with on-blur validation, dirty/valid gating on submit, and Sonner toast feedback (success: `Updated Client Config`; error: `There was an issue updating the Client Config`). `apps/web/src/features/client-config/client-config.schemas.ts`
- **Editable fields**:
  - `mediaMtxUrl` — internal/container hostname for MediaMTX API.
  - `mediaMtxApiPort` — API port (default 9997).
  - `remoteMediaMtxUrl` — browser-reachable HLS endpoint (the field that unlocks live playback for remote viewers).
  - `recordingsDirectory` — mount path for MP4s.
  - `screenshotsDirectory` — mount path for thumbnails.
- **`config.app.get` / `config.app.update` oRPC procedures** with TanStack Query invalidation after save. `apps/api/src/router.ts`, `apps/api/src/config-store.ts`
- **Field-level help text** — each input has a description explaining its impact.
- **Reset** — outline button calls `form.reset(defaultValues)`; enabled only while the form is dirty.

### 3.2 MediaMTX global server config — `/config/mediamtx/global`
- **Comprehensive MediaMTX `GlobalConf` editor** — ~75 fields, every option exposed by MediaMTX v1.11.3 covered by the schema. `apps/web/src/features/mediamtx-config/mediamtx-config-form.tsx`, `packages/contract/src/index.ts` (`GlobalConfigSchema`)
- **Tabbed layout** — eight top-level Tabs (Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC, SRT), each tab containing one or more sub-Cards. `apps/web/src/features/mediamtx-config/sections/*`
- **Per-tab error badges** — destructive `Badge` next to each `TabsTrigger` shows the count of validation errors mapped via `tab-fields.ts`.
- **Sticky save bar** — `StickySaveBar` appears at the bottom of the SidebarInset whenever the form is dirty, showing "n unsaved changes" + Discard / Save changes. `apps/web/src/features/mediamtx-config/sticky-save-bar.tsx`
- **Boolean fields use `Switch`** — every yes/no toggle uses a labeled-row Switch. `apps/web/src/features/mediamtx-config/form-fields.tsx`. Field labels stay English (mirror MediaMTX YAML keys, per `docs/I18N.md`), but the per-protocol server-enable helper text is localized via `Config.mediamtxForm.sections.*.enableDescription`.
- **List fields use newline-split Textarea** — `logDestinations`, `protocols`, `authMethods`, `hlsTrustedProxies`, `webrtcTrustedProxies`, `webrtcIPsFromInterfacesList`, `webrtcAdditionalHosts`. One value per line.
- **WebRTC ICE servers field array** — `useFieldArray` row group with add/remove + per-row URL/Username/Password inputs. New rows start blank (no placeholder values).
- **Live read/write through MediaMTX HTTP API** — `config.mediamtx.getGlobal` (`v3/config/global/get`) + `config.mediamtx.updateGlobal` (`v3/config/global/patch`). `apps/api/src/router.ts`, `apps/api/src/mediamtx.ts`
- **Toast feedback** on success/error (success: `Updated Global Config`; error: `There was an issue updating the Global Config`); submit gated on dirty + valid.

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
- **Env-seeded first boot** — see §4; sensible production-shaped defaults (`http://mediamtx`, port `9997`, `/recordings`, `/screenshots`) come from the env schema. `apps/api/src/env.ts`

---

## 7. MediaMTX API Integration

- **Hand-rolled typed client** for the three endpoints the app uses: `v3/paths/list`, `v3/config/global/get`, `v3/config/global/patch` (fetch-based, shapes mirror MediaMTX v1.11.3 swagger). `apps/api/src/mediamtx.ts`
- **Only the api talks to MediaMTX's API** — the browser reaches MediaMTX directly only for HLS playback via `remoteMediaMtxUrl`.

---

## 8. UI System / Shared Components

### 8.1 shadcn/ui primitives (`apps/web/src/components/ui/`)
- Layout / nav: Sidebar (+ provider/menu/inset/trigger), Sheet, Breadcrumb, Tabs, ScrollArea, Separator.
- Content: Card, Alert, Empty, AspectRatio, Pagination, Skeleton, Progress, Badge.
- Inputs: Button, Input, Textarea, Switch, Select, Label, ToggleGroup, Toggle.
- Surfaces: Popover, DropdownMenu, Dialog, Tooltip, Command.
- Form: RHF integration (FormField, FormControl, FormMessage, FormDescription, FormItem, FormLabel).
- Toast: Sonner `Toaster` mounted in the root route; callsites import `toast` directly from `sonner`.

### 8.2 Shared components (`apps/web/src/components/`)
- **AppSidebar** — global Sidebar shell (sidebar-07 pattern): brand, "Application" group (Live, Recordings), "Settings" group (Client Config, MediaMTX), footer LocaleSwitcher + ModeToggle. `apps/web/src/components/app-sidebar.tsx`
- **PageHeader** — sticky inset top bar with `SidebarTrigger` + `Breadcrumb` + an optional actions slot. Each page passes its own crumbs. `apps/web/src/components/page-header.tsx`
- **SidebarTrigger** — single-click sidebar open/close button with state-aware morphing icon (`PanelLeftOpen` ↔ `PanelLeftClose`) on a scale + rotate transition. `apps/web/src/components/ui/sidebar.tsx`
- **PageLayout** — h2 title + subheader + Separator + content, wrapped in a max-w-7xl padded container. `apps/web/src/components/page-layout.tsx`
- **EmptyState** — wrapper around shadcn `Empty` with `icon`, `title`, `description`, optional CTA `children`. Used for non-destructive empty/info states across the app. `apps/web/src/components/empty-state.tsx`
- **ModeToggle** — single-click Light ↔ Dark theme toggle backed by the in-app `ThemeProvider`. Uses the View Transitions API to play a circle-reveal clip-path animation centered on the button (graceful fallback when the API is unsupported). `apps/web/src/components/mode-toggle.tsx`
- **RefreshButton** — manual page reload control surfaced in connection-error alerts. `apps/web/src/components/refresh-button.tsx`
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
- **Sidebar shell** — `SidebarProvider` + `AppSidebar` + `SidebarInset` wraps every route via the TanStack Router root route. The sidebar collapses to icons on desktop (cookie-persisted) and slides in as a Sheet on mobile via `SidebarTrigger`. `apps/web/src/main.tsx`
- **Root route** — Sonner Toaster mount, ThemeProvider, ServiceWorker registration, `I18nProvider`, and the router itself (code-based route tree). `apps/web/src/main.tsx`
- **Global CSS** — Tailwind 4 with shadcn sidebar tokens (`--sidebar-*`). `apps/web/src/globals.css`

---

## 9. Theming, Accessibility, PWA, Internationalization

- **Dark / Light theme** — persisted to `localStorage` via the in-app `ThemeProvider`, dark default. Toggled by `ModeToggle` (single-click, View Transitions API circle-reveal).
- **Web App Manifest** — installable PWA. App name, theme color `#0c1016`, `display: standalone`, 512×512 maskable + rounded icons, `start_url: /`. `apps/web/public/manifest.webmanifest`
- **Service worker registration** — offline-friendly shell. `apps/web/src/components/service-worker.tsx`, `apps/web/public/sw.js`
- **Radix-based UI primitives** — keyboard nav, focus management, ARIA wired in via shadcn/ui.
- **Internationalization (i18n)** — `use-intl` (next-intl's framework-agnostic core). Supported locales (30 total): `en` (default); plus `es`, `zh` (Simplified), `it`, `de`, `ru`, `fr`, `pt`, `ja`, `pl`, `ko`, `tr`, `nl`, `cs`, `zh-tw` (Traditional Chinese), `pt-br` (Brazilian Portuguese), `id`, `ro`, `sv`, `da`, `no`, `fi`, `el`, `hu`, `uk`, `vi`, `tl`, `th`, `hi`, `bn`. The locale is a client-side setting (persisted in `localStorage('locale')`, initialized from `navigator.languages`) — URLs carry no locale prefix. English messages are bundled eagerly; other locales lazy-load as their own chunks. `<html lang>` is set on switch. Date / time / relative-time formatting uses `useFormatter` for locale-aware output. `apps/web/src/i18n/provider.tsx`, `apps/web/src/i18n/locales.ts`, `apps/web/messages/{locale}.json`
- **Locale switcher** — sidebar footer searchable combobox (Popover + Command). Type to filter the 30 languages; the list is height-capped and scrolls so it never runs off screen. Sits next to ModeToggle, preserves the current route when switching. `apps/web/src/components/locale-switcher.tsx`
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
- **`streams.spec.ts`** — header rendering, nav links, the connection states (error / no streams / configured / streams visible), stream card display, remote-URL prompt.
- **`recordings.spec.ts`** — index load, per-stream cards, View navigation, detail-page pagination, empty + error states.
- **`config.spec.ts`** — form load, all five inputs render, submit gating, edit + save round-trip with reload-and-verify, description copy.
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
