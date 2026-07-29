---
id: 20260728223600
title: semver-trust-exclusion
principal: 1h
interest: unknown
hotspot: pnpm-workspace.yaml
business_capability: build/release
payoff_trigger: eslint-plugin-react-hooks/@babel/core no longer pull semver@5.7.2 or @6.3.1 — verify with 'pnpm why semver', then delete the block
quadrant: prudent-deliberate
category: infrastructure
ai_authored: true
created: 2026-07-28
---

pnpm 11 re-applies `trustPolicy: no-downgrade` to every lockfile entry, not just newly resolved ones, and rejects semver@5.7.2 and semver@6.3.1 (2023 maintenance republishes with no provenance, reached via eslint-plugin-react-hooks -> @babel/core). This blocked CI on the pnpm v11 bump and blocked regenerating the lockfile for seven other dependency PRs. Resolved with a version-pinned `trustPolicyExclude` for exactly those two versions, keeping no-downgrade in force everywhere else. Mirrors ADR 0006. The exclusion self-expires once those versions leave the tree, but nothing alerts us when that happens — it needs a manual check on the next @babel/core major.
