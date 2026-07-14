---
id: 20260714175246
title: schema-dts-transitive-guard
principal: 1h
interest: unknown
hotspot: optimal-stack-showcase/Makefile
business_capability: streams
payoff_trigger: a CI pipeline exists for the showcase — add a make check-gen target that regenerates and git-diffs both artifacts
quadrant: prudent-deliberate
category: testing
ai_authored: true
created: 2026-07-14
---

The openapi.yaml drift test guards the Go-structs-to-contract half of the type-safety seam, but schema.d.ts freshness is only covered transitively (openapi-typescript is deterministic and make gen regenerates both). Hand-running gen-openapi without gen-types can still leave schema.d.ts stale with everything green. Accepted residual risk to keep npm out of the Go test loop.
