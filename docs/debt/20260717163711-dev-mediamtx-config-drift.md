---
id: 20260717163711
title: dev-mediamtx-config-drift
principal: 1h
interest: silent dev/prod config drift
hotspot: mediamtx.dev.yml
business_capability: dev-environment
payoff_trigger: next time mediamtx.yml base settings (api/hls/webrtc/pathDefaults) change
quadrant: prudent-deliberate
category: infrastructure
ai_authored: true
created: 2026-07-17
---

mediamtx.dev.yml duplicates the base settings (api, hls, webrtc, webrtcAdditionalHosts, pathDefaults) of the shipped mediamtx.yml, then adds a diverse runOnInit/runOnDemand stream fleet on top. If prod mediamtx.yml gains or changes a base setting (new port, auth change, record path), the dev config can silently drift out of sync. Chosen deliberately: a separate dev-only config is the clean way to add dev-only synthetic streams without polluting the shipped config, and MediaMTX has no include/merge mechanism to share a base. Symptom to watch: dev behaving differently from prod for anything not stream-related.
