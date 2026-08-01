---
id: 20260731210242
title: verify-gate-pnpm-pin-duplicated
principal: 15m
interest: +1 unchecked agent branch per drift — the gate runs the wrong pnpm and the failure reads as a code defect
hotspot: .smallhours.yml, package.json
business_capability: unknown
payoff_trigger: smallhours can source the agent's own shell environment (its ADR 0011 lists Claude Code's shell-snapshots as the rejected-but-faithful option) — then drop the npx wrapper for a bare `pnpm verify`
quadrant: prudent-deliberate
category: infrastructure
ai_authored: true
created: 2026-07-31
---

`.smallhours.yml`'s verify command hardcodes `npx --yes pnpm@11.17.0`, duplicating the version already pinned in `package.json`'s `packageManager`. Renovate bumps `packageManager` and will not touch `.smallhours.yml`, so after the next pnpm bump the gate silently runs the old pnpm against a lockfile the new one resolved.

It is a workaround for an environment boundary, not a repo defect. The smallhours verify gate runs the consumer command in a shell it starts itself; Claude Code's Bash tool keeps one persistent shell per session, so any PATH the agent establishes lives in that process and is written to no file another shell can read. smallhours v0.5.11 (upstream #29) made the gate's shell login+interactive and sourced `~/.bashrc`, which fixes toolchains whose installer appends to an rc file — issue #209's run proved ours is not one: bare `pnpm verify` came back `could not run — pnpm is not on PATH`, and the branch was pushed unchecked.

This was tried and reverted once already (471ea17 -> revert). Do not re-attempt without evidence that the gate can reach the agent's own environment.
