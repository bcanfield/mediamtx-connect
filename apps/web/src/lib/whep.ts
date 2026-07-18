// WHEP (WebRTC-HTTP Egress Protocol) client for MediaMTX, which serves it at
// `/{path}/whep`. Deliberately hand-rolled: the exchange is one POST and one
// DELETE, and every WHEP library on npm is heavier than the ~60 lines below.
//
// MediaMTX accepts a complete offer, so we gather ICE candidates before the
// POST rather than trickling them in over PATCH. That costs a moment of setup
// and saves the whole PATCH path.

import type { GlobalConfig } from '@connect/contract'

// The contract owns this shape (MediaMTX's `webrtcICEServers2`); don't re-declare it.
export type IceServerEntry = NonNullable<GlobalConfig['webrtcICEServers2']>[number]

/** Candidate gathering can stall behind a dead STUN server; offer what we have. */
const ICE_GATHER_TIMEOUT_MS = 2000
/** A blocked network shows up as silence, not an error. Fail so we can fall back. */
const CONNECT_TIMEOUT_MS = 8000

export function toIceServers(entries: IceServerEntry[] = []): RTCIceServer[] {
  return entries
    .filter(entry => entry.url)
    .map(entry => (entry.username
      ? { urls: entry.url!, username: entry.username, credential: entry.password ?? '' }
      : { urls: entry.url! }))
}

export function gatherCandidates(pc: RTCPeerConnection, timeoutMs = ICE_GATHER_TIMEOUT_MS): Promise<void> {
  if (pc.iceGatheringState === 'complete')
    return Promise.resolve()

  return new Promise((resolve) => {
    const listener = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    const done = () => {
      listener.abort()
      clearTimeout(timer)
      resolve()
    }
    pc.addEventListener('icegatheringstatechange', () => {
      if (pc.iceGatheringState === 'complete')
        done()
    }, { signal: listener.signal })
    timer = setTimeout(done, timeoutMs)
  })
}

/** Returns the session resource URL to DELETE on teardown, or null if the server sent none. */
export async function negotiateWhep(
  pc: RTCPeerConnection,
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  await gatherCandidates(pc)

  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/sdp' },
    // the local description, not `offer`: gathering rewrote it with candidates
    body: pc.localDescription?.sdp ?? offer.sdp,
  })

  if (!response.ok)
    throw new Error(`whep offer rejected with ${response.status}`)

  await pc.setRemoteDescription({ type: 'answer', sdp: await response.text() })

  const location = response.headers.get('Location')
  return location ? new URL(location, url).toString() : null
}

export function waitForConnected(pc: RTCPeerConnection, timeoutMs = CONNECT_TIMEOUT_MS): Promise<void> {
  if (pc.connectionState === 'connected')
    return Promise.resolve()

  return new Promise((resolve, reject) => {
    const listener = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    const settle = (error?: Error) => {
      listener.abort()
      clearTimeout(timer)
      if (error)
        reject(error)
      else
        resolve()
    }
    pc.addEventListener('connectionstatechange', () => {
      if (pc.connectionState === 'connected')
        settle()
      else if (pc.connectionState === 'failed' || pc.connectionState === 'closed')
        settle(new Error(`webrtc connection ${pc.connectionState}`))
    }, { signal: listener.signal })
    timer = setTimeout(() => settle(new Error('webrtc connection timed out')), timeoutMs)
  })
}

/** Teardown is best-effort: the peer connection closes even if MediaMTX never hears the DELETE. */
export async function closeWhepSession(
  pc: RTCPeerConnection,
  resourceUrl: string | null,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  try {
    if (resourceUrl)
      await fetchImpl(resourceUrl, { method: 'DELETE' })
  }
  catch {
    // the session times out server-side on its own
  }
  finally {
    pc.close()
  }
}
