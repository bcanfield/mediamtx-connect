// Repo invariants that used to be ESLint rules on JSON and YAML files
// (eslint-plugin-pnpm, jsonc/no-dupe-keys). Oxlint only lints JS and TS, so
// they live here now. See docs/adr/0008-oxlint-replaces-eslint.md.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const root = new URL('..', import.meta.url)
function read(file) {
  return readFileSync(new URL(file, root), 'utf8')
}

function tracked(pattern) {
  return execFileSync('git', ['ls-files', pattern], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean)
}

const manifests = tracked('*package.json').filter(file => /(?:^|\/)package\.json$/.test(file))
const workspace = read('pnpm-workspace.yaml')

// The top-level `catalog:` block as [name, specifier] pairs, duplicates kept.
function catalogEntries(yaml) {
  const lines = yaml.split('\n')
  const start = lines.indexOf('catalog:')
  const entries = []
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break
    const match = !line.trimStart().startsWith('#') && line.match(/^ {2}'?([^':]+)'?: (.+)$/)
    if (match) entries.push([match[1], match[2]])
  }
  return entries
}

// Every object key path that appears more than once. JSON.parse keeps the last
// duplicate silently, so this walks the text itself.
function duplicateKeys(text) {
  const dupes = []
  let i = 0
  const ws = () => {
    while (/\s/.test(text[i])) i++
  }
  const string = () => {
    const start = i++
    while (text[i] !== '"') i += text[i] === '\\' ? 2 : 1
    i++
    return JSON.parse(text.slice(start, i))
  }
  const value = path => {
    ws()
    if (text[i] === '{') {
      i++
      const seen = new Set()
      ws()
      while (text[i] !== '}') {
        ws()
        const key = string()
        if (seen.has(key)) dupes.push([...path, key].join('.'))
        seen.add(key)
        ws()
        i++ // :
        value([...path, key])
        ws()
        if (text[i] === ',') i++
        ws()
      }
      i++
    } else if (text[i] === '[') {
      i++
      let n = 0
      ws()
      while (text[i] !== ']') {
        value([...path, n++])
        ws()
        if (text[i] === ',') i++
        ws()
      }
      i++
    } else if (text[i] === '"') {
      string()
    } else {
      while (i < text.length && !/[,\]}\s]/.test(text[i])) i++
    }
  }
  value([])
  return dupes
}

describe('pnpm catalog', () => {
  const catalog = catalogEntries(workspace)
  const names = catalog.map(([name]) => name)

  it('is parsed from pnpm-workspace.yaml', () => {
    expect(names).toContain('typescript')
  })

  it('has no entry twice', () => {
    expect(names.filter((name, i) => names.indexOf(name) !== i)).toEqual([])
  })

  it('is where every third-party version lives', () => {
    const offenders = []
    for (const file of manifests) {
      const pkg = JSON.parse(read(file))
      for (const field of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
        for (const [dep, spec] of Object.entries(pkg[field] ?? {})) {
          if (!spec.startsWith('workspace:') && spec !== 'catalog:') offenders.push(`${file} ${field}.${dep}: ${spec}`)
          if (spec === 'catalog:' && !names.includes(dep)) offenders.push(`${file} ${field}.${dep}: no catalog entry`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('has no entry that nothing uses', () => {
    const used = new Set(
      manifests.flatMap(file => {
        const pkg = JSON.parse(read(file))
        return ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'].flatMap(f =>
          Object.keys(pkg[f] ?? {}),
        )
      }),
    )
    expect(names.filter(name => !used.has(name))).toEqual([])
  })
})

describe('pnpm settings', () => {
  it('live in pnpm-workspace.yaml, not package.json', () => {
    expect(manifests.filter(file => 'pnpm' in JSON.parse(read(file)))).toEqual([])
  })

  it.each([['minimumReleaseAgeExcludePrune: true'], ['shellEmulator: true'], ['trustPolicy: no-downgrade']])(
    'keeps %s',
    setting => {
      expect(workspace.split('\n')).toContain(setting)
    },
  )
})

describe('tracked JSON', () => {
  // .vscode/*.json is JSONC (comments), which neither check reads.
  const files = tracked('*.json').filter(file => !file.startsWith('.vscode/'))

  it('is strict JSON (no comments, trailing commas or JSON5 literals)', () => {
    const offenders = files.filter(file => {
      try {
        JSON.parse(read(file))
        return false
      } catch {
        return true
      }
    })
    expect(offenders).toEqual([])
  })

  it('has no duplicate keys', () => {
    const offenders = files.flatMap(file => duplicateKeys(read(file)).map(key => `${file}: ${key}`))
    expect(offenders).toEqual([])
  })

  it('catches a duplicate key', () => {
    expect(duplicateKeys('{"a": {"b": 1, "b": [2, {"c": "x\\"y"}]}}')).toEqual(['a.b'])
  })
})
