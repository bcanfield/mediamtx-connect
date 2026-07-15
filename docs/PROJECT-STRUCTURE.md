# Project Structure

A pnpm + Turborepo monorepo optimized for clarity and agent navigation. Commands and cross-package conventions live in `AGENTS.md`; this doc covers layout and naming.

## Layout

```
apps/
├── api/                          # Hono backend (Node 22, bundled with tsdown)
│   └── src/
│       ├── server.ts             # Hono app: /rpc, /media, /api/health, SPA serve
│       ├── router.ts             # oRPC handlers — implement(contract)
│       ├── media.ts              # Binary routes: screenshots, MP4s (Range)
│       ├── config-store.ts       # config.json read/write + first-boot seed
│       ├── recordings-fs.ts      # Recordings filesystem helpers
│       ├── mediamtx.ts           # Typed fetch client for the MediaMTX API
│       ├── jobs.ts               # node-cron: thumbnails + retention
│       ├── env.ts                # t3-env — the only process.env access
│       └── logger.ts             # Pino
│
└── web/                          # Vite + React 19 SPA
    ├── index.html                # Shell: theme script, manifest link
    ├── messages/                 # i18n messages, one JSON per locale
    │   ├── en.json               # Source of truth — every key lives here first
    │   └── *.json                # Mirror en.json. CI's i18n:check enforces parity.
    ├── public/                   # PWA statics: manifest, sw.js, icons
    └── src/
        ├── main.tsx              # Providers + TanStack Router route tree
        ├── orpc.ts               # Typed oRPC client + TanStack Query utils
        ├── globals.css           # Tailwind 4 + shadcn tokens
        ├── i18n/                 # use-intl wiring
        │   ├── locales.ts        # Locale list + names + detection
        │   ├── provider.tsx      # IntlProvider + locale persistence
        │   └── navigation.ts     # href-based Link/useRouter compat layer
        ├── features/             # Domain code — bulk of the app
        │   └── streams/
        │       ├── stream-card.tsx        # Flat. No components/ subfolder.
        │       ├── live-view-page.tsx     # Route component (wired in main.tsx)
        │       └── ...
        ├── components/           # Shared UI, no business logic
        │   └── ui/               # shadcn primitives (button.tsx, input.tsx)
        ├── hooks/                # Shared hooks (3+ consumers)
        └── lib/                  # utils.ts (cn), logger.ts

packages/
├── contract/                     # oRPC contract + Zod schemas — the ONLY
│   └── src/index.ts              # place API shapes are defined
└── typescript-config/            # Shared tsconfig base
```

## Rules

> **i18n is not optional.** Every user-visible string goes through `apps/web/messages/*.json` via `useTranslations`. New feature folder → new namespace in `messages/en.json`. ESLint enforces "no raw JSX literals" in `apps/web/src/features/**` and `apps/web/src/components/**`. Full policy and "add a language" workflow: `docs/I18N.md`.

1. **Routes are wired in `main.tsx`, pages live in features.** A route component imports a feature page and renders it. No business logic in the route tree.
2. **API shapes live in the contract.** Adding an endpoint means: schema + procedure in `packages/contract`, handler in `apps/api/src/router.ts`, consumption via `orpc.*` in the web app — all in one commit. Binary/streaming responses are plain Hono routes in `apps/api/src/media.ts` instead.
3. **Flat feature folders.** No `components/`, `schemas/` subdirs until a feature exceeds ~10 files.
4. **No barrel `index.ts` files** (the contract package's single entry is the exception). Import from the actual file: `from '@/features/streams/stream-card'`.
5. **Descriptive, greppable filenames.** `stream-card.tsx`, not `card.tsx`. Filename search must be useful.
6. **Promote at 3+ consumers.** Code starts in the feature that owns it. Move to `components/`, `hooks/`, or `lib/utils.ts` only when a third caller appears.
7. **One env file (`apps/api/src/env.ts`).** All `process.env` access goes through it. The web app has no env — everything flows through the API.
8. **Import workspace packages by name** (`@connect/contract`), never by relative path across package boundaries.

## Server / Client / API Boundaries

| Need                          | Use                                            |
|-------------------------------|------------------------------------------------|
| Read in the UI                | `useQuery(orpc.<ns>.<proc>.queryOptions())`    |
| Mutation from UI              | `useMutation(orpc.<ns>.<proc>.mutationOptions())` + query invalidation |
| Binary / streaming response   | Hono route in `apps/api/src/media.ts`, consumed as an `<img>`/`<video>`/fetch URL |
| Filesystem / MediaMTX access  | api-side only (`recordings-fs.ts`, `mediamtx.ts`) |

- Don't call `fetch` on JSON endpoints from the web app — the oRPC client is the only JSON path.
- Don't push binary payloads through oRPC — that's what `/media/*` is for.

## Naming

| Type                  | Pattern                | Example                   |
|-----------------------|------------------------|---------------------------|
| Component             | `kebab-case.tsx`       | `stream-card.tsx`         |
| Feature page          | `[feature]-page.tsx`   | `live-view-page.tsx`      |
| Schema (form-local)   | `[feature].schemas.ts` | `client-config.schemas.ts`|
| Hook                  | `use-[name].ts`        | `use-mobile.ts`           |
| Folder                | kebab-case             | `streams`, `recordings`   |

## Imports

```ts
// apps/web tsconfig: { "paths": { "@/*": ["./src/*"] } }
import { AppConfigSchema } from '@connect/contract' // workspace package by name
import { Button } from '@/components/ui/button'
import { StreamCard } from '@/features/streams/stream-card' // direct file
import { orpc } from '@/orpc'

// Same feature: relative
import { StreamCard } from './stream-card'
```

## What this structure deliberately omits

- Barrel `index.ts` re-exports.
- DDD layers (`domain/`, `application/`, `infrastructure/`).
- `services/`, `repositories/`, `dto/`, `controllers/`.
- Root `types/` or `constants/` folders (colocate with usage).
- A database — the app's five settings live in a Zod-validated JSON file (`apps/api/src/config-store.ts`). `packages/db` is the slot if one ever earns its way in.

## When to deviate

- **Feature exceeds ~15 files** — split into `streams/components/` etc. Don't pre-split (see `mediamtx-config/sections/` for the existing precedent).
