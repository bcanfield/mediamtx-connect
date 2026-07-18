---
id: 20260717102450
title: webrtc-ice-host-hardcoded-localhost
principal: 1d
interest: unknown
hotspot: mediamtx.yml
business_capability: live-view
payoff_trigger: the first deployment reached from another machine that reports WebRTC playback silently never engaging
quadrant: prudent-deliberate
category: infrastructure
ai_authored: true
created: 2026-07-17
---

`mediamtx.yml` hardcodes `webrtcAdditionalHosts: [127.0.0.1]` so WHEP works out of the box when the browser and the Docker stack share a host. Any deployment reached from another machine needs its own address there, and nothing enforces or surfaces that: MediaMTX advertises an unroutable candidate, WHEP negotiates fine, ICE times out after 8s, and the player falls back to HLS. The operator sees working video and never learns that LOW-LAT is dead. This is the same class of trap as REMOTE_MEDIAMTX_URL's `http://localhost` default (`docs/debt/20260715151742-mediamtx-url-container-default.md`), but quieter — the REMOTE_MEDIAMTX_URL version at least breaks playback visibly. A real fix is either deriving the host from REMOTE_MEDIAMTX_URL at boot or surfacing "WebRTC unreachable" in the UI rather than only in a console warning.
