---
id: 20260715151753
title: env-paths-relative-to-apps-api
principal: 2h
interest: +15min/dev tripped by paths landing under apps/api; every new doc needs the ../../ caveat
hotspot: apps/api/src/env.ts
business_capability: config
payoff_trigger: Next time a relative path lands in the wrong place, or a third doc/script needs the ../../ caveat spelled out
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-15
---

Relative values for DATA_DIR / MEDIAMTX_RECORDINGS_DIR / MEDIAMTX_SCREENSHOTS_DIR resolve against the api's cwd (apps/api, where turbo and the pnpm scripts run it), not the repo root — so .env must say ../../test-data/... while playwright.config.ts and CI, which run from the root, say ./test-data/... for the same directory. This turn documented the trap in three places (.env.example header, an env.ts comment, docs/FEATURES.md) and fixed a docs/STACK.md example that had it wrong, rather than fixing it structurally. The considered alternative — resolving relative paths against the repo root inside env.ts — was rejected as magic under CLAUDE.md's boring-over-clever rule, but it means the same string means two different directories depending on who launches the process. Observed symptom: a stray empty apps/api/test-data/{recordings,screenshots} tree, created because the stored config.json held root-relative paths that the api reinterpreted from apps/api.
