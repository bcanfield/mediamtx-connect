import { oc } from '@orpc/contract'
import { z } from 'zod'

export const EntrySchema = z.object({
  id: z.number().int(),
  message: z.string(),
  // z.date() works over the wire: oRPC's RPC serializer preserves native Date
  createdAt: z.date(),
})

export type Entry = z.infer<typeof EntrySchema>

export const contract = {
  health: oc.output(z.object({ status: z.literal('ok'), uptime: z.number() })),
  entries: {
    list: oc.output(z.array(EntrySchema)),
    add: oc
      .input(z.object({ message: z.string().min(1).max(280) }))
      .output(EntrySchema),
  },
}
