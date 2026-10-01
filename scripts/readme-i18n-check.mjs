// Fails when README.md drifts from the recorded translation-sync hashes, or when a locale
// README no longer mirrors the source's structure. The hashes alone are easy to bump in
// lockstep without touching a single translation; the structure comparison is not.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SOURCE = path.join(ROOT, 'README.md')
const STATUS = path.join(ROOT, 'docs', 'i18n', '.translation-status.json')
const I18N_DIR = path.join(ROOT, 'docs', 'i18n')

function hash16(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex').slice(0, 16)
}

// The parts of the README a translation has to carry over one-for-one: the heading
// outline, the shape of every fenced block, and every literal in backticks (env vars,
// flags, paths, defaults).
function skeleton(markdown) {
  const headings = []
  const codeBlocks = []
  const literals = new Set()
  let openBlock = null

  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) {
      if (openBlock) {
        codeBlocks.push(`${openBlock.lang}:${openBlock.lines}`)
        openBlock = null
      }
      else {
        openBlock = { lang: line.slice(3).trim(), lines: 0 }
      }
      continue
    }
    if (openBlock) {
      openBlock.lines += 1
      continue
    }
    const heading = /^(#{1,6}) /.exec(line)
    if (heading)
      headings.push('#'.repeat(heading[1].length))
    for (const [, literal] of line.matchAll(/`([^`]+)`/g)) literals.add(literal)
  }

  return { headings, codeBlocks, literals }
}

function structureErrors(source, translation) {
  const errors = []

  if (source.headings.join(' ') !== translation.headings.join(' ')) {
    errors.push(
      `heading outline differs — source: ${source.headings.join(' ')} / translation: ${translation.headings.join(' ')}`,
    )
  }

  if (source.codeBlocks.join(' ') !== translation.codeBlocks.join(' ')) {
    errors.push(
      `fenced blocks differ (lang:lines) — source: ${source.codeBlocks.join(' ')} / translation: ${translation.codeBlocks.join(' ')}`,
    )
  }

  const missing = [...source.literals].filter(literal => !translation.literals.has(literal))
  if (missing.length) {
    errors.push(`missing literals: ${missing.map(literal => `\`${literal}\``).join(', ')}`)
  }

  return errors
}

const status = JSON.parse(fs.readFileSync(STATUS, 'utf8'))
const currentSourceHash = hash16(SOURCE)
const sourceSkeleton = skeleton(fs.readFileSync(SOURCE, 'utf8'))
let hadError = false

if (status.sourceHash !== currentSourceHash) {
  hadError = true
  console.error(`✗ README.md hash changed: ${status.sourceHash} → ${currentSourceHash}`)
  console.error(`  Update locale READMEs in docs/i18n/, then bump sourceHash and each translation hash in .translation-status.json.`)
}

for (const [locale, recordedHash] of Object.entries(status.translations)) {
  const readmePath = path.join(I18N_DIR, `README.${locale}.md`)
  if (!fs.existsSync(readmePath)) {
    hadError = true
    console.error(`✗ ${locale}: docs/i18n/README.${locale}.md missing`)
    continue
  }
  if (recordedHash !== currentSourceHash) {
    hadError = true
    console.error(`✗ ${locale}: stale (recorded ${recordedHash}, source ${currentSourceHash})`)
    continue
  }
  const errors = structureErrors(sourceSkeleton, skeleton(fs.readFileSync(readmePath, 'utf8')))
  if (errors.length) {
    hadError = true
    console.error(`✗ ${locale}: content is stale even though the recorded hash matches`)
    for (const error of errors) console.error(`  ${error}`)
    continue
  }
  console.log(`✓ ${locale}: README in sync with source`)
}

process.exit(hadError ? 1 : 0)
