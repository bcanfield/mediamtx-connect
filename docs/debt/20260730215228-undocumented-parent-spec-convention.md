---
id: 20260730215228
title: undocumented-parent-spec-convention
principal: 2h
interest: +15min per decomposition, and one dangling ADR citation already shipped
hotspot: docs/agents/, docs/adr/
business_capability: planning
payoff_trigger: a third parent spec is created, or a child ticket fails because the agent did not inherit the parent's context
quadrant: prudent-deliberate
category: documentation
ai_authored: true
created: 2026-07-30
---

The parent-spec decomposition pattern — an issue too big for one agent run is banner-marked "not a unit of work / do not label ready-for-agent" and cut into children that each carry a `Spec: #N` line — is now load-bearing for nine issues (#291–#296 from #175, #304–#306 from #214) but is documented nowhere. The smallhours implement stage relies on that line to give a child ticket the parent's full context.

It has already produced one observed symptom: #175's body cited "ADR 0006" as the convention's source, but 0006 is the pnpm-11 trust exception and no such ADR was ever written. The dangling reference was removed on 2026-07-30 rather than backfilled, because whether the convention is worth an ADR is itself undecided — two credible alternatives exist (a real ADR under docs/adr/, versus a paragraph in docs/agents/issue-tracker.md, which is where the tracker conventions already live).

Deferred deliberately: the convention has worked twice and the cost of writing it up now is higher than the cost of a third reader inferring it from #175.
