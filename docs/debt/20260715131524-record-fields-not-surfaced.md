---
id: 20260715131524
title: record-fields-not-surfaced
principal: unknown
interest: unknown
hotspot: packages/contract/src/index.ts, apps/web/src/features/mediamtx-config/sections.ts
business_capability: mediamtx-config
payoff_trigger: first user confused by the 'Enable recording' CTA landing on a page with no record toggle
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-15
---

The MediaMTX record* global fields (record, recordPath, recordFormat, recordPartDuration, recordSegmentDuration, recordDeleteAfter) exist in GlobalConfigSchema but are surfaced in no section — the design pins exactly 8 rail sections with no Recording section, yet the recordings empty-state CTA "Enable recording" links to /config/mediamtx/global. Either a 9th section is needed (design deviation) or the CTA needs a different target.

**Correction (2026-07-15, verified against the live v1.19.2 API):** a 9th section over the existing getGlobal/updateGlobal procedures will not work. `GET /v3/config/global/get` returns 119 keys and no `record*` at all — they live in `GET /v3/config/pathdefaults/get`. `PATCH /v3/config/global/patch` still *accepts* `record` (a bad type yields a Go bool unmarshal error, not an unknown-field error), so it is a write path that never reads back: the contract declares record* on GlobalConfigSchema as `.optional()`, so global/get silently resolves them to `undefined` and the form would always render empty. Surfacing these fields means wrapping `/v3/config/pathdefaults/{get,patch}` as a new contract surface + handler, not just a new sections.ts descriptor. Overlaps with the mediamtx-schema-version-lag entry (schema mirrors v1.11.3; the image ships 1.19.2).

**Resolved 2026-07-16 by `docs/adr/0002-three-mediamtx-config-scopes.md`.** The open question this entry poses — 9th section (design deviation) or a different CTA target — is answered: neither. Path defaults get their own scope and route (`/config/mediamtx/path-defaults`, sibling to `/config/mediamtx/paths/$name`), the `record*` keys move off `GlobalConfigSchema` onto a new pathdefaults surface, and the CTA points at the defaults route. A ninth section was rejected for modelling path-scoped data as server-scoped.

Two further findings from the same 2026-07-16 probe: `pathdefaults.record` is `true` in the dev setup, so the "Enable recording" CTA currently offers to enable something already enabled, and the stream card's hard-wired `OFF` is actively false rather than merely absent. The entry stays open until the pathdefaults surface ships.
