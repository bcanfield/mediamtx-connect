import fs from 'node:fs'
import path from 'node:path'

export interface StreamSummary {
  count: number
  latestMtime: Date | null
}

export function summarizeStreamRecordings(
  directoryPath: string,
): Record<string, StreamSummary> {
  const directories: string[] = fs
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

export function getFilesInDirectory(directoryPath: string): string[] {
  const directories: string[] = fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .map(dirent => dirent.name)
  return directories
}
