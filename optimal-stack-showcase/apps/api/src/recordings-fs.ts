import type { AppConfig } from '@connect/contract'
import fs from 'node:fs'
import path from 'node:path'

export interface StreamSummary {
  count: number
  latestMtime: Date | null
}

export function summarizeStreamRecordings(directoryPath: string): Record<string, StreamSummary> {
  const directories = fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  const summary: Record<string, StreamSummary> = {}

  for (const dir of directories) {
    const dirPath = path.join(directoryPath, dir)
    const files = fs.readdirSync(dirPath)
    let latestMtime: Date | null = null
    for (const file of files) {
      const stat = fs.statSync(path.join(dirPath, file))
      if (!latestMtime || stat.mtime > latestMtime)
        latestMtime = stat.mtime
    }
    summary[dir] = { count: files.length, latestMtime }
  }

  return summary
}

export function listStreamRecordingFiles(recordingsDirectory: string, streamName: string): string[] {
  return fs
    .readdirSync(path.join(recordingsDirectory, streamName))
    .filter(f => !f.startsWith('.'))
    .sort((one, two) => (one > two ? -1 : 1))
}

// URL for a recording's sibling PNG, or null when it hasn't been generated.
export function screenshotUrlFor(config: AppConfig, streamName: string, recordingFileName: string): string | null {
  const pngName = `${path.parse(recordingFileName).name}.png`
  const pngPath = path.join(config.screenshotsDirectory, streamName, pngName)
  return fs.existsSync(pngPath)
    ? `/media/screenshots/${encodeURIComponent(streamName)}/${encodeURIComponent(pngName)}`
    : null
}

// Most recent PNG in a stream's screenshot dir, or null.
export function latestScreenshotUrlFor(config: AppConfig, streamName: string): string | null {
  const dir = path.join(config.screenshotsDirectory, streamName)
  if (!fs.existsSync(dir))
    return null
  const pngs = fs.readdirSync(dir).filter(f => !f.startsWith('.'))
  if (pngs.length === 0)
    return null
  return `/media/screenshots/${encodeURIComponent(streamName)}/latest`
}
