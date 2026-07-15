import process from 'node:process'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().int().default(3000),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
