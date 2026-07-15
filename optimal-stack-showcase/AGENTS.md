# mediamtx-connect (optimal-stack monorepo)

pnpm + Turborepo monorepo housing the migrated MediaMTX Connect app: a
decoupled Vite/React SPA (`apps/web`) and Hono API (`apps/api`) share one oRPC
contract (`packages/contract`) and ship as a single Docker image where Hono
serves the SPA build. `MIGRATION.md` records how the old Next.js app maps onto
this layout.

## Commands

- `pnpm install` — install everything (workspace root only; never run npm/yarn)
- `pnpm dev` — web on :5173 (proxies `/rpc`, `/media`, `/api` → :3000), api on :3000
- `pnpm build` — builds all packages via Turborepo (cached)
- `pnpm typecheck` — `tsc --noEmit` per package
- `pnpm lint` / `pnpm lint:fix` — ESLint (`@antfu/eslint-config`, handles
  formatting too; there is no separate formatter)
- `pnpm i18n:check` — verify message-key parity across `apps/web/messages/*.json`
- `docker build -t mediamtx-connect .` — single production image

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
