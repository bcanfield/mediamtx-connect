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

// MediaMTX's own whitelist for a path's `source` (its conf validation): three
// keywords, or a URL in one of the schemes it can pull from. Mirrored here so a
// typo is caught by the form instead of coming back as a refused PATCH.
const PATH_SOURCE_KEYWORDS = ['publisher', 'redirect', 'rpiCamera']

const PATH_SOURCE_URL_SCHEMES = [
  'rtsp',
  'rtsps',
  'rtmp',
  'rtmps',
  'http',
  'https',
  'udp',
  'srt',
  'whep',
  'wheps',
]

export function isValidPathSource(source: string): boolean {
  return PATH_SOURCE_KEYWORDS.includes(source)
    || PATH_SOURCE_URL_SCHEMES.some(scheme => source.startsWith(`${scheme}://`))
}

// A path's own config is the per-path override of the defaults scope (ADR
// 0002), plus `source`: where a stream comes from belongs to one path, and
// MediaMTX does not serve it from pathdefaults.
export const PathConfigSchema = PathDefaultsSchema.extend({
  // Unrefined on the wire on purpose — MediaMTX is the authority on what it
  // accepts, and a source kind added in a later version still has to read back.
  // The form validates against `isValidPathSource` before it writes.
  source: z.string().optional(),
})

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

// `unresolved` is its own state rather than a null: a name with no runtime path
// and no entry of its own has nothing to resolve — MediaMTX won't say which
// wildcard entry would cover it — and that is a different situation from a
// MediaMTX we couldn't reach, which stays `null` as it is on the other scopes.
export const PathConfigResultSchema = z.discriminatedUnion('status', [
  EffectivePathConfigSchema.extend({ status: z.literal('resolved') }),
  z.object({ status: z.literal('unresolved') }),
])

export type PathConfigResult = z.infer<typeof PathConfigResultSchema>

// What is attached to a runtime path right now. MediaMTX drops a path's config
// entry without a word about the sessions it cuts off, so a delete confirmation
// has to read this itself.
export const PathConnectionsSchema = z.object({
  // MediaMTX's own session type for whatever publishes — `rtspSession`,
  // `rtmpConn`, `srtConn`, `webRTCSession`, `redirect`. Null while nothing does.
  publisher: z.string().nullable(),
  // One entry per consumer, by the session type it reads over. MediaMTX pairs
  // each with an opaque id, which names nothing an operator would recognise.
  readers: z.array(z.string()),
})

export type PathConnections = z.infer<typeof PathConnectionsSchema>

// One track of a live path. `codec` is MediaMTX's own name for it ("H264",
// "MPEG-4 Audio"); `resolution` comes from `tracks2`'s codec properties, so it
// is null for audio tracks and for servers that only serve the older `tracks`.
export const PathTrackSchema = z.object({
  codec: z.string(),
  resolution: z.string().nullable(),
})

export type PathTrack = z.infer<typeof PathTrackSchema>

// What a path is doing right now, as opposed to what it is configured to do —
// the stored config alone never says whether a camera is actually working.
// `idle` covers both a path MediaMTX isn't running and one it is running but
// that isn't ready: neither is an error, and both have no counters to show.
export const PathHealthSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('idle') }),
  z.object({
    status: z.literal('live'),
    // When the path went ready — what uptime is measured from.
    readyTime: z.string().nullable(),
    // Same session types as `PathConnectionsSchema`.
    publisher: z.string().nullable(),
    readers: z.array(z.string()),
    tracks: z.array(PathTrackSchema),
    // Cumulative since the path went ready, both directions.
    bytesReceived: z.number(),
    bytesSent: z.number(),
    // `inboundFramesInError` — a flaky camera's tell. Null on MediaMTX versions
    // that don't serve it, which is not the same answer as zero.
    framesInError: z.number().nullable(),
  }),
])

export type PathHealth = z.infer<typeof PathHealthSchema>

// One row of the paths catalog: a *config entry*, not a runtime path. A regex
// entry backs many runtime paths and a wildcard-backed path has no entry at
// all, so this list and the live stream grid are different populations.
export const PathCatalogEntrySchema = z.object({
  name: z.string(),
  // MediaMTX's `source` for the entry — `publisher` when something pushes to
  // it, an RTSP/RTMP/SRT URL when MediaMTX pulls. Null when the entry omits it.
  source: z.string().nullable(),
  // A `~`-prefixed name is a regular expression matching many path names.
  isRegex: z.boolean(),
  // Whether MediaMTX is running a ready path off this entry right now. Every
  // static entry always has a runtime path, idle or not, so "has a runtime
  // path" would be true for all of them and say nothing.
  active: z.boolean(),
})

export type PathCatalogEntry = z.infer<typeof PathCatalogEntrySchema>

// Same tri-state shape as the live view: an unreachable server is its own
// answer, not an empty catalog.
export const PathCatalogStateSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('connection-error'),
    mediaMtxUrl: z.string(),
    mediaMtxApiPort: z.number(),
  }),
  z.object({
    status: z.literal('connected'),
    paths: z.array(PathCatalogEntrySchema),
  }),
])

export type PathCatalogState = z.infer<typeof PathCatalogStateSchema>

// MediaMTX's `rtspTransport`, the transport it pulls an RTSP source over.
export const RTSP_TRANSPORTS = ['automatic', 'udp', 'multicast', 'tcp'] as const

export type RtspTransport = (typeof RTSP_TRANSPORTS)[number]

// Creating a path is a narrower surface than editing one: the guided add
// composes `source` from its parts and sends the finished URL, and `source` is
// the only key it writes.
export const AddPathInputSchema = z.object({
  name: z.string().min(1),
  source: z.string().min(1),
  // Left off rather than sent as `automatic`: that is what an entry without the
  // key already does, and an entry stays a sparse override.
  rtspTransport: z.enum(RTSP_TRANSPORTS).optional(),
})

export type AddPathInput = z.infer<typeof AddPathInputSchema>

// Effective record state — the path's own override merged over path defaults,
// as MediaMTX resolves it. Inherited `on` is the stock setup, so a card that
// read only the path's own (absent) entry would claim it's off. `unknown` is
// its own state rather than a default to `off`: a config entry we couldn't read
// says nothing about whether MediaMTX is writing files.
export const RecordStateSchema = z.enum(['on', 'off', 'unknown'])

export type RecordState = z.infer<typeof RecordStateSchema>

export const StreamSchema = z.object({
  name: z.string(),
  readyTime: z.string().nullable(),
  recordState: RecordStateSchema,
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
      // Every configured path, with the live server's view of which are up.
      listPaths: oc.output(PathCatalogStateSchema),
      addPath: oc.input(AddPathInputSchema).output(z.void()),
      getPathConfig: oc
        .input(z.object({ name: z.string().min(1) }))
        .output(PathConfigResultSchema.nullable()),
      // `conf` carries only the keys the operator changed: MediaMTX stores it
      // as a sparse override, so everything omitted keeps tracking defaults.
      updatePathConfig: oc
        .input(z.object({ name: z.string().min(1), conf: PathConfigSchema }))
        .output(z.void()),
      // One path's live runtime health, polled while its detail page is open.
      // `null` is an unreachable server; a path that isn't running is `idle`.
      getPathHealth: oc
        .input(z.object({ name: z.string().min(1) }))
        .output(PathHealthSchema.nullable()),
      // What a delete would cut off. `null` is an unreachable server, not an
      // idle path — a warning we couldn't build is not a path with nothing on it.
      getPathConnections: oc
        .input(z.object({ name: z.string().min(1) }))
        .output(PathConnectionsSchema.nullable()),
      // Removes the path's own entry. A path that a wildcard entry still covers
      // goes back to tracking it; one whose entry was the path is gone.
      deletePathConfig: oc
        .input(z.object({ name: z.string().min(1) }))
        .output(z.void()),
    },
  },
}
