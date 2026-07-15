---
id: 20260714220335
title: typescript-6-bridge-pin
principal: 1h
interest: unknown
hotspot: optimal-stack-showcase/pnpm-workspace.yaml
business_capability: unknown
payoff_trigger: typescript-eslint ships TS 7 support (issue typescript-eslint#10940 closes / peer range allows >=7)
quadrant: prudent-deliberate
category: migration
ai_authored: true
created: 2026-07-14
---

The showcase pins TypeScript to ^6.0.3 (the final JS-based bridge release) in the pnpm catalog instead of latest (7.0.2) because typescript-eslint caps its typescript peer at <6.1.0 on both latest and canary, and its TS 7 work is open and labeled "blocked by external API" (typescript-eslint#10940). All packages are verified to typecheck under tsc 7.0.2, so the eventual bump is a one-line catalog change. Documented in AGENTS.md and README.
