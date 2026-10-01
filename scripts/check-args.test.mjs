import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseArgs, touchesI18n } from './check-args.mjs'

describe('parseArgs', () => {
  it('rejects --since with no ref after it', () => {
    expect(parseArgs(['--since']).error).toContain('--since')
  })

  it('treats a following flag as a missing ref, not as a ref named --foo', () => {
    expect(parseArgs(['--since', '--foo'])).toMatchObject({ since: null, error: expect.stringContaining('--since') })
  })

  it('scopes to the ref when one is given', () => {
    expect(parseArgs(['--since', 'main'])).toEqual({ since: 'main', explicit: [] })
  })

  it('falls back to the working tree with no arguments', () => {
    expect(parseArgs([])).toEqual({ since: null, explicit: [] })
  })

  it('passes bare paths through as explicit files', () => {
    expect(parseArgs(['some/file.ts', 'other.tsx'])).toEqual({ since: null, explicit: ['some/file.ts', 'other.tsx'] })
  })
})

describe('touchesI18n', () => {
  it('runs i18n:check for a message catalogue', () => {
    expect(touchesI18n(['apps/web/messages/de.json'])).toBe(true)
  })

  it('runs i18n:check for the English README and every translated one', () => {
    expect(touchesI18n(['README.md'])).toBe(true)
    expect(touchesI18n(['docs/i18n/README.pt-br.md'])).toBe(true)
  })

  it('runs i18n:check when only the sync hashes moved', () => {
    expect(touchesI18n(['docs/i18n/.translation-status.json'])).toBe(true)
  })

  it('skips i18n:check for an edit that cannot affect it', () => {
    expect(touchesI18n(['apps/api/src/env.ts', 'docs/FEATURES.md'])).toBe(false)
  })
})

describe('check.mjs', () => {
  // The whole point of the fix: a check that cannot fail is worse than no check,
  // so the bad invocation has to be loud and non-zero rather than silently green.
  it('exits non-zero on `--since` with no ref', () => {
    const script = fileURLToPath(new URL('./check.mjs', import.meta.url))
    const result = spawnSync(process.execPath, [script, '--since'], { encoding: 'utf8' })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('--since needs a ref')
  })
})
