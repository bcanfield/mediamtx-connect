---
id: 20260730215531
title: verify-gate-pnpm-pin-duplicated
principal: 15m
interest: +1 wasted agent run per drift — the gate runs the wrong pnpm and its failure looks like a code defect
hotspot: .smallhours.yml, package.json
business_capability: unknown
payoff_trigger: bcanfield/smallhours#29 lands — then drop the npx wrapper and return to a bare `pnpm verify`
quadrant: prudent-deliberate
category: infrastructure
ai_authored: true
created: 2026-07-30
---

`.smallhours.yml`'s verify command hardcodes `npx --yes pnpm@11.17.0`, duplicating the version already pinned in `package.json`'s `packageManager` field. Renovate bumps `packageManager` and will not touch `.smallhours.yml`, so after the next pnpm major the agent's verify gate silently runs the old pnpm against a lockfile the new one resolved — and the resulting failure reads as a code defect rather than a version skew.

It exists as a workaround for a toolkit bug, not a repo one: the smallhours verify gate runs the consumer command in a non-login `bash -c` that cannot see the PATH the agent bootstrapped pnpm onto, so a bare `pnpm verify` returned exit 127 (`command not found`) on the first live run (mediamtx-connect#300). That run then spent 31 turns and $2.22 re-entering the agent to fix code that was never broken.

Filed upstream as bcanfield/smallhours#29 with four candidate fixes. Once one lands, this duplication should disappear rather than be kept in sync.
