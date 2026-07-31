# mediamtx-connect (optimal-stack monorepo)

pnpm + Turborepo monorepo housing the migrated MediaMTX Connect app: a
decoupled Vite/React SPA (`apps/web`) and Hono API (`apps/api`) share one oRPC
contract (`packages/contract`) and ship as a single Docker image where Hono
serves the SPA build. `MIGRATION.md` records how the old Next.js app maps onto
this layout.

## Commands

- `pnpm install` — install everything (workspace root only; never run npm/yarn)
- **`pnpm check`** — the inner loop, ~4s. Lints the changed files, typechecks the
  affected packages, runs the tests your edit can reach. Run it after every edit.
  `pnpm check --since main` scopes it to the whole branch.
- **`pnpm verify`** — the gate, ~11s warm. lint + typecheck + i18n:check + all
  tests + build, which is exactly what CI's Build job runs. Run before pushing.
- `pnpm dev` — seeds sample data into `.dev-data/`, starts MediaMTX + fake
  streams (Docker), and runs web on :5173 (proxies `/rpc`, `/media`, `/api` →
  :3000) + api on :3000. Zero config — no `.env` needed. `pnpm dev:stop` stops
  Docker.
- `pnpm build` — builds all packages via Turborepo (cached)
- `pnpm typecheck` — `tsc --noEmit` per package
- `pnpm lint` / `pnpm lint:fix` — ESLint (`@antfu/eslint-config`, handles
  formatting too; there is no separate formatter)
- `pnpm i18n:check` — verify message-key parity across `apps/web/messages/*.json`
- `pnpm test:e2e` — Playwright. **Needs `pnpm build` plus Docker MediaMTX and
  ffmpeg**; see the environment note below before reaching for it.
- `docker build -t mediamtx-connect .` — single production image

## If you are an agent running in CI

Nothing is installed for you. **Run `pnpm install` first** — it takes ~21s cold —
or `pnpm check` and `pnpm verify` will both fail on a missing binary rather than
on anything you wrote.

Your environment has **no Docker, no Playwright browsers and no ffmpeg**, and it
cannot bind a local port. So:

- `pnpm check` and `pnpm verify` are runnable and are what your work is judged on.
  `pnpm verify` runs automatically after you stop, and you are sent back to fix it
  if it fails (`verify` / `verify_reentries` in `.smallhours.yml`), so running it
  yourself first is strictly faster.
- `pnpm test:e2e` is **not** runnable here. CI owns it. Do not try to start
  MediaMTX, install browsers, or work around the sandbox.
- If an install or a check fails because a host or a write path was blocked, say
  which one in your summary. That is a gap in `.smallhours.yml`'s `sandbox:` block,
  not something to route around.

When you add a test, break the line it covers and watch it fail before moving on.
A test you have not seen fail is not a test — this repo has shipped two green-but-
vacuous suites already (`docs/adr/0005-fast-test-suite.md`).

## Structure

- `packages/contract` — oRPC contract + Zod schemas (app config, MediaMTX
  GlobalConf, streams, recordings). **The only place API shapes are defined.**
  Both apps import it as `@connect/contract`; never duplicate a schema or type
  on either side.
- `apps/api` — implements the contract (`implement(contract)` in
  `src/router.ts`); binary/streaming endpoints (screenshots, MP4s with Range
  support) live in `src/media.ts` as plain Hono routes; app settings persist
  to `$DATA_DIR/config.json` via `src/config-store.ts` (no database); ffmpeg
  thumbnail + retention crons in `src/jobs.ts`; serves the SPA from `./public`
  in production.
- `apps/web` — consumes the contract through `src/orpc.ts`
  (`ContractRouterClient` + TanStack Query utils). Never call `fetch` on API
  routes directly (the `/media/*` binary URLs are the exception — they are
  `<img>`/`<video>`/download targets). TanStack Router routes are defined in
  `src/main.tsx`; UI is shadcn/ui + Tailwind 4; i18n is `use-intl` with 30
  locales in `messages/` (locale persisted client-side, no URL prefix).
- `packages/typescript-config` — shared tsconfig base (Turborepo convention).
  Every package extends `@connect/typescript-config/base.json`; never add a
  root-level tsconfig.

## Conventions

- Import workspace packages by name (`@connect/contract`), never by relative
  path across package boundaries.
- `packages/contract` is a just-in-time package: it exports raw `.ts` and is
  compiled by each consumer. It has no build step; `apps/api` bundles it via
  tsdown `noExternal`.
- Env vars go through `apps/api/src/env.ts` (t3-env + Zod). Never read
  `process.env` elsewhere. The web app has NO env — everything flows through
  the API.
- Env vars only seed the first boot (`config.json`); afterwards the `/config`
  UI is authoritative.
- `console.*` is lint-banned outside `apps/api/src/logger.ts` (Pino) and
  `apps/web/src/lib/logger.ts`.
- User-visible strings live in `apps/web/messages/*.json` (lint-enforced — no
  hardcoded JSX literals in features/components). Forms are React Hook Form +
  Zod, with schemas imported from the contract.
- Named exports only. Zod v4 for all validation.
- Third-party versions live in the pnpm catalog (`pnpm-workspace.yaml`);
  package.json files reference them as `catalog:`. Bump versions there only,
  never inline in a package.
- TypeScript is `^6.0.3` — the final JS-based line and the official bridge to
  the native 7.0 compiler. typescript-eslint's peer range (`<6.1.0`) does not
  yet allow 7.x; bump the catalog to `^7` when it does.
- The api needs its bundle step (tsdown): Node can't run this code natively —
  relative imports are extensionless and the JIT contract package resolves
  through node_modules. Production runs plain JS (`dist/server.mjs`).
- A contract change is a breaking change for both apps at once — update
  contract, api handler, and web usage in the same commit. Typecheck enforces
  this.
- PR titles are conventional commits (`fix(streams): ...`) — `main` is
  squash-merged, so the title is the commit subject semantic-release reads. A
  non-conventional title drops the change out of the next release; CI checks
  the format. Details in `CONTRIBUTING.md`.
