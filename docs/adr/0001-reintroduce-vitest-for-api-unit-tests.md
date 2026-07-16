# 0001 — Reintroduce Vitest for api unit tests

**Date:** 2026-07-16
**Status:** Accepted

## Context

The Next.js → Vite/Hono migration dropped the old Vitest layers (they targeted Prisma, server actions, and `instrumentation.ts`), leaving Playwright E2E plus a Docker image smoke test as the only behavioral gates. `docs/debt/20260714231521-vitest-layers-not-ported.md` tracks this, and `docs/TESTING.md` named Vitest as the intended replacement without one being installed.

The live snapshot cron added in `apps/api/src/jobs.ts` forced the issue. Its risky logic is invisible to a browser: it spawns one `ffmpeg` per ready stream, writes via tmp+rename so `/latest` never serves a half-written PNG, arms a 15s SIGKILL for stalled cameras, and parses an RTSP port out of MediaMTX's `rtspAddress`. E2E can only observe that a PNG eventually appears — it cannot assert that the tmp file is discarded on a non-zero exit, or that a hung ffmpeg is killed rather than accumulating every 30s. Both failures are silent in production, which is the same class of silent failure that let MediaMTX record to a directory nothing read for 2.5 hours.

## Decision

Add Vitest (catalog `^4.1.10`) as a devDependency of `apps/api`, with tests colocated as `src/*.test.ts`, a `test` task in `turbo.json`, a root `pnpm test`, and a CI step ahead of `Build`. No `vitest.config.ts` — the defaults (node environment, `**/*.test.ts`, `dist` excluded) are already what we want.

Scope is deliberately narrow: `jobs.ts` only. The rest of the debt entry (contract schemas, `recordings-fs.ts`, `config-store.ts`, `media.ts` range logic, RHF forms) stays open.

## Consequences

- Cron logic that E2E structurally cannot reach is now gated in CI; the suite runs in ~190ms.
- Each test was verified to fail against a mutated source before being accepted, so the suite is known to have teeth.
- A second test tool means two commands, two configs to keep current, and a judgment call per change about which layer to use — `docs/TESTING.md` now carries that decision table.
- Vitest pulls in Vite as a peer. The api is built with tsdown and has no Vite dependency otherwise, so this is new surface for a package that didn't need it.

## Alternatives

- **`node:test` + `node:assert`** — zero new dependencies, and Node 24 supports mocking and fake timers. Rejected: `docs/TESTING.md` already named Vitest, the repo already runs Vite for `apps/web`, and `vi.mock` module-factory mocking is materially better than `node:test`'s loader story for replacing `./config-store` and `node:child_process`.
- **Leave it to E2E** — no new tooling. Rejected: E2E cannot observe a discarded tmp file or a SIGKILL'd process; these behaviors are only reachable by faking timers and spawning.

## Payoff trigger

None — this is not deferred work. The remaining uncovered modules stay tracked in `docs/debt/20260714231521-vitest-layers-not-ported.md`.
