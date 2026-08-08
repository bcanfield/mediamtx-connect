import type { AppConfig } from '@connect/contract'
import { mkdirSync, mkdtempSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  latestScreenshotMtimeFor,
  latestScreenshotPathFor,
  latestScreenshotUrlFor,
  listStreamRecordingFiles,
  screenshotUrlFor,
  summarizeStreamRecordings,
} from './recordings-fs'

// Everything here reads real directory entries and mtimes, so the fixture is a
// real temp tree rather than a mocked node:fs.
let root: string
let config: AppConfig

function writeAt(filePath: string, mtime: string) {
  writeFileSync(filePath, '')
  utimesSync(filePath, new Date(mtime), new Date(mtime))
}

beforeAll(() => {
  root = mkdtempSync(path.join(tmpdir(), 'recordings-fs-'))
  const recordings = path.join(root, 'recordings')
  const screenshots = path.join(root, 'screenshots')

  for (const dir of ['stream1', 'stream2', 'dotted'])
    mkdirSync(path.join(recordings, dir), { recursive: true })
  // A loose file beside the stream directories — not a stream.
  writeFileSync(path.join(recordings, 'notes.txt'), '')

  writeAt(path.join(recordings, 'stream1', '2026-07-01_10-00-00.mp4'), '2026-07-01T10:00:00Z')
  writeAt(path.join(recordings, 'stream1', '2026-07-02_10-00-00.mp4'), '2026-07-02T10:00:00Z')
  writeAt(path.join(recordings, 'stream2', '2026-07-01_10-00-00.mp4'), '2026-07-01T10:00:00Z')
  writeFileSync(path.join(recordings, 'dotted', 'a.mp4'), '')
  writeFileSync(path.join(recordings, 'dotted', '.partial.mp4'), '')

  for (const dir of ['stream1', 'stream2', 'prefixed', 'cam one', 'blank'])
    mkdirSync(path.join(screenshots, dir), { recursive: true })

  writeAt(path.join(screenshots, 'stream1', 'live.png'), '2026-07-03T09:00:00Z')
  writeAt(path.join(screenshots, 'stream1', '2026-07-01_10-00-00.png'), '2026-07-01T10:00:00Z')
  writeAt(path.join(screenshots, 'stream1', '2026-07-02_10-00-00.png'), '2026-07-02T10:00:00Z')
  writeAt(path.join(screenshots, 'stream2', '2026-07-01_10-00-00.png'), '2026-07-01T10:00:00Z')
  writeAt(path.join(screenshots, 'stream2', '2026-07-02_10-00-00.png'), '2026-07-02T10:00:00Z')
  // A stream whose thumbnails carry the path name, as a recordPath with %path
  // produces — so the newest thumbnail sorts *after* live.png by name.
  writeAt(path.join(screenshots, 'prefixed', 'live.png'), '2026-07-03T09:00:00Z')
  writeAt(path.join(screenshots, 'prefixed', 'prefixed_2026-07-02_10-00-00.png'), '2026-07-02T10:00:00Z')
  writeFileSync(path.join(screenshots, 'cam one', 'a b.png'), '')
  // A stream whose directory exists but holds no snapshot.
  writeFileSync(path.join(screenshots, 'blank', 'notes.txt'), '')

  config = {
    mediaMtxUrl: 'http://127.0.0.1',
    mediaMtxApiPort: 9997,
    remoteMediaMtxUrl: null,
    recordingsDirectory: recordings,
    screenshotsDirectory: screenshots,
  }
})

describe('summarizeStreamRecordings', () => {
  it('keys the summary by stream directory, skipping loose files', () => {
    const summary = summarizeStreamRecordings(config.recordingsDirectory)

    expect(Object.keys(summary).sort()).toEqual(['dotted', 'stream1', 'stream2'])
  })

  it('counts the files in each stream directory', () => {
    const summary = summarizeStreamRecordings(config.recordingsDirectory)

    expect(summary.stream1?.count).toBe(2)
    expect(summary.stream2?.count).toBe(1)
  })

  it('reports the newest mtime in each stream directory', () => {
    const summary = summarizeStreamRecordings(config.recordingsDirectory)

    expect(summary.stream1?.latestMtime).toEqual(new Date('2026-07-02T10:00:00Z'))
    expect(summary.stream2?.latestMtime).toEqual(new Date('2026-07-01T10:00:00Z'))
  })

  it('throws when the recordings directory is not there', () => {
    expect(() => summarizeStreamRecordings(path.join(root, 'gone'))).toThrow(/ENOENT/)
  })
})

describe('listStreamRecordingFiles', () => {
  it('lists a stream\'s recordings newest first', () => {
    const files = listStreamRecordingFiles(config.recordingsDirectory, 'stream1')

    expect(files).toEqual(['2026-07-02_10-00-00.mp4', '2026-07-01_10-00-00.mp4'])
  })

  // MediaMTX writes the segment it is still recording under a leading dot.
  it('hides dotfiles', () => {
    const files = listStreamRecordingFiles(config.recordingsDirectory, 'dotted')

    expect(files).toEqual(['a.mp4'])
  })

  it('throws when the stream has no directory', () => {
    expect(() => listStreamRecordingFiles(config.recordingsDirectory, 'gone')).toThrow(/ENOENT/)
  })
})

describe('screenshotUrlFor', () => {
  it('points at the recording\'s sibling PNG', () => {
    const url = screenshotUrlFor(config, 'stream1', '2026-07-02_10-00-00.mp4')

    expect(url).toBe('/media/screenshots/stream1/2026-07-02_10-00-00.png')
  })

  it('answers null when the thumbnail has not been generated', () => {
    expect(screenshotUrlFor(config, 'stream2', '2026-07-03_10-00-00.mp4')).toBeNull()
  })

  it('escapes the stream and file names into the URL', () => {
    const url = screenshotUrlFor(config, 'cam one', 'a b.mp4')

    expect(url).toBe('/media/screenshots/cam%20one/a%20b.png')
  })
})

describe('latestScreenshotPathFor', () => {
  it('prefers the live capture over the recording thumbnails', () => {
    const filePath = latestScreenshotPathFor(config, 'prefixed')

    expect(filePath).toBe(path.join(config.screenshotsDirectory, 'prefixed', 'live.png'))
  })

  it('falls back to the newest recording thumbnail when there is no live capture', () => {
    const filePath = latestScreenshotPathFor(config, 'stream2')

    expect(filePath).toBe(path.join(config.screenshotsDirectory, 'stream2', '2026-07-02_10-00-00.png'))
  })

  it('answers null when the stream has no screenshots directory', () => {
    expect(latestScreenshotPathFor(config, 'gone')).toBeNull()
  })

  it('answers null when the directory holds no PNG', () => {
    expect(latestScreenshotPathFor(config, 'blank')).toBeNull()
  })
})

describe('latestScreenshotUrlFor', () => {
  it('points at the stream\'s /latest route', () => {
    expect(latestScreenshotUrlFor(config, 'stream2')).toBe('/media/screenshots/stream2/latest')
  })

  it('escapes the stream name into the URL', () => {
    expect(latestScreenshotUrlFor(config, 'cam one')).toBe('/media/screenshots/cam%20one/latest')
  })

  it('answers null when the stream has no snapshot at all', () => {
    expect(latestScreenshotUrlFor(config, 'gone')).toBeNull()
  })
})

describe('latestScreenshotMtimeFor', () => {
  it('reports when the file /latest serves was captured', () => {
    expect(latestScreenshotMtimeFor(config, 'prefixed')).toEqual(new Date('2026-07-03T09:00:00Z'))
  })

  it('answers null when the stream has no snapshot at all', () => {
    expect(latestScreenshotMtimeFor(config, 'gone')).toBeNull()
  })
})
