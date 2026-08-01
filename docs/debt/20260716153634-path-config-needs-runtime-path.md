---
id: 20260716153634
title: path-config-needs-runtime-path
principal: 4h
interest: +1 operator who has to hand-call the MediaMTX API to give a never-published path an entry
hotspot: apps/api/src/router.ts (getPathConfig), apps/web/src/features/mediamtx-config/path-config-page.tsx
business_capability: mediamtx-config
payoff_trigger: an operator wants to author config for a path that has never published, which needs either wildcard matching against config/paths/list or a create-entry-from-defaults flow
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-16
---

getPathConfig resolves a path's confName from /v3/paths/get/<name>, which only knows paths that exist at runtime. For a wildcard-backed stream that isn't currently publishing, that 404s, the handler falls back to the path's own name, that entry 404s too, and the page renders the generic "Invalid Config" message instead of the stream's inherited settings.

This is inherent to the API rather than an oversight: MediaMTX won't say which wildcard entry (all_others) would match a name that has no runtime path, so effective config for a stopped wildcard-backed path can't be resolved without reimplementing MediaMTX's own regex matching against config/paths/list. Ticket 02 scoped the route to streams reached from their card, which are always at runtime, so the gap isn't reachable through the intended entry point. The cost is the wrong message on a URL an operator can still type or bookmark: "Invalid Config" reads as a broken app, not "this stream isn't running".

**Misleading dead-end paid off; entry stays open (2026-08-01, issue 209).** `getPathConfig` now returns a discriminated union: `{status: 'unresolved'}` when there is no runtime path *and* no entry of the path's own, with `null` kept for "MediaMTX didn't answer" as on the other two scopes. The page reports that state as a read-only empty state — dashed-border block, no subheader, no revert, one link to path defaults — instead of "Invalid Config". The copy asserts neither of the two routes into the state, because MediaMTX can't distinguish them: a stream that stopped publishing and a name that was never a path look identical, and with a wildcard entry present any name is potentially valid. So "this stream isn't publishing" would have replaced one wrong message with a subtler one.

What this does **not** do is resolve effective config for the name — the paragraph above still stands, and reimplementing MediaMTX's wildcard matching against `config/paths/list` was deliberately out of scope. The payoff trigger is narrowed accordingly: it now fires when an operator wants to *author* config for a path that has never published, which needs either that matching or a create-entry-from-defaults flow.
