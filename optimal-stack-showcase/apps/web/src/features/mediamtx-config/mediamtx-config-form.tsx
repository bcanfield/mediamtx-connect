import type { GlobalConfig } from '@connect/contract'
import { GlobalConfigSchema } from '@connect/contract'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslations } from 'use-intl'

import { Badge } from '@/components/ui/badge'
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { orpc } from '@/orpc'
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
  globalConf?: GlobalConfig
}) {
  const t = useTranslations('Config.mediamtxForm')
  const form = useForm({
    resolver: zodResolver(GlobalConfigSchema),
    mode: 'onBlur',
    defaultValues: globalConf,
  })

  const updateGlobalConfig = useMutation(orpc.config.mediamtx.updateGlobal.mutationOptions())

  const onSubmit = async (values: GlobalConfig) => {
    try {
      await updateGlobalConfig.mutateAsync(values)
      form.reset(values)
      toast.success(t('toasts.success'))
    }
    catch {
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
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Tabs defaultValue="logging" className="flex flex-col gap-3">
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

        <StickySaveBar onReset={onReset} />
      </form>
    </Form>
  )
}
