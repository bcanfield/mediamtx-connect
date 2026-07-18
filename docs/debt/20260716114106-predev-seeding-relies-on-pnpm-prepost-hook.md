---
id: 20260716114106
title: predev-seeding-relies-on-pnpm-prepost-hook
principal: 30m
interest: silent: empty recordings read as a broken feature, not skipped seeding
hotspot: package.json, scripts/seed-fixtures.mjs
business_capability: dev-environment
payoff_trigger: a contributor reports empty recordings on a fresh pnpm dev, or we adopt a pnpm config that disables pre/post scripts
quadrant: prudent-deliberate
category: infrastructure
ai_authored: true
created: 2026-07-16
---

Fixture seeding for `pnpm dev` is wired as a `predev` npm lifecycle script (root package.json) that runs scripts/seed-fixtures.mjs. This assumes pnpm's enable-pre-post-scripts is on (its default). If a contributor disables pre/post scripts, `pnpm dev` boots with an empty .dev-data/recordings and no error — the Recordings page shows its empty state, which reads as "feature broken" rather than "seeding skipped". Deferred an explicit seeding step (or folding the seed into the dev command chain) in favor of the conventional predev hook.
