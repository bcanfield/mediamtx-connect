---
id: 20260714175232
title: store-seam-concrete
principal: 1d
interest: unknown
hotspot: optimal-stack-showcase/internal/api/streams.go
business_capability: streams
payoff_trigger: sqlite + sqlc adapter lands — promote Store to a Go interface
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-14
---

The Store in the optimal-stack showcase is deliberately a concrete struct, not a Go interface, even though its methods are adapter-shaped (ctx in, error out, ErrExists/ErrNotFound sentinels). One adapter means a hypothetical seam; the interface keyword lands in the same change as the second (sqlite + sqlc) adapter. Mirrors optimal-stack-showcase/docs/adr/0001-store-seam-stays-concrete.md — do not extract the interface early.
