/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = path.resolve(__dirname, '..')
const MESSAGES_DIR = path.join(ROOT, 'messages')
const SOURCE_LOCALE = 'en'

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function flatten(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object')
    return [prefix]
  const out: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value))
      out.push(...flatten(value, nextKey))
    else
      out.push(nextKey)
  }
  return out
}

function main() {
  const files = fs.readdirSync(MESSAGES_DIR).filter(f => f.endsWith('.json'))
  const sourceFile = `${SOURCE_LOCALE}.json`
  if (!files.includes(sourceFile)) {
    console.error(`✗ messages/${sourceFile} not found`)
    process.exit(1)
  }

  const sourceKeys = new Set(flatten(readJson(path.join(MESSAGES_DIR, sourceFile))))
  let hadError = false

  for (const file of files) {
    if (file === sourceFile)
      continue
    const locale = file.replace(/\.json$/, '')
    const targetKeys = new Set(flatten(readJson(path.join(MESSAGES_DIR, file))))

    const missing = [...sourceKeys].filter(k => !targetKeys.has(k))
    const extra = [...targetKeys].filter(k => !sourceKeys.has(k))

    if (missing.length === 0 && extra.length === 0) {
      console.log(`✓ ${locale}: ${targetKeys.size} keys, in sync with ${SOURCE_LOCALE}`)
      continue
    }

    hadError = true
    console.error(`✗ ${locale}: out of sync with ${SOURCE_LOCALE}`)
    if (missing.length > 0) {
      console.error(`  Missing (${missing.length}):`)
      for (const k of missing) console.error(`    - ${k}`)
    }
    if (extra.length > 0) {
      console.error(`  Extra (${extra.length}):`)
      for (const k of extra) console.error(`    - ${k}`)
    }
  }

  process.exit(hadError ? 1 : 0)
}

main()
