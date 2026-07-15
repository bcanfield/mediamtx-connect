import type { Entry } from '@showcase/contract'
import process from 'node:process'
import { implement } from '@orpc/server'
import { contract } from '@showcase/contract'

const os = implement(contract)

// in-memory store; swap for packages/db (Drizzle) in a real app
const entries: Entry[] = [
  { id: 1, message: 'Hello from the single image!', createdAt: new Date() },
]

export const router = os.router({
  health: os.health.handler(() => ({
    status: 'ok' as const,
    uptime: process.uptime(),
  })),
  entries: {
    list: os.entries.list.handler(() => entries),
    add: os.entries.add.handler(({ input }) => {
      const entry: Entry = {
        id: (entries.at(-1)?.id ?? 0) + 1,
        message: input.message,
        createdAt: new Date(),
      }
      entries.push(entry)
      return entry
    }),
  },
})
