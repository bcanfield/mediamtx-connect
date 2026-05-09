'use client'

import type { z } from 'zod'

import type { GlobalConf } from '@/lib/mediamtx/generated'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

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

const TABS = [
  { value: 'logging', label: 'Logging' },
  { value: 'api', label: 'API' },
  { value: 'hooks', label: 'Hooks' },
  { value: 'rtsp', label: 'RTSP' },
  { value: 'rtmp', label: 'RTMP' },
  { value: 'hls', label: 'HLS' },
  { value: 'webrtc', label: 'WebRTC' },
  { value: 'srt', label: 'SRT' },
] as const

export function MediaMTXConfigForm({
  globalConf,
}: {
  globalConf?: GlobalConf
}) {
  const form = useForm({
    resolver: zodResolver(GlobalConfigSchema),
    mode: 'onBlur',
    defaultValues: globalConf,
  })

  const onSubmit = async (values: z.output<typeof GlobalConfigSchema>) => {
    const updated = await updateGlobalConfig({ globalConfig: values })
    if (updated) {
      toast.success('Updated Global Config')
    }
    else {
      toast.error('There was an issue updating the Global Config', {
        description: 'Please double check your form values.',
      })
    }
  }

  const onReset = () => form.reset(globalConf)

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Tabs defaultValue="logging" className="flex flex-col gap-4">
          <TabsList className="flex-wrap">
            {TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
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
            Reset
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid || !form.formState.isDirty}
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  )
}
