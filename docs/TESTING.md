# Testing

Reference for what to test, where it lives, and which tool runs it. Update this file when a layer or convention changes.

## Layers

| Layer | Tool | Scope | Location |
|-------|------|-------|----------|
| Unit | Vitest | Pure functions, Zod schemas, fs helpers, query helpers | `*.test.ts` colocated |
| Component | Vitest + Testing Library (jsdom) | Forms, interactive components (RHF + Zod, toasts, progress) | `*.test.tsx` colocated |
| Contract | Vitest + MSW | MediaMTX HTTP client behavior (`v3/pathsList`, `v3/configGlobal*`), error paths | `src/lib/mediamtx/*.test.ts` |
| Integration | Vitest + real Prisma (temp SQLite) | Server actions, `instrumentation.ts` cron + ffmpeg spawn | `*.int.test.ts` colocated |
| E2E | Playwright | Full browser flows, byte-range MP4 streaming, accessibility | `tests/e2e/*.spec.ts` |
| Image smoke | Docker + curl in CI | `docker build` + `/api/health` against the production image | `.github/workflows/ci.yml` |

## Decision: which layer for a new feature?

- Touched a Zod schema, util, or query helper → **unit**.
- Added/changed a form, button, or interactive component → **component**.
- Added/changed a call to MediaMTX → **contract** (assert request shape + 4xx/5xx handling).
- Added/changed a server action, query that hits Prisma, or `instrumentation.ts` → **integration**.
- Added a route, navigation, byte-range, or cross-page flow → **E2E**.
- Changed `Dockerfile`, Prisma binary targets, or boot order → ensure **image smoke** still passes.

If a feature spans layers, write the lowest-cost test that proves it; only add an E2E when the value is end-to-end (routing, real HTTP, real video element).

## Commands

```bash
npm test                # vitest run (unit + component + contract + integration)
npm run test:watch      # vitest watch
npm run test:cov        # vitest run --coverage
npm run test:e2e        # playwright, headless
npm run test:e2e:dev    # playwright UI
```

## Conventions

- **Colocate** unit/component/integration tests next to the file under test (`foo.ts` → `foo.test.ts`). E2E stays in `tests/e2e/`.
- **One assertion theme per `test()`**. Multiple `expect`s are fine; multiple unrelated behaviors are not.
- **Use `userEvent`, not `fireEvent`.** Use `getByRole` over `getByTestId`. No `data-testid` unless there is no accessible alternative.
- **Mock at the boundary**, not the internals. Mock `fetch`/MediaMTX via MSW. Mock `child_process.spawn` and `node-cron` via `vi.mock`. Never mock Prisma — use a temp SQLite file.
- **Resilient E2E.** Assert "state A or state B" when both are valid (see `CONTRIBUTING.md`). Never `toHaveCount(n)` against live data.
- **No `console.*`** in tests (lint-banned project-wide). Use `expect` to assert; failures speak for themselves.
- **Determinism.** Fake timers for cron/retention. Fixed `Date.now()` via `vi.setSystemTime` when testing timestamps. No `setTimeout` in tests.
- **Fixtures live next to the test**. Recordings/screenshots fixtures: `tests/e2e/fixtures/` or `__fixtures__/` in feature folders. No network in unit/component tests.
- **MediaMTX swagger** is the contract. When `swagger.json` changes, regen the client and re-run contract tests; failures are the signal.

## E2E projects

`playwright.config.ts` runs:

- `chromium` — primary
- `firefox`, `webkit` — catches HLS-native fallback regressions
- `mobile-chrome` (Pixel 7), `mobile-safari` (iPhone 14) — covers the responsive grid

Accessibility: `@axe-core/playwright` smoke check on `/`, `/recordings`, `/config`, `/config/mediamtx/global`. Zero serious/critical violations.

## CI gates

PRs must pass, in order:

1. `lint` + `typecheck`
2. `vitest run --coverage` — fails under threshold (see `vitest.config.ts`)
3. `build`
4. `test:e2e` (sharded across runners when wall-clock > 5 min)
5. Docker image smoke (`/api/health` returns 200 against the built image)

Coverage threshold: **80%** (lines, functions, branches, statements) — applied per-glob in `vitest.config.ts` so only files that already have tests are gated. New tests **must** add their target file's glob to `coverage.thresholds`. UI files are not gated.

Playwright traces, screenshots, and HTML report upload on failure only.

## What we explicitly don't test

- shadcn/Radix primitives (`src/components/ui/*`) — upstream's job.
- `src/lib/mediamtx/generated.ts` — auto-generated, do not edit, do not unit test.
- Visual regression of pages — flaky across OS font rendering; not worth the maintenance.
- Lighthouse / Core Web Vitals — not a stated product goal.

## Adding a layer or tool

If you add a new test layer (load testing, mutation testing, visual regression, etc.):

1. Update the **Layers** table.
2. Update the **Decision** list so contributors know when to use it.
3. Add the command to **Commands** and the gate to **CI gates** if it's required.
4. Note any explicit exclusions under **What we explicitly don't test**.
