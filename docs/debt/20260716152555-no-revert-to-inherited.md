---
id: 20260716152555
title: no-revert-to-inherited
principal: 1d
interest: +1 raw MediaMTX API call per operator who wants a per-path override gone
hotspot: apps/web/src/features/mediamtx-config/path-config-page.tsx, apps/api/src/router.ts (updatePathConfig)
business_capability: mediamtx-config
payoff_trigger: first operator asks how to undo a per-path override, or ticket 04's card record toggle starts materializing entries from the grid at a higher rate
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-16
---

Saving any change to a wildcard-backed stream materializes a permanent config entry under its own name, and nothing in the UI deletes that entry to return the path to tracking its wildcard (all_others). The path-config route was scoped to read + override only; materializing is one-way from the app's side. The e2e test has to call config/paths/delete over raw HTTP to clean up after itself — the app itself cannot undo what a single save does, which is the clearest symptom that the affordance is missing.

ADR 0002 accepted the consequence (the set of configured paths grows through normal UI use, and config/paths/list stops being a proxy for "paths the operator configured by hand") but didn't give the operator a way back. The cost lands on whoever tweaks one key on one stream and then wants pure inheritance again: today that means hand-calling the MediaMTX API.

**Resolved (2026-07-28, issue 208).** The per-path page carries a "Revert to inherited" header action, rendered only once the path has a config entry of its own; behind a confirm dialog it calls `config.mediamtx.deletePathConfig` → `v3/config/paths/delete`, and the path goes back to tracking its wildcard. The form is keyed on `confName` so it remounts on the inherited values instead of keeping the deleted ones. `tests/e2e/path-config.spec.ts` reverts through the page and no longer needs the raw-HTTP `afterEach` cleanup at all. One thing this does not cover: the *card's* record toggle also materializes an entry, and the grid has no revert affordance, so `record-toggle.spec.ts` keeps its own raw `config/paths/delete` cleanup.
