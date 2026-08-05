import type { GlobalConfigFormData, PathConfigFormData, PathDefaultsFormData } from '@connect/contract'
import type { FieldPath, FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import {
  GlobalConfigSchema,
  isValidPathSource,
  PathConfigSchema,
  PathDefaultsSchema,
} from '@connect/contract'
import { z } from 'zod'

export type FieldKind = 'text' | 'number' | 'switch' | 'list'

// Field names are MediaMTX config keys verbatim, and are rendered
// untranslated in every scope below (docs/I18N.md).
export interface SectionField<T extends FieldValues> {
  name: FieldPath<T>
  kind: FieldKind
}

export interface SectionDef<T extends FieldValues> {
  id: string
  // sections with an enable switch in the header; their fields hide while off
  enableField?: FieldPath<T>
  fields: SectionField<T>[]
  hasIceServers?: boolean
  // sections whose save disrupts live streams; renders sectionWarnings.<id>
  warnsOnSave?: boolean
}

// Board 2e's eight global-scope sections, in scroll order.
export const GLOBAL_SECTIONS: SectionDef<GlobalConfigFormData>[] = [
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

// Shared by both path-scoped surfaces: a path's own config is the per-path
// override of the same keys path defaults sets server-wide (ADR 0002).
// MediaMTX serves many more keys than these two groups.
export const PATH_SECTIONS: SectionDef<PathDefaultsFormData>[] = [
  {
    id: 'recording',
    enableField: 'record',
    fields: [
      { name: 'recordPath', kind: 'text' },
      { name: 'recordFormat', kind: 'text' },
      { name: 'recordPartDuration', kind: 'text' },
      { name: 'recordSegmentDuration', kind: 'text' },
      { name: 'recordDeleteAfter', kind: 'text' },
    ],
  },
  // Path-scoped hooks, in MediaMTX's own lifecycle order. `hooks` is taken by
  // the global scope's connect/disconnect commands, which are a different set.
  // Writing any runOn* key makes MediaMTX re-create the path to arm the hook,
  // which drops the publisher; a record* write doesn't (ADR 0002, verified on
  // v1.19.2). Same save bar, different blast radius — hence the warning.
  {
    id: 'pathHooks',
    warnsOnSave: true,
    fields: [
      { name: 'runOnInit', kind: 'text' },
      { name: 'runOnInitRestart', kind: 'switch' },
      { name: 'runOnDemand', kind: 'text' },
      { name: 'runOnDemandRestart', kind: 'switch' },
      { name: 'runOnDemandStartTimeout', kind: 'text' },
      { name: 'runOnDemandCloseAfter', kind: 'text' },
      { name: 'runOnUnDemand', kind: 'text' },
      { name: 'runOnReady', kind: 'text' },
      { name: 'runOnReadyRestart', kind: 'switch' },
      { name: 'runOnNotReady', kind: 'text' },
      { name: 'runOnRead', kind: 'text' },
      { name: 'runOnReadRestart', kind: 'switch' },
      { name: 'runOnUnread', kind: 'text' },
      { name: 'runOnRecordSegmentCreate', kind: 'text' },
      { name: 'runOnRecordSegmentComplete', kind: 'text' },
    ],
  },
]

// One MediaMTX config scope (ADR 0002): what the rail form validates against
// and which sections it renders. Read/write procedures are wired by the page.
export interface ConfigScope<T extends FieldValues> {
  // T is the schema's *input* — what the form holds before coercion.
  schema: ZodType<unknown, T>
  sections: SectionDef<T>[]
}

export const GLOBAL_SCOPE: ConfigScope<GlobalConfigFormData> = {
  schema: GlobalConfigSchema,
  sections: GLOBAL_SECTIONS,
}

export const PATH_DEFAULTS_SCOPE: ConfigScope<PathDefaultsFormData> = {
  schema: PathDefaultsSchema,
  sections: PATH_SECTIONS,
}

// `source` is a path's own key — MediaMTX serves it per path, not from
// pathdefaults — so it heads the per-path scope and appears on no other.
const SOURCE_SECTION: SectionDef<PathConfigFormData> = {
  id: 'source',
  fields: [{ name: 'source', kind: 'text' }],
}

// Built rather than declared like the other scopes: the source rule mirrors
// MediaMTX's own whitelist, and the message it fails with is localized.
export function pathConfigScope(invalidSourceMessage: string): ConfigScope<PathConfigFormData> {
  return {
    schema: PathConfigSchema.extend({
      source: z
        .string()
        .refine(isValidPathSource, { message: invalidSourceMessage })
        .optional(),
    }),
    sections: [SOURCE_SECTION, ...PATH_SECTIONS],
  }
}

export function sectionFieldNames<T extends FieldValues>(section: SectionDef<T>): string[] {
  const names: string[] = section.fields.map(f => f.name)
  if (section.enableField)
    names.push(section.enableField)
  if (section.hasIceServers)
    names.push('webrtcICEServers2')
  return names
}

export function countErrorsForSection<T extends FieldValues>(
  errors: Partial<Record<string, unknown>>,
  section: SectionDef<T>,
): number {
  return sectionFieldNames(section).filter(name => errors[name]).length
}
