import type { AppConfig } from '@connect/contract'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslations } from 'use-intl'

import { SaveBar } from '@/components/save-bar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { orpc } from '@/orpc'

import { buildLocalizedClientConfigSchema } from './client-config.schemas'

const monoInput = 'h-9.5 font-mono'

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-border-subtle pb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-faint">
      {children}
    </h2>
  )
}

export function ClientConfigForm({
  clientConfig,
}: {
  clientConfig: AppConfig
}) {
  const t = useTranslations('Config.clientForm')
  const tSaveBar = useTranslations('Config.saveBar')
  const tForms = useTranslations('Forms.errors')
  const queryClient = useQueryClient()
  const localizedSchema = buildLocalizedClientConfigSchema({
    required: tForms('required'),
    mustBePositive: tForms('mustBePositive'),
  })
  const form = useForm({
    resolver: zodResolver(localizedSchema),
    mode: 'onBlur',
    defaultValues: clientConfig,
  })

  const updateConfig = useMutation(orpc.config.app.update.mutationOptions())

  const onSubmit = async (values: AppConfig) => {
    try {
      const updated = await updateConfig.mutateAsync(values)
      await queryClient.invalidateQueries()
      form.reset(updated)
      toast.success(t('toasts.success'))
    }
    catch {
      toast.error(t('toasts.errorTitle'), {
        description: t('toasts.errorDescription'),
      })
    }
  }

  const onReset = () => form.reset(clientConfig)

  const { isDirty, isValid, dirtyFields, errors } = form.formState
  const dirtyCount = Object.keys(dirtyFields).length
  const errorCount = Object.keys(errors).length
  const summary = errorCount > 0
    ? `${tSaveBar('unsaved', { count: dirtyCount })} · ${tSaveBar('needsAttention', { count: errorCount })}`
    : tSaveBar('unsaved', { count: dirtyCount })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <section className="flex flex-col gap-4.5">
          <SectionEyebrow>{t('sections.mediamtxConnection')}</SectionEyebrow>

          <FormField
            name="mediaMtxUrl"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.mediaMtxUrl.label')}</FormLabel>
                <FormControl {...field}>
                  <Input className={monoInput} placeholder="http://mediamtx" />
                </FormControl>
                <FormDescription>
                  {t('fields.mediaMtxUrl.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="mediaMtxApiPort"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.mediaMtxApiPort.label')}</FormLabel>
                <FormControl {...field}>
                  <Input type="number" className={cn(monoInput, 'w-45')} placeholder="9997" />
                </FormControl>
                <FormDescription>
                  {t('fields.mediaMtxApiPort.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hero field (board 2d): required for live playback, amber callout. */}
          <div className="flex flex-col gap-3.5 rounded-panel border border-warning/30 bg-linear-to-b from-warning/[0.05] to-transparent p-4">
            <span className="self-start rounded-full border border-warning/40 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.07em] text-warning">
              {t('playbackBadge')}
            </span>
            <FormField
              name="remoteMediaMtxUrl"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.remoteMediaMtxUrl.label')}</FormLabel>
                  <FormControl>
                    <Input
                      className={monoInput}
                      placeholder="http://localhost"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('fields.remoteMediaMtxUrl.description')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="flex flex-col gap-4.5">
          <SectionEyebrow>{t('sections.storage')}</SectionEyebrow>

          <FormField
            name="recordingsDirectory"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.recordingsDirectory.label')}</FormLabel>
                <FormControl {...field}>
                  <Input className={monoInput} placeholder="/recordings" />
                </FormControl>
                <FormDescription>
                  {t('fields.recordingsDirectory.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="screenshotsDirectory"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.screenshotsDirectory.label')}</FormLabel>
                <FormControl {...field}>
                  <Input className={monoInput} placeholder="/screenshots" />
                </FormControl>
                <FormDescription>
                  {t('fields.screenshotsDirectory.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {dirtyCount > 0 && (
          <SaveBar
            summary={summary}
            onDiscard={onReset}
            discardLabel={tSaveBar('reset')}
            saveLabel={tSaveBar('save')}
            saveDisabled={!isValid || !isDirty}
          />
        )}
      </form>
    </Form>
  )
}
