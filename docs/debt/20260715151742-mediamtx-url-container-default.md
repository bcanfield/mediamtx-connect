---
id: 20260715151742
title: mediamtx-url-container-default
principal: 30m
interest: +10min/dev chasing a connection error to a hostname that only resolves in compose
hotspot: apps/api/src/env.ts
business_capability: config
payoff_trigger: Next time the env dir-var rule is revisited, or a dev reports a confusing failure connecting to http://mediamtx in local dev
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-15
---

The three *_DIR vars now require an explicit value outside production, because their container defaults (/data, /recordings, /screenshots) only exist inside the image. BACKEND_SERVER_MEDIAMTX_URL is the same shape of problem — http://mediamtx is a compose service name that resolves nowhere else — but it still defaults unconditionally. It was left alone because it fails more legibly: a connection error surfaced in the UI, not a boot crash or a silently empty list. The result is that four container-shaped defaults in one schema now follow two different rules, which is the debt.
