import type { Config } from '@prisma/client'

import { z } from 'zod'

export const ClientConfigSchema = z.object({
  id: z.coerce.number(),
  mediaMtxUrl: z.string().min(1),
  mediaMtxApiPort: z.coerce.number().gt(0),
  remoteMediaMtxUrl: z.string().nullable(),
  recordingsDirectory: z.string().min(1),
  screenshotsDirectory: z.string().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<Config>

export type ClientConfigFormData = z.infer<typeof ClientConfigSchema>

export function buildLocalizedClientConfigSchema(messages: {
  required: string
  mustBePositive: string
}) {
  return z.object({
    id: z.coerce.number(),
    mediaMtxUrl: z.string().min(1, { message: messages.required }),
    mediaMtxApiPort: z.coerce.number().gt(0, { message: messages.mustBePositive }),
    remoteMediaMtxUrl: z.string().nullable(),
    recordingsDirectory: z.string().min(1, { message: messages.required }),
    screenshotsDirectory: z.string().min(1, { message: messages.required }),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }) satisfies z.ZodType<Config>
}
