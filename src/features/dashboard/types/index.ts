// Types for the connection dashboard feature

export interface ConnectionStats {
  totalStreams: number
  activeStreams: number
  totalClients: number
  totalBytesReceived: number
  totalBytesSent: number
}

export interface ProtocolStats {
  rtsp: number
  rtmp: number
  webrtc: number
  hls: number
  srt: number
}

export interface StreamInfo {
  name: string
  ready: boolean
  readyTime: string | null
  bytesReceived: number
  bytesSent: number
  readers: number
  source: {
    type: string
    id: string
  } | null
  tracks: string[]
}

export interface ClientConnection {
  id: string
  protocol: 'RTSP' | 'RTMP' | 'WebRTC' | 'HLS' | 'SRT'
  remoteAddr: string
  created: string
  state: 'idle' | 'read' | 'publish'
  path: string
  bytesReceived: number
  bytesSent: number
}

export interface DashboardData {
  connectionStats: ConnectionStats
  protocolStats: ProtocolStats
  streams: StreamInfo[]
  clients: ClientConnection[]
  lastUpdated: string
  error?: string
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  message: string
  packetLoss?: number
}

// Type guard for checking if a connection has bandwidth data
export function hasTrafficData(conn: { bytesReceived?: number, bytesSent?: number }): boolean {
  return (conn.bytesReceived !== undefined && conn.bytesReceived > 0)
    || (conn.bytesSent !== undefined && conn.bytesSent > 0)
}

// Utility function to format bytes to human-readable format
export function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// Utility function to format bitrate
export function formatBitrate(bytesPerSecond: number): string {
  const bitsPerSecond = bytesPerSecond * 8
  if (bitsPerSecond === 0)
    return '0 bps'
  const k = 1000
  const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps']
  const i = Math.floor(Math.log(bitsPerSecond) / Math.log(k))
  return `${Number.parseFloat((bitsPerSecond / k ** i).toFixed(2))} ${sizes[i]}`
}
