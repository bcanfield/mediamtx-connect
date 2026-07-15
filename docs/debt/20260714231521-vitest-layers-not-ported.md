---
id: 20260714231521
title: vitest-layers-not-ported
principal: 3d
interest: unknown
hotspot: packages/contract, apps/api/src
business_capability: testing
payoff_trigger: first regression an E2E test misses, or next substantial feature work in api/contract
quadrant: prudent-deliberate
category: testing
ai_authored: true
created: 2026-07-14
---

The Next.js → Vite/Hono migration dropped the old Vitest unit/component/contract/integration layers (schemas, fs helpers, forms, MSW contract tests, Prisma integration tests) because they were written against Prisma, server actions, and instrumentation.ts, which no longer exist. Only Playwright E2E + Docker image smoke remain as gates. Re-introduce Vitest for packages/contract schemas, apps/api/src/recordings-fs.ts, config-store.ts, media.ts range logic, and the RHF forms. docs/TESTING.md points here.
