# Optimal Stack Showcase

Minimal reference implementation of the mid-2026 full-stack TypeScript
monorepo: **pnpm workspaces + Turborepo**, a decoupled **Vite + React 19 +
TanStack Router** SPA and a **Hono (Node 22)** backend, connected by a shared
**oRPC contract package** (Zod v4) for end-to-end type safety — shipped as
**one distroless Docker image** where Hono serves the static frontend build.

## Layout

```
├── AGENTS.md / CLAUDE.md      agent context (CLAUDE.md imports AGENTS.md)
├── turbo.json                 task graph: build / typecheck / dev
├── eslint.config.mjs          @antfu/eslint-config (lint + format, one tool)
├── Dockerfile                 turbo prune → slim build → distroless runtime
├── apps/
│   ├── web/                   Vite SPA; dev proxies /rpc → api
│   └── api/                   Hono; mounts oRPC at /rpc, serves web dist in prod
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
```

## Single-image deploy

```sh
docker build -t showcase .
docker run -p 3000:3000 showcase
# http://localhost:3000 — SPA + API from one process, one image
```

The Dockerfile follows the reference pattern: `turbo prune --docker` for
cache-friendly layering, `pnpm install` with a BuildKit store cache mount,
`pnpm deploy --legacy --prod` for a self-contained output, and
`gcr.io/distroless/nodejs22-debian12` as the runtime (glibc end to end).

## How the type safety works

1. `packages/contract` defines procedures with `oc` + Zod (contract-first
   oRPC — this also makes an OpenAPI 3.1 spec one plugin away).
2. `apps/api/src/router.ts` implements it with `implement(contract)`; the
   compiler rejects handlers that drift from the contract.
3. `apps/web/src/orpc.ts` builds a `ContractRouterClient<typeof contract>`
   and wraps it in TanStack Query utils — inputs, outputs, and even native
   `Date` values are typed across the wire with zero codegen.

## Validated choices (and why they stay)

- **tsdown (the api bundler) is required, not optional.** Node's native
  TypeScript support can't run this code: relative imports would need explicit
  `.ts` extensions, and the just-in-time `@showcase/contract` package resolves
  through `node_modules`, where Node refuses to strip types. Turborepo's docs
  say JIT packages "rely on the application bundler to compile the package",
  and Hono's official Dockerfile ships compiled `dist/` JS — no first-party
  example of this stack runs `.ts` in production.
- **All third-party versions are centralized in the pnpm catalog**
  (`pnpm-workspace.yaml`) and referenced as `catalog:` — one place to bump,
  guaranteed consistency across apps.
- **TypeScript is 6.0.x, the official bridge to 7**: per the TypeScript repo,
  "6.0 is the final JavaScript-based release" — it errors on everything 7.0
  removes, so passing 6.0 means 7-ready (all packages also verified against
  tsc 7.0.2 directly). The blocker for 7 itself is typescript-eslint, whose
  peer range is `<6.1.0`; its 8.64 crashes outright on the TS 7 native API.
  When typescript-eslint ships 7 support, the bump is one catalog line.
- **ESLint over Biome**: `@antfu/eslint-config` covers linting and formatting
  in one tool (no Prettier), including JSON/YAML/Markdown.
- `packages/typescript-config` follows Turborepo's shared-config convention —
  it also makes `turbo prune --docker` carry the tsconfig into the image
  without hacks.

## Deliberately omitted (next steps in the reference doc)

- `packages/db` (Drizzle + Postgres/PostGIS) — the guestbook uses an
  in-memory array so the example runs with zero infrastructure.
- Vitest/Playwright, Lefthook, Changesets, Better Auth, OpenAPI handler.
