# Architecture

MediaMTX Connect is a pnpm + Turborepo monorepo. It has a Vite + React 19 SPA (`apps/web`) and a Hono API (`apps/api`), and the two share one oRPC contract (`packages/contract`). It ships as one Docker image, where a single Node process serves the SPA build, the JSON API and media files.

What the app does is in [`FEATURES.md`](./FEATURES.md). Commands and coding rules are in [`AGENTS.md`](../AGENTS.md).

## System

```
┌──────────────────────────────── Browser (SPA) ────────────────────────────────┐
│  Live view · Recordings · Config pages            <video> players             │
│  TanStack Query + oRPC client     <img>/download   WHEP (WebRTC) │ HLS        │
└──────────┬────────────────────────────┬───────────────────────────┼───────────┘
           │ /rpc/* typed JSON          │ /media/* binary, Range    │ straight to MediaMTX
┌──────────▼────────────────────────────▼───────────┐               │ :8889 WHEP + 8189/udp ICE
│              Hono API (:3000)                     │               │ :8888 HLS
│  oRPC router · media routes · /api/health ·       │               │
│  SPA fallback · cron jobs (ffmpeg snapshots,      │               │
│  recording thumbnails, retention)                 │               │
└──────┬──────────────┬──────────────┬──────────────┘               │
       │              │              │ HTTP :9997 Control API       │
┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼─────────────────────────────▼────────────┐
│ config.json │ │ recordings │ │ MediaMTX                                        │
│ (/data)     │ │ screenshots│ │ RTSP :8554 · RTMP :1935 · HLS :8888 ·           │
└─────────────┘ │ (shared    │ │ WebRTC :8889 + 8189/udp · SRT :8890/udp         │
                │  volumes)  │ │ snapshot cron reads RTSP; MediaMTX writes the   │
                └────────────┘ │ recordings dir Connect reads                    │
                               └──────────────────────▲──────────────────────────┘
                                                      │ publish
                                         cameras, OBS, ffmpeg, …
```

## Boundaries

- **`/rpc`: all JSON.** `packages/contract` defines every procedure once with oRPC + Zod v4. `apps/api/src/router.ts` implements it with `implement(contract)`, so a handler that drifts from the contract fails to compile. `apps/web/src/orpc.ts` wraps a `ContractRouterClient` in TanStack Query utils. There's no codegen, and native `Date` values survive the wire.
- **`/media`: binary.** Snapshots, recording thumbnails and MP4 playback/download (real HTTP Range, `?download` sets `Content-Disposition`) are plain Hono routes in `apps/api/src/media.ts`, used as `<img>`/`<video>` URLs. Thumbnails are URLs, never base64 inside list responses.
- **`/api/health`** (`apps/api/src/health.ts`) is the container healthcheck.
- **Everything else** falls through to the SPA (`apps/api/src/spa.ts`). In dev, Vite serves the SPA and proxies `/rpc`, `/media` and `/api` to the API.
- **The browser talks to MediaMTX only for live playback** (WHEP, falling back to HLS). It reads `config.json` values through the API, and never touches the filesystem or the MediaMTX Control API.
- **The API talks to MediaMTX** through `apps/api/src/mediamtx.ts`, a hand-written fetch client for the Control API. The snapshot cron also pulls a frame over RTSP with `ffmpeg`.

## Repo layout

```
apps/
├── api/src/
│   ├── server.ts          Hono app: mounts /rpc, /media, /api, SPA
│   ├── router.ts          oRPC handlers (implement(contract))
│   ├── media.ts           binary routes: snapshots, thumbnails, MP4 (Range)
│   ├── health.ts · spa.ts
│   ├── mediamtx.ts        Control API client
│   ├── recordings-fs.ts   reads the recordings directory
│   ├── jobs.ts            node-cron: snapshots, thumbnails, retention
│   ├── config-store.ts    config.json read/write + first-boot seed
│   ├── env.ts             t3-env: the only process.env access
│   └── logger.ts          Pino
└── web/
    ├── messages/          one JSON per locale; en.json is the source
    ├── public/            PWA manifest, icons
    └── src/
        ├── main.tsx       providers + TanStack Router route tree
        ├── orpc.ts        typed client + Query utils
        ├── features/      client-config, mediamtx-config, recordings, streams
        ├── components/    shared UI; ui/ holds the shadcn primitives
        ├── hooks/ · lib/  shared hooks and helpers (whep, playback, publish, logger)
        ├── i18n/          use-intl wiring
        └── test/          component-test helpers (MSW oRPC server)
packages/
├── contract/              oRPC contract + Zod schemas: the only place API shapes live
└── typescript-config/     shared tsconfig base
tests/e2e/                 Playwright, against the built server and a live MediaMTX
tests/fixtures/            seed recordings and screenshots
scripts/                   check, i18n-check, seed-fixtures, wait-for-mediamtx
examples/ · demo/          sample publishers; demo-video capture rig
```

Layout rules:
- Routes are wired in `main.tsx`; pages live in `features/<name>/<name>-page.tsx`.
- Keep feature folders flat. Promote code to `components/`, `hooks/` or `lib/` when a third caller appears.
- Use descriptive kebab-case filenames (`stream-card.tsx`, not `card.tsx`). Name hooks `use-<name>.ts` and form-local schemas `<feature>.schemas.ts`.
- No barrel `index.ts` files, except the contract package's entry.
- There are deliberately no `services/`, `repositories/`, DDD layers, or root `types/`/`constants/` folders. Colocate code with where it's used.

## Stack choices

- **tsdown bundles the API, and is required.** Node's native type stripping can't run this code: relative imports would need `.ts` extensions, and `@connect/contract` exports raw `.ts` from `node_modules`, where Node refuses to strip types. `apps/api/tsdown.config.ts` bundles `@connect/*` into `dist/server.mjs` and leaves npm deps external.
- **One version catalog.** Every third-party version lives in `pnpm-workspace.yaml` and is referenced as `catalog:`. Renovate bumps it. The TypeScript pin is explained in a comment there.
- **ESLint, not Biome.** `@antfu/eslint-config` does linting and formatting in one tool, with no Prettier.
- **No database.** The app has five settings, so it uses a Zod-validated `config.json` with atomic writes (`config-store.ts`). Env vars seed it on first boot; after that, the `/config` page owns it. If a real database ever earns its place, it goes in `packages/db`.
- **use-intl, no URL locale prefix.** See [`I18N.md`](./I18N.md).
- **Hand-rolled WHEP client.** See [ADR 0003](./adr/0003-hand-rolled-whep-client.md).

## Packaging

The `Dockerfile` runs `turbo prune --docker`, then `pnpm install` with a BuildKit store cache, `turbo build`, and `pnpm deploy --legacy --prod` into a self-contained `/prod/api`. The SPA build is copied to `apps/api/public`. `serveStatic` resolves that path from `import.meta.url`, not the working directory, because the image makes no working-directory guarantee.

The runtime image is `node:24-bookworm-slim` plus Debian's `ffmpeg`, not distroless. The app shells out to ffmpeg for snapshots and thumbnails. A distro package is easier to trust than a 70 MB `ffmpeg-static` binary, and a shell is there when something breaks. The healthcheck uses `node -e "fetch(...)"`, so curl isn't needed. `/recordings`, `/screenshots` and `/data` are mount points.

## Responsive policy

The supported viewport range is **360–1920 CSS px**. At 320 px there's no horizontal overflow and everything stays reachable, but it can look cramped. Only `sm` (640), `lg` (1024) and `xl` (1280) are used. `md` and `2xl` are deliberately unused; update this section before introducing them.

- **Below 640:** single column. The tab nav scrolls horizontally, the density toggle and header connection status are hidden, and MediaMTX config rows stack (key → help → control).
- **`sm`:** two-column card grids. The density toggle and connection status appear, and config rows switch to a `[280px | control]` grid.
- **`lg`:** three-column card grids. The sticky section rail replaces the config chip nav, and ICE-server editor rows go to one line.
- **`xl`:** the densest grid setting gets a fourth column, and the `max-w-7xl` page container has visible headroom. The header shares that container so edges align.

Forms use narrow centered columns (about 585 px for app config) instead of breakpoints.
