# MediaMTX Connect (new stack)

MediaMTX Connect rebuilt on the mid-2026 full-stack TypeScript monorepo:
**pnpm workspaces + Turborepo**, a decoupled **Vite + React 19 + TanStack
Router** SPA and a **Hono (Node 22)** backend, connected by a shared
**oRPC contract package** (Zod v4) for end-to-end type safety — shipped as
**one Docker image** where Hono serves the static frontend build and shells
out to ffmpeg for recording thumbnails.

Feature-for-feature port of the previous Next.js implementation — live stream
viewing (HLS), recordings browsing/playback/download, app config, and the
full MediaMTX global config editor, in 30 languages. `docs/MIGRATION.md` documents
the mapping; `docs/FEATURES.md` remains the feature
inventory.

## Layout

```
├── AGENTS.md / CLAUDE.md      agent context (CLAUDE.md imports AGENTS.md)
├── docs/MIGRATION.md          how the old Next.js app mapped onto this stack
├── turbo.json                 task graph: build / typecheck / dev
├── eslint.config.mjs          @antfu/eslint-config (lint + format, one tool)
├── Dockerfile                 turbo prune → slim build → node:22-slim + ffmpeg
├── docker-compose.yml         MediaMTX + this app, one network
├── apps/
│   ├── web/                   Vite SPA; dev proxies /rpc, /media, /api → api
│   └── api/                   Hono; oRPC at /rpc, media streaming at /media,
│                              config.json store, ffmpeg thumbnail crons
└── packages/
    ├── contract/              oRPC contract + Zod schemas (single source of truth)
    └── typescript-config/     shared tsconfig base (Turborepo convention)
```

## Quickstart

```sh
pnpm install
pnpm dev          # web http://localhost:5173, api http://localhost:3000
pnpm build        # turbo-cached build of everything
pnpm typecheck
pnpm lint
pnpm i18n:check   # message-key parity across the 30 locales
```

For local dev against a real MediaMTX with fake streams, use the dev compose
stack (`pnpm mediamtx`) and point the api at it:

```sh
# Absolute paths on purpose: turbo runs the api with a cwd of apps/api, so a
# relative ./.data here would land in apps/api/.data, not the repo root.
BACKEND_SERVER_MEDIAMTX_URL=http://127.0.0.1 \
REMOTE_MEDIAMTX_URL=http://localhost \
DATA_DIR=$PWD/.data \
MEDIAMTX_RECORDINGS_DIR=$PWD/.data/recordings \
MEDIAMTX_SCREENSHOTS_DIR=$PWD/.data/screenshots \
pnpm dev
```

Env vars seed `config.json` on first boot; afterwards the in-app `/config`
page is the source of truth.

## Single-image deploy

```sh
docker compose up -d      # MediaMTX + app
# or just the app image:
docker build -t mediamtx-connect .
docker run -p 3000:3000 mediamtx-connect
```

The Dockerfile follows the reference pattern: `turbo prune --docker` for
cache-friendly layering, `pnpm install` with a BuildKit store cache mount,
`pnpm deploy --legacy --prod` for a self-contained output. The runtime is
`node:22-bookworm-slim` + ffmpeg (the thumbnail generator) rather than
distroless — see `docs/MIGRATION.md` §5.

## How the type safety works

1. `packages/contract` defines procedures with `oc` + Zod (contract-first
   oRPC — this also makes an OpenAPI 3.1 spec one plugin away).
2. `apps/api/src/router.ts` implements it with `implement(contract)`; the
   compiler rejects handlers that drift from the contract.
3. `apps/web/src/orpc.ts` builds a `ContractRouterClient<typeof contract>`
   and wraps it in TanStack Query utils — inputs, outputs, and even native
   `Date` values (recording mtimes) are typed across the wire with zero
   codegen.

Binary payloads (thumbnails, MP4 playback/download with HTTP Range support)
deliberately bypass oRPC: they are plain Hono routes under `/media/*`.

## Validated choices (and why they stay)

- **tsdown (the api bundler) is required, not optional.** Node's native
  TypeScript support can't run this code: relative imports would need explicit
  `.ts` extensions, and the just-in-time `@connect/contract` package resolves
  through `node_modules`, where Node refuses to strip types.
- **All third-party versions are centralized in the pnpm catalog**
  (`pnpm-workspace.yaml`) and referenced as `catalog:` — one place to bump,
  guaranteed consistency across apps.
- **TypeScript is 6.0.x, the official bridge to 7** — bump the catalog to
  `^7` once typescript-eslint supports it.
- **ESLint over Biome**: `@antfu/eslint-config` covers linting and formatting
  in one tool (no Prettier), including JSON/YAML/Markdown.
- **No database.** The previous app's Prisma + SQLite held one row of five
  settings; a Zod-validated `config.json` with atomic writes replaced it.
  `packages/db` (Drizzle) is the slot if a real database ever earns its way in.
- **use-intl over next-intl**: same author, same message format, same
  `useTranslations` API — all 30 `messages/*.json` files ported unchanged.
  Locale is persisted client-side; there is no URL locale prefix (this is a
  self-hosted dashboard, SEO machinery buys nothing).
