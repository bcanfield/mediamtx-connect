import type { AppConfig } from '@connect/contract'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslations } from 'use-intl'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

import { Separator } from '@/components/ui/separator'
import { orpc } from '@/orpc'
import { buildLocalizedClientConfigSchema } from './client-config.schemas'

export function ClientConfigForm({
  clientConfig,
}: {
  clientConfig: AppConfig
}) {
  const t = useTranslations('Config.clientForm')
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-medium">{t('sections.mediamtxConnection')}</h3>

              <FormField
                name="mediaMtxUrl"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.mediaMtxUrl.label')}</FormLabel>
                    <FormControl {...field}>
                      <Input placeholder="http://mediamtx" />
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
                      <Input type="number" placeholder="9997" />
                    </FormControl>
                    <FormDescription>{t('fields.mediaMtxApiPort.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="remoteMediaMtxUrl"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.remoteMediaMtxUrl.label')}</FormLabel>
                    <FormControl {...field}>
                      <Input placeholder="http://localhost" />
                    </FormControl>
                    <FormDescription>
                      {t('fields.remoteMediaMtxUrl.description')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-medium">{t('sections.storage')}</h3>

              <FormField
                name="recordingsDirectory"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.recordingsDirectory.label')}</FormLabel>
                    <FormControl {...field}>
                      <Input placeholder="/recordings" />
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
                      <Input placeholder="/screenshots" />
                    </FormControl>
                    <FormDescription>
                      {t('fields.screenshotsDirectory.description')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              disabled={!form.formState.isDirty}
            >
              {t('actions.reset')}
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid || !form.formState.isDirty}
            >
              {t('actions.submit')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
