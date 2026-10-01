import { describe, expect, it, vi } from 'vitest'

import { publishEndpoints, publishHost, publishTargets, publishUrl, readEndpoints } from './publish'

describe('publishTargets', () => {
  it('derives each protocol port from the configured listen address', () => {
    const targets = publishTargets('cam.lan', {
      rtspAddress: ':8554',
      rtmpAddress: ':1935',
      srtAddress: ':8890',
    })
    expect(targets.map(t => t.prefix)).toEqual([
      'rtsp://cam.lan:8554/',
      'rtmp://cam.lan:1935/',
      'srt://cam.lan:8890?streamid=publish:',
    ])
  })

  it('reflects a changed listen port rather than the default', () => {
    // The bug this fixes: a hardcoded port would still read 1935 here.
    const prefixes = publishTargets('cam.lan', { rtmpAddress: ':11935' }).map(t => t.prefix)
    expect(prefixes).toContain('rtmp://cam.lan:11935/')
    expect(prefixes).not.toContain('rtmp://cam.lan:1935/')
  })

  it('keeps only the port from a host-qualified address, pairing it with the browser host', () => {
    const prefixes = publishTargets('cam.lan', { rtspAddress: '0.0.0.0:8555' }).map(t => t.prefix)
    expect(prefixes).toContain('rtsp://cam.lan:8555/')
  })

  it('falls back to MediaMTX defaults when the server reports no addresses', () => {
    expect(publishTargets('cam.lan', null).map(t => t.prefix)).toEqual([
      'rtsp://cam.lan:8554/',
      'rtmp://cam.lan:1935/',
      'srt://cam.lan:8890?streamid=publish:',
    ])
  })

  it('drops a protocol the server has disabled', () => {
    const protocols = publishTargets('cam.lan', { rtmp: false }).map(t => t.protocol)
    expect(protocols).toEqual(['RTSP', 'SRT'])
  })

  it('returns nothing when every source protocol is disabled', () => {
    expect(publishTargets('cam.lan', { rtsp: false, rtmp: false, srt: false })).toEqual([])
  })

  it('keeps every protocol the server enables', () => {
    const protocols = publishTargets('cam.lan', { rtsp: true, rtmp: true, srt: true }).map(t => t.protocol)
    expect(protocols).toEqual(['RTSP', 'RTMP', 'SRT'])
  })
})

describe('publishUrl', () => {
  it('appends the stream name to each target prefix', () => {
    const urls = publishTargets('cam.lan', null).map(t => publishUrl(t, 'front'))
    expect(urls).toEqual([
      'rtsp://cam.lan:8554/front',
      'rtmp://cam.lan:1935/front',
      'srt://cam.lan:8890?streamid=publish:front',
    ])
  })
})

// The path panel's builders. `h` stands in for the browser-facing host.
const urlsOf = (endpoints: { url: string }[]) => endpoints.map(e => e.url)
const protocolsOf = (endpoints: { protocol: string }[]) => endpoints.map(e => e.protocol)

describe('publishEndpoints and readEndpoints', () => {
  it('builds every URL on MediaMTX default ports when nothing is configured', () => {
    expect(urlsOf(publishEndpoints('h', 'cam', null))).toEqual([
      'rtsp://h:8554/cam',
      'rtmp://h:1935/cam',
      'srt://h:8890?streamid=publish:cam&pkt_size=1316',
      'http://h:8889/cam/whip',
    ])
    expect(urlsOf(readEndpoints('h', 'cam', null))).toEqual([
      'rtsp://h:8554/cam',
      'rtmp://h:1935/cam',
      'srt://h:8890?streamid=read:cam',
      'http://h:8888/cam/index.m3u8',
      'http://h:8889/cam/whep',
    ])
  })

  it('carries non-default ports into every URL', () => {
    const global = {
      rtspAddress: ':18554',
      rtspsAddress: ':18322',
      rtspEncryption: 'optional',
      rtmpAddress: ':11935',
      rtmpsAddress: ':11936',
      rtmpEncryption: 'optional',
      srtAddress: ':18890',
      hlsAddress: ':18888',
      webrtcAddress: ':18889',
    } as const
    expect(urlsOf(publishEndpoints('h', 'cam', global))).toEqual([
      'rtsp://h:18554/cam',
      'rtsps://h:18322/cam',
      'rtmp://h:11935/cam',
      'rtmps://h:11936/cam',
      'srt://h:18890?streamid=publish:cam&pkt_size=1316',
      'http://h:18889/cam/whip',
    ])
    expect(urlsOf(readEndpoints('h', 'cam', global))).toEqual([
      'rtsp://h:18554/cam',
      'rtsps://h:18322/cam',
      'rtmp://h:11935/cam',
      'rtmps://h:11936/cam',
      'srt://h:18890?streamid=read:cam',
      'http://h:18888/cam/index.m3u8',
      'http://h:18889/cam/whep',
    ])
  })

  it.each([
    ['rtsp', ['RTSP'], ['RTSP']],
    ['rtmp', ['RTMP'], ['RTMP']],
    ['srt', ['SRT'], ['SRT']],
    ['hls', [], ['HLS']],
    ['webrtc', ['WebRTC (WHIP)'], ['WebRTC (WHEP)']],
  ])('drops exactly the %s blocks when the server disables it', (toggle, publishGone, readGone) => {
    const allPublish = protocolsOf(publishEndpoints('h', 'cam', null))
    const allRead = protocolsOf(readEndpoints('h', 'cam', null))
    expect(protocolsOf(publishEndpoints('h', 'cam', { [toggle]: false })))
      .toEqual(allPublish.filter(p => !publishGone.includes(p)))
    expect(protocolsOf(readEndpoints('h', 'cam', { [toggle]: false })))
      .toEqual(allRead.filter(p => !readGone.includes(p)))
  })

  it.each([
    ['strict', ['RTMPS']],
    ['optional', ['RTMP', 'RTMPS']],
    ['no', ['RTMP']],
    [undefined, ['RTMP']],
  ] as const)('rtmpEncryption %s serves %j', (mode, expected) => {
    const global = { rtmpEncryption: mode }
    for (const endpoints of [publishEndpoints('h', 'cam', global), readEndpoints('h', 'cam', global)])
      expect(protocolsOf(endpoints).filter(p => p.startsWith('RTMP'))).toEqual(expected)
  })

  it.each([
    ['strict', ['RTSPS']],
    ['optional', ['RTSP', 'RTSPS']],
    ['no', ['RTSP']],
    [undefined, ['RTSP']],
  ] as const)('rtspEncryption %s serves %j', (mode, expected) => {
    const global = { rtspEncryption: mode }
    for (const endpoints of [publishEndpoints('h', 'cam', global), readEndpoints('h', 'cam', global)])
      expect(protocolsOf(endpoints).filter(p => p.startsWith('RTSP'))).toEqual(expected)
  })

  it('switches HLS and WebRTC to https when their encryption is on', () => {
    expect(urlsOf(readEndpoints('h', 'cam', { hlsEncryption: true })))
      .toContain('https://h:8888/cam/index.m3u8')
    const webrtc = { webrtcEncryption: true }
    expect(urlsOf(publishEndpoints('h', 'cam', webrtc))).toContain('https://h:8889/cam/whip')
    expect(urlsOf(readEndpoints('h', 'cam', webrtc))).toContain('https://h:8889/cam/whep')
    // The links to MediaMTX's own pages follow the same scheme.
    const links = [...publishEndpoints('h', 'cam', webrtc), ...readEndpoints('h', 'cam', webrtc)]
      .filter(e => e.protocol.startsWith('WebRTC'))
      .flatMap(e => e.links.map(l => l.href))
    expect(links).toEqual(['https://h:8889/cam/publish', 'https://h:8889/cam'])
  })

  it('puts a slashed path name verbatim into every URL, snippet and link', () => {
    const global = { rtspEncryption: 'optional', rtmpEncryption: 'optional' } as const
    const endpoints = [...publishEndpoints('h', 'cams/front', global), ...readEndpoints('h', 'cams/front', global)]
    for (const endpoint of endpoints) {
      expect(endpoint.url).toContain('cams/front')
      for (const snippet of endpoint.snippets)
        expect(snippet.text).toContain('cams/front')
      for (const link of endpoint.links)
        expect(link.href).toContain('cams/front')
    }
  })

  it('embeds the displayed URL in every snippet', () => {
    for (const endpoint of [...publishEndpoints('h', 'cam', null), ...readEndpoints('h', 'cam', null)]) {
      for (const snippet of endpoint.snippets)
        expect(snippet.text).toContain(endpoint.url)
    }
  })

  it('shapes the publish snippets the way MediaMTX documents them', () => {
    const byProtocol = Object.fromEntries(publishEndpoints('h', 'cam', null).map(e => [e.protocol, e.snippets]))
    expect(byProtocol.RTSP?.map(s => s.client)).toEqual(['ffmpeg', 'GStreamer'])
    expect(byProtocol.RTSP?.[0]?.text).toContain('-c copy -f rtsp rtsp://h:8554/cam')
    expect(byProtocol.RTSP?.[1]?.text).toContain('rtspclientsink')
    expect(byProtocol.RTMP?.map(s => s.client)).toEqual(['ffmpeg', 'OBS'])
    expect(byProtocol.RTMP?.[0]?.text).toContain('-c copy -f flv rtmp://h:1935/cam')
    expect(byProtocol.RTMP?.[1]?.text).toBe('Service: Custom...\nServer: rtmp://h:1935/cam\nStream key:')
    expect(byProtocol.SRT?.map(s => s.client)).toEqual(['ffmpeg', 'GStreamer'])
    // Quoted: the `&` would otherwise background the command in a shell.
    expect(byProtocol.SRT?.[0]?.text).toContain('-c copy -f mpegts \'srt://h:8890?streamid=publish:cam&pkt_size=1316\'')
    expect(byProtocol.SRT?.[1]?.text).toContain('srtsink')
    expect(byProtocol['WebRTC (WHIP)']?.map(s => s.client)).toEqual(['ffmpeg', 'OBS'])
    expect(byProtocol['WebRTC (WHIP)']?.[0]?.text).toContain('-c:a libopus -ar 48000 -ac 2 -b:a 128k -f whip http://h:8889/cam/whip')
    expect(byProtocol['WebRTC (WHIP)']?.[1]?.text).toBe('Service: WHIP\nServer: http://h:8889/cam/whip')
  })

  it('offers the read clients and links each protocol supports', () => {
    const endpoints = readEndpoints('h', 'cam', { rtspEncryption: 'optional', rtmpEncryption: 'optional' })
    const shape = Object.fromEntries(endpoints.map(e => [e.protocol, {
      clients: e.snippets.map(s => s.client),
      links: e.links.map(l => `${l.kind} ${l.href}`),
    }]))
    expect(shape).toEqual({
      'RTSP': { clients: ['ffmpeg', 'ffplay', 'VLC'], links: ['systemPlayer rtsp://h:8554/cam'] },
      'RTSPS': { clients: ['ffmpeg', 'ffplay', 'VLC'], links: ['systemPlayer rtsps://h:8322/cam'] },
      'RTMP': { clients: ['ffmpeg', 'ffplay', 'VLC'], links: [] },
      'RTMPS': { clients: ['ffmpeg', 'ffplay', 'VLC'], links: [] },
      'SRT': { clients: ['ffmpeg', 'ffplay', 'VLC'], links: ['systemPlayer srt://h:8890?streamid=read:cam'] },
      'HLS': { clients: ['ffplay', 'VLC'], links: ['hlsPage http://h:8888/cam'] },
      'WebRTC (WHEP)': { clients: [], links: ['webrtcPage http://h:8889/cam'] },
    })
    expect(endpoints[0]?.snippets.map(s => s.text)).toEqual([
      'ffmpeg -i rtsp://h:8554/cam -c copy out.mp4',
      'ffplay rtsp://h:8554/cam',
      'vlc rtsp://h:8554/cam',
    ])
  })

  it('links WHIP to MediaMTX\'s browser publish page', () => {
    const whip = publishEndpoints('h', 'cam', null).find(e => e.protocol === 'WebRTC (WHIP)')
    expect(whip?.links).toEqual([{ kind: 'browserPublish', href: 'http://h:8889/cam/publish' }])
  })
})

describe('publishHost', () => {
  it('takes only the hostname of the browser-facing MediaMTX URL', () => {
    expect(publishHost('http://cam.lan:8080')).toBe('cam.lan')
  })

  it('falls back to the page\'s own host when none is configured', () => {
    // A node suite has no window; stub one whose host no fixture uses.
    vi.stubGlobal('window', { location: { hostname: 'served-from.lan' } })
    try {
      expect(publishHost(null)).toBe('served-from.lan')
    }
    finally {
      vi.unstubAllGlobals()
    }
  })
})
