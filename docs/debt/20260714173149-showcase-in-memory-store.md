---
id: 20260714173149
title: showcase-in-memory-store
principal: 1d
interest: unknown
hotspot: optimal-stack-showcase/internal/api/streams.go
business_capability: unknown
payoff_trigger: showcase is promoted from demo to a real migration starting point
quadrant: prudent-deliberate
category: planning
ai_authored: true
created: 2026-07-14
---

The optimal-stack showcase backs its Streams API with an in-memory map, while docs/optimal-stack.md prescribes modernc.org/sqlite + sqlc for the data layer. Chosen deliberately to keep the showcase minimal (the point is the OpenAPI type seam, not persistence); handlers were shaped so a sqlc-backed store can replace the map without API changes. Documented in the showcase README under "Deliberate omissions".
