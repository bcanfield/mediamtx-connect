# optimal-stack-showcase

pnpm + Turborepo monorepo. Decoupled Vite/React SPA (`apps/web`) and Hono API
(`apps/api`) share one oRPC contract (`packages/contract`) and ship as a single
distroless Docker image where Hono serves the SPA build.

## Commands

- `pnpm install` — install everything (workspace root only; never run npm/yarn)
- `pnpm dev` — web on :5173 (proxies `/rpc` → :3000), api on :3000
- `pnpm build` — builds all packages via Turborepo (cached)
- `pnpm typecheck` — `tsc --noEmit` per package
- `pnpm lint` / `pnpm lint:fix` — ESLint (`@antfu/eslint-config`, handles
  formatting too; there is no separate formatter)
- `docker build -t showcase .` — single production image (~190 MB)

## Structure

- `packages/contract` — oRPC contract + Zod schemas. **The only place API
  shapes are defined.** Both apps import it as `@showcase/contract`; never
  duplicate a schema or type on either side.
- `apps/api` — implements the contract (`implement(contract)` in
  `src/router.ts`), serves the SPA from `./public` in production.
- `apps/web` — consumes the contract through `src/orpc.ts`
  (`ContractRouterClient` + TanStack Query utils). Never call `fetch` on API
  routes directly.
- `packages/typescript-config` — shared tsconfig base (Turborepo convention).
  Every package extends `@showcase/typescript-config/base.json`; never add a
  root-level tsconfig.

## Conventions

- Import workspace packages by name (`@showcase/contract`), never by relative
  path across package boundaries.
- `packages/contract` is a just-in-time package: it exports raw `.ts` and is
  compiled by each consumer. It has no build step; `apps/api` bundles it via
  tsdown `noExternal`.
- Env vars go through `apps/api/src/env.ts` (t3-env + Zod). Never read
  `process.env` elsewhere.
- Named exports only. Zod v4 for all validation.
- Third-party versions live in the pnpm catalog (`pnpm-workspace.yaml`);
  package.json files reference them as `catalog:`. Bump versions there only,
  never inline in a package.
- TypeScript is `^6.0.3` — the final JS-based line and the official bridge to
  the native 7.0 compiler. typescript-eslint's peer range (`<6.1.0`) does not
  yet allow 7.x; bump the catalog to `^7` when it does. All packages are
  verified to typecheck under 7.0.2 already.
- The api needs its bundle step (tsdown): Node can't run this code natively —
  relative imports are extensionless and the JIT contract package resolves
  through node_modules, both unsupported by Node's type stripping. Production
  runs plain JS (`dist/server.mjs`), matching Hono's official deploy docs.
- A contract change is a breaking change for both apps at once — update
  contract, api handler, and web usage in the same commit. Typecheck enforces
  this.
