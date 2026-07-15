# Ideas: Protocols & Sources

> **Status: ideas, not implemented.** Brainstorm only — nothing in this file is shipped. Shipped features live in [`docs/FEATURES.md`](../FEATURES.md). See [`00-index.md`](./00-index.md) for context.

MediaMTX is fundamentally a multi-protocol media router: every path can be sourced from a dozen URL schemes (`rtsp://`, `rtmp://`, `srt://`, `whep://`, `udp+mpegts://`, `rpiCamera`, etc.) and consumed via just as many reader protocols (RTSP, RTSPS, RTMP, RTMPS, HLS, LL-HLS, WebRTC/WHEP, SRT, MPEG-TS over UDP). Today MediaMTX Connect only edits the global server config and plays HLS — it has no UI surface for the per-path source/publisher/reader topology, codec health, on-demand lifecycle, or the dozens of `rpiCamera*` knobs. This document brainstorms UI features that close that gap, organized by the categories the user defined. Every idea cites the concrete MediaMTX building block (config key, API endpoint, or protocol) it relies on.

## Stream ingest & publishing helpers

- **Per-path "Publish to this stream" panel** — A side sheet on each stream card that shows ready-to-paste publish URLs for every enabled protocol, derived from the active server config (`rtsp://host:8554/<path>`, `rtmp://host:1935/<path>`, `srt://host:8890?streamid=publish:<path>`, `http://host:8889/<path>/whip`). Uses `v3/configGlobalGet` to read live ports (`rtspAddress`, `rtmpAddress`, `srtAddress`, `webrtcAddress`).
- **Copy-to-clipboard with one-click protocol toggle** — Tabs across RTSP / RTSPS / RTMP / RTMPS / SRT / WHIP, each with a copy button and a host override field (so an operator on a LAN can swap `localhost` for the public hostname). Backed by `rtspEncryption`, `rtmpEncryption`, and `webrtc` enable flags.
- **OBS Studio recipe generator** — A pre-filled OBS "Custom" service form: server URL + stream key already split correctly for RTMP (`rtmp://host:1935/` + `<path>`) or WHIP (`http://host:8889/<path>/whip`). Citation: `RTMP`, `WHIP` ingest endpoints.
- **FFmpeg snippet generator** — Renders the canonical `ffmpeg -re -i <input> -c copy -f rtsp <url>` (and the RTMP / SRT / MPEG-TS / WHIP equivalents) with the path substituted, plus a "Copy as shell" / "Copy as Docker run" affordance. Citation: source kind `publisher`.
- **GStreamer pipeline generator** — Mirror of the FFmpeg generator producing `gst-launch-1.0 ... ! rtspclientsink location=<url>` and SRT/WHIP equivalents. Citation: source kind `publisher`.
- **Mobile RTMP app preset** — Pre-formatted "URL" + "Stream key" pair sized for Larix/Streamlabs/Prism Live where the apps split server vs. key. Citation: `rtmpAddress`.
- **Validity check before showing a URL** — Hide the RTMPS tab if `rtmpEncryption: no`, hide WHIP if `webrtc: false`, etc., so operators never copy a URL that won't work. Citation: `rtsp`, `rtmp`, `srt`, `webrtc` enable flags.
- **HLS publish snippet** — Specifically surface `ffmpeg -f hls` ingest examples for the rare HLS-as-source case where `source: http://.../stream.m3u8`. Citation: HLS source URL scheme.
- **MPEG-TS over UDP push helper** — One-shot generator for `ffmpeg ... -f mpegts udp://host:port` with a "listen on" port input that maps directly onto a `udp+mpegts://0.0.0.0:port` source. Citation: `udp+mpegts://` source scheme.
- **Raw RTP / SDP source helper** — UI that takes an SDP file and registers a path with `source: udp+rtp://...` plus the `rtpSDP` config baked in. Citation: `rtpSDP`.

## Per-path source configuration

- **Paths catalog page** (`/config/mediamtx/paths`) — Table of every path returned by `v3/config/paths/list` with columns for source type, record on/off, on-demand on/off, and inline edit/delete. Citation: `GET /v3/config/paths/list`.
- **"Add path" wizard** — Multi-step dialog (Name → Source kind → Source-specific fields → Recording → Hooks) that POSTs to `v3/config/paths/add/{name}`. Source-kind step branches into the right sub-form (RTSP URL, RTMP URL, SRT URL, WHEP URL, redirect, rpiCamera, publisher). Citation: `POST /v3/config/paths/add/{name}`.
- **Per-path edit form** — Mirrors the global config form's tabbed layout but scoped to a single path; PATCHes via `v3/config/paths/patch/{name}`. Includes every override available in `pathDefaults`. Citation: `PATCH /v3/config/paths/patch/{name}`.
- **`pathDefaults` editor** — A separate page for default-path settings, since changing it cascades to every path; dirty-state warning explaining the blast radius. Citation: `GET/PATCH /v3/config/pathdefaults`.
- **Regex path support** — Detect tilde-prefixed names (e.g. `~^cam\d+$`) and render a "regex" badge plus a tester that lets the operator paste candidate path names and see which match. Citation: regex paths in `paths:` map.
- **Path delete with confirm + active-stream warning** — If the path currently has publishers/readers (cross-checked against `v3/paths/get/{name}`), the confirm dialog escalates to a destructive prompt. Citation: `DELETE /v3/config/paths/delete/{name}`.
- **Source URL builder for RTSP cameras** — Form fields for host, port, username, password, channel/stream profile, and transport (`automatic`/`udp`/`multicast`/`tcp`); composes the final URL and writes to `source` + `rtspTransport`. Citation: `rtspTransport`, `source: rtsp://...`.
- **Source-fingerprint pinning helper** — When the entered RTSPS / WHEPS URL has a self-signed cert, run a one-click backend probe (`openssl s_client`-equivalent) and pin the SHA-256 into `sourceFingerprint`. Citation: `sourceFingerprint`.
- **`maxReaders` slider** — Per-path "max concurrent viewers" control with explanatory copy ("0 = unlimited"). Citation: `maxReaders`.
- **`useAbsoluteTimestamp` toggle with tooltip** — Boolean Switch with a help link explaining when to enable it (e.g. archival use cases). Citation: `useAbsoluteTimestamp`.

## Codec / compatibility surfacing

- **Active codec badges on each stream card** — Read `v3/paths/get/{name}` and render a small badge row ("H264 · AAC", "AV1 · Opus") underneath the title. Citation: `v3/paths/get/{name}` `tracks` array.
- **Reader-compatibility matrix per stream** — On the stream card kebab, "Compatibility" opens a popover that shows green/yellow/red dots for HLS, LL-HLS, WebRTC, RTSP, RTMP given the current codec set (e.g. RTMP red for AV1/H265, HLS yellow for VP9). Citation: codec-protocol compatibility from MediaMTX docs.
- **Codec-mismatch warning banners** — On the live page, surface a banner like "RTMP readers can't consume H265 — switch publisher to H264" when the active codec list is incompatible with an enabled reader. Citation: `tracks` from `v3/paths/get`, RTMP codec constraints.
- **Audio-codec Opus / AAC guard** — Specifically warn HLS/LL-HLS viewers when audio is G711/G722/LPCM/MP3/AC-3 and may need transcoding upstream. Citation: HLS audio codec list.
- **MJPEG / MPEG-1/2 / MPEG-4 Video legacy badge** — Distinct visual treatment for non-HLS-compatible video codecs so operators know the live page can't play them in a browser. Citation: HLS-supported codec list.
- **Per-track detail drawer** — Click a codec badge to open a drawer showing every elementary stream from `v3/paths/get/{name}` (codec, sample rate, channels, RTP payload type). Citation: `v3/paths/get/{name}` `tracks`.

## Multi-protocol player

- **Protocol switcher on the player** — Segmented control above the `<video>` letting the viewer pick HLS, LL-HLS, WebRTC (via WHEP), or "RTSP URL" (copy-only); the active selection rebuilds the player. Citation: `hlsAddress`, `hlsVariant: lowLatency`, `webrtcAddress`.
- **WebRTC (WHEP) playback in browser** — Add a tiny WHEP client (`fetch` + `RTCPeerConnection.setRemoteDescription`) so users get sub-second latency without HLS. Citation: WHEP endpoint at `http://host:8889/<path>/whep`.
- **LL-HLS toggle and indicator** — Show whether the muxer is producing LL-HLS (from `hlsVariant`) and let the viewer flip to the variant; warn if `hlsEncryption: false` since Apple devices need HTTPS for LL-HLS. Citation: `hlsVariant`, `hlsEncryption`.
- **Latency readout** — Compute `(now - bufferEnd)` in HLS.js and show "~3.2s behind live"; for WHEP, surface `RTCPeerConnection.getStats()` `jitterBufferDelay`. Citation: HLS.js + WHEP stats.
- **Per-protocol "Open in external player" links** — Buttons that launch the system handler for `vlc://rtsp://...` (where supported) or copy the RTSP URL for VLC/ffplay. Citation: `RTSP` reader.
- **Audio-only mode** — Drop `<video>` for an `<audio>` element when only audio tracks are present (saves CPU and works for G711/Opus radio streams). Citation: `tracks` from `v3/paths/get`.

## WHIP / WHEP browser publishing

- **"Publish from this device" page** (`/publish/[path]`) — Browser-native WHIP publisher using `getUserMedia` + `RTCPeerConnection` posting an SDP to the path's WHIP endpoint. Citation: WHIP at `http://host:8889/<path>/whip`.
- **Camera / mic device pickers** — `enumerateDevices` dropdowns so the publisher can pick which webcam and which mic, with a live preview before going live. Citation: WHIP.
- **Screen-share publishing** — `getDisplayMedia` button that publishes the screen / a window / a tab as a WHIP source — useful for ad-hoc broadcasts. Citation: WHIP.
- **Resolution / framerate / bitrate constraints UI** — Sliders that map to `getUserMedia` `MediaTrackConstraints` and to `RTCRtpSender.setParameters` encodings. Citation: WHIP, codec selection.
- **Auto-create the path before publishing** — If the chosen path doesn't exist yet, POST `v3/config/paths/add/{name}` with `source: publisher` first, then start the WHIP handshake. Citation: `POST /v3/config/paths/add`.
- **Codec preference UI** — Let publisher pick H264 vs. AV1 vs. VP8/VP9 (browser permitting); show a hint that AV1 won't be RTMP-readable. Citation: WebRTC codec negotiation.

## SRT

- **SRT passphrase generator + strength meter** — "Generate" button writes a 10–79-character passphrase into both `srtPublishPassphrase` and `srtReadPassphrase`, with show/hide and a Zod-enforced length range. Citation: `srtPublishPassphrase`, `srtReadPassphrase`.
- **Stream-ID composer** — Form fields for mode (`publish`/`read`), path name, optional user, optional pass; outputs the canonical SRT stream ID `#!::r=<path>,m=<mode>,u=<user>,s=<passphrase>` with a copy button. Citation: SRT stream IDs.
- **Latency presets** — "Local LAN (120 ms)", "Internet good (500 ms)", "Internet noisy (2000 ms)", "Custom" — written into the publisher/reader URL `?latency=` parameter. Citation: SRT latency parameter.
- **SRT URL builder** — Composes `srt://host:8890?streamid=...&passphrase=...&latency=...&pkt_size=1316&mode=caller` and shows it in a copy field. Citation: `srtAddress`.
- **OBS Studio SRT preset** — Dedicated copy block that matches OBS's "Custom Service" SRT URL field. Citation: SRT.

## Raspberry Pi camera

- **`rpiCamera` source page** — Dedicated tab on the per-path edit form, only visible when `source: rpiCamera`. All knobs grouped: Sensor, Image, Exposure, Autofocus, Codec, Overlay. Citation: `rpiCamera*` keys.
- **Sensor preview tile** — Width/height/FPS inputs with a thumbnail showing what the resulting frame ratio looks like; warn when the chosen `rpiCameraMode` (`width:height:bit-depth:packing`) is invalid for the connected sensor. Citation: `rpiCameraWidth`, `rpiCameraHeight`, `rpiCameraFPS`, `rpiCameraMode`.
- **Image controls** — Sliders for brightness `[-1,1]`, contrast `[0,16]`, saturation, sharpness, EV `[-10,10]` with live numeric readouts. Citation: `rpiCameraBrightness`, `rpiCameraContrast`, `rpiCameraSaturation`, `rpiCameraSharpness`, `rpiCameraEV`.
- **Exposure mode picker** — Radio group (`normal` / `short` / `long` / `custom`); when `custom`, reveal `rpiCameraShutter` (microseconds) and `rpiCameraGain`. Citation: `rpiCameraExposure`, `rpiCameraShutter`, `rpiCameraGain`.
- **AWB picker** — Dropdown (`auto`, `incandescent`, `tungsten`, `fluorescent`, `indoor`, `daylight`, `cloudy`, `custom`); custom reveals `rpiCameraAWBGains` `[red, blue]`. Citation: `rpiCameraAWB`, `rpiCameraAWBGains`.
- **Autofocus controls** — Mode (`auto`/`manual`/`continuous`), Range (`normal`/`macro`/`full`), Speed; manual mode reveals `rpiCameraLensPosition` mapped through the `1/value` distance formula and a `rpiCameraAfWindow` ROI picker. Citation: `rpiCameraAfMode`, `rpiCameraAfRange`, `rpiCameraAfSpeed`, `rpiCameraLensPosition`, `rpiCameraAfWindow`.
- **ROI picker** — Drag-on-image rectangle that writes to `rpiCameraROI` as four normalized floats. Citation: `rpiCameraROI`.
- **Codec picker** — `auto` / `hardwareH264` / `softwareH264` / `mjpeg` radios; each reveals only its own knobs (HW/SW H264 profile/level + bitrate + IDR period vs. MJPEG quality). Citation: `rpiCameraCodec`, `rpiCameraIDRPeriod`, `rpiCameraBitrate`, `rpiCameraHardwareH264Profile`, `rpiCameraHardwareH264Level`, `rpiCameraSoftwareH264Profile`, `rpiCameraSoftwareH264Level`, `rpiCameraMJPEGQuality`.
- **HDR + flip toggles** — Switches for `rpiCameraHDR`, `rpiCameraHFlip`, `rpiCameraVFlip`; HDR shows a "Camera Module 3 only" hint. Citation: `rpiCameraHDR`, `rpiCameraHFlip`, `rpiCameraVFlip`.
- **Text overlay editor** — Toggle plus a `strftime` cheat sheet (`%Y-%m-%d %H:%M:%S`) for `rpiCameraTextOverlay`, with a live-preview frame. Citation: `rpiCameraTextOverlayEnable`, `rpiCameraTextOverlay`.
- **Tuning file uploader** — File input that sets `rpiCameraTuningFile` to a server-stored path; useful for IMX477 / NoIR. Citation: `rpiCameraTuningFile`.
- **Multi-camera CamID picker** — Dropdown populated from a server probe; supports the dual-camera CM4 case via `rpiCameraCamID` and pairs with a `rpiCameraSecondary` toggle. Citation: `rpiCameraCamID`, `rpiCameraSecondary`.
- **Flicker-correction picker** — Helper that converts "50 Hz mains" / "60 Hz mains" / "off" into `rpiCameraFlickerPeriod` microseconds. Citation: `rpiCameraFlickerPeriod`.
- **Denoise toggle** — Select for `off` / `cdn_off` / `cdn_fast` / `cdn_hq` with explanatory tooltip. Citation: `rpiCameraDenoise`.

## Redirect / fallback / failover paths

- **Redirect-source builder** — When the operator chooses `source: redirect`, render a path-picker / RTSP-URL field that writes `sourceRedirect`. Citation: `source: redirect`, `sourceRedirect`.
- **Always-available fallback editor** — UI to enable `alwaysAvailable: true`, upload an MP4 to `alwaysAvailableFile`, or compose `alwaysAvailableTracks` (codec + sampleRate + channelCount + muLaw) so viewers see a placeholder loop when no publisher is connected. Citation: `alwaysAvailable`, `alwaysAvailableFile`, `alwaysAvailableTracks`.
- **Failover chain visualizer** — Render the redirect graph (path A → path B → external RTSP) so cycles or dead ends are visible at a glance. Citation: `sourceRedirect`.
- **"Test failover" button** — One-click action that simulates source failure (e.g. by kicking the active publisher via `POST /v3/rtspsessions/kick/{id}`) and confirms the fallback engages. Citation: `POST /v3/rtspsessions/kick/{id}`, `alwaysAvailable`.

## On-demand publishing & reading

- **Lifecycle tab in the per-path form** — One panel grouping `runOnInit`, `runOnDemand`, `runOnUnDemand`, `runOnReady`, `runOnNotReady`, `runOnRead`, `runOnUnread`, `runOnRecordSegmentCreate`, `runOnRecordSegmentComplete` with code editor inputs and the env-var cheat sheet (`MTX_PATH`, `MTX_QUERY`, `MTX_SOURCE_TYPE`, `MTX_SOURCE_ID`, `RTSP_PORT`, `G1..Gn`). Citation: `runOn*` hooks.
- **`runOnDemand` ffmpeg recipe library** — Pre-canned snippets (e.g. `ffmpeg -re -stream_loop -1 -i sample.mp4 -c copy -f rtsp rtsp://localhost:$RTSP_PORT/$MTX_PATH`) that the user can drop into `runOnDemand` with one click. Citation: `runOnDemand`.
- **`sourceOnDemand` toggle with timing fields** — Switch plus two duration inputs for `sourceOnDemandStartTimeout` and `sourceOnDemandCloseAfter`, each with explanatory copy on what the timeout means for first-viewer experience. Citation: `sourceOnDemand`, `sourceOnDemandStartTimeout`, `sourceOnDemandCloseAfter`.
- **`runOnDemandRestart` and `runOnDemandCloseAfter` controls** — Switch + duration so operators can tune flapping behavior. Citation: `runOnDemandRestart`, `runOnDemandCloseAfter`.
- **`overridePublisher` switch with "lock current publisher" UX** — Disabling it means the current publisher can't be kicked off; surface a warning when a stream is active. Citation: `overridePublisher`.
- **`runOnConnect` global command editor** — Top-level page (in Hooks tab) for the global `runOnConnect` / `runOnDisconnect` hooks. Citation: `runOnConnect`, `runOnDisconnect`.

## Embed widgets & sharing

- **"Embed this stream" dialog** — Generates an `<iframe src="https://app/embed/<path>?protocol=hls">` snippet that renders just the player, with toggles for autoplay, muted, controls, and protocol. Citation: HLS / WHEP playback.
- **`<video>` snippet for native HLS** — Alternative copy block that produces a raw `<video src="http://host:8888/<path>/index.m3u8" controls>` for users who don't want an iframe. Citation: `hlsAddress`.
- **Public read-only viewer route** — `/v/<path>` page that renders only the player chrome (no sidebar, no admin), suitable for kiosks or share links. Citation: HLS reader.
- **Share-link expiry parameter** — Append a signed `?token=...&exp=...` so embed URLs can be time-limited (uses MediaMTX `authJWT` claims for `read`). Citation: `authJWT*`, JWT `mediamtx_permissions`.
- **Embed dimensions presets** — Buttons for 16:9 720p / 1080p / square / vertical that pre-fill the iframe `width`/`height`. Citation: HLS reader.

## QR codes

- **QR code panel for every publish URL** — Renders a QR for the chosen RTSP / RTMP / SRT / WHIP URL so a phone running Larix / Prism / Streamlabs can scan it. Citation: `rtspAddress`, `rtmpAddress`, `srtAddress`, WHIP endpoint.
- **QR for read URLs (HLS / WebRTC)** — Same affordance for viewers — print on a sign, scan to watch. Citation: `hlsAddress`, `webrtcAddress`.
- **QR with embedded credentials** — Optional include-username/password in the URL so the operator doesn't have to retype on a phone keyboard; warning copy when enabled. Citation: RTSP/RTMP URL auth.
- **Bulk QR sheet** — Print-friendly page that lays out QR codes for every path on one A4/Letter sheet, useful when handing out N cameras to N field operators. Citation: `v3/config/paths/list`.

## Bandwidth / codec / resolution overlays

- **Per-card overlay chips** — Small chips on the live card showing resolution (`1920×1080`), framerate (`30 fps`), video codec, and bitrate (kbps). Resolution/framerate come from `v3/paths/get/{name}` track info; bitrate is computed client-side from HLS.js `levels[].bitrate` or WHEP `getStats()`. Citation: `v3/paths/get/{name}`, HLS.js stats.
- **Bitrate sparkline** — A 60-second mini graph in the card footer that visualizes ingress bitrate over time (sampled from the player or from MediaMTX's Prometheus `mediamtx_bytes_received`). Citation: `metrics` Prometheus output.
- **Bytes received / sent counters** — Use `v3/paths/get/{name}.bytesReceived` and `bytesSent` (where exposed) as a "data sent today" tile per stream. Citation: `v3/paths/get/{name}`.
- **Resolution-mismatch warning** — When a viewer is watching a 1080p stream on a 360p viewport, surface a "you're using more bandwidth than needed" hint linking to a per-path lower-bitrate fallback (only for sources where the operator has provided one). Citation: source `redirect`.
- **Overlay-toggle preference** — User-level Switch to globally hide / show the overlay chips. Citation: app-only.

## Snapshot capture from live view

- **"Capture snapshot" button on the player** — Writes the current frame to a PNG by drawing the `<video>` to a `<canvas>`, posts to a new `POST /api/[streamName]/snapshot` endpoint, and stores it under `<screenshotsDirectory>/<path>/manual-<ts>.png`. Citation: existing `screenshotsDirectory`.
- **Snapshot gallery per stream** — Tab on the recordings page listing manual snapshots distinct from the cron-generated thumbnails. Citation: `screenshotsDirectory`.
- **Server-side snapshot via ffmpeg** — Alternate "high-quality snapshot" action that spawns `ffmpeg -i <hls/rtsp> -frames:v 1` against the live source instead of the browser frame, useful when the browser can't decode (H265/AV1). Citation: existing ffmpeg cron pipeline.
- **Snapshot keyboard shortcut** — `S` while the player is focused triggers the capture; toast confirms with thumbnail. Citation: app-only.
- **Snapshot to clipboard** — Use the Clipboard API `navigator.clipboard.write([new ClipboardItem({'image/png': blob})])` for one-step "copy frame to chat". Citation: app-only.

## Stream health & uptime

- **"Online for" promotion** — Convert the existing `readyTime` into a live-updating "Online for 2h 13m" duration. Citation: `v3/paths/list` `readyTime`.
- **Uptime history sparkline** — Per-path 24-hour timeline of online/offline derived from `runOnReady` / `runOnNotReady` hooks writing to a small persisted table/JSON store. Citation: `runOnReady`, `runOnNotReady`.
- **MTBF tile** — Show "mean time between failures" and "last outage" on the stream card kebab. Citation: derived from `runOnReady`/`runOnNotReady` log.
- **Reader / publisher count** — Pull `bytesSent` plus `readers[]` and `source` from `v3/paths/get/{name}` to render "1 publisher · 4 readers" badges. Citation: `v3/paths/get/{name}`.
- **Connection table per protocol** — Pages that surface `v3/rtspconns/list`, `v3/rtmpconns/list`, `v3/webrtcsessions/list`, `v3/srtconns/list`, `v3/hlsmuxers/list` with kick buttons. Citation: those endpoints + corresponding `kick` POSTs.
- **Kick reader / publisher action** — Per-row destructive button calling e.g. `POST /v3/rtspsessions/kick/{id}` or `POST /v3/webrtcsessions/kick/{id}`. Citation: kick endpoints.
- **Stream-state badge on the card** — "Live" / "Idle (sourceOnDemand)" / "Always-available fallback" / "Offline" derived from `v3/paths/get` `ready`/`source` plus the `alwaysAvailable` config flag. Citation: `v3/paths/get`, `alwaysAvailable`.
- **Health alerts via webhook** — UI to register a webhook URL the app pings on `runOnNotReady` (or on a derived "down for >N seconds" rule). Citation: `runOnNotReady`.

## Other protocol-specific UI features

- **`hlsVariant` chooser surfaced on each path** — Override the global `mpegts` / `fmp4` / `lowLatency` per path (when MediaMTX adds path-scoped HLS knobs) or, in the meantime, surface the currently-active variant on each card. Citation: `hlsVariant`.
- **HLS segment-tuning panel** — Sliders for `hlsSegmentCount`, `hlsSegmentDuration`, `hlsPartDuration` with explanatory copy on the latency-vs-buffering tradeoff. Citation: `hlsSegmentCount`, `hlsSegmentDuration`, `hlsPartDuration`.
- **HLS CDN secret manager** — Generate-and-rotate UI for `hlsCDNSecret`, with a "test" button that issues a real request with `Authorization: Bearer ...`. Citation: `hlsCDNSecret`.
- **Multicast group calculator** — When `rtspTransports` includes `multicast`, surface the IP each client should join (computed from `multicastIPRange`, `multicastRTPPort`, `multicastRTCPPort`) per active path. Citation: `multicastIPRange`, `multicastRTPPort`, `multicastRTCPPort`.
- **`rtspDemuxMpegts` switch** — Per-path toggle (with a tooltip explaining "enable when an RTSP publisher pushes an MP2T elementary stream that should be demuxed for HLS/WebRTC consumers"). Citation: `rtspDemuxMpegts`.
- **`rtspAnyPort` security warning** — Switch with a destructive-styled hint ("only enable for cameras that require it; opens server-port-randomization risk"). Citation: `rtspAnyPort`.
- **`rtspRangeStart` / `rtspRangeType` chooser** — When source is RTSP and the operator wants to seek to an offset on connect, render a Date/time-picker / NPT duration input that writes the appropriate string. Citation: `rtspRangeType`, `rtspRangeStart`.
- **`whepBearerToken` field** — Password input with show/hide for WHEP-source paths. Citation: `whepBearerToken`.
- **WebRTC ICE diagnostics** — Per-WHEP-session table of selected candidate pair (host / srflx / relay) and round-trip-time, pulled from `RTCPeerConnection.getStats()`. Citation: `webrtcICEServers2`.
- **TURN / STUN tester** — Button on the WebRTC global config that issues a test ICE gather using the configured `webrtcICEServers2` and reports which server types resolved. Citation: `webrtcICEServers2`, `webrtcSTUNGatherTimeout`.
- **`webrtcAdditionalHosts` builder** — Detect the server's public IP and offer a one-click "add `<public-ip>` to advertised hosts" action. Citation: `webrtcAdditionalHosts`.
- **WebRTC TCP fallback toggle** — Switch for `webrtcLocalTCPAddress` with the docs blurb ("less efficient than UDP; enable for restrictive networks"). Citation: `webrtcLocalTCPAddress`.
- **`udpMaxPayloadSize` MTU calculator** — Slider with helper text mapping common MTU values (1500 Ethernet, 1492 PPPoE, 1280 IPv6 minimum) to the final value. Citation: `udpMaxPayloadSize`.
- **`writeQueueSize` advisor** — Numeric input with a "RAM cost ≈ N × queueSize × payloadSize" estimate, so operators understand the tradeoff. Citation: `writeQueueSize`.
- **Per-protocol "where to get a client" cheat sheet** — Sidebar of recommended apps per protocol (OBS for RTMP/WHIP, Larix for mobile RTMP/SRT, VLC for RTSP, Safari for HLS, Chrome for WHEP) so a non-expert operator knows where to start. Citation: protocol family.
