import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getFilesInDirectory, summarizeStreamRecordings } from './file-operations'

let tmp: string

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'recordings-test-'))
})

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true })
})

function makeFile(p: string) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, '')
}

describe('summarizeStreamRecordings', () => {
  it('counts files per subdirectory and ignores top-level files', () => {
    makeFile(path.join(tmp, 'camera1', 'a.mp4'))
    makeFile(path.join(tmp, 'camera1', 'b.mp4'))
    makeFile(path.join(tmp, 'camera2', 'c.mp4'))
    makeFile(path.join(tmp, 'top-level.mp4'))

    const summary = summarizeStreamRecordings(tmp)
    expect(Object.keys(summary).sort()).toEqual(['camera1', 'camera2'])
    expect(summary.camera1.count).toBe(2)
    expect(summary.camera2.count).toBe(1)
    expect(summary.camera1.latestMtime).toBeInstanceOf(Date)
  })

  it('returns an empty record when there are no subdirectories', () => {
    expect(summarizeStreamRecordings(tmp)).toEqual({})
  })

  it('reports 0 + null mtime for an empty subdirectory', () => {
    fs.mkdirSync(path.join(tmp, 'empty-stream'))
    expect(summarizeStreamRecordings(tmp)).toEqual({
      'empty-stream': { count: 0, latestMtime: null },
    })
  })

  it('throws when the directory does not exist', () => {
    expect(() => summarizeStreamRecordings(path.join(tmp, 'missing'))).toThrow()
  })
})

describe('getFilesInDirectory', () => {
  it('lists files and subdirectories', () => {
    makeFile(path.join(tmp, 'a.mp4'))
    makeFile(path.join(tmp, 'b.mp4'))
    fs.mkdirSync(path.join(tmp, 'sub'))
    expect(getFilesInDirectory(tmp).sort()).toEqual(['a.mp4', 'b.mp4', 'sub'])
  })

  it('returns an empty array for an empty directory', () => {
    expect(getFilesInDirectory(tmp)).toEqual([])
  })
})
