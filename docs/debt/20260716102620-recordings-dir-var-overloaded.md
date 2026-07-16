---
id: 20260716102620
title: recordings-dir-var-overloaded
principal: 2h
interest: +hours per incident: the failure is silent — MediaMTX records to a directory nothing reads, and the UI just shows 'no snapshot yet' forever
hotspot: docker-compose.yml, .env.example, apps/api/src/env.ts
business_capability: config
payoff_trigger: A deployer reports empty recordings with docker-compose.yml, or a third consumer needs MEDIAMTX_RECORDINGS_DIR
quadrant: prudent-deliberate
category: code_quality
ai_authored: true
created: 2026-07-16
---

MEDIAMTX_RECORDINGS_DIR carries four incompatible meanings: a path relative to the api's cwd (.env.example, for `pnpm dev`), a host bind-mount source resolved against the repo root (docker-compose*.yml), a root-relative path (playwright.config.ts, ci.yml), and a container-absolute path (docker-compose.yml's environment block, ci.yml's docker run). Verified 2026-07-16: `cp .env.example .env && pnpm dev:all` made docker compose resolve ../../test-data/recordings to /Users/<user>/Documents/test-data/recordings — outside the repo — so MediaMTX recorded where the api never looks and every stream card sat on "no snapshot yet". docker-compose.dev.yml was fixed by hardcoding ./test-data/recordings, and .env.example's false "Only apps/api reads this file" header was corrected (docker compose auto-reads it too). docker-compose.yml still interpolates ${MEDIAMTX_RECORDINGS_DIR:-./recordings} as a host path while overriding the same name to /recordings for the container, so a dev-shaped .env still breaks a local prod-compose run. Left alone because renaming the host-side var changes a documented deployment interface. Extends env-paths-relative-to-apps-api, which documented only the api-cwd-vs-root pair and missed compose as a third consumer.
