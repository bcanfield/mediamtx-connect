import type { GlobalConfigFormData } from '@connect/contract'

export type FieldName = keyof GlobalConfigFormData

export type FieldKind = 'text' | 'number' | 'switch' | 'list'

export interface SectionField {
  name: FieldName
  kind: FieldKind
}

export interface SectionDef {
  id: string
  // protocol sections get a header switch; their fields hide while off
  enableField?: FieldName
  fields: SectionField[]
  hasIceServers?: boolean
}

// Board 2e's eight sections, in scroll order. Field names are MediaMTX
// config keys verbatim and are rendered untranslated (docs/I18N.md).
export const SECTIONS: SectionDef[] = [
  {
    id: 'logging',
    fields: [
      { name: 'logLevel', kind: 'text' },
      { name: 'logDestinations', kind: 'list' },
      { name: 'logFile', kind: 'text' },
      { name: 'readTimeout', kind: 'text' },
      { name: 'writeTimeout', kind: 'text' },
      { name: 'writeQueueSize', kind: 'number' },
      { name: 'udpMaxPayloadSize', kind: 'number' },
      { name: 'externalAuthenticationURL', kind: 'text' },
    ],
  },
  {
    id: 'api',
    enableField: 'api',
    fields: [
      { name: 'apiAddress', kind: 'text' },
      { name: 'metrics', kind: 'switch' },
      { name: 'metricsAddress', kind: 'text' },
      { name: 'pprof', kind: 'switch' },
      { name: 'pprofAddress', kind: 'text' },
    ],
  },
  {
    id: 'hooks',
    fields: [
      { name: 'runOnConnect', kind: 'text' },
      { name: 'runOnConnectRestart', kind: 'switch' },
      { name: 'runOnDisconnect', kind: 'text' },
    ],
  },
  {
    id: 'rtsp',
    enableField: 'rtsp',
    fields: [
      { name: 'rtspAddress', kind: 'text' },
      { name: 'rtspsAddress', kind: 'text' },
      { name: 'rtpAddress', kind: 'text' },
      { name: 'rtcpAddress', kind: 'text' },
      { name: 'multicastIPRange', kind: 'text' },
      { name: 'multicastRTPPort', kind: 'number' },
      { name: 'multicastRTCPPort', kind: 'number' },
      { name: 'protocols', kind: 'list' },
      { name: 'encryption', kind: 'text' },
      { name: 'serverKey', kind: 'text' },
      { name: 'serverCert', kind: 'text' },
      { name: 'authMethods', kind: 'list' },
    ],
  },
  {
    id: 'rtmp',
    enableField: 'rtmp',
    fields: [
      { name: 'rtmpAddress', kind: 'text' },
      { name: 'rtmpEncryption', kind: 'text' },
      { name: 'rtmpsAddress', kind: 'text' },
      { name: 'rtmpServerKey', kind: 'text' },
      { name: 'rtmpServerCert', kind: 'text' },
    ],
  },
  {
    id: 'hls',
    enableField: 'hls',
    fields: [
      { name: 'hlsAddress', kind: 'text' },
      { name: 'hlsEncryption', kind: 'switch' },
      { name: 'hlsServerKey', kind: 'text' },
      { name: 'hlsServerCert', kind: 'text' },
      { name: 'hlsAlwaysRemux', kind: 'switch' },
      { name: 'hlsVariant', kind: 'text' },
      { name: 'hlsSegmentCount', kind: 'number' },
      { name: 'hlsSegmentDuration', kind: 'text' },
      { name: 'hlsPartDuration', kind: 'text' },
      { name: 'hlsSegmentMaxSize', kind: 'text' },
      { name: 'hlsAllowOrigin', kind: 'text' },
      { name: 'hlsTrustedProxies', kind: 'list' },
      { name: 'hlsDirectory', kind: 'text' },
    ],
  },
  {
    id: 'webrtc',
    enableField: 'webrtc',
    hasIceServers: true,
    fields: [
      { name: 'webrtcAddress', kind: 'text' },
      { name: 'webrtcEncryption', kind: 'switch' },
      { name: 'webrtcServerKey', kind: 'text' },
      { name: 'webrtcServerCert', kind: 'text' },
      { name: 'webrtcAllowOrigin', kind: 'text' },
      { name: 'webrtcTrustedProxies', kind: 'list' },
      { name: 'webrtcLocalUDPAddress', kind: 'text' },
      { name: 'webrtcLocalTCPAddress', kind: 'text' },
      { name: 'webrtcIPsFromInterfaces', kind: 'switch' },
      { name: 'webrtcIPsFromInterfacesList', kind: 'list' },
      { name: 'webrtcAdditionalHosts', kind: 'list' },
    ],
  },
  {
    id: 'srt',
    enableField: 'srt',
    fields: [
      { name: 'srtAddress', kind: 'text' },
    ],
  },
]

export function sectionFieldNames(section: SectionDef): FieldName[] {
  const names = section.fields.map(f => f.name)
  if (section.enableField)
    names.push(section.enableField)
  if (section.hasIceServers)
    names.push('webrtcICEServers2')
  return names
}

export function countErrorsForSection(
  errors: Partial<Record<string, unknown>>,
  section: SectionDef,
): number {
  return sectionFieldNames(section).filter(name => errors[name]).length
}
