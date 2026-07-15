# Migrating MediaMTX Connect into this stack

> **Status (2026-07-14): complete.** All six phases are done. The monorepo
> now lives at the repo root (the old Next.js `src/` tree is retired), the
> Playwright suite, CI, and docs are ported, and the app was verified
> end-to-end against a live MediaMTX (streams, HLS playback, recordings with
> Range streaming, both config forms, i18n, theming, crons, Docker image).
> The Docker runtime decision landed on `node:22-slim` + ffmpeg (§5
> option 1). This document is now a historical record of the mapping. The
> old app's Vitest layers were not carried over — see `docs/debt/`
> (`vitest-layers-not-ported`).

How to transfer everything in `docs/FEATURES.md` (repo root) from the Next.js 16
app into this monorepo: Vite + React 19 + TanStack Router SPA (`apps/web`),
Hono API (`apps/api`), shared oRPC contract (`packages/contract`), one
Docker image (`node:22-slim` + ffmpeg — see §5).

The guiding move: **everything that is a Server Component, Server Action, or
Next API route today becomes either an oRPC procedure (JSON) or a plain Hono
route (binary/streaming).** The browser never talks to the filesystem, Prisma,
or the MediaMTX API directly — only `apps/api` does.

---

## 1. Where each piece of the old app lands

| Today (Next.js) | Tomorrow | Notes |
|---|---|---|
| Server actions (`updateClientConfig`, `updateGlobalConfig`) | oRPC mutations in `packages/contract` + handlers in `apps/api` | `revalidatePath` → TanStack Query invalidation |
| Server queries (`getAppConfig`, `getGlobalConfig`, `getStreamRecordings`, MediaMTX `pathsList`) | oRPC queries | Zod schemas move into the contract — single source of truth |
| `/api/health` | oRPC `health` (already scaffolded) | Docker healthcheck hits it over HTTP |
| `/api/[streamName]/first-screenshot` | Plain Hono route `GET /media/screenshots/:streamName/latest` | Binary responses don't belong in oRPC |
| `/api/.../view-recording` + `download-recording` | One Hono route `GET /media/recordings/:streamName/:file` with real `Range` support; download is the same URL + `?download` (`Content-Disposition`) | Two Next routes collapse into one; proper 206 partial content is an upgrade over today's full-file responses |
| Base64-inlined recording thumbnails (`getScreenshot`) | Plain `<img src="/media/...">` URLs | Drops the base64 payload from list responses entirely |
| `src/instrumentation.ts` crons (thumbnail gen, retention, first-run bootstrap) | `apps/api/src/jobs/` started from `server.ts` | Same node-cron (or croner) logic, same ffmpeg spawn; no Next instrumentation quirks |
| Prisma + SQLite (single `Config` row) | **JSON config file** (`/data/config.json`), atomic write, seeded from env on first boot | See §3 — this deletes Prisma, migrations, migrate-on-boot, and the DB healthcheck |
| `src/lib/env.ts` (Zod) | `apps/api/src/env.ts` (t3-env + Zod, already exists) | Web app gets **no** env — everything flows through the API |
| `src/lib/mediamtx/generated.ts` | `apps/api/src/mediamtx/` — regenerate from MediaMTX swagger with `openapi-typescript` + `openapi-fetch` | fetch-based, types-only output, still do-not-edit |
| Next App Router pages | TanStack Router routes | `?play=`, `?page`, `?take` become **typed search params** (`validateSearch` + Zod) — an upgrade |
| shadcn/ui + Tailwind 4 + theme provider | Port as-is into `apps/web` | Framework-agnostic already; `ThemeScript` becomes an inline script in `index.html` |
| `next/image` + 1×1-transparent-PNG 404 hack | Plain `<img>` + `onError` fallback in the card | The 404-with-fake-PNG workaround exists only for `next/image`; delete it |
| next-intl (30 locales, `[locale]` URL prefix) | **use-intl** (next-intl's framework-agnostic core) | Same `useTranslations` API, same `messages/*.json` — port unchanged. Locale via cookie/localStorage, **no URL prefix** (see §4) |
| PWA manifest + `sw.js` | Static files in `apps/web/public/` | Hono serves them like everything else |
| HLS.js `VideoPlayer` | Port unchanged | Browser still talks straight to MediaMTX HLS via `remoteMediaMtxUrl` |
| RHF + Zod forms | Port unchanged | Schemas import from `@connect/contract` instead of feature-local files |
| Playwright suites (`tests/e2e/`) | Port with minor selector/URL fixes | `webServer` becomes the built single-server (`node apps/api/dist/server.mjs`) |
| Axios (download progress) | `fetch` + `ReadableStream` progress | Only one component uses Axios; drop the dependency |
| Sharp | **Delete** | Never imported in `src/` — it exists only for `next/image` |

## 2. Contract shape (`packages/contract`)

One namespace per feature domain, mirroring the old `src/features/` layout:

```ts
export const contract = {
  health: oc.output(HealthSchema),
  streams: {
    list: oc.output(z.array(StreamPathSchema)), // wraps v3/pathsList + connection-state discrimination
  },
  recordings: {
    listStreams: oc.output(z.array(StreamRecordingSummarySchema)), // {name, count, latestMtime, screenshotUrl}
    listForStream: oc
      .input(z.object({ streamName: z.string(), page: z.int().min(1), take: z.int().min(1).max(100) }))
      .output(PaginatedRecordingsSchema),
  },
  config: {
    app: {
      get: oc.output(AppConfigSchema),
      update: oc.input(AppConfigSchema).output(AppConfigSchema),
    },
    mediamtx: {
      getGlobal: oc.output(GlobalConfSchema),
      updateGlobal: oc.input(GlobalConfSchema.partial()).output(z.void()),
    },
  },
}
```

`ClientConfigSchema` and the ~75-field `GlobalConfigSchema` move here verbatim
(they're already Zod 4). The connection-diagnostics tri-state (API error / no
streams / no remote URL) becomes a discriminated union in `StreamsListSchema`
rather than try/catch logic in a page component.

## 3. Config storage: drop the database

The entire Prisma + SQLite setup exists to hold **one row with five fields**.
Replace it with a JSON file:

- `apps/api/src/config-store.ts` — read/write `${DATA_DIR}/config.json`
  (atomic: write temp + rename), validated by `AppConfigSchema` on both ends.
- First boot: file missing → seed from env (same five vars, same defaults),
  create recordings/screenshots dirs. Subsequent boots: env-drift warning
  logic ports as-is.
- Deleted outright: Prisma, both migrations, `db.ts`, `migrate-on-boot`
  entrypoint script, Prisma binary-target juggling, the DB half of the
  healthcheck, `db:seed` / `db:reset` scripts.

If a real database ever earns its way in (auth, analytics), the reference
doc's `packages/db` (Drizzle) slot is where it goes — don't pre-build it.

## 4. i18n in a SPA

- **Keep:** all 30 `messages/*.json` files, the `useTranslations` call sites,
  the `i18n-check` parity script, the searchable locale switcher.
- **Change:** next-intl → `use-intl` (same author, same message format, same
  hooks — this is next-intl minus the Next.js router bindings). Wrap the app
  in `IntlProvider`, store the locale choice in `localStorage` + cookie.
- **Drop:** the `[locale]` URL segment, `localePrefix`, hreflang tags,
  `src/proxy.ts` locale routing. This is a self-hosted dashboard; URL-based
  locale negotiation and SEO machinery buy nothing here. Routes become plain
  `/recordings`, `/config`, etc.
- README translations and their staleness guard are repo-level, not
  app-level — they move over untouched.

## 5. Docker: the ffmpeg problem

The showcase runtime is `gcr.io/distroless/nodejs22-debian12`; the app needs
`ffmpeg` (thumbnails) and a healthcheck probe. Two options:

1. **Recommended: switch the runtime stage to `node:22-slim`** +
   `apt-get install ffmpeg`. Boring, debuggable, ffmpeg is a real distro
   package. Healthcheck via `node -e "fetch(...)"` (no curl needed).
2. Stay distroless + `ffmpeg-static` npm package (glibc binary, works on
   distroless-debian). Smaller attack surface, but a 70 MB binary in
   node_modules and no shell when something goes wrong at 2 a.m.

Everything else in the existing Dockerfile pattern (turbo prune → build →
`pnpm deploy --legacy --prod`) stays. Mount points `/recordings`,
`/screenshots`, and new `/data` (config.json) are created in the image.
`docker-compose.yml` keeps the same topology — only the image and the removal
of the SQLite volume change (replaced by a `/data` volume).

## 6. Migration order

Each phase leaves the new app buildable (`pnpm build && pnpm typecheck` green):

1. **Foundations** — rename package scope (`@connect/*` → project scope),
   delete guestbook, port `env.ts` additions, config-store (§3), regenerate
   the MediaMTX client, wire `health` + `config.app` end to end. This proves
   the whole contract→api→web loop on the simplest real feature.
2. **Media routes** — Hono `GET /media/...` for screenshots and recordings
   with Range support; port `file-operations.ts` helpers.
3. **Web shell** — Tailwind 4 + shadcn into Vite (`components.json`,
   `globals.css` tokens), sidebar chrome, PageHeader/PageLayout/EmptyState,
   theme provider + inline theme script, use-intl provider, locale switcher,
   Sonner.
4. **Features, one route at a time** — Live View (streams.list + cards +
   HLS player + `?play=` search param), Recordings index, per-stream
   recordings (pagination + download), Client Config form, MediaMTX Global
   Config form (tabs, error badges, sticky save bar).
5. **Jobs + packaging** — crons into `apps/api/src/jobs/`, PWA statics,
   Dockerfile (§5), compose files, port Playwright suites, CI.
6. **Cutover** — move `docs/`, `examples/`, `mediamtx.yml`, README + i18n
   READMEs; carry the `docs/FEATURES.md` maintenance contract over; retire
   the old `src/` tree.

## 7. What deliberately does not change

HLS.js player logic, RHF + Zod form patterns, all shadcn components, the
messages files, the ffmpeg thumbnail command, `mediamtx.yml`, the
`examples/` recipes, the compose topology, the Playwright test intent, the
Pino-logger and centralized-env lint rules (re-enforced via
`eslint.config.mjs` here), and the `docs/FEATURES.md` contract.
