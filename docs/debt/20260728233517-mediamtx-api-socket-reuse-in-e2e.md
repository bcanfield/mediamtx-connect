---
id: 20260728233517
title: mediamtx-api-socket-reuse-in-e2e
principal: 2h
interest: +1 flaky e2e run per CI cycle
hotspot: tests/e2e
business_capability: CI/test suite
payoff_trigger: the next socket-hang-up failure in record-toggle, path-defaults or path-config — promote patchGlobal's poll into a shared tests/e2e helper used by every direct MediaMTX API call
quadrant: prudent-deliberate
category: testing
ai_authored: true
created: 2026-07-28
---

MediaMTX restarts its HTTP API server on any config write (core.go closeResources ORs closeAPI with closePathManager and closeRTMPServer), dropping every pooled connection. Playwright reuses pooled sockets, so under fullyParallel any spec's config write can kill a socket another spec is about to reuse, producing "socket hang up". Fixed only in publish-urls.spec.ts, the spec that actually failed CI. record-toggle.spec.ts, path-defaults.spec.ts and path-config.spec.ts make the same direct API calls and carry the same latent flake — they just haven't lost the race yet. Left alone to avoid touching passing tests in a CI-unblocking change.
