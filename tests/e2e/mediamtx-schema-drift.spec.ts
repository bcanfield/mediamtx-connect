// E2E because it needs a live MediaMTX: the config keys a real server of the
// version CI runs actually serves, which no stub can answer. Read-only; it
// writes nothing to MediaMTX.
import type { APIRequestContext } from '@playwright/test'
import { expect, test } from '@playwright/test'
// Exception to "import by name": tests/e2e isn't a workspace package, and
// depending on @connect/contract from the root would change the lockfile.
import { GlobalConfigSchema, PathConfigSchema } from '../../packages/contract/src/index'

const API = 'http://localhost:9997/v3'

// Every key MediaMTX serves that Connect leaves out on purpose, per scope. A
// ticket that models a group deletes it from here; the spec fails if it doesn't.
// Covers v1.21.1, so Renovate's bump past CI's 1.20.0 stays green.
const DELIBERATELY_UNMODELED = {
  global: [
    // A later auth ticket. authInternalUsers needs its own editor.
    'authInternalUsers',
    'authHTTPExclude',
    'authHTTPFingerprint',
    'authJWTJWKS',
    'authJWTJWKSFingerprint',
    'authJWTClaimKey',
    'authJWTExclude',
    'authJWTIssuer',
    'authJWTAudience',
    // No ticket: the rest of playback.
    'playbackEncryption',
    'playbackServerKey',
    'playbackServerCert',
    'playbackAllowOrigins',
    'playbackTrustedProxies',
    // No ticket: logging and transport internals.
    'logStructured',
    'sysLogPrefix',
    'dumpPackets',
    'udpReadBufferSize',
    // No ticket: TLS, CORS and proxies of the API, metrics and pprof listeners.
    'apiEncryption',
    'apiServerKey',
    'apiServerCert',
    'apiAllowOrigins',
    'apiTrustedProxies',
    'metricsEncryption',
    'metricsServerKey',
    'metricsServerCert',
    'metricsAllowOrigins',
    'metricsTrustedProxies',
    'pprofEncryption',
    'pprofServerKey',
    'pprofServerCert',
    'pprofAllowOrigins',
    'pprofTrustedProxies',
    // No ticket: RTSP and RTMP extras.
    'srtpAddress',
    'srtcpAddress',
    'multicastSRTPPort',
    'multicastSRTCPPort',
    'rtspTrustedProxies',
    'rtmpTrustedProxies',
    // No ticket: HLS and WebRTC extras. The exclude list is 1.21.x only.
    'hlsMuxerCloseAfter',
    'hlsCDNSecret',
    'webrtcSTUNGatherTimeout',
    'webrtcHandshakeTimeout',
    'webrtcTrackGatherTimeout',
    'webrtcIPsFromInterfacesExcludeList',
    // No ticket: the MoQ server.
    'moq',
    'moqHTTP2Address',
    'moqHTTP3Address',
    'moqQUICAddress',
    'moqServerKey',
    'moqServerCert',
    'moqAllowOrigins',
    'moqTrustedProxies',
  ],
  pathDefaults: [
    // The entry's own name, not a setting.
    'name',
    // #348
    'alwaysAvailable',
    'alwaysAvailableFile',
    'sourceOnDemand',
    'sourceOnDemandStartTimeout',
    'sourceOnDemandCloseAfter',
    // No ticket: the rest of always-available. Tracks need their own editor;
    // Recorded is 1.21.x only.
    'alwaysAvailableTracks',
    'alwaysAvailableRecorded',
    // No ticket: general path settings.
    'sourceFingerprint',
    'sourceRedirect',
    'maxReaders',
    'useAbsoluteTimestamp',
    'overridePublisher',
    'recordMaxPartSize',
    'srtPublishPassphrase',
    'srtReadPassphrase',
    // No ticket: pulled-source settings. moqTransport is 1.21.x only.
    'rtspDemuxMpegts',
    'rtspTransport',
    'rtspAnyPort',
    'rtspRangeType',
    'rtspRangeStart',
    'rtspScale',
    'rtspUDPSourcePortRange',
    'rtpSDP',
    'whepBearerToken',
    'whepSTUNGatherTimeout',
    'whepHandshakeTimeout',
    'whepTrackGatherTimeout',
    'moqTransport',
    // No ticket: the Raspberry Pi camera. rpiCameraSecondary needs its own editor.
    'rpiCameraCamID',
    'rpiCameraSecondary',
    'rpiCameraWidth',
    'rpiCameraHeight',
    'rpiCameraHFlip',
    'rpiCameraVFlip',
    'rpiCameraBrightness',
    'rpiCameraContrast',
    'rpiCameraSaturation',
    'rpiCameraSharpness',
    'rpiCameraExposure',
    'rpiCameraAWB',
    'rpiCameraAWBGains',
    'rpiCameraDenoise',
    'rpiCameraShutter',
    'rpiCameraMetering',
    'rpiCameraGain',
    'rpiCameraEV',
    'rpiCameraROI',
    'rpiCameraHDR',
    'rpiCameraTuningFile',
    'rpiCameraMode',
    'rpiCameraFPS',
    'rpiCameraAfMode',
    'rpiCameraAfRange',
    'rpiCameraAfSpeed',
    'rpiCameraLensPosition',
    'rpiCameraAfWindow',
    'rpiCameraFlickerPeriod',
    'rpiCameraTextOverlayEnable',
    'rpiCameraTextOverlay',
    'rpiCameraCodec',
    'rpiCameraIDRPeriod',
    'rpiCameraBitrate',
    'rpiCameraH264Profile',
    'rpiCameraH264Level',
    'rpiCameraMJPEGQuality',
  ],
}

// Other specs PATCH config in parallel, and MediaMTX restarts its API listener
// on every config write, so a pooled socket can die with "socket hang up".
// Polling retries on a fresh one (see patchGlobal in publish-urls.spec.ts).
async function servedKeys(request: APIRequestContext, endpoint: string): Promise<string[]> {
  let keys: string[] = []
  await expect.poll(async () => {
    try {
      const res = await request.get(`${API}${endpoint}`)
      if (!res.ok())
        return false
      keys = Object.keys(await res.json())
      return true
    }
    catch {
      return false
    }
  }).toBe(true)
  return keys
}

// A deprecated alias an older Connect once PATCHed (the old hook or RTSP names)
// stays served until MediaMTX restarts, so a long-running local MediaMTX can
// fail this. Restart it.
function expectNoDrift(served: string[], modeled: string[], allowlisted: string[], scope: string) {
  expect(
    served.filter(key => !modeled.includes(key) && !allowlisted.includes(key)),
    `MediaMTX serves ${scope} keys Connect neither models nor lists in DELIBERATELY_UNMODELED.${scope}`,
  ).toEqual([])
  expect(
    modeled.filter(key => !served.includes(key)),
    `Connect models ${scope} keys MediaMTX no longer serves (renamed or removed upstream)`,
  ).toEqual([])
  expect(
    allowlisted.filter(key => modeled.includes(key)),
    `DELIBERATELY_UNMODELED.${scope} lists keys Connect now models; delete them from the list`,
  ).toEqual([])
}

test.describe('MediaMTX schema drift', () => {
  test('global config matches what MediaMTX serves', async ({ request }) => {
    const served = await servedKeys(request, '/config/global/get')
    expectNoDrift(
      served,
      Object.keys(GlobalConfigSchema.shape),
      DELIBERATELY_UNMODELED.global,
      'global',
    )
  })

  // MediaMTX serves `source` from path defaults too, so this scope compares
  // against the per-path schema, which is path defaults plus `source`.
  test('path defaults match what MediaMTX serves', async ({ request }) => {
    const served = await servedKeys(request, '/config/pathdefaults/get')
    expectNoDrift(
      served,
      Object.keys(PathConfigSchema.shape),
      DELIBERATELY_UNMODELED.pathDefaults,
      'pathDefaults',
    )
  })
})
