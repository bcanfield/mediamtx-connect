---
id: 20260714214209
title: showcase-in-memory-store
principal: 1d
interest: unknown
hotspot: optimal-stack-showcase/apps/api/src/router.ts
business_capability: unknown
payoff_trigger: showcase promoted beyond a demo or needs persistence
quadrant: prudent-deliberate
category: infrastructure
ai_authored: true
created: 2026-07-14
---

The optimal-stack-showcase guestbook stores entries in an in-memory array in apps/api/src/router.ts instead of the reference architecture's packages/db (Drizzle + Postgres/PostGIS). This keeps the minimal example runnable with zero infrastructure, but entries reset on every restart and there is no packages/db workspace to point at. Documented as a deliberate omission in the showcase README.
