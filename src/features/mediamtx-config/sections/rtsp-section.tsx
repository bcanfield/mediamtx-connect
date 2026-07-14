'use client'

import type { Control } from 'react-hook-form'

import type { GlobalConfigFormData } from '../mediamtx-config.schemas'

import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ListField, SwitchField, TextField } from '../form-fields'

export function RtspSection({ control }: { control: Control<GlobalConfigFormData> }) {
  const t = useTranslations('Config.mediamtxForm.sections.rtsp')
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('server')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SwitchField
            control={control}
            name="rtsp"
            label="RTSP"
            description={t('enableDescription')}
          />
          <TextField control={control} name="rtspAddress" label="RTSP Address" />
          <TextField control={control} name="rtpAddress" label="RTP Address" />
          <TextField control={control} name="rtcpAddress" label="RTCP Address" />
          <TextField control={control} name="multicastIPRange" label="Multicast IP Range" />
          <TextField control={control} name="multicastRTPPort" label="Multicast RTP Port" type="number" />
          <TextField control={control} name="multicastRTCPPort" label="Multicast RTCP Port" type="number" />
          <ListField control={control} name="protocols" label="Protocols" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('tls')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TextField control={control} name="encryption" label="Encryption" />
          <TextField control={control} name="serverKey" label="Server Key" />
          <TextField control={control} name="serverCert" label="Server Cert" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('auth')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ListField control={control} name="authMethods" label="Auth Methods" />
        </CardContent>
      </Card>
    </div>
  )
}
