/* eslint-disable no-console */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = path.resolve(__dirname, '..')
const SOURCE = path.join(ROOT, 'README.md')
const STATUS = path.join(ROOT, 'docs', 'i18n', '.translation-status.json')
const I18N_DIR = path.join(ROOT, 'docs', 'i18n')

interface Status {
  source: string
  sourceHash: string
  translations: Record<string, string>
}

function hash16(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex').slice(0, 16)
}

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`✗ ${path.relative(ROOT, SOURCE)} not found`)
    process.exit(1)
  }
  if (!fs.existsSync(STATUS)) {
    console.error(`✗ ${path.relative(ROOT, STATUS)} not found`)
    process.exit(1)
  }

  const status: Status = JSON.parse(fs.readFileSync(STATUS, 'utf8'))
  const currentSourceHash = hash16(SOURCE)
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
    console.log(`✓ ${locale}: README in sync with source`)
  }

  process.exit(hadError ? 1 : 0)
}

main()
