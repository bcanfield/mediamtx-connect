# MediaMTX Connect — Complete Feature Inventory

> **Living source of truth.** This document describes the *current* feature state of the app. Every shipped capability, route, server action, background job, schema, integration, and developer-facing convenience belongs here.

## Maintenance contract

**Update this file in the same change that adds, removes, or changes a feature.** A PR that ships product behavior without updating this doc is incomplete.

When you change the codebase:

- **Add a feature** → add bullet(s) under the right section, with a one-line description and a backticked file-path citation.
- **Change a feature** → update the existing bullet (don't append a new one). Keep file paths current.
- **Remove a feature** → delete the bullet. Don't leave "removed" tombstones.
- **Add a route / API / server action / schema / cron** → also update the corresponding catalog table (§10 Routing Map, §11 Server Actions, §12 Schemas, §4 Background Jobs).
- **Add a new feature *domain*** (e.g., auth, storage, analytics) → add a new top-level section, update §19, and reflect it in `CLAUDE.md`'s domain table.

Keep entries factual and present-tense. No roadmap items, no "coming soon." Reserved-but-empty domains live only in §19.

Unshipped ideas — brainstorm only — live in [`docs/ideas/`](./ideas/00-index.md). Never copy from there into this file until the work is actually merged.

Sources reviewed at last full audit: source tree, `README.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `package.json`, Dockerfile, compose files, Prisma schema, MediaMTX OpenAPI integration, Playwright suites.

---

## 1. Live Streaming

### 1.1 Live View page (`/`)
- **Live streams dashboard** — grid of all active MediaMTX paths with auto-refresh on navigation. `src/features/streams/live-view-page.tsx`, `src/app/[locale]/page.tsx`
- **MediaMTX path discovery** — calls MediaMTX `v3/pathsList` to enumerate active streams. `src/features/streams/live-view-page.tsx`
- **Connection diagnostics** — distinguishes API connection error vs. no streams vs. streams-but-no-remote-URL; the destructive case shows a `Cannot connect to MediaMTX` `Alert`, the others render the shared `EmptyState` with a CTA into Config. `src/features/streams/live-view-page.tsx`
- **"Stream online since" metadata** — exposes `readyTime` per path inline on the card subtitle.
- **Density toggle** — `LiveStreamsView` exposes a 2/3/4-column ToggleGroup; the choice persists in `localStorage('liveDensity')`. `src/features/streams/live-streams-view.tsx`

### 1.2 Stream cards
- **16:9 thumbnail tile** — shows latest screenshot via `/api/[streamName]/first-screenshot` inside a shadcn `AspectRatio`, with a fallback icon when missing. `src/features/streams/stream-card.tsx`
- **Play / Stop toggle** — primary action button swaps between thumbnail and live HLS player.
- **LIVE indicator** — when actively playing, a destructive `Badge` with a pulsing dot anchors the card header.
- **URL-state-driven selection** — `?play=foo,bar` search param tracks which streams are live, so the active set survives reload/share.
- **Stream actions menu** — kebab `DropdownMenu` exposes "View recordings" (and is the extension point for future per-stream actions). `src/features/streams/stream-card.tsx`

### 1.3 HLS video player
- **HLS.js streaming** — adaptive bitrate playback in any modern browser. `src/components/video-player.tsx`
- **Native HLS fallback** — uses `<video>` native HLS where supported (Safari).
- **Live-edge sync** — caps `liveSyncPlaybackRate` at 1.5× to stay near the live edge.
- **Automatic media-error recovery** — retries via `recoverMediaError` with a 2 s debounce.
- **Fatal-error escalation** — destroys and rebuilds the HLS instance on unrecoverable errors.
- **Autoplay-muted on manifest parse** — works around browser autoplay policies.

---

## 2. Recordings

### 2.1 Recordings index (`/recordings`)
- **All-streams recording grid** — every subdirectory of the recordings mount renders as a 16:9 card with the stream's most recent screenshot, name, recording count, and "Latest <relative time>" via dayjs. `src/features/recordings/recordings-index-page.tsx`, `src/features/recordings/recordings-index-view.tsx`
- **Client-side stream search** — Input above the grid filters cards by stream name in place.
- **Drill-in "View" button per stream** — routes to `/recordings/[streamname]`.
- **Misconfiguration alert** — destructive `Alert` for inaccessible recordings directory; missing-recordings case uses `EmptyState` with `MTX_RECORD=yes` hint. `src/features/recordings/recordings-index-empty.tsx`
- **`summarizeStreamRecordings`** — feature-local fs helper returns `{count, latestMtime}` per subdirectory in one walk. `src/features/recordings/file-operations.ts`

### 2.2 Per-stream recording browser (`/recordings/[streamname]`)
- **Paginated recording list** — `?page` and `?take` query params, default 10/page. `src/features/recordings/stream-recordings-page.tsx`, `src/app/[locale]/recordings/[streamname]/page.tsx`
- **Day-grouped sections** — recordings on the current page render under "Today" / "Yesterday" / formatted-day headings.
- **shadcn `Pagination`** — prev/next + numbered window of ±2 pages at the bottom.
- **Breadcrumb** — `Recordings → {streamName}` in the inset top bar.
- **Reverse-chronological sort** — newest recordings first. `src/features/recordings/recordings.queries.ts`

### 2.3 Recording cards
- **16:9 thumbnail** — auto-generated PNG, base64-inlined; falls back to an icon when missing. `src/features/recordings/recording-card.tsx`, `src/features/recordings/recordings.queries.ts`
- **Time-of-day title + size** — `HH:mm:ss` on the left, MB on the right (the day is in the section heading, not on every card).
- **Inline playback** — primary Play/Stop button swaps the thumbnail for an MP4 `<video>` against the view endpoint. `?play=` URL param tracks which recordings are open.
- **Download button with progress bar** — Axios blob streaming, 0–100 % progress, browser save dialog, success/error toasts. `src/features/recordings/download-button.tsx`

### 2.4 Recording streaming endpoints
- **`GET /api/[streamName]/[filePath]/view-recording`** — serves MP4 with `Content-Type: video/mp4`, `Accept-Ranges: bytes`, `Content-Length` for in-browser playback + seeking. `src/app/api/[streamName]/[filePath]/view-recording/route.ts`
- **`GET /api/[streamName]/[filePath]/download-recording`** — same streaming response shape, used by the download button. `src/app/api/[streamName]/[filePath]/download-recording/route.ts`
- **Path safety + 404s** — file existence validated before stream open.

### 2.5 Thumbnails / screenshots
- **`GET /api/[streamName]/first-screenshot`** — returns the most recent PNG for a stream as `image/png` (HTTP 200). When the screenshot directory or files are missing, returns HTTP 404 with a 1×1 transparent PNG body so `next/image` never errors. `src/app/api/[streamName]/first-screenshot/route.ts`
- **`Cache-Control: no-store`** — set on every response (200 success and 404 fallback) so the freshest snapshot is always served.
- **Stream-scoped storage** — thumbnails live under `<screenshotsDirectory>/<streamName>/`.

---

## 3. Configuration

### 3.1 Client (app) config — `/config`
- **Card-wrapped settings form** — single Card with title "Application Settings", two grouped sections ("MediaMTX connection" and "Storage") separated by a `Separator`, footer with Reset + Submit. `src/features/client-config/client-config-page.tsx`, `src/features/client-config/client-config-form.tsx`
- **React Hook Form + Zod validation** with on-blur validation, dirty/valid gating on submit, and Sonner toast feedback (success: `Updated Client Config`; error: `There was an issue updating the Client Config`). `src/features/client-config/client-config.schemas.ts`
- **Editable fields**:
  - `mediaMtxUrl` — internal/container hostname for MediaMTX API.
  - `mediaMtxApiPort` — API port (default 9997).
  - `remoteMediaMtxUrl` — browser-reachable HLS endpoint (the field that unlocks live playback for remote viewers).
  - `recordingsDirectory` — mount path for MP4s.
  - `screenshotsDirectory` — mount path for thumbnails.
- **`getAppConfig` / `updateClientConfig` server actions** with `revalidatePath` cache busting. `src/features/client-config/`
- **Field-level help text** — each input has a description explaining its impact.
- **Reset** — outline button calls `form.reset(defaultValues)`; enabled only while the form is dirty.

### 3.2 MediaMTX global server config — `/config/mediamtx/global`
- **Comprehensive MediaMTX `GlobalConf` editor** — ~75 fields, every option exposed by MediaMTX v1.11.3 covered by the schema. `src/features/mediamtx-config/mediamtx-config-form.tsx`, `src/features/mediamtx-config/mediamtx-config.schemas.ts`
- **Tabbed layout** — eight top-level Tabs (Logging, API, Hooks, RTSP, RTMP, HLS, WebRTC, SRT), each tab containing one or more sub-Cards. `src/features/mediamtx-config/sections/*`
- **Per-tab error badges** — destructive `Badge` next to each `TabsTrigger` shows the count of validation errors mapped via `tab-fields.ts`.
- **Sticky save bar** — `StickySaveBar` appears at the bottom of the SidebarInset whenever the form is dirty, showing "n unsaved changes" + Discard / Save changes. `src/features/mediamtx-config/sticky-save-bar.tsx`
- **Boolean fields use `Switch`** — every yes/no toggle uses a labeled-row Switch (replaces the previous select-True/False stand-ins). `src/features/mediamtx-config/form-fields.tsx`
- **List fields use newline-split Textarea** — `logDestinations`, `protocols`, `authMethods`, `hlsTrustedProxies`, `webrtcTrustedProxies`, `webrtcIPsFromInterfacesList`, `webrtcAdditionalHosts`. One value per line.
- **WebRTC ICE servers field array** — `useFieldArray` row group with add/remove + per-row URL/Username/Password inputs. New rows start blank (no placeholder values).
- **Live read/write through MediaMTX HTTP API** — `getGlobalConfig` (`v3/configGlobalGet`) + `updateGlobalConfig` (`v3/configGlobalSet`). `src/features/mediamtx-config/`
- **Toast feedback** on success/error (success: `Updated Global Config`; error: `There was an issue updating the Global Config`); submit gated on dirty + valid.

---

## 4. Background Jobs (`src/instrumentation.ts`)

- **First-run bootstrap** — creates the singleton `Config` row from env vars (`BACKEND_SERVER_MEDIAMTX_URL`, `MEDIAMTX_API_PORT`, `REMOTE_MEDIAMTX_URL`, `MEDIAMTX_RECORDINGS_DIR`, `MEDIAMTX_SCREENSHOTS_DIR`) and ensures `recordingsDirectory` / `screenshotsDirectory` exist on server boot. After the row exists, the `/config` UI is the source of truth — re-setting env vars takes effect only after a DB reset.
- **Env / Config drift warning** — on subsequent boots, for each bootstrap env var that the operator has *explicitly* set in the environment (raw `process.env`, distinct from schema defaults via `rawEnv` in `src/lib/env.ts`), if its value differs from the corresponding stored `Config` value a single structured `WARN` log lists each mismatch and reminds the operator that env only seeds the first boot.
- **Thumbnail generation cron** — every 30 minutes (`*/30 * * * *`) scans the recordings tree for MP4s without a sibling PNG and spawns `ffmpeg -ss 00:00:00 -i <file>.mp4 -frames:v 1 <file>.png`. Non-blocking, parallel.
- **Screenshot retention cron** — daily at midnight (`0 0 0 * * *`) deletes thumbnails older than 2 days, per stream subdirectory.
- **Pino-structured logging** of every spawn / deletion.

---

## 5. Health, Observability, and System

- **`GET /api/health`** — JSON health endpoint with DB connectivity check via `SELECT 1`; returns 200 healthy or 503 degraded. Used by the Docker `HEALTHCHECK`. `src/app/api/health/route.ts`
- **Pino logger** — structured logs across the app, with `console.*` lint-banned. `src/lib/logger.ts`
- **Centralized env loader** — `src/lib/env.ts` validates env via Zod and exposes `isProduction` / `isDevelopment` / `isTest` / `isCI`. Lint rule (`node/prefer-global/process`) blocks raw `process.env` access elsewhere.
- **Force-dynamic rendering** on data-driven pages so server actions always see fresh state.

---

## 6. Data Layer

- **SQLite + Prisma ORM** — single `Config` table holds all app settings. `src/lib/prisma/schema.prisma`
- **Prisma client singleton** — avoids dev-time client storms. `src/lib/db.ts`
- **Migrations** — versioned under `src/lib/prisma/migrations/`:
  - `20231215194703_init` — initial schema.
  - `20231216215901_client_config_optional_fields` — relaxed field constraints.
- **Multi-arch Prisma binary targets** — `native` + `linux-musl-openssl-3.0.x` for Alpine containers.
- **Sensible field defaults** — `http://mediamtx`, port `9997`, `/recordings`, `/screenshots`.

---

## 7. MediaMTX API Integration

- **Auto-generated TypeScript client** from MediaMTX `swagger.json` (v1.11.3). `src/lib/mediamtx/generated.ts`
- **Used endpoints**: `v3/pathsList`, `v3/configGlobalGet`, `v3/configGlobalSet`.
- **Marked as auto-generated / do-not-edit** in `CLAUDE.md`.

---

## 8. UI System / Shared Components

### 8.1 shadcn/ui primitives (`src/components/ui/`)
- Layout / nav: Sidebar (+ provider/menu/inset/trigger), Sheet, Breadcrumb, Tabs, ScrollArea, Separator.
- Content: Card, Alert, Empty, AspectRatio, Pagination, Skeleton, Progress, Badge.
- Inputs: Button, Input, Textarea, Switch, Select, Label, ToggleGroup, Toggle.
- Surfaces: Popover, DropdownMenu, Dialog, Tooltip, Calendar, Command.
- Form: RHF integration (FormField, FormControl, FormMessage, FormDescription, FormItem, FormLabel).
- Toast: Sonner `Toaster` mounted in the root layout; callsites import `toast` directly from `sonner`.

### 8.2 Shared components (`src/components/`)
- **AppSidebar** — global Sidebar shell (sidebar-07 pattern): brand, "Application" group (Live, Recordings), "Settings" group (Client Config, MediaMTX), footer ModeToggle. `src/components/app-sidebar.tsx`
- **PageHeader** — sticky inset top bar with `SidebarTrigger` + `Breadcrumb` + an optional actions slot. Each page passes its own crumbs. `src/components/page-header.tsx`
- **SidebarTrigger** — single-click sidebar open/close button with state-aware morphing icon (`PanelLeftOpen` ↔ `PanelLeftClose`) on a scale + rotate transition. `src/components/ui/sidebar.tsx`
- **PageLayout** — h2 title + subheader (Suspense-wrapped) + Separator + content, wrapped in a max-w-7xl padded container. `src/components/page-layout.tsx`
- **EmptyState** — wrapper around shadcn `Empty` with `icon`, `title`, `description`, optional CTA `children`. Used for non-destructive empty/info states across the app. `src/components/empty-state.tsx`
- **ModeToggle** — single-click Light ↔ Dark theme toggle backed by `next-themes`. Uses the View Transitions API to play a circle-reveal clip-path animation centered on the button (graceful fallback when the API is unsupported). `src/components/mode-toggle.tsx`
- **RefreshButton** — manual page reload control surfaced in connection-error alerts. `src/components/refresh-button.tsx`
- **VideoPlayer** — shared HLS.js component (see §1.3). `src/components/video-player.tsx`
- **ThemeProvider** — `next-themes` wrapper, dark default. `src/components/theme-provider.tsx`
- **ServiceWorker** — registers `/sw.js` for offline / PWA support, with browser-capability guard. `src/components/service-worker.tsx`

### 8.3 Lib (`src/lib/`)
- **`cn`** — Tailwind class merger. `src/lib/utils.ts`
- **`logger`** — Pino-backed logger. `src/lib/logger.ts`
- **`db`** — Prisma client singleton. `src/lib/db.ts`
- **`env`** — Zod-validated env loader. `src/lib/env.ts`

### 8.4 Recordings filesystem helpers
- **`summarizeStreamRecordings` / `getFilesInDirectory`** — feature-local fs helpers used by the recordings views. `src/features/recordings/file-operations.ts`

### 8.5 Application chrome
- **Sidebar shell** — `SidebarProvider` + `AppSidebar` + `SidebarInset` wraps every page. The sidebar collapses to icons on desktop (cookie-persisted) and slides in as a Sheet on mobile via `SidebarTrigger`. Settings live as nested entries in the global sidebar; there is no per-section sub-layout. `src/app/[locale]/layout.tsx`
- **Root layout** — Sonner Toaster mount, ThemeProvider, ServiceWorker registration, dark-themed viewport color, default document title metadata (`MediaMTX Connect`), and `NextIntlClientProvider` for the active locale. `src/app/[locale]/layout.tsx`
- **Global CSS** — Tailwind 4 with shadcn sidebar tokens (`--sidebar-*`). `src/app/globals.css`

---

## 9. Theming, Accessibility, PWA, Internationalization

- **Dark / Light theme** — persisted via `next-themes`, dark default. Toggled by `ModeToggle` (single-click, View Transitions API circle-reveal).
- **Web App Manifest** — installable PWA. App name, theme color `#0c1016`, `display: standalone`, 512×512 maskable + rounded icons, `start_url: /`. `src/app/manifest.ts`
- **Service worker registration** — offline-friendly shell. `src/components/service-worker.tsx`, `public/sw.js`
- **Radix-based UI primitives** — keyboard nav, focus management, ARIA wired in via shadcn/ui.
- **Sub-path / reverse-proxy friendliness** — historical work to run cleanly behind nginx with a base path (`CHANGELOG` 1.4.1).
- **Internationalization (i18n)** — `next-intl` with App Router `[locale]` segment. Supported locales: `en` (default, served at `/`), `es` (served at `/es/...`), `zh` (Simplified Chinese, served at `/zh/...`), `it` (served at `/it/...`), `de` (served at `/de/...`), `ru` (served at `/ru/...`), `fr` (served at `/fr/...`), `pt` (served at `/pt/...`), `ja` (served at `/ja/...`), `pl` (served at `/pl/...`), `ko` (served at `/ko/...`), `tr` (served at `/tr/...`), `nl` (served at `/nl/...`), and `cs` (served at `/cs/...`). `localePrefix: 'as-needed'` — English URLs are unchanged from pre-i18n. Locale routing handled by `src/proxy.ts`; per-request messages loaded via `src/i18n/request.ts` from `messages/{locale}.json`. Routing config in `src/i18n/routing.ts`, locale-aware navigation helpers in `src/i18n/navigation.ts`. `<html lang>` set per request from the URL segment. `metadata.alternates.languages` emits hreflang tags. Date / time / relative-time formatting uses `useFormatter` (client) / `getFormatter` (server) for locale-aware output.
- **Locale switcher** — sidebar footer dropdown. Sits next to ModeToggle, persists choice via `NEXT_LOCALE` cookie (next-intl default), preserves the current path when switching. `src/components/locale-switcher.tsx`
- **Localized README** — `README.md` (English source, at repo root) + `docs/i18n/README.{locale}.md` for every other supported locale. Each carries a centered language strip with flag emoji + native name (current locale bolded). Developer-facing docs (this file, `CONTRIBUTING.md`, `ARCHITECTURE.md`, `CLAUDE.md`, etc.) intentionally remain English-only.
- **README translation staleness guard** — `docs/i18n/.translation-status.json` records the source `README.md` hash plus per-locale "last synced at hash" entries. `scripts/readme-i18n-check.ts` (run via `npm run i18n:check`) fails CI when the source hash drifts from any locale's recorded hash or when a locale README file is missing.
- **Translation onboarding & guard** — `docs/I18N.md` documents the full "add a new language" workflow and translation policy. `scripts/i18n-check.ts` (run via `npm run i18n:check`) compares every non-English locale against `messages/en.json` and fails when keys are missing or extra. Wired into CI alongside `lint` / `typecheck`.

---

## 10. Routing Map

| Route | Purpose | File |
|-------|---------|------|
| `/` (and `/es`) | Live View — stream grid | `src/app/[locale]/page.tsx` |
| `/recordings` (and `/es/recordings`) | All-streams recording index | `src/app/[locale]/recordings/page.tsx` |
| `/recordings/[streamname]` | Per-stream paginated browser | `src/app/[locale]/recordings/[streamname]/page.tsx` |
| `/config` (and `/es/config`) | Client app config | `src/app/[locale]/config/page.tsx` |
| `/config/mediamtx/global` | MediaMTX server config | `src/app/[locale]/config/mediamtx/global/page.tsx` |
| `/api/health` | Health endpoint | `src/app/api/health/route.ts` |
| `/api/[streamName]/first-screenshot` | Latest stream thumbnail | `src/app/api/[streamName]/first-screenshot/route.ts` |
| `/api/[streamName]/[filePath]/view-recording` | MP4 stream for playback | `src/app/api/[streamName]/[filePath]/view-recording/route.ts` |
| `/api/[streamName]/[filePath]/download-recording` | MP4 download | `src/app/api/[streamName]/[filePath]/download-recording/route.ts` |
| `/manifest.webmanifest` | PWA manifest | `src/app/manifest.ts` |

---

## 11. Server Actions & Queries (catalog)

Reads (server-only, no `'use server'`):

| Query | File | What it does |
|-------|------|--------------|
| `getAppConfig` | `src/features/client-config/client-config.queries.ts` | Reads the singleton `Config` row. |
| `getGlobalConfig` | `src/features/mediamtx-config/mediamtx-config.queries.ts` | Fetches MediaMTX `GlobalConf` via API. |
| `getStreamRecordings` | `src/features/recordings/recordings.queries.ts` | Paginated recording metadata + thumbnails for a stream. |
| `getScreenshot` | `src/features/recordings/recordings.queries.ts` | Reads a PNG into base64 for inline rendering. |

Writes (Server Actions, `'use server'`):

| Action | File | What it does |
|--------|------|--------------|
| `updateClientConfig` | `src/features/client-config/client-config.actions.ts` | Validates + persists app settings, revalidates cache. |
| `updateGlobalConfig` | `src/features/mediamtx-config/mediamtx-config.actions.ts` | Pushes `GlobalConf` changes to MediaMTX. |

---

## 12. Validation Schemas

- **`ClientConfigSchema`** (`src/features/client-config/client-config.schemas.ts`) — coerced types, non-empty strings, positive port, optional nullable remote URL.
- **`GlobalConfigSchema`** (`src/features/mediamtx-config/mediamtx-config.schemas.ts`) — full MediaMTX `GlobalConf` mirror with optional fields and coercion across logging, transports (RTSP/RTMP/HLS/WebRTC/SRT), API/metrics/profiling, recording, and ICE servers.

---

## 13. Docker & Runtime

### 13.1 Production image (`Dockerfile`)
- **Multi-stage build** on `node:24-alpine3.23` — `deps` → `builder` → `runner`.
- **Native deps** — `libc6-compat`, `openssl`.
- **Telemetry off** during build (`NEXT_TELEMETRY_DISABLED=1`).
- **Runtime tooling baked in** — `ffmpeg` (thumbnail generation), `openssl`, `curl` (healthchecks).
- **Standalone Next output** — small, self-contained runtime.
- **Pre-created mount points** — `/recordings`, `/screenshots`.
- **Production-shaped env defaults** — bootstrap env vars (`BACKEND_SERVER_MEDIAMTX_URL=http://mediamtx`, `MEDIAMTX_API_PORT=9997`, `REMOTE_MEDIAMTX_URL=http://localhost`, `MEDIAMTX_RECORDINGS_DIR=/recordings`, `MEDIAMTX_SCREENSHOTS_DIR=/screenshots`) come from the Zod schema in `src/lib/env.ts`, so `docker run` with no env produces a valid first-boot seed without any image-level `ENV` directives. Override at `docker run` time to skip the in-app `/config` step.
- **Non-root `nextjs` user**.
- **Port 3000** + `HEALTHCHECK` against `/api/health` (30 s interval, 10 s timeout, 3 retries).
- **Migration-on-boot entrypoint** — `./scripts/start.sh` runs `prisma migrate deploy` then `next start`.

### 13.2 Compose stacks
- **`docker-compose.yml`** — full prod stack: `mediamtx` (v1.11.3) + `mediamtx-connect`, shared `mtx` bridge network, named volume for SQLite, read-only-mounted `mediamtx.yml`, exposed ports `3000 / 8554 (RTSP) / 1935 (RTMP) / 8888 (HLS) / 9997 (API)`, app healthcheck, dependency ordering. The app container sets `BACKEND_SERVER_MEDIAMTX_URL=http://mediamtx`, `MEDIAMTX_API_PORT=9997`, `MEDIAMTX_RECORDINGS_DIR=/recordings`, `MEDIAMTX_SCREENSHOTS_DIR=/screenshots` so first-boot seeding produces correct values.
- **`docker-compose.dev.yml`** — dev variant with optional `fake-streams` service behind `--profile streams` for offline testing.

### 13.3 Multi-arch
- **`linux/amd64` + `linux/arm64`** images (advertised in README), with Prisma binary targets to match.

### 13.4 Sample `mediamtx.yml`
- Pre-wired configuration enabling RTSP, RTMP, HLS, WebRTC, SRT, recording, and the API. `mediamtx.yml`

### 13.5 Reverse-proxy friendliness
- App runs cleanly behind nginx with a base path / redirects (per `CHANGELOG` 1.4.x).

---

## 14. Examples (in-repo recipes)

- **`examples/fake-streams/`** — Dockerized test rig that publishes 5 synthetic RTSP streams via ffmpeg, used for offline development.
- **`examples/raspberry-pi-camera/`** — GStreamer pipeline + ALSA audio capture + Docker compose for streaming a Raspberry Pi camera into MediaMTX.

---

## 15. Testing & Quality

### 15.1 Playwright E2E (`tests/e2e/`)
- **`streams.spec.ts`** — header rendering, nav links, the four connection states (error / no streams / configured / streams visible), stream card display, remote-URL prompt.
- **`recordings.spec.ts`** — index load, per-stream cards, View navigation, detail-page pagination, empty + error states.
- **`config.spec.ts`** — form load, all five inputs render, submit gating, edit + save round-trip with reload-and-verify, description copy.
- **`api.spec.ts`** — `/api/health` behavior.
- **`mediamtx.spec.ts`** — MediaMTX connectivity smoke tests.
- **Runner config** (`playwright.config.ts`) — Chromium, 1280×720, parallel workers (1 in CI), retries (2 in CI), HTML reporter, traces on first retry, screenshots on failure, `webServer: npm run start` against `http://localhost:3000`.

### 15.2 Linting & types
- **ESLint 9 + `@antfu/eslint-config`** — TypeScript, React 19, Next.js, with custom rules:
  - `node/prefer-global/process` — forbids raw `process.env` (forces use of `src/lib/env.ts`).
  - `console.*` ban — forces use of the Pino logger.
- **`tsc --noEmit`** type checking via `npm run typecheck`.

### 15.3 Scripts (`package.json`)
| Script | Purpose |
|--------|---------|
| `npm run dev` | Next dev server. |
| `npm run build` | Production build. |
| `npm run start` | Run the prod server. |
| `npm run typecheck` | TypeScript type check. |
| `npm run lint` / `lint:fix` | ESLint check / autofix. |
| `npm run i18n:check` | Verify message-key parity across `messages/*.json`. |
| `npm run test:e2e` | Playwright suite. |
| `npm run setup` | Run `./scripts/setup-dev.sh`. |
| `npm run dev:all` | Start MediaMTX (with fake streams) and Next.js dev together; tears the stack down on exit. |
| `npm run mediamtx` / `mediamtx:stop` | Start / stop MediaMTX with fake test streams. |
| `npm run generate` | `prisma generate`. |
| `npm run migrate` | `prisma migrate deploy`. |
| `npm run db:seed` | Seed the database. |
| `npm run db:reset` | Reset the database. |

### 15.4 Helper scripts (`scripts/`)
- **`setup-dev.sh`** — bootstraps a dev environment.
- **`setup-test-data.sh`** — generates sample recordings for tests. Sources `.env` and writes fixtures to `MEDIAMTX_RECORDINGS_DIR` / `MEDIAMTX_SCREENSHOTS_DIR` (or the env defaults), so fixtures and seeded Config never disagree.
- **`start-mediamtx.sh`** — wraps the dev compose flow.
- **`dev-all.sh`** — runs `start-mediamtx.sh` then `next dev`, with a trap that brings the dev compose stack down on exit.
- **`start.sh`** — container entrypoint: migrate then `next start`.

---

## 16. CI / Release / Repo Hygiene

- **GitHub Actions CI** (badge in README) — build, lint, type check, tests.
- **Docker Hub publishing** — `bcanfield/mediamtx-connect` image.
- **`semantic-release`** — `release.config.js` automates semver, changelog, and GitHub releases. `CHANGELOG.md` is auto-maintained.
- **Renovate** — `renovate.json` configured for automated dependency PRs (visible across `CHANGELOG.md` history).
- **MIT licensed** — `LICENSE`.
- **Contribution guide** — `CONTRIBUTING.md`.
- **Architecture doc** — `ARCHITECTURE.md`.
- **Project conventions** — `docs/PROJECT-STRUCTURE.md` (layout, naming, imports).
- **Demo GIF** — `.github/assets/demo.gif` referenced from README.

---

## 17. Tech Stack (at a glance)

| Layer | Technology |
|------|------------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict, `@/` path alias) |
| Styling | Tailwind CSS 4, shadcn/ui (Radix UI) |
| Forms | React Hook Form 7 + Zod 4 |
| Video (browser) | HLS.js 1.6.x |
| Video (server) | ffmpeg (thumbnails) |
| Database | SQLite via Prisma 5 |
| HTTP | Axios |
| Logging | Pino |
| Scheduling | node-cron |
| Image processing | Sharp |
| Icons | Lucide React |
| i18n | `next-intl` (App Router, locale-prefixed routing) |
| Testing | Playwright |
| Linting | ESLint 9 + `@antfu/eslint-config` |
| Packaging | Docker (multi-stage, multi-arch) |
| Release | semantic-release, Renovate |

---

## 18. Capability Highlights (TL;DR for product/marketing)

- Watch every MediaMTX stream live in the browser (HLS) without installing anything.
- Browse, preview, play, and download recordings, with auto-generated thumbnails.
- Edit *every* MediaMTX server-config option from a typed, validated web form — no YAML required.
- Reconfigure the app itself (URLs, mount paths) from the same UI; no container restart needed.
- Healthcheck endpoint, structured logs, scheduled background jobs, and PWA install — production-ready out of the box.
- Multi-arch Docker images (amd64/arm64), one-command stand-up via Docker Compose, and reverse-proxy friendly.
- Dark/light/system theming, responsive grids, mobile nav, accessible Radix primitives.
- End-to-end test suite, semantic-release pipeline, Renovate-managed deps.
- Domain-driven feature layout that's prebuilt to absorb future capabilities (auth, storage management, analytics, integrations).
