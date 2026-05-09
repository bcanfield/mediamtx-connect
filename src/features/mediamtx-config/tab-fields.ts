import type { GlobalConfigFormData } from './mediamtx-config.schemas'

type FieldName = keyof GlobalConfigFormData

export const TAB_FIELDS: Record<string, FieldName[]> = {
  logging: [
    'logLevel',
    'logDestinations',
    'logFile',
    'readTimeout',
    'writeTimeout',
    'writeQueueSize',
    'udpMaxPayloadSize',
    'externalAuthenticationURL',
  ],
  api: [
    'api',
    'apiAddress',
    'metrics',
    'metricsAddress',
    'pprof',
    'pprofAddress',
  ],
  hooks: ['runOnConnect', 'runOnConnectRestart', 'runOnDisconnect'],
  rtsp: [
    'rtsp',
    'rtspAddress',
    'rtpAddress',
    'rtcpAddress',
    'multicastIPRange',
    'multicastRTPPort',
    'multicastRTCPPort',
    'protocols',
    'encryption',
    'serverKey',
    'serverCert',
    'authMethods',
  ],
  rtmp: [
    'rtmp',
    'rtmpAddress',
    'rtmpEncryption',
    'rtmpsAddress',
    'rtmpServerKey',
    'rtmpServerCert',
  ],
  hls: [
    'hls',
    'hlsAddress',
    'hlsEncryption',
    'hlsServerKey',
    'hlsServerCert',
    'hlsAlwaysRemux',
    'hlsVariant',
    'hlsSegmentCount',
    'hlsSegmentDuration',
    'hlsPartDuration',
    'hlsSegmentMaxSize',
    'hlsAllowOrigin',
    'hlsTrustedProxies',
    'hlsDirectory',
  ],
  webrtc: [
    'webrtc',
    'webrtcAddress',
    'webrtcEncryption',
    'webrtcServerKey',
    'webrtcServerCert',
    'webrtcAllowOrigin',
    'webrtcTrustedProxies',
    'webrtcLocalUDPAddress',
    'webrtcLocalTCPAddress',
    'webrtcIPsFromInterfaces',
    'webrtcIPsFromInterfacesList',
    'webrtcAdditionalHosts',
    'webrtcICEServers2',
  ],
  srt: ['srt', 'srtAddress'],
}

export function countErrorsForTab(
  errors: Partial<Record<string, unknown>>,
  tab: string,
): number {
  const fields = TAB_FIELDS[tab] ?? []
  let count = 0
  for (const f of fields) {
    if (errors[f])
      count++
  }
  return count
}
