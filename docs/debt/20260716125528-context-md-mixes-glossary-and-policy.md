---
id: 20260716125528
title: context-md-mixes-glossary-and-policy
principal: 30m
interest: unknown
hotspot: CONTEXT.md
business_capability: app-shell
payoff_trigger: next edit to the breakpoint policy, or the next time a reader treats CONTEXT.md as a spec rather than a glossary
quadrant: prudent-deliberate
category: documentation
ai_authored: true
created: 2026-07-16
---

CONTEXT.md now holds two kinds of content: a Language glossary (added 2026-07-16 from the stubbed-affordances grill — path/stream, the three MediaMTX config scopes, materialize, source vs playback protocol) and a pre-existing "Responsive breakpoint policy" section full of implementation detail (named breakpoints, px values, per-viewport layout rules).

The domain-modeling skill defines CONTEXT.md as a glossary and nothing else — "totally devoid of implementation details... not a spec, a scratch pad, or a repository for implementation decisions". The breakpoint policy predates the glossary and is a policy, not ubiquitous language.

It was left in place rather than relocated without asking, since it is someone else's deliberate work and moving it is out of scope for a grill. The fix is to relocate it (docs/PROJECT-STRUCTURE.md, or its own docs/ file) and leave CONTEXT.md as pure domain language. Symptom to watch for: a reader or agent treating CONTEXT.md as the place to record implementation decisions, because the file already models that.
