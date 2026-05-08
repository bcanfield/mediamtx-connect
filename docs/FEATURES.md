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

Sources reviewed at last full audit: source tree, `README.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `package.json`, Dockerfile, compose files, Prisma schema, MediaMTX OpenAPI integration, Playwright suites.

---

## 1. Live Streaming

### 1.1 Live View page (`/`)
- **Live streams dashboard** — grid of all active MediaMTX paths with auto-refresh on navigation. `src/features/streams/live-view-page.tsx`, `src/app/page.tsx`
- **MediaMTX path discovery** — calls MediaMTX `v3/pathsList` to enumerate active streams. `src/features/streams/live-view-page.tsx`
- **Connection diagnostics** — distinguishes API connection error vs. no streams vs. streams-but-no-remote-URL with separate UI states and links into Config. `src/features/streams/live-view-page.tsx`
- **"Stream online since" metadata** — exposes `readyTime` per path in a popover.
- **Cross-feature deep links** — quick links from Live View into Recordings and Config.

### 1.2 Stream cards
- **Auto-thumbnail tile** — shows latest screenshot via `/api/[streamName]/first-screenshot` with graceful fallback icon. `src/features/streams/stream-card.tsx`
- **Click-to-play / pause toggle** — switches the card between thumbnail and live HLS player.
- **URL-state-driven selection** — uses search params so the active live tile survives reload/share.
- **Per-stream action buttons** — play/pause, recordings shortcut, and details popover use labeled icon controls. `src/features/streams/stream-card.tsx`
- **Square aspect-ratio grid** — responsive across mobile / sm / md / lg / xl breakpoints.

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
- **All-streams recording list** — shows every subdirectory of the recordings mount with a file count badge. `src/features/recordings/recordings-index-page.tsx`, `src/app/recordings/page.tsx`
- **Drill-in "View" link per stream** — routes to `/recordings/[streamname]`.
- **Misconfiguration alerts** — flags missing/inaccessible recordings directory with actionable copy.
- **Empty state** — friendly UI when no recordings exist yet.

### 2.2 Per-stream recording browser (`/recordings/[streamname]`)
- **Paginated recording list** — `?page` and `?take` query params, default 10/page. `src/features/recordings/stream-recordings-page.tsx`, `src/app/recordings/[streamname]/page.tsx`
- **"Showing X–Y of Z" range display** with prev/next nav and disabled boundary states.
- **Reverse-chronological sort** — newest recordings first. `src/features/recordings/recordings.queries.ts`
- **Back-to-index navigation**.

### 2.3 Recording cards
- **Per-recording thumbnail** — auto-generated PNG, base64-inlined to skip extra round trips. `src/features/recordings/recording-card.tsx`, `src/features/recordings/recordings.queries.ts`
- **Filename + creation timestamp + formatted file size**.
- **Inline playback control** — opens the in-browser MP4 player via the view endpoint with a labeled icon button. `src/features/recordings/recording-card.tsx`
- **Download button with progress bar** — Axios blob streaming, 0–100 % progress, browser save dialog, success/error toasts, and labeled icon-only affordance. `src/features/recordings/download-button.tsx`
- **Metadata popover** — full file metadata for the recording, launched from a labeled icon button. `src/features/recordings/recording-card.tsx`
- **Configurable grid density** — small/medium card layouts.

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
- **Single-table app settings UI** backed by SQLite. `src/features/client-config/client-config-page.tsx`, `src/app/config/page.tsx`
- **React Hook Form + Zod validation** with on-blur validation, dirty/valid gating on submit, and toast feedback (success: `Updated Client Config`; error: `There was an issue updating the Client Config`). `src/features/client-config/client-config-form.tsx`, `src/features/client-config/client-config.schemas.ts`
- **Editable fields**:
  - `mediaMtxUrl` — internal/container hostname for MediaMTX API.
  - `mediaMtxApiPort` — API port (default 9997).
  - `remoteMediaMtxUrl` — browser-reachable HLS endpoint (the field that unlocks live playback for remote viewers).
  - `recordingsDirectory` — mount path for MP4s.
  - `screenshotsDirectory` — mount path for thumbnails.
- **`getAppConfig` / `updateClientConfig` server actions** with `revalidatePath` cache busting. `src/features/client-config/`
- **Field-level help text** — each input has a description explaining its impact.

### 3.2 MediaMTX global server config — `/config/mediamtx/global`
- **Comprehensive MediaMTX `GlobalConf` editor** — ~75 fields, every option exposed by MediaMTX v1.11.3. `src/features/mediamtx-config/mediamtx-config-form.tsx`, `src/features/mediamtx-config/mediamtx-config.schemas.ts`
- **Sectioned form** — Logging, API/Metrics/Profiling, RTSP, RTMP, HLS, WebRTC, SRT, Recording, with visual separators.
- **Logging** — log level, multi-destination log targets, log file path, write timeouts.
- **Limits** — read/write timeouts, write queue size, UDP payload size.
- **External authentication URL** — pluggable auth hook.
- **API / metrics / profiling** — toggles + addresses for each.
- **RTSP** — enable, address, transport protocols, encryption, auth methods.
- **RTMP** — enable, address, encryption, certificates.
- **HLS** — enable, address, segment count/duration/size, variant, always-remux.
- **WebRTC** — enable, addresses, trusted proxies, dynamic ICE-server array (add/remove rows with labeled icon controls).
- **SRT** — enable, address.
- **Recording** — enable, path, format, part/segment duration, delete-after.
- **Live read/write through MediaMTX HTTP API** — `getGlobalConfig` (`v3/configGlobalGet`) + `updateGlobalConfig` (`v3/configGlobalSet`). `src/features/mediamtx-config/`
- **Toast feedback** on success/error (success: `Updated Global Config`; error: `There was an issue updating the Global Config`); submit gated on dirty + valid.

### 3.3 Config navigation
- **Config layout shell** — shared layout for the config sub-tree. `src/app/config/layout.tsx`

---

## 4. Background Jobs (`src/instrumentation.ts`)

- **First-run bootstrap** — creates the singleton `Config` row and ensures `recordingsDirectory` / `screenshotsDirectory` exist on server boot.
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
- Button (CVA variants: default / outline / ghost / destructive / …), Input, Textarea, Form (RHF integration: FormField, FormControl, FormMessage, FormDescription, FormItem, FormLabel), Card, Alert, Select, Popover, DropdownMenu, Separator, Progress, Label, Skeleton, Toast / Toaster / `use-toast`.

### 8.2 Shared components (`src/components/`)
- **PageLayout** — title + subheader (Suspense-wrapped) + separator + content. `src/components/page-layout.tsx`
- **PageSkeleton** — loading state for `app/loading.tsx`. `src/components/page-skeleton.tsx`
- **GridLayout** — responsive `xs / small / medium / large` density modes built on Tailwind grid columns. `src/components/grid-layout.tsx`
- **GridFormItem** — consistent label / control / description grid wrapper used across both config forms. `src/components/grid-form-item.tsx`
- **ModeToggle** — Light / Dark / System theme switcher using `useSyncExternalStore` + `matchMedia('prefers-color-scheme: dark')`. `src/components/mode-toggle.tsx`
- **RefreshButton** — manual page reload control surfaced in the navbar and connection-error states. `src/components/refresh-button.tsx`
- **VideoPlayer** — shared HLS.js component (see §1.3). `src/components/video-player.tsx`
- **ThemeProvider** — `next-themes` wrapper, dark default. `src/components/theme-provider.tsx`
- **ServiceWorker** — registers `/sw.js` for offline / PWA support, with browser-capability guard. `src/components/service-worker.tsx`
- **SidebarNav** — generic active-route-aware nav strip used by the config layout. `src/components/sidebar-nav.tsx`
- **NavBar** — sticky responsive top nav (used by the root layout). `src/components/nav-bar.tsx`

### 8.3 Lib (`src/lib/`)
- **`cn`** — Tailwind class merger. `src/lib/utils.ts`
- **`logger`** — Pino-backed logger. `src/lib/logger.ts`
- **`db`** — Prisma client singleton. `src/lib/db.ts`
- **`env`** — Zod-validated env loader. `src/lib/env.ts`

### 8.4 Recordings filesystem helpers
- **`countFilesInSubdirectories` / `getFilesInDirectory`** — feature-local fs helpers used by the recordings views. `src/features/recordings/file-operations.ts`

### 8.5 Application chrome
- **Sticky responsive NavBar** — Connect / Recordings / Config links with active-route highlighting, mobile menu access, refresh button, and theme toggle; icon controls carry screen-reader labels. `src/components/nav-bar.tsx`
- **Root layout** — max-width container, Toaster mount, ThemeProvider, ServiceWorker registration, dark-themed viewport color. `src/app/layout.tsx`
- **Global CSS** — Tailwind 4. `src/app/globals.css`

---

## 9. Theming, Accessibility, PWA

- **Dark / Light / System theme** — persisted via `next-themes`, dark default.
- **Web App Manifest** — installable PWA. App name, theme color `#0c1016`, `display: standalone`, 512×512 maskable + rounded icons, `start_url: /`. `src/app/manifest.ts`
- **Service worker registration** — offline-friendly shell. `src/components/service-worker.tsx`, `public/sw.js`
- **Radix-based UI primitives** — keyboard nav, focus management, ARIA wired in via shadcn/ui.
- **Sub-path / reverse-proxy friendliness** — historical work to run cleanly behind nginx with a base path (`CHANGELOG` 1.4.1).

---

## 10. Routing Map

| Route | Purpose | File |
|-------|---------|------|
| `/` | Live View — stream grid | `src/app/page.tsx` |
| `/recordings` | All-streams recording index | `src/app/recordings/page.tsx` |
| `/recordings/[streamname]` | Per-stream paginated browser | `src/app/recordings/[streamname]/page.tsx` |
| `/config` | Client app config | `src/app/config/page.tsx` |
| `/config/mediamtx/global` | MediaMTX server config | `src/app/config/mediamtx/global/page.tsx` |
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
