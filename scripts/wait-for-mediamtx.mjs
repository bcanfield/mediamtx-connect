#!/usr/bin/env node
// Wait for the dev/CI MediaMTX fixture to publish its whole stream fleet, not
// just for the API to answer. This is what tests/e2e/mediamtx.spec.ts used to
// assert; those tests only ever checked the fixture, never anything in apps/,
// so the check belongs here — where a failure names the missing stream instead
// of surfacing as eight red tests.
//
//   node scripts/wait-for-mediamtx.mjs
import process from 'node:process'

const API = process.env.MEDIAMTX_API ?? 'http://localhost:9997'
const EXPECTED = ['stream1', 'stream2', 'stream3', 'stream4', 'stream5', 'front-door']
const ATTEMPTS = 30
const INTERVAL_MS = 2000

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function readyStreams() {
  const response = await fetch(`${API}/v3/paths/list`)
  if (!response.ok)
    throw new Error(`paths/list returned ${response.status}`)
  const body = await response.json()
  return new Map(body.items.map(item => [item.name, item.ready]))
}

let missing = EXPECTED
for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
  try {
    const streams = await readyStreams()
    // `ready` matters as much as presence: an on-demand path is listed before
    // it has a publisher, and the UI renders it very differently.
    missing = EXPECTED.filter(name => streams.get(name) !== true)
    if (missing.length === 0) {
      console.log(`MediaMTX ready with: ${EXPECTED.join(', ')}`)
      process.exit(0)
    }
  }
  catch (error) {
    missing = EXPECTED
    if (attempt === ATTEMPTS)
      console.error(`MediaMTX API unreachable: ${error.message}`)
  }
  await sleep(INTERVAL_MS)
}

console.error(`MediaMTX never published (or never readied): ${missing.join(', ')}`)
process.exit(1)
