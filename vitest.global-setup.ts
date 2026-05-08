import { execSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'

const dbPath = path.resolve(process.cwd(), 'prisma-test.db')
const dbUrl = `file:${dbPath}`

function clean() {
  rmSync(dbPath, { force: true })
  rmSync(`${dbPath}-journal`, { force: true })
}

export async function setup() {
  clean()
  execSync('npx prisma migrate deploy --schema=src/lib/prisma/schema.prisma', {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: 'pipe',
  })
}

export async function teardown() {
  clean()
}
