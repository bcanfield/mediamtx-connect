// Verifies every non-English locale in apps/web/messages has exactly the same
// message keys as en.json. Mirrors the old repo's scripts/i18n-check.ts.
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const messagesDir = fileURLToPath(new URL('../apps/web/messages', import.meta.url))

function flattenKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key
    return value !== null && typeof value === 'object' ? flattenKeys(value, full) : [full]
  })
}

const en = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8'))
const enKeys = new Set(flattenKeys(en))

let failed = false
for (const file of fs.readdirSync(messagesDir).filter(f => f.endsWith('.json') && f !== 'en.json')) {
  const keys = new Set(flattenKeys(JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf8'))))
  const missing = [...enKeys].filter(k => !keys.has(k))
  const extra = [...keys].filter(k => !enKeys.has(k))
  if (missing.length > 0 || extra.length > 0) {
    failed = true
    console.error(`${file}: ${missing.length} missing, ${extra.length} extra keys`)
    for (const k of missing.slice(0, 10)) console.error(`  missing: ${k}`)
    for (const k of extra.slice(0, 10)) console.error(`  extra:   ${k}`)
  }
}

if (failed) {
  process.exit(1)
}
console.log('i18n:check OK — all locales match en.json')
