'use server'

import type {
  ClientConnection,
  ConnectionStats,
  DashboardData,
  ProtocolStats,
  StreamInfo,
} from '../types'

import { getAppConfig } from '@/features/config/client'
import { Api } from '@/lib/MediaMTX/generated'
import { logger } from '@/shared/utils'

export async function getDashboardData(): Promise<DashboardData> {
  const config = await getAppConfig()

  if (!config) {
    return {
      connectionStats: { totalStreams: 0, activeStreams: 0, totalClients: 0, totalBytesReceived: 0, totalBytesSent: 0 },
      protocolStats: { rtsp: 0, rtmp: 0, webrtc: 0, hls: 0, srt: 0 },
      streams: [],
      clients: [],
      lastUpdated: new Date().toISOString(),
      error: 'Unable to load configuration',
    }
  }

  const api = new Api({
    baseUrl: `${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
  })

  try {
    // Fetch all data in parallel
    const [
      pathsResponse,
      rtspSessionsResponse,
      rtmpConnsResponse,
      webrtcSessionsResponse,
      hlsMuxersResponse,
      srtConnsResponse,
    ] = await Promise.all([
      api.v3.pathsList({}, { cache: 'no-store' }),
      api.v3.rtspSessionsList({}, { cache: 'no-store' }),
      api.v3.rtmpConnsList({}, { cache: 'no-store' }),
      api.v3.webrtcSessionsList({}, { cache: 'no-store' }),
      api.v3.hlsMuxersList({}, { cache: 'no-store' }),
      api.v3.srtConnsList({}, { cache: 'no-store' }),
    ])

    const paths = pathsResponse.data.items || []
    const rtspSessions = rtspSessionsResponse.data.items || []
    const rtmpConns = rtmpConnsResponse.data.items || []
    const webrtcSessions = webrtcSessionsResponse.data.items || []
    const hlsMuxers = hlsMuxersResponse.data.items || []
    const srtConns = srtConnsResponse.data.items || []

    // Calculate connection stats
    let totalBytesReceived = 0
    let totalBytesSent = 0

    paths.forEach((path) => {
      totalBytesReceived += path.bytesReceived || 0
      totalBytesSent += path.bytesSent || 0
    })

    const connectionStats: ConnectionStats = {
      totalStreams: paths.length,
      activeStreams: paths.filter(p => p.ready).length,
      totalClients: rtspSessions.length + rtmpConns.length + webrtcSessions.length + hlsMuxers.length + srtConns.length,
      totalBytesReceived,
      totalBytesSent,
    }

    // Calculate protocol stats
    const protocolStats: ProtocolStats = {
      rtsp: rtspSessions.length,
      rtmp: rtmpConns.length,
      webrtc: webrtcSessions.length,
      hls: hlsMuxers.length,
      srt: srtConns.length,
    }

    // Map streams
    const streams: StreamInfo[] = paths.map(path => ({
      name: path.name || 'unknown',
      ready: path.ready || false,
      readyTime: path.readyTime || null,
      bytesReceived: path.bytesReceived || 0,
      bytesSent: path.bytesSent || 0,
      readers: path.readers?.length || 0,
      source: path.source ? { type: path.source.type || 'unknown', id: path.source.id || '' } : null,
      tracks: path.tracks || [],
    }))

    // Map clients from all protocols
    const clients: ClientConnection[] = [
      ...rtspSessions.map(session => ({
        id: session.id || '',
        protocol: 'RTSP' as const,
        remoteAddr: session.remoteAddr || '',
        created: session.created || '',
        state: (session.state || 'idle') as 'idle' | 'read' | 'publish',
        path: session.path || '',
        bytesReceived: session.bytesReceived || 0,
        bytesSent: session.bytesSent || 0,
      })),
      ...rtmpConns.map(conn => ({
        id: conn.id || '',
        protocol: 'RTMP' as const,
        remoteAddr: conn.remoteAddr || '',
        created: conn.created || '',
        state: (conn.state || 'idle') as 'idle' | 'read' | 'publish',
        path: conn.path || '',
        bytesReceived: conn.bytesReceived || 0,
        bytesSent: conn.bytesSent || 0,
      })),
      ...webrtcSessions.map(session => ({
        id: session.id || '',
        protocol: 'WebRTC' as const,
        remoteAddr: session.remoteAddr || '',
        created: session.created || '',
        state: (session.state || 'read') as 'idle' | 'read' | 'publish',
        path: session.path || '',
        bytesReceived: session.bytesReceived || 0,
        bytesSent: session.bytesSent || 0,
      })),
      ...hlsMuxers.map(muxer => ({
        id: muxer.path || '',
        protocol: 'HLS' as const,
        remoteAddr: '',
        created: muxer.created || '',
        state: 'read' as const,
        path: muxer.path || '',
        bytesReceived: 0,
        bytesSent: muxer.bytesSent || 0,
      })),
      ...srtConns.map(conn => ({
        id: conn.id || '',
        protocol: 'SRT' as const,
        remoteAddr: conn.remoteAddr || '',
        created: conn.created || '',
        state: (conn.state || 'idle') as 'idle' | 'read' | 'publish',
        path: conn.path || '',
        bytesReceived: conn.bytesReceived || 0,
        bytesSent: conn.bytesSent || 0,
      })),
    ]

    return {
      connectionStats,
      protocolStats,
      streams,
      clients,
      lastUpdated: new Date().toISOString(),
    }
  }
  catch (error) {
    logger.error('Error fetching dashboard data:', error)
    return {
      connectionStats: { totalStreams: 0, activeStreams: 0, totalClients: 0, totalBytesReceived: 0, totalBytesSent: 0 },
      protocolStats: { rtsp: 0, rtmp: 0, webrtc: 0, hls: 0, srt: 0 },
      streams: [],
      clients: [],
      lastUpdated: new Date().toISOString(),
      error: `Unable to connect to MediaMTX at ${config.mediaMtxUrl}:${config.mediaMtxApiPort}`,
    }
  }
}
