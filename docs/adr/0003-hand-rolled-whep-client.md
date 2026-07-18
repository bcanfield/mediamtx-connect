# 0003 — Hand-roll the WHEP client rather than take a dependency

**Date:** 2026-07-17
**Status:** Accepted

## Context

The Live View's playback-mode control (AUTO / LOW-LAT / COMPAT) shipped as a stub: it persisted a choice and logged, but every mode played the same HLS. Making LOW-LAT honest means actually playing over WebRTC, which MediaMTX already serves via WHEP at `http://host:8889/{path}/whep` — no server-side work and no new contract surface.

WHEP is a small protocol: POST an SDP offer as `application/sdp`, receive an SDP answer with a `Location` header naming the session resource, DELETE that resource on teardown. MediaMTX accepts a complete (non-trickle) offer, so the PATCH-candidates path is optional.

The camera wall is a first-class case — several cards play at once, each with its own peer connection — so whatever we pick is instantiated N times per page, not once.

## Decision

Hand-roll the client in `apps/web/src/lib/whep.ts` (~60 lines: `toIceServers`, `gatherCandidates`, `negotiateWhep`, `waitForConnected`, `closeWhepSession`). Gather ICE candidates before the POST rather than trickling over PATCH. ICE servers come from MediaMTX's own `webrtcICEServers2` in the global conf, which the contract already carries.

Every function takes its `RTCPeerConnection` and `fetch` as parameters, so the negotiation is unit-testable in node against a fake peer connection without jsdom or a live server.

## Consequences

- No dependency, and the whole exchange is readable in one screen — when MediaMTX changes its WHEP behavior, the fix is local.
- The negotiation is covered by `apps/web/src/lib/whep.test.ts` (Vitest, node env). Adding Vitest to `apps/web` is new tooling for that package; it follows the precedent and the reasoning of ADR 0001, and `docs/debt/20260714231521-vitest-layers-not-ported.md` already tracks the wider gap.
- We own the protocol edge cases we do not yet handle: no PATCH/trickle, no `If-Match` ETag, no auth header. MediaMTX needs none of them for anonymous reads today.
- Browser WebRTC quirks (Safari, Firefox) are ours to absorb rather than a maintainer's. The HLS fallback limits the blast radius: a browser we get wrong plays HLS instead of failing.

## Alternatives

- **A WHEP library from npm** (`whep-client`, `@eyevinn/whep-web-client`, etc.) — rejected: each is a wrapper over the same ~60 lines, none is broadly maintained, and all bundle trickle/auth paths MediaMTX does not need. A dependency whose source is the size of the code it replaces is not leverage.
- **MediaMTX's own embedded reader page in an `<iframe>`** — zero protocol code, and always correct by construction. Rejected: an iframe cannot report which transport connected, so the pill could not tell the truth; it cannot fall back to our HLS player; and it brings MediaMTX's own chrome into the card.

## Payoff trigger

If MediaMTX starts requiring trickle ICE for WHEP reads, or the app grows authenticated playback (`If-Match` / bearer tokens), revisit whether a maintained library now carries its weight.
