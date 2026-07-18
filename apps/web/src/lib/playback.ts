// Playback transport preference (board 2a). MediaMTX serves the same stream
// over HLS and over WebRTC/WHEP, so the mode picks which one a card reaches
// for — it is a preference, not a guarantee. What actually plays is whatever
// connected, and the card's pill reports that rather than this.
export type PlaybackMode = 'auto' | 'low-lat' | 'compat'

/** The transport a player ended up on — the honest answer, not the request. */
export type PlaybackProtocol = 'webrtc' | 'hls'

export const PLAYBACK_MODES: PlaybackMode[] = ['auto', 'low-lat', 'compat']
export const PLAYBACK_MODE_KEY = 'playbackMode'
export const DEFAULT_PLAYBACK_MODE: PlaybackMode = 'auto'

export function isPlaybackMode(value: unknown): value is PlaybackMode {
  return PLAYBACK_MODES.includes(value as PlaybackMode)
}

export function readPlaybackMode(): PlaybackMode {
  const stored = window.localStorage.getItem(PLAYBACK_MODE_KEY)
  return isPlaybackMode(stored) ? stored : DEFAULT_PLAYBACK_MODE
}

// `remoteMediaMtxUrl` is the browser-facing origin (e.g. `http://cam.lan`) and
// the addresses are MediaMTX's port suffixes (e.g. `:8888`), so these join.
export function hlsUrlFor(remoteMediaMtxUrl: string, hlsAddress: string, streamName: string): string {
  return `${remoteMediaMtxUrl}${hlsAddress}/${encodeURIComponent(streamName)}/index.m3u8`
}

/** Null when the server publishes no WebRTC address — there is no URL to guess. */
export function whepUrlFor(
  remoteMediaMtxUrl: string,
  webrtcAddress: string | undefined,
  streamName: string,
): string | null {
  if (!remoteMediaMtxUrl || !webrtcAddress)
    return null
  return `${remoteMediaMtxUrl}${webrtcAddress}/${encodeURIComponent(streamName)}/whep`
}

/** Which transport to try first. Failing over to HLS afterwards is the player's job. */
export function resolveTransport(mode: PlaybackMode, whepUrl: string | null): PlaybackProtocol {
  if (mode === 'compat' || !whepUrl)
    return 'hls'
  return 'webrtc'
}
