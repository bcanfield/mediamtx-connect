---
id: 20260715131506
title: connection-status-no-version
principal: unknown
interest: unknown
hotspot: apps/web/src/components/connection-status.tsx
business_capability: app-shell
payoff_trigger: none — wontfix; MediaMTX exposes no version over its API (see correction)
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-15
---

The header connection status shows only the dot + "connected"/"offline"; the design mock shows "connected · v1.9" with the MediaMTX server version. The contract's streams.list/health procedures expose no version field, so the version segment was dropped rather than faked.

**Correction (2026-07-16, verified against the live v1.19.2 API) — resolved as wontfix.** The original payoff trigger ("wrapping a MediaMTX endpoint that reports the server version") waits on an endpoint that does not exist. Probed on the running 1.19.2 container: `GET /v3/version` → 404; `GET /v3/config/global/get` contains no key matching `version`; the HTTP `Server` header is the bare string `mediamtx` with no version; the metrics listener is not exposed (and Prometheus build-info would be a scrape target, not an app-facing API). The design mock specified data MediaMTX does not publish.

Decided 2026-07-16: drop the version segment permanently. The status stays dot + "connected"/"offline". Rejected alternatives: sourcing the version app-side from the Docker image tag (lies whenever `remoteMediaMtxUrl` points at a server we didn't build — see `20260715151742-mediamtx-url-container-default.md`), and scraping MediaMTX's startup log line (unavailable for remote servers, and the bespoke cleverness `CLAUDE.md` bans). Reopen only if MediaMTX adds a version endpoint upstream.
