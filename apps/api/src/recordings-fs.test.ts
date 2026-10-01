import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { listStreamRecordingFiles, summarizeStreamRecordings } from './recordings-fs'

let recordings: string

function writeAt(filePath: string, mtime: string) {
  writeFileSync(filePath, '')
  utimesSync(filePath, new Date(mtime), new Date(mtime))
}

beforeAll(() => {
  recordings = mkdtempSync(path.join(tmpdir(), 'recordings-fs-'))
  mkdirSync(path.join(recordings, 'stream1'))
  writeAt(path.join(recordings, 'stream1', '2026-07-01_10-00-00.mp4'), '2026-07-01T10:00:00Z')
  writeAt(path.join(recordings, 'stream1', '2026-07-02_10-00-00.mp4'), '2026-07-02T10:00:00Z')
  // Finder litter, newer than any recording.
  writeAt(path.join(recordings, 'stream1', '.DS_Store'), '2026-07-03T10:00:00Z')
})

afterAll(() => rmSync(recordings, { recursive: true, force: true }))

describe('summarizeStreamRecordings', () => {
  it('counts the same files the per-stream listing returns', () => {
    const summary = summarizeStreamRecordings(recordings)

    expect(summary.stream1?.count).toBe(listStreamRecordingFiles(recordings, 'stream1').length)
    expect(summary.stream1?.count).toBe(2)
  })

  it('takes the latest mtime from recordings only', () => {
    const summary = summarizeStreamRecordings(recordings)

    expect(summary.stream1?.latestMtime).toEqual(new Date('2026-07-02T10:00:00Z'))
  })
})
