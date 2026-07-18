---
id: 20260715122210
title: mediamtx-schema-version-lag
principal: 2d
interest: unknown
hotspot: packages/contract/src/index.ts
business_capability: mediamtx-config
payoff_trigger: Next MediaMTX image bump, or a user reports a config field missing from the editor
quadrant: prudent-deliberate
category: migration
ai_authored: true
created: 2026-07-15
---

The GlobalConf schema (packages/contract/src/index.ts:19) and the hand-rolled API client (apps/api/src/mediamtx.ts:4) mirror MediaMTX v1.11.3, but docker-compose.yml ships bluenviron/mediamtx:1.19.2 — eight minor versions ahead. Config keys added between 1.11.3 and 1.19.2 are invisible to the config editor and untyped in the client. Surfaced during a docs audit: docs/FEATURES.md correctly documents both versions, so the docs disagree only because the code lags.
