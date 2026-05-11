'use client'

import type { z } from 'zod'

import type { GlobalConf } from '@/lib/mediamtx/generated'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { updateGlobalConfig } from './mediamtx-config.actions'
import { GlobalConfigSchema } from './mediamtx-config.schemas'
import { ApiSection } from './sections/api-section'
import { HlsSection } from './sections/hls-section'
import { HooksSection } from './sections/hooks-section'
import { LoggingSection } from './sections/logging-section'
import { RtmpSection } from './sections/rtmp-section'
import { RtspSection } from './sections/rtsp-section'
import { SrtSection } from './sections/srt-section'
import { WebrtcSection } from './sections/webrtc-section'
import { StickySaveBar } from './sticky-save-bar'
import { countErrorsForTab } from './tab-fields'

const TAB_VALUES = ['logging', 'api', 'hooks', 'rtsp', 'rtmp', 'hls', 'webrtc', 'srt'] as const

export function MediaMTXConfigForm({
  globalConf,
}: {
  globalConf?: GlobalConf
}) {
  const t = useTranslations('Config.mediamtxForm')
  const form = useForm({
    resolver: zodResolver(GlobalConfigSchema),
    mode: 'onBlur',
    defaultValues: globalConf,
  })

  const onSubmit = async (values: z.output<typeof GlobalConfigSchema>) => {
    const updated = await updateGlobalConfig({ globalConfig: values })
    if (updated) {
      toast.success(t('toasts.success'))
    }
    else {
      toast.error(t('toasts.errorTitle'), {
        description: t('toasts.errorDescription'),
      })
    }
  }

  const onReset = () => form.reset(globalConf)

  const errors = form.formState.errors

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Tabs defaultValue="logging" className="flex flex-col gap-4">
          <TabsList className="flex-wrap">
            {TAB_VALUES.map((value) => {
              const errCount = countErrorsForTab(errors, value)
              return (
                <TabsTrigger key={value} value={value}>
                  {t(`tabs.${value}`)}
                  {errCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-2 h-4 min-w-4 px-1 text-[10px]"
                    >
                      {errCount}
                    </Badge>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="logging">
            <LoggingSection control={form.control} />
          </TabsContent>
          <TabsContent value="api">
            <ApiSection control={form.control} />
          </TabsContent>
          <TabsContent value="hooks">
            <HooksSection control={form.control} />
          </TabsContent>
          <TabsContent value="rtsp">
            <RtspSection control={form.control} />
          </TabsContent>
          <TabsContent value="rtmp">
            <RtmpSection control={form.control} />
          </TabsContent>
          <TabsContent value="hls">
            <HlsSection control={form.control} />
          </TabsContent>
          <TabsContent value="webrtc">
            <WebrtcSection control={form.control} />
          </TabsContent>
          <TabsContent value="srt">
            <SrtSection control={form.control} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-2">
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
        </div>

        <StickySaveBar onReset={onReset} />
      </form>
    </Form>
  )
}
