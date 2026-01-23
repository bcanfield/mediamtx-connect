import { z } from 'zod'

// Cron expression validation regex - simplified to allow common patterns
const cronRegex = /^[\d*,/-]+\s+[\d*,/-]+\s+[\d*,/-]+\s+[\d*,/-]+\s+[\d*,/-]+$/

// Per-stream retention JSON validation
const perStreamRetentionSchema = z.record(z.string(), z.number().int().min(1).max(365))

export const RetentionConfigSchema = z.object({
  id: z.number().optional(),
  enabled: z.boolean().default(false),
  schedule: z
    .string()
    .regex(cronRegex, 'Invalid cron expression')
    .default('0 3 * * *'),
  maxAgeDays: z
    .number()
    .int()
    .min(1, 'Must keep recordings for at least 1 day')
    .max(365, 'Maximum retention is 365 days')
    .default(30),
  maxStoragePercent: z
    .number()
    .int()
    .min(50, 'Storage threshold must be at least 50%')
    .max(99, 'Storage threshold cannot exceed 99%')
    .default(90),
  minFreeSpaceGB: z
    .number()
    .min(1, 'Minimum free space must be at least 1 GB')
    .max(1000, 'Maximum free space is 1000 GB')
    .default(10),
  deleteOldestFirst: z.boolean().default(true),
  perStreamRetentionDays: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (!val)
          return true
        try {
          const parsed = JSON.parse(val)
          return perStreamRetentionSchema.safeParse(parsed).success
        }
        catch {
          return false
        }
      },
      { message: 'Invalid per-stream retention JSON format' },
    ),
})

export type RetentionConfigInput = z.input<typeof RetentionConfigSchema>
export type RetentionConfigOutput = z.output<typeof RetentionConfigSchema>

// Schema for per-stream retention configuration in a more user-friendly format
export const PerStreamRetentionItemSchema = z.object({
  streamName: z.string().min(1, 'Stream name is required'),
  retentionDays: z.number().int().min(1).max(365),
})

export type PerStreamRetentionItem = z.infer<typeof PerStreamRetentionItemSchema>
