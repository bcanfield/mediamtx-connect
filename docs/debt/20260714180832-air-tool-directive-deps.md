---
id: 20260714180832
title: air-tool-directive-deps
principal: 2h
interest: +noise per dependabot/audit run
hotspot: optimal-stack-showcase/go.mod
business_capability: dev-tooling
payoff_trigger: recurring dependabot/audit noise or a version conflict between air's transitive deps and server deps
quadrant: prudent-deliberate
category: infrastructure
ai_authored: true
created: 2026-07-14
---

Pinning air via the go.mod tool directive makes the dev loop reproducible but drags hugo and ~15 other tool-only transitive deps into go.mod/go.sum (~46 lines of go.sum). They don't ship in the server binary, but they widen the audit/dependabot surface. If that noise recurs or a dep conflict appears, split dev tooling into a separate tools module. Mirrors docs/adr/0001-pin-air-via-go-mod-tool-directive.md.
