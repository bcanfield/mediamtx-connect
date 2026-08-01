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

**Resolved (2026-08-01, issue 212).** Neither of the two fixes this entry proposed. `REMOTE_MEDIAMTX_HOST` is now the single compose knob for "the address browsers use to reach this stack" (default `127.0.0.1`), feeding `MTX_WEBRTCADDITIONALHOSTS` on the `mediamtx` service and `REMOTE_MEDIAMTX_URL` on `mediamtx-connect`. One knob, not two, because this entry and the `REMOTE_MEDIAMTX_URL` trap it compares itself to are the same root cause with the same remedy — setting one and not the other *is* the silent half-configured state. `MTX_PARAMNAME` is MediaMTX's own env override, so this consumes a MediaMTX primitive instead of adding app machinery.

Deriving the host from `REMOTE_MEDIAMTX_URL` at boot was rejected: the app would be overwriting a MediaMTX config key an operator can also edit in our own `/config/mediamtx/global`, with no record of who won; it reverts whenever the mediamtx container restarts without us; and it is simply wrong when `remoteMediaMtxUrl` is a DNS name behind a proxy that terminates on a different host than the one serving ICE.

`webrtcAdditionalHosts` had to be commented out in both `mediamtx.yml` and `mediamtx.dev.yml`, not left live. An env override always beats the config file, so a live key plus a compose default means an operator who edits the sample config and restarts is silently overridden by a value they never saw — a worse bug than this one, and ours. Leaving compose's default empty doesn't help: compose still passes an empty string and MediaMTX reads that as an empty list. The cost is an accepted regression — a bare `docker run` mounting our sample config without our compose advertises no host and loses localhost WHEP until the line is uncommented.

What this does **not** do is the entry's second option: nothing yet surfaces "MediaMTX is advertising only loopback" in the UI. That is split out as its own issue (a live-view banner).
