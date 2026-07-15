import { z } from 'zod'

// Same shape as AppConfigSchema in @connect/contract, with localized
// validation messages for the form.
export function buildLocalizedClientConfigSchema(messages: {
  required: string
  mustBePositive: string
}) {
  return z.object({
    mediaMtxUrl: z.string().min(1, { message: messages.required }),
    mediaMtxApiPort: z.coerce.number().gt(0, { message: messages.mustBePositive }),
    remoteMediaMtxUrl: z.string().nullable(),
    recordingsDirectory: z.string().min(1, { message: messages.required }),
    screenshotsDirectory: z.string().min(1, { message: messages.required }),
  })
}
