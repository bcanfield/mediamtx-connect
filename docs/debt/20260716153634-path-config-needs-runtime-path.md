---
id: 20260716153634
title: path-config-needs-runtime-path
principal: 4h
interest: +1 confusing dead-end per operator who opens path config for a stream that stopped publishing
hotspot: apps/api/src/router.ts (getPathConfig), apps/web/src/features/mediamtx-config/path-config-page.tsx
business_capability: mediamtx-config
payoff_trigger: first operator opens path config for an idle stream and reports the Invalid Config error, or the route gains an entry point that isn't a live stream card
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-16
---

getPathConfig resolves a path's confName from /v3/paths/get/<name>, which only knows paths that exist at runtime. For a wildcard-backed stream that isn't currently publishing, that 404s, the handler falls back to the path's own name, that entry 404s too, and the page renders the generic "Invalid Config" message instead of the stream's inherited settings.

This is inherent to the API rather than an oversight: MediaMTX won't say which wildcard entry (all_others) would match a name that has no runtime path, so effective config for a stopped wildcard-backed path can't be resolved without reimplementing MediaMTX's own regex matching against config/paths/list. Ticket 02 scoped the route to streams reached from their card, which are always at runtime, so the gap isn't reachable through the intended entry point. The cost is the wrong message on a URL an operator can still type or bookmark: "Invalid Config" reads as a broken app, not "this stream isn't running".
