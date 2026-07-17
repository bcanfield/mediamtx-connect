import type { AppConfig } from '@connect/contract'
import { existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

export interface StreamSummary {
  count: number
  latestMtime: Date | null
}

export function summarizeStreamRecordings(directoryPath: string): Record<string, StreamSummary> {
  const directories = readdirSync(directoryPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  const summary: Record<string, StreamSummary> = {}

  for (const dir of directories) {
    const dirPath = path.join(directoryPath, dir)
    const files = readdirSync(dirPath)
    let latestMtime: Date | null = null
    for (const file of files) {
      const stat = statSync(path.join(dirPath, file))
      if (!latestMtime || stat.mtime > latestMtime)
        latestMtime = stat.mtime
    }
    summary[dir] = { count: files.length, latestMtime }
  }

  return summary
}

export function listStreamRecordingFiles(recordingsDirectory: string, streamName: string): string[] {
  return readdirSync(path.join(recordingsDirectory, streamName))
    .filter(f => !f.startsWith('.'))
    .sort((one, two) => (one > two ? -1 : 1))
}

// URL for a recording's sibling PNG, or null when it hasn't been generated.
export function screenshotUrlFor(config: AppConfig, streamName: string, recordingFileName: string): string | null {
  const pngName = `${path.parse(recordingFileName).name}.png`
  const pngPath = path.join(config.screenshotsDirectory, streamName, pngName)
  return existsSync(pngPath)
    ? `/media/screenshots/${encodeURIComponent(streamName)}/${encodeURIComponent(pngName)}`
    : null
}

// The file `/media/screenshots/{stream}/latest` serves, or null when a stream
// has no snapshot at all. live.png is the periodic capture of the running
// stream; streams that are offline (or predate the capture job) fall back to
// their newest recording thumbnail, whose %Y-%m-%d_%H-%M-%S name sorts
// chronologically. Resolved here rather than at each caller so the route, the
// URL helper and the card's snapshot age can't disagree about which file is
// "latest".
export function latestScreenshotPathFor(config: AppConfig, streamName: string): string | null {
  const dir = path.join(config.screenshotsDirectory, streamName)
  if (!existsSync(dir))
    return null

  const live = path.join(dir, 'live.png')
  if (existsSync(live))
    return live

  const latest = readdirSync(dir).filter(f => f.endsWith('.png')).sort().at(-1)
  return latest ? path.join(dir, latest) : null
}

export function latestScreenshotUrlFor(config: AppConfig, streamName: string): string | null {
  return latestScreenshotPathFor(config, streamName)
    ? `/media/screenshots/${encodeURIComponent(streamName)}/latest`
    : null
}

// When the snapshot a card would show was captured, or null when there is none.
export function latestScreenshotMtimeFor(config: AppConfig, streamName: string): Date | null {
  const filePath = latestScreenshotPathFor(config, streamName)
  return filePath ? statSync(filePath).mtime : null
}
