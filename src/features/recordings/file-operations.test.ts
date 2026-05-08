import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { countFilesInSubdirectories, getFilesInDirectory } from './file-operations'

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

describe('countFilesInSubdirectories', () => {
  it('counts files per subdirectory and ignores top-level files', () => {
    makeFile(path.join(tmp, 'camera1', 'a.mp4'))
    makeFile(path.join(tmp, 'camera1', 'b.mp4'))
    makeFile(path.join(tmp, 'camera2', 'c.mp4'))
    makeFile(path.join(tmp, 'top-level.mp4'))

    expect(countFilesInSubdirectories(tmp)).toEqual({
      camera1: 2,
      camera2: 1,
    })
  })

  it('returns an empty record when there are no subdirectories', () => {
    expect(countFilesInSubdirectories(tmp)).toEqual({})
  })

  it('reports 0 for an empty subdirectory', () => {
    fs.mkdirSync(path.join(tmp, 'empty-stream'))
    expect(countFilesInSubdirectories(tmp)).toEqual({ 'empty-stream': 0 })
  })

  it('throws when the directory does not exist', () => {
    expect(() => countFilesInSubdirectories(path.join(tmp, 'missing'))).toThrow()
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
