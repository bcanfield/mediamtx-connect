import type { GlobalConfig } from '@connect/contract'

// MediaMTX's default publish ports, used only when the server hasn't reported a
// listen address (e.g. its global config is briefly unreachable). A configured
// address always wins — hardcoding the port regardless is the bug this fixes.
const DEFAULT_PORTS = { rtsp: 8554, rtmp: 1935, srt: 8890 } as const

export interface PublishTarget {
  /** Protocol label, e.g. "RTSP". A brand name — not translated (see I18N.md). */
  protocol: string
  /** The URL up to where the stream name goes; append a name for a full URL. */
  prefix: string
}

// MediaMTX listen addresses are `host:port`, with the host usually empty
// (`:8554`). We keep the configured port and pair it with the browser-facing
// host, so an operator who changed a listen address is pointed at the right one.
function portOf(address: string | undefined, fallback: number): number {
  if (!address)
    return fallback
  const colon = address.lastIndexOf(':')
  if (colon === -1)
    return fallback
  const port = Number.parseInt(address.slice(colon + 1), 10)
  return Number.isNaN(port) ? fallback : port
}

// The one builder for a server's publish URLs, shared by the card's copy action
// and the empty-state hints so the two can never disagree on a port.
//
// A protocol the server doesn't serve is left out entirely — its URL would look
// valid and then silently refuse the publisher. MediaMTX's toggles default to
// on, so only an explicit `false` drops a target: a missing flag (or a global
// config we couldn't read) keeps it, same as the port fallback above.
export function publishTargets(host: string, global: GlobalConfig | null | undefined): PublishTarget[] {
  const targets: PublishTarget[] = []
  if (global?.rtsp !== false)
    targets.push({ protocol: 'RTSP', prefix: `rtsp://${host}:${portOf(global?.rtspAddress, DEFAULT_PORTS.rtsp)}/` })
  if (global?.rtmp !== false)
    targets.push({ protocol: 'RTMP', prefix: `rtmp://${host}:${portOf(global?.rtmpAddress, DEFAULT_PORTS.rtmp)}/` })
  if (global?.srt !== false)
    targets.push({ protocol: 'SRT', prefix: `srt://${host}:${portOf(global?.srtAddress, DEFAULT_PORTS.srt)}?streamid=publish:` })
  return targets
}

export function publishUrl(target: PublishTarget, streamName: string): string {
  return `${target.prefix}${streamName}`
}
