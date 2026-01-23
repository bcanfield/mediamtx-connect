'use client'

import type { RetentionConfig } from '@prisma/client'
import type { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
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

import { updateRetentionConfig } from '../actions/updateRetentionConfig'
import { RetentionConfigSchema } from '../schemas/retention-config.schema'

interface RetentionConfigFormProps {
  retentionConfig: RetentionConfig | null
}

type FormValues = z.input<typeof RetentionConfigSchema>

export function RetentionConfigForm({ retentionConfig }: RetentionConfigFormProps) {
  const { toast } = useToast()

  const defaultValues: FormValues = retentionConfig
    ? {
        id: retentionConfig.id,
        enabled: retentionConfig.enabled,
        schedule: retentionConfig.schedule,
        maxAgeDays: retentionConfig.maxAgeDays,
        maxStoragePercent: retentionConfig.maxStoragePercent,
        minFreeSpaceGB: retentionConfig.minFreeSpaceGB,
        deleteOldestFirst: retentionConfig.deleteOldestFirst,
        perStreamRetentionDays: retentionConfig.perStreamRetentionDays,
      }
    : {
        enabled: false,
        schedule: '0 3 * * *',
        maxAgeDays: 30,
        maxStoragePercent: 90,
        minFreeSpaceGB: 10,
        deleteOldestFirst: true,
        perStreamRetentionDays: null,
      }

  const form = useForm<FormValues>({
    resolver: zodResolver(RetentionConfigSchema),
    mode: 'onBlur',
    defaultValues,
  })

  const onSubmit = async (values: FormValues) => {
    const updated = await updateRetentionConfig({ retentionConfig: values })

    if (updated) {
      toast({
        title: 'Retention Configuration Updated',
        description: 'Your recording retention settings have been saved.',
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
            <GridFormItem label="Enable Automatic Cleanup">
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
                  Enable or disable automatic recording cleanup based on retention policies.
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
              <GridFormItem label="Cleanup Schedule (Cron)">
                <>
                  <FormControl {...field}>
                    <Input placeholder="0 3 * * *" />
                  </FormControl>
                  <FormDescription>
                    Cron expression for cleanup schedule. Default: 3 AM daily (0 3 * * *)
                  </FormDescription>
                  <FormMessage />
                </>
              </GridFormItem>
            )}
          />
        )}

        <FormField
          name="maxAgeDays"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Maximum Recording Age (Days)">
              <>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="30"
                    min={1}
                    max={365}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Recordings older than this will be automatically deleted.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />

        <FormField
          name="maxStoragePercent"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Storage Threshold (%)">
              <>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="90"
                    min={50}
                    max={99}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Trigger cleanup when disk usage exceeds this percentage.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />

        <FormField
          name="minFreeSpaceGB"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Minimum Free Space (GB)">
              <>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10"
                    min={1}
                    max={1000}
                    step={0.1}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Ensure at least this amount of free disk space is maintained.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />

        <FormField
          name="deleteOldestFirst"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Delete Strategy">
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
                      <SelectItem value="true">Oldest First</SelectItem>
                      <SelectItem value="false">Keep All (Age-Based Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  When storage threshold is reached, delete oldest recordings first.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />

        <FormField
          name="perStreamRetentionDays"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Per-Stream Retention (JSON)">
              <>
                <FormControl>
                  <Input
                    placeholder='{"stream1": 7, "stream2": 14}'
                    {...field}
                    value={field.value || ''}
                    onChange={e => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormDescription>
                  Optional: Set different retention days for specific streams (JSON format).
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        />
      </form>
    </Form>
  )
}
