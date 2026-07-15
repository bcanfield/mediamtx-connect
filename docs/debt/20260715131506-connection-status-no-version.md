---
id: 20260715131506
title: connection-status-no-version
principal: unknown
interest: unknown
hotspot: apps/web/src/components/connection-status.tsx
business_capability: app-shell
payoff_trigger: wrapping a MediaMTX endpoint that reports the server version (the mock shows 'connected · v1.9')
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-15
---

The header connection status shows only the dot + "connected"/"offline"; the design mock shows "connected · v1.9" with the MediaMTX server version. The contract's streams.list/health procedures expose no version field, so the version segment was dropped rather than faked.
