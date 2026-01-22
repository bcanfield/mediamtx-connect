import fs from 'node:fs'
import path from 'node:path'

export function countFilesInSubdirectories(
  directoryPath: string,
): Record<string, number> {
  const directories: string[] = fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  const directoryFileCount: Record<string, number> = {}

  for (const dir of directories) {
    const dirPath = path.join(directoryPath, dir)
    const files = fs.readdirSync(dirPath)
    directoryFileCount[dir] = files.length
  }

  return directoryFileCount
}

export function getFilesInDirectory(directoryPath: string): string[] {
  const directories: string[] = fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .map(dirent => dirent.name)
  return directories
}
