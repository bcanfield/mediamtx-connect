'use client'

import type { BackupConfig } from '@prisma/client'
import type { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { GridFormItem } from '@/shared/components/forms'
import { Button } from '@/shared/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useToast } from '@/shared/components/ui/use-toast'

import { testRemoteConnection } from '../actions/testRemoteConnection'
import { updateBackupConfig } from '../actions/updateBackupConfig'
import { BackupConfigSchema } from '../schemas/backup-config.schema'

interface BackupConfigFormProps {
  backupConfig: BackupConfig | null
}

type FormValues = z.input<typeof BackupConfigSchema>

export function BackupConfigForm({ backupConfig }: BackupConfigFormProps) {
  const { toast } = useToast()
  const [isTesting, setIsTesting] = useState(false)

  const defaultValues: FormValues = backupConfig
    ? {
        id: backupConfig.id,
        enabled: backupConfig.enabled,
        schedule: backupConfig.schedule,
        localBackupDir: backupConfig.localBackupDir,
        maxLocalBackups: backupConfig.maxLocalBackups,
        remoteEnabled: backupConfig.remoteEnabled,
        remoteType: backupConfig.remoteType as 's3' | null,
        remoteBucket: backupConfig.remoteBucket,
        remoteRegion: backupConfig.remoteRegion,
        remoteAccessKey: backupConfig.remoteAccessKey,
        remoteSecretKey: backupConfig.remoteSecretKey,
        remotePrefix: backupConfig.remotePrefix,
      }
    : {
        enabled: false,
        schedule: '0 2 * * *',
        localBackupDir: './backups',
        maxLocalBackups: 7,
        remoteEnabled: false,
        remoteType: null,
        remoteBucket: null,
        remoteRegion: null,
        remoteAccessKey: null,
        remoteSecretKey: null,
        remotePrefix: 'backups/',
      }

  const form = useForm<FormValues>({
    resolver: zodResolver(BackupConfigSchema),
    mode: 'onBlur',
    defaultValues,
  })

  const onSubmit = async (values: FormValues) => {
    const updated = await updateBackupConfig({ backupConfig: values })

    if (updated) {
      toast({
        title: 'Backup Configuration Updated',
        description: 'Your backup settings have been saved.',
      })
    }
    else {
      toast({
        variant: 'destructive',
        title: 'Failed to Update Configuration',
        description: 'Please check your form values and try again.',
      })
    }
  }

  const watchEnabled = form.watch('enabled')
  const watchRemoteEnabled = form.watch('remoteEnabled')
  const watchRemoteType = form.watch('remoteType')

  const handleTestConnection = async () => {
    const remoteType = form.getValues('remoteType')
    const remoteBucket = form.getValues('remoteBucket')
    const remoteRegion = form.getValues('remoteRegion')
    const remoteAccessKey = form.getValues('remoteAccessKey')
    const remoteSecretKey = form.getValues('remoteSecretKey')

    if (!remoteType || !remoteBucket || !remoteRegion || !remoteAccessKey || !remoteSecretKey) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in all remote storage fields before testing.',
      })
      return
    }

    setIsTesting(true)
    try {
      const result = await testRemoteConnection({
        remoteType: remoteType as 's3',
        remoteBucket,
        remoteRegion,
        remoteAccessKey,
        remoteSecretKey,
      })

      if (result.success) {
        toast({
          title: 'Connection Successful',
          description: 'Successfully connected to remote storage.',
        })
      }
      else {
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description: result.errorMessage || 'Failed to connect to remote storage.',
        })
      }
    }
    catch {
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'An unexpected error occurred while testing the connection.',
      })
    }
    finally {
      setIsTesting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4 py-2 flex flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex justify-end py-2">
          <Button
            type="submit"
            disabled={!form.formState.isValid || !form.formState.isDirty}
          >
            Save Configuration
          </Button>
        </div>

        <FormField
          name="enabled"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Enable Automatic Backups">
              <>
                <FormControl>
                  <Select
                    onValueChange={value => field.onChange(value === 'true')}
                    defaultValue={field.value ? 'true' : 'false'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Enable or disable automatic scheduled backups.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />

        {watchEnabled && (
          <FormField
            name="schedule"
            control={form.control}
            render={({ field }) => (
              <GridFormItem label="Backup Schedule (Cron)">
                <>
                  <FormControl {...field}>
                    <Input placeholder="0 2 * * *" />
                  </FormControl>
                  <FormDescription>
                    Cron expression for backup schedule. Default: 2 AM daily (0 2 * * *)
                  </FormDescription>
                  <FormMessage />
                </>
              </GridFormItem>
            )}
          />
        )}

        <FormField
          name="localBackupDir"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Local Backup Directory">
              <>
                <FormControl {...field}>
                  <Input placeholder="./backups" />
                </FormControl>
                <FormDescription>
                  Directory where local backups will be stored.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />

        <FormField
          name="maxLocalBackups"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Max Local Backups">
              <>
                <FormControl {...field}>
                  <Input type="number" placeholder="7" min={1} max={100} />
                </FormControl>
                <FormDescription>
                  Maximum number of local backups to retain. Older backups will be
                  automatically deleted.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />

        <FormField
          name="remoteEnabled"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Enable Remote Backup">
              <>
                <FormControl>
                  <Select
                    onValueChange={value => field.onChange(value === 'true')}
                    defaultValue={field.value ? 'true' : 'false'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Enable backup to cloud storage (S3, GCS, or Azure).
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />

        {watchRemoteEnabled && (
          <>
            <FormField
              name="remoteType"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Remote Storage Type">
                  <>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select storage type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="s3">Amazon S3</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Cloud storage provider for remote backups.
                    </FormDescription>
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="remoteBucket"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Bucket Name">
                  <>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder="my-backup-bucket"
                      />
                    </FormControl>
                    <FormDescription>
                      Name of the cloud storage bucket.
                    </FormDescription>
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="remoteRegion"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Region">
                  <>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder="us-east-1"
                      />
                    </FormControl>
                    <FormDescription>
                      Cloud storage region.
                    </FormDescription>
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="remoteAccessKey"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Access Key">
                  <>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        type="password"
                        placeholder="Access Key ID"
                      />
                    </FormControl>
                    <FormDescription>
                      Cloud storage access key.
                    </FormDescription>
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="remoteSecretKey"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Secret Key">
                  <>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        type="password"
                        placeholder="Secret Access Key"
                      />
                    </FormControl>
                    <FormDescription>
                      Cloud storage secret key.
                    </FormDescription>
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="remotePrefix"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Path Prefix">
                  <>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder="backups/"
                      />
                    </FormControl>
                    <FormDescription>
                      Prefix path for backups in the bucket.
                    </FormDescription>
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <div className="flex justify-start py-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting || !watchRemoteType}
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  )
}
