#!/usr/bin/env node
// Seed sample recordings/screenshots into a data dir for local dev and e2e.
// Cross-platform (no bash, no ffmpeg) — just copies the committed fixtures in
// tests/fixtures. Idempotent: skips a stream dir that already has content, so
// re-running never clobbers recordings the live MediaMTX stack has added.
//
//   node scripts/seed-fixtures.mjs                 # -> <repo>/.dev-data
//   node scripts/seed-fixtures.mjs --target ./foo  # -> ./foo
import { cp, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const fixtures = path.join(repoRoot, 'tests', 'fixtures')

const argIdx = process.argv.indexOf('--target')
const target = path.resolve(
  argIdx !== -1 ? process.argv[argIdx + 1] : path.join(repoRoot, '.dev-data'),
)

async function isEmpty(dir) {
  try {
    return (await readdir(dir)).length === 0
  }
  catch {
    return true // doesn't exist yet
  }
}

async function seed(kind) {
  const dest = path.join(target, kind)
  if (!(await isEmpty(dest))) {
    console.log(`seed-fixtures: ${kind} already present in ${dest}, skipping`)
    return
  }
  await cp(path.join(fixtures, kind), dest, { recursive: true })
  console.log(`seed-fixtures: seeded ${kind} -> ${dest}`)
}

await mkdir(path.join(target, 'data'), { recursive: true })
await seed('recordings')
await seed('screenshots')
