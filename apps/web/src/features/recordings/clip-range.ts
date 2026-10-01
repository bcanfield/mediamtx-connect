import type { RecordingSpan } from '@connect/contract'

/** "Last 5 min", "Last 15 min" and "Last 1 h", in seconds. */
export const CLIP_PRESETS = [300, 900, 3600] as const
export type ClipPreset = typeof CLIP_PRESETS[number]

export interface ClipRange {
  start: Date
  /** Seconds. */
  duration: number
}

// Presets end where the latest span ends, not at wall-clock now: now may sit in
// a gap or on another day, and a `start` with no recording around it is a 404.
// MediaMTX's /list returns spans oldest first.
export function clipRange(spans: RecordingSpan[], preset: ClipPreset): ClipRange {
  const latest = spans.at(-1)!
  const end = latest.start.getTime() + latest.duration * 1000
  const duration = Math.min(preset, latest.duration)
  return { start: new Date(end - duration * 1000), duration }
}

// `cams/front_door` at 14:02:11Z → `cams_front_door_2026-10-01_14-02-11.mp4`.
export function clipFileName(path: string, start: Date): string {
  const stamp = start.toISOString().slice(0, 19).replace('T', '_').replaceAll(':', '-')
  return `${path.replace(/[^\w.-]/g, '_')}_${stamp}.mp4`
}
