# Domain context

## Language

### Streams and paths

**Path**:
MediaMTX's namespace for one media stream — the name a publisher publishes to, and the thing a config entry can target.
_Avoid_: channel, endpoint, feed

**Stream**:
The UI's word for a runtime path. One-to-one with MediaMTX's runtime paths, ready or not — an idle stream is still a stream.
_Avoid_: camera, source (source means something else here)

**Wildcard-backed path**:
A runtime path whose settings come from a wildcard config entry (`all_others`) rather than one of its own — its `confName` differs from its `name`. The common case, not an edge case.
_Avoid_: unconfigured path, default path, orphan path

**Materialize**:
To give a wildcard-backed path a config entry of its own, so that a single key can be overridden.
_Avoid_: create path, fork path, pin path

### Config scopes

MediaMTX has three, and they are not interchangeable. See [ADR 0002](./docs/adr/0002-three-mediamtx-config-scopes.md).

**Global config**:
MediaMTX settings that apply to the server as a whole — listen addresses, logging, protocol toggles.
_Avoid_: config, server config, settings

**Path defaults**:
The settings every path inherits unless it overrides them. Where `record` lives.
_Avoid_: pathdefaults, defaults, global recording settings

**Path config**:
One path's own settings, stored sparsely — only the keys it overrides.
_Avoid_: path settings, per-path override

**Effective config**:
What a path actually runs with: its path config merged over path defaults.
_Avoid_: merged config, resolved config

### Protocols

**Source protocol**:
How a stream is published *to* MediaMTX — RTSP, RTMP, SRT.
_Avoid_: protocol (unqualified)

**Playback protocol**:
How the app consumes a stream *for viewing* — HLS or WebRTC/WHEP. Independent of source protocol; a stream published over RTSP can be played back over either.
_Avoid_: protocol (unqualified), playback mode (that's the user-facing control, not the protocol)

## Responsive breakpoint policy (2026-07-15)

Decided after a full visual pass of every view at 320/360/640/768/1024/1280/1600.

**Supported viewport range: 360–1920 CSS px.** 320 is best-effort: no horizontal
page overflow and everything stays reachable/usable, but cramped layouts and
truncated metadata are acceptable there.

**Named breakpoints in use: `sm` (640), `lg` (1024), `xl` (1280) only.**
`md` and `2xl` are deliberately unused — don't introduce them without updating
this policy. Roles:

- `< 640` — single-column mobile. Tab nav scrolls horizontally (fits fully at
  ≥360 via tighter gaps); grid-density toggle and header connection status are
  hidden; MediaMTX-config rows stack (key → help → control).
- `sm` (640) — two-column card grids; density toggle + connection status appear;
  MediaMTX-config rows switch to the `[280px | control]` grid.
- `lg` (1024) — three-column card grids; MediaMTX-config chip nav is replaced by
  the sticky section rail; ICE-server editor rows go from stacked to one-line
  (kept stacked below `lg` because the sm control column is too narrow).
- `xl` (1280) — page container cap (`max-w-7xl`) becomes visible headroom; no
  structural changes. Header and tab nav share the same `max-w-7xl` container so
  their left edge aligns with content on wide screens.

Forms use narrower centered columns (App Config ~585px) instead of breakpoints —
line length is controlled by max-width, not media queries.
