---
id: 20260714141714
title: broad-turbopack-ignoreissue
principal: 30m
interest: hides any real Turbopack issue in instrumentation-node.ts
hotspot: next.config.ts
business_capability: infrastructure
payoff_trigger: confirm exact Turbopack issue title from a dev run, add a title matcher to narrow the suppression
quadrant: prudent-deliberate
category: infrastructure
ai_authored: true
created: 2026-07-14
---

turbopack.ignoreIssue for **/instrumentation-node.ts is scoped by path only, with no title matcher, so it suppresses ALL Turbopack issues in that file — not just the false-positive "Node.js module not supported in the Edge Runtime" warning it was added for. A future genuine issue (e.g. module-not-found, syntax error) in that file would be silently hidden. Scoped this way because the exact Turbopack issue-title string is emitted by the Rust core and wasn't confirmed during the fix. Narrow it by adding a `title` matcher once the string is verified from a dev run.
