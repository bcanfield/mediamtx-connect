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

The tooling question is settled, so what remains is writing tests rather than choosing a framework; principal drops 3d → 1d. Still uncovered: packages/contract schemas, recordings-fs.ts, media.ts's Range/206 logic (E2E does exercise it in api.spec.ts), and the RHF forms. The forms half is the expensive part: apps/web has no test runner at all — Vitest was added to apps/api only — so it needs a jsdom/browser-mode setup that does not exist yet.
