import { execFileSync } from 'node:child_process'
import process from 'node:process'

// Seed the e2e data dir from the committed fixtures (tests/fixtures) before the
// webServer boots. Hermetic and offline — no ffmpeg, no MediaMTX, no timing.
// Kept separate from the dev dir (.dev-data) so a running `pnpm dev` session and
// a test run never clobber each other.
export default function globalSetup() {
  execFileSync(
    process.execPath,
    ['scripts/seed-fixtures.mjs', '--target', 'test-results/e2e-data'],
    { stdio: 'inherit' },
  )
}
