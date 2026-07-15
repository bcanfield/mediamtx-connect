---
id: 20260715122224
title: readme-translations-behind-source
principal: 1d
interest: unknown
hotspot: docs/i18n/
business_capability: documentation
payoff_trigger: Next README.md content change (the guard forces a re-sync anyway), or a translation-quality report
quadrant: prudent-inadvertent
category: documentation
ai_authored: true
created: 2026-07-15
---

All 30 docs/i18n/README.*.md were bumped to the current sourceHash (49ad2132edec9881) in .translation-status.json without actually back-porting newer English sections: the multi-arch images paragraph, the -e BACKEND_SERVER_MEDIAMTX_URL docker-run line, and the entire "Configuration" env-var table are missing from at least es/de (likely all 29 non-English locales). scripts/readme-i18n-check.mjs only compares recorded hashes against the source hash, so a lockstep hash bump defeats the guard and it reports green while content is stale.
