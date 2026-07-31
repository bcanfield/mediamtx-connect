#!/usr/bin/env node
// The inner loop: what `pnpm verify` checks, scoped to what actually changed.
// Measured on this repo, warm: **~4s**, against ~10s for a full `pnpm verify`.
// Run this after every edit; run `verify` before pushing.
//
//   pnpm check                 # vs the working tree (staged + unstaged + untracked)
//   pnpm check --since main    # vs a ref, for a whole branch
//   pnpm check a.ts b.tsx      # explicit paths
//
// Four scoping decisions, each measured rather than assumed:
//
//   lint       eslint on the changed files only. Repo-wide is 3.4s warm even
//              with --cache, because most of that is ESLint's startup and flat
//              config resolution rather than checking files. Scoping it saves
//              far less than you would hope, for the same reason.
//   typecheck  turbo typecheck, unscoped. Turbo already scopes by package (14ms
//              on a full cache hit) and tsc has no useful file-level mode, so
//              there is nothing left to narrow.
//   test       vitest --changed, which resolves the module graph and runs only
//              the tests an edit can reach.
//   i18n       skipped unless a message catalogue or a README moved. It walks
//              every locale and every translated README every time, and no
//              other kind of edit can affect its result.
//
// Build is NOT here — that is verify's job, and it is what makes verify the
// thing that mirrors CI's Build job rather than merely resembling it.
import { execFileSync, spawn } from 'node:child_process'
import process from 'node:process'

const args = process.argv.slice(2)
const sinceIdx = args.indexOf('--since')
const since = sinceIdx === -1 ? null : args[sinceIdx + 1]
const explicit = args.filter((a, i) => a !== '--since' && i !== sinceIdx + 1)

function git(...a) {
  return execFileSync('git', a, { encoding: 'utf8' })
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
}

function changedFiles() {
  if (explicit.length)
    return explicit
  if (since)
    return git('diff', '--name-only', `${since}...HEAD`)
  // Working tree: tracked modifications plus untracked files. A new file that
  // has never been added is exactly the one most likely to have a lint error.
  return [
    ...git('diff', '--name-only', 'HEAD'),
    ...git('ls-files', '--others', '--exclude-standard'),
  ]
}

const files = [...new Set(changedFiles())]
const lintable = files.filter(f => /\.[cm]?[jt]sx?$/.test(f))
const touchesI18n = files.some(f =>
  f.startsWith('apps/web/messages/') || /(?:^|\/)README(?:\.[a-z-]+)?\.md$/.test(f),
)

// Anything vitest could reach. `--changed` reads git itself, so an explicit path
// list is only a signal about whether to bother running it at all.
const testable = files.some(f => /\.[cm]?[jt]sx?$/.test(f) || f.endsWith('.json'))

const steps = [
  lintable.length && ['Lint', 'pnpm', ['exec', 'eslint', '--cache', ...lintable]],
  ['Typecheck', 'pnpm', ['typecheck']],
  testable && ['Tests', 'pnpm', ['test:changed']],
  touchesI18n && ['i18n', 'pnpm', ['i18n:check']],
].filter(Boolean)

if (!files.length) {
  process.stdout.write('check: nothing changed\n')
  process.exit(0)
}

process.stdout.write(`check: ${files.length} changed file(s), ${lintable.length} lintable\n`)

// Concurrently, because the steps are independent and each carries a fixed
// startup tax that dominates its real work — ESLint's flat-config resolution is
// ~2s whether it checks one file or four hundred, and Vitest costs ~1.3s before
// it runs a single test. Serially those taxes add up; in parallel the whole thing
// costs about as much as its slowest step.
//
// Output is buffered per step and printed in order rather than streamed. Four
// interleaved stderr streams are unreadable, and the point of this command is a
// verdict you can act on.
function run([name, cmd, cmdArgs]) {
  const t0 = Date.now()
  return new Promise((resolve) => {
    const child = spawn(cmd, cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    child.stdout.on('data', d => (out += d))
    child.stderr.on('data', d => (out += d))
    child.on('error', err => resolve({ name, ok: false, out: String(err), ms: Date.now() - t0 }))
    child.on('close', code => resolve({ name, ok: code === 0, out, ms: Date.now() - t0 }))
  })
}

// Every step runs even when one fails: an agent fixing a type error wants the
// lint error in the same pass, not on the next one.
const results = await Promise.all(steps.map(run))

for (const { name, ok, out, ms } of results) {
  if (!ok)
    process.stdout.write(out.endsWith('\n') ? out : `${out}\n`)
  process.stdout.write(`check: ${name} ${ok ? 'ok' : 'FAILED'} (${ms}ms)\n`)
}

process.exit(results.some(r => !r.ok) ? 1 : 0)
