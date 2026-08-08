---
id: 20260714231521
title: vitest-layers-not-ported
principal: 1d
interest: unknown
hotspot: packages/contract, apps/api/src/recordings-fs.ts, apps/web
business_capability: testing
payoff_trigger: first regression an E2E test misses, or next substantial feature work in api/contract
quadrant: prudent-deliberate
category: testing
ai_authored: true
created: 2026-07-14
---

The Next.js → Vite/Hono migration dropped the old Vitest unit/component/contract/integration layers (schemas, fs helpers, forms, MSW contract tests, Prisma integration tests) because they were written against Prisma, server actions, and instrumentation.ts, which no longer exist. Only Playwright E2E + Docker image smoke remain as gates. Re-introduce Vitest for packages/contract schemas, apps/api/src/recordings-fs.ts, config-store.ts, media.ts range logic, and the RHF forms. docs/TESTING.md points here.

**Partially paid down 2026-07-16:** Vitest is installed and wired into turbo + CI (see docs/adr/0001-reintroduce-vitest-for-api-unit-tests.md), now covering 25 tests across three api modules, none of which E2E can observe:

- `jobs.ts` — the snapshot cron's tmp+rename, 15s SIGKILL, RTSP port parsing.
- `media.ts` — `/latest` resolution: live.png preference, the sorted recording-thumbnail fallback, traversal rejection.
- `config-store.ts` — atomic tmp+rename writes, schema rejection, first-boot-only seeding, and the drift warning's explicitly-set-vars-only rule.

Every test was verified to fail against a mutated source before being accepted. That pass caught a traversal test which was green for the wrong reason and would have shipped as a fake gate — treat it as required, not optional (docs/TESTING.md carries the rule).

**Range/206 paid down 2026-07-27** (see docs/adr/0005-fast-test-suite.md, change 2): `media.serving.test.ts` covers it in-process against the real fixtures — closed, open-ended and suffix ranges, 416, `?download`, and two traversal tests verified to go red with the guard removed. `health.test.ts` covers the Docker HEALTHCHECK's 200/503 split.

The claim below that "E2E does exercise it in api.spec.ts" was **false**: those tests targeted a stream named `camera1`, which does not exist in `tests/fixtures/`, so every one of them took the `else` branch and asserted a 404. The 206 assertion never ran. api.spec.ts and mediamtx.spec.ts are now deleted.

**`recordings-fs.ts` and `mediamtx.ts` paid down 2026-08-01** (#304, the baseline half of docs/adr/0004): colocated suites for the last two substantive api modules — the client's URL/method/header composition and its error mapping over a stubbed `fetch`, and the fs helpers against a real temp tree. Both were swept against 28 source mutations and no test survived all of them. What remains of this entry is packages/contract schemas.

The tooling question is settled, so what remains is writing tests rather than choosing a framework; principal drops 3d → 1d. Still uncovered: packages/contract schemas, recordings-fs.ts, and the RHF forms. The forms half is the expensive part: apps/web has no test runner at all — Vitest was added to apps/api only — so it needs a jsdom/browser-mode setup that does not exist yet.
