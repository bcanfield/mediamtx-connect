import { afterEach, describe, expect, it, vi } from 'vitest'

import { closeWhepSession, gatherCandidates, negotiateWhep, toIceServers, waitForConnected } from './whep'

// Enough of RTCPeerConnection for the negotiation to run in node. Only the
// members whep.ts touches are here; the rest of the interface is cast away.
function fakePc(overrides: Partial<Record<string, unknown>> = {}) {
  const listeners = new Map<string, Set<() => void>>()
  const pc = {
    iceGatheringState: 'new',
    connectionState: 'new',
    localDescription: { sdp: 'offer-sdp-with-candidates' },
    remoteDescription: null as { type: string, sdp: string } | null,
    closed: false,
    createOffer: vi.fn(async () => ({ type: 'offer', sdp: 'offer-sdp' })),
    setLocalDescription: vi.fn(async () => {}),
    setRemoteDescription: vi.fn(async (desc: { type: string, sdp: string }) => {
      pc.remoteDescription = desc
    }),
    close: vi.fn(() => {
      pc.closed = true
    }),
    addEventListener: (event: string, fn: () => void) => {
      if (!listeners.has(event))
        listeners.set(event, new Set())
      listeners.get(event)!.add(fn)
    },
    removeEventListener: (event: string, fn: () => void) => {
      listeners.get(event)?.delete(fn)
    },
    // test helper: move a state and fire the matching event
    emit: (event: string, state?: Record<string, string>) => {
      Object.assign(pc, state)
      listeners.get(event)?.forEach(fn => fn())
    },
    ...overrides,
  }
  return pc as typeof pc & RTCPeerConnection
}

function sdpResponse(sdp: string, init: ResponseInit = {}) {
  return new Response(sdp, { status: 201, ...init })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('toIceServers', () => {
  it('maps MediaMTX webrtcICEServers2 entries onto RTCIceServer', () => {
    expect(toIceServers([{ url: 'stun:stun.l.google.com:19302' }])).toEqual([
      { urls: 'stun:stun.l.google.com:19302' },
    ])
  })

  it('carries credentials through for TURN entries', () => {
    expect(toIceServers([{ url: 'turn:turn.lan:3478', username: 'u', password: 'p' }])).toEqual([
      { urls: 'turn:turn.lan:3478', username: 'u', credential: 'p' },
    ])
  })

  it('drops entries with no url rather than handing RTCPeerConnection a bad one', () => {
    expect(toIceServers([{ username: 'u' }, { url: '' }])).toEqual([])
    expect(toIceServers()).toEqual([])
  })
})

describe('gatherCandidates', () => {
  it('returns immediately when gathering already completed', async () => {
    const pc = fakePc({ iceGatheringState: 'complete' })
    await expect(gatherCandidates(pc, 2000)).resolves.toBeUndefined()
  })

  it('waits for gathering to complete', async () => {
    const pc = fakePc()
    const pending = gatherCandidates(pc, 2000)
    pc.emit('icegatheringstatechange', { iceGatheringState: 'complete' })
    await expect(pending).resolves.toBeUndefined()
  })

  it('gives up on timeout and offers what it has, rather than rejecting', async () => {
    vi.useFakeTimers()
    const pc = fakePc()
    const pending = gatherCandidates(pc, 2000)
    await vi.advanceTimersByTimeAsync(2000)
    await expect(pending).resolves.toBeUndefined()
  })
})

describe('negotiateWhep', () => {
  it('posts the gathered offer as application/sdp', async () => {
    const pc = fakePc({ iceGatheringState: 'complete' })
    const fetchImpl = vi.fn(async () => sdpResponse('answer-sdp'))

    await negotiateWhep(pc, 'http://cam.lan:8889/front/whep', fetchImpl as unknown as typeof fetch)

    expect(fetchImpl).toHaveBeenCalledOnce()
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('http://cam.lan:8889/front/whep')
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/sdp')
    // the local description, not the raw offer: it carries the ICE candidates
    expect(init.body).toBe('offer-sdp-with-candidates')
  })

  it('applies the response body as the answer', async () => {
    const pc = fakePc({ iceGatheringState: 'complete' })
    const fetchImpl = vi.fn(async () => sdpResponse('answer-sdp'))

    await negotiateWhep(pc, 'http://cam.lan:8889/front/whep', fetchImpl as unknown as typeof fetch)

    expect(pc.setRemoteDescription).toHaveBeenCalledWith({ type: 'answer', sdp: 'answer-sdp' })
  })

  it('resolves a relative Location against the whep url so teardown can find the session', async () => {
    const pc = fakePc({ iceGatheringState: 'complete' })
    const fetchImpl = vi.fn(async () =>
      sdpResponse('answer-sdp', { headers: { Location: '/front/whep/abc123' } }),
    )

    const resource = await negotiateWhep(pc, 'http://cam.lan:8889/front/whep', fetchImpl as unknown as typeof fetch)

    expect(resource).toBe('http://cam.lan:8889/front/whep/abc123')
  })

  it('returns no resource when the server sends no Location', async () => {
    const pc = fakePc({ iceGatheringState: 'complete' })
    const fetchImpl = vi.fn(async () => sdpResponse('answer-sdp'))

    await expect(
      negotiateWhep(pc, 'http://cam.lan:8889/front/whep', fetchImpl as unknown as typeof fetch),
    ).resolves.toBeNull()
  })

  it('throws when the server rejects the offer, so the caller can fall back', async () => {
    const pc = fakePc({ iceGatheringState: 'complete' })
    const fetchImpl = vi.fn(async () => new Response('no such path', { status: 404 }))

    await expect(
      negotiateWhep(pc, 'http://cam.lan:8889/front/whep', fetchImpl as unknown as typeof fetch),
    ).rejects.toThrow(/404/)
    expect(pc.setRemoteDescription).not.toHaveBeenCalled()
  })
})

describe('waitForConnected', () => {
  it('resolves once the peer connection reports connected', async () => {
    const pc = fakePc()
    const pending = waitForConnected(pc, 8000)
    pc.emit('connectionstatechange', { connectionState: 'connected' })
    await expect(pending).resolves.toBeUndefined()
  })

  it('returns immediately when already connected', async () => {
    const pc = fakePc({ connectionState: 'connected' })
    await expect(waitForConnected(pc, 8000)).resolves.toBeUndefined()
  })

  it('rejects when ICE fails, which is how a blocked network surfaces', async () => {
    const pc = fakePc()
    const pending = waitForConnected(pc, 8000)
    pc.emit('connectionstatechange', { connectionState: 'failed' })
    await expect(pending).rejects.toThrow(/failed/)
  })

  it('rejects on timeout, so a silently stalled connection cannot hang the card', async () => {
    vi.useFakeTimers()
    const pc = fakePc()
    const pending = waitForConnected(pc, 8000)
    const assertion = expect(pending).rejects.toThrow(/timed out/)
    await vi.advanceTimersByTimeAsync(8000)
    await assertion
  })
})

describe('closeWhepSession', () => {
  it('deletes the session resource and closes the peer connection', async () => {
    const pc = fakePc()
    const fetchImpl = vi.fn(async () => new Response(null, { status: 200 }))

    await closeWhepSession(pc, 'http://cam.lan:8889/front/whep/abc123', fetchImpl as unknown as typeof fetch)

    expect(fetchImpl).toHaveBeenCalledWith('http://cam.lan:8889/front/whep/abc123', { method: 'DELETE' })
    expect(pc.closed).toBe(true)
  })

  it('still closes the peer connection when the DELETE fails', async () => {
    const pc = fakePc()
    const fetchImpl = vi.fn(async () => {
      throw new Error('network down')
    })

    await closeWhepSession(pc, 'http://cam.lan:8889/front/whep/abc123', fetchImpl as unknown as typeof fetch)

    expect(pc.closed).toBe(true)
  })

  it('closes the peer connection when there is no resource to delete', async () => {
    const pc = fakePc()
    const fetchImpl = vi.fn()

    await closeWhepSession(pc, null, fetchImpl as unknown as typeof fetch)

    expect(fetchImpl).not.toHaveBeenCalled()
    expect(pc.closed).toBe(true)
  })
})
