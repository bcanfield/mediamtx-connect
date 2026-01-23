import { z } from 'zod'

// Cron expression validation regex - simplified to allow common patterns
const cronRegex = /^[\d*,/-]+\s+[\d*,/-]+\s+[\d*,/-]+\s+[\d*,/-]+\s+[\d*,/-]+$/

export const BackupConfigSchema = z.object({
  id: z.number().optional(),
  enabled: z.boolean().default(false),
  schedule: z
    .string()
    .regex(cronRegex, 'Invalid cron expression')
    .default('0 2 * * *'),
  localBackupDir: z.string().min(1, 'Backup directory is required'),
  maxLocalBackups: z
    .number()
    .int()
    .min(1, 'Must keep at least 1 backup')
    .max(100, 'Maximum 100 backups')
    .default(7),
  remoteEnabled: z.boolean().default(false),
  remoteType: z.enum(['s3']).nullish(),
  remoteBucket: z.string().nullish(),
  remoteRegion: z.string().nullish(),
  remoteAccessKey: z.string().nullish(),
  remoteSecretKey: z.string().nullish(),
  remotePrefix: z.string().nullish().default('backups/'),
})

export type BackupConfigInput = z.input<typeof BackupConfigSchema>
export type BackupConfigOutput = z.output<typeof BackupConfigSchema>
