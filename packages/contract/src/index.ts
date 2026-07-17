import { oc } from '@orpc/contract'
import { z } from 'zod'

export const HealthSchema = z.object({
  status: z.literal('ok'),
  uptime: z.number(),
})

export const AppConfigSchema = z.object({
  mediaMtxUrl: z.string().min(1),
  mediaMtxApiPort: z.coerce.number().int().gt(0),
  remoteMediaMtxUrl: z.string().nullable(),
  recordingsDirectory: z.string().min(1),
  screenshotsDirectory: z.string().min(1),
})

export type AppConfig = z.infer<typeof AppConfigSchema>

// Mirrors MediaMTX v1.11.3 GlobalConf. Field names match the YAML keys 1:1.
export const GlobalConfigSchema = z.object({
  logLevel: z.string().optional(),
  logDestinations: z.array(z.string()).optional(),
  logFile: z.string().optional(),
  readTimeout: z.string().optional(),
  writeTimeout: z.string().optional(),
  writeQueueSize: z.coerce.number().optional(),
  udpMaxPayloadSize: z.coerce.number().optional(),
  externalAuthenticationURL: z.string().optional(),
  api: z.boolean().optional(),
  apiAddress: z.string().optional(),
  metrics: z.boolean().optional(),
  metricsAddress: z.string().optional(),
  pprof: z.boolean().optional(),
  pprofAddress: z.string().optional(),
  runOnConnect: z.string().optional(),
  runOnConnectRestart: z.boolean().optional(),
  runOnDisconnect: z.string().optional(),
  rtsp: z.boolean().optional(),
  protocols: z.array(z.string()).optional(),
  encryption: z.string().optional(),
  rtspAddress: z.string().optional(),
  rtspsAddress: z.string().optional(),
  rtpAddress: z.string().optional(),
  rtcpAddress: z.string().optional(),
  multicastIPRange: z.string().optional(),
  multicastRTPPort: z.coerce.number().optional(),
  multicastRTCPPort: z.coerce.number().optional(),
  serverKey: z.string().optional(),
  serverCert: z.string().optional(),
  authMethods: z.array(z.string()).optional(),
  rtmp: z.boolean().optional(),
  rtmpAddress: z.string().optional(),
  rtmpEncryption: z.string().optional(),
  rtmpsAddress: z.string().optional(),
  rtmpServerKey: z.string().optional(),
  rtmpServerCert: z.string().optional(),
  hls: z.boolean().optional(),
  hlsAddress: z.string().optional(),
  hlsEncryption: z.boolean().optional(),
  hlsServerKey: z.string().optional(),
  hlsServerCert: z.string().optional(),
  hlsAlwaysRemux: z.boolean().optional(),
  hlsVariant: z.string().optional(),
  hlsSegmentCount: z.coerce.number().optional(),
  hlsSegmentDuration: z.string().optional(),
  hlsPartDuration: z.string().optional(),
  hlsSegmentMaxSize: z.string().optional(),
  hlsAllowOrigin: z.string().optional(),
  hlsTrustedProxies: z.array(z.string()).optional(),
  hlsDirectory: z.string().optional(),
  webrtc: z.boolean().optional(),
  webrtcAddress: z.string().optional(),
  webrtcEncryption: z.boolean().optional(),
  webrtcServerKey: z.string().optional(),
  webrtcServerCert: z.string().optional(),
  webrtcAllowOrigin: z.string().optional(),
  webrtcTrustedProxies: z.array(z.string()).optional(),
  webrtcLocalUDPAddress: z.string().optional(),
  webrtcLocalTCPAddress: z.string().optional(),
  webrtcIPsFromInterfaces: z.boolean().optional(),
  webrtcIPsFromInterfacesList: z.array(z.string()).optional(),
  webrtcAdditionalHosts: z.array(z.string()).optional(),
  webrtcICEServers2: z
    .array(
      z.object({
        url: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
      }),
    )
    .optional(),
  srt: z.boolean().optional(),
  srtAddress: z.string().optional(),
})

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>
export type GlobalConfigFormData = z.input<typeof GlobalConfigSchema>

// MediaMTX serves these from /v3/config/pathdefaults, not /v3/config/global —
// every path inherits them. Sparse by design: unlisted keys are left alone by
// the PATCH, and MediaMTX returns many more keys than we surface.
export const PathDefaultsSchema = z.object({
  record: z.boolean().optional(),
  recordPath: z.string().optional(),
  recordFormat: z.string().optional(),
  recordPartDuration: z.string().optional(),
  recordSegmentDuration: z.string().optional(),
  recordDeleteAfter: z.string().optional(),

  // The path's own lifecycle hooks. Distinct from the global scope's
  // runOnConnect/runOnDisconnect, which fire per client connection and belong
  // to the server, not to any path (ADR 0002).
  runOnInit: z.string().optional(),
  runOnInitRestart: z.boolean().optional(),
  runOnDemand: z.string().optional(),
  runOnDemandRestart: z.boolean().optional(),
  runOnDemandStartTimeout: z.string().optional(),
  runOnDemandCloseAfter: z.string().optional(),
  runOnUnDemand: z.string().optional(),
  runOnReady: z.string().optional(),
  runOnReadyRestart: z.boolean().optional(),
  runOnNotReady: z.string().optional(),
  runOnRead: z.string().optional(),
  runOnReadRestart: z.boolean().optional(),
  runOnUnread: z.string().optional(),
  runOnRecordSegmentCreate: z.string().optional(),
  runOnRecordSegmentComplete: z.string().optional(),
})

export type PathDefaults = z.infer<typeof PathDefaultsSchema>
export type PathDefaultsFormData = z.input<typeof PathDefaultsSchema>

// A path's own config is exactly the per-path override of the defaults scope —
// same keys, applied to one path (ADR 0002).
export const PathConfigSchema = PathDefaultsSchema

export type PathConfig = z.infer<typeof PathConfigSchema>
export type PathConfigFormData = z.input<typeof PathConfigSchema>

// What a path resolves to right now: its own overrides merged over path
// defaults, as MediaMTX itself resolves them. `confName` is the config entry
// the values come from — a wildcard (`all_others`) until the path is
// materialized, its own name after.
export const EffectivePathConfigSchema = z.object({
  confName: z.string(),
  conf: PathConfigSchema,
})

export type EffectivePathConfig = z.infer<typeof EffectivePathConfigSchema>

export const StreamSchema = z.object({
  name: z.string(),
  readyTime: z.string().nullable(),
  // Effective record state — the path's own override merged over path defaults,
  // as MediaMTX resolves it. Inherited `true` is the stock setup, so a card
  // that read only the path's own (absent) entry would claim it's off.
  recording: z.boolean(),
  // MediaMTX's per-track codec names, straight off the path list.
  codecs: z.array(z.string()),
  // MediaMTX counts a reader per consumer of the path, whatever protocol it
  // reads over — including this app's own player while a card is playing.
  viewers: z.number().int(),
  // Age of the snapshot a card shows while idle. Ours, not MediaMTX's: the
  // mtime of the PNG the capture job writes. Null until the first capture.
  snapshotMtime: z.date().nullable(),
})

export type Stream = z.infer<typeof StreamSchema>

// The live view's connection tri-state, resolved server-side instead of via
// try/catch in a page component.
export const StreamsStateSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('connection-error'),
    mediaMtxUrl: z.string(),
    mediaMtxApiPort: z.number(),
  }),
  z.object({
    status: z.literal('connected'),
    streams: z.array(StreamSchema),
    hlsAddress: z.string(),
    remoteMediaMtxUrl: z.string().nullable(),
  }),
])

export type StreamsState = z.infer<typeof StreamsStateSchema>

export const RecordingStreamSummarySchema = z.object({
  name: z.string(),
  count: z.number().int(),
  // native Date survives the wire — oRPC's RPC serializer preserves it
  latestMtime: z.date().nullable(),
  screenshotUrl: z.string().nullable(),
})

export type RecordingStreamSummary = z.infer<typeof RecordingStreamSummarySchema>

export const RecordingSchema = z.object({
  name: z.string(),
  createdAt: z.date(),
  fileSize: z.number(),
  screenshotUrl: z.string().nullable(),
})

export type Recording = z.infer<typeof RecordingSchema>

export const contract = {
  health: oc.output(HealthSchema),
  streams: {
    list: oc.output(StreamsStateSchema),
    // Capture a frame for one stream now, off the same RTSP feed the snapshot
    // cron pulls — MediaMTX has no snapshot endpoint. Throws when the capture
    // fails so the card can surface it; concurrency is bounded server-side.
    snapshot: oc.input(z.object({ name: z.string().min(1) })).output(z.void()),
  },
  recordings: {
    listStreams: oc.output(z.array(RecordingStreamSummarySchema)),
    listForStream: oc
      .input(
        z.object({
          streamName: z.string().min(1),
          page: z.number().int().min(1).default(1),
          take: z.number().int().min(1).max(100).default(10),
        }),
      )
      .output(
        z.object({
          recordings: z.array(RecordingSchema),
          totalCount: z.number().int(),
        }),
      ),
  },
  config: {
    app: {
      get: oc.output(AppConfigSchema),
      update: oc.input(AppConfigSchema).output(AppConfigSchema),
    },
    mediamtx: {
      getGlobal: oc.output(GlobalConfigSchema.nullable()),
      updateGlobal: oc.input(GlobalConfigSchema).output(z.void()),
      getPathDefaults: oc.output(PathDefaultsSchema.nullable()),
      updatePathDefaults: oc.input(PathDefaultsSchema).output(z.void()),
      getPathConfig: oc
        .input(z.object({ name: z.string().min(1) }))
        .output(EffectivePathConfigSchema.nullable()),
      // `conf` carries only the keys the operator changed: MediaMTX stores it
      // as a sparse override, so everything omitted keeps tracking defaults.
      updatePathConfig: oc
        .input(z.object({ name: z.string().min(1), conf: PathConfigSchema }))
        .output(z.void()),
    },
  },
}
