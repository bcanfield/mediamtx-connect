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
import { SwitchField, TextField } from '../form-fields'

export function RtmpSection({ control }: { control: Control<GlobalConfigFormData> }) {
  const t = useTranslations('Config.mediamtxForm.sections.rtmp')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('rtmp')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <SwitchField
          control={control}
          name="rtmp"
          label="RTMP"
          description={t('enableDescription')}
        />
        <TextField control={control} name="rtmpAddress" label="RTMP Address" />
        <TextField control={control} name="rtmpEncryption" label="RTMP Encryption" />
        <TextField control={control} name="rtmpsAddress" label="RTMPS Address" />
        <TextField control={control} name="rtmpServerKey" label="RTMP Server Key" />
        <TextField control={control} name="rtmpServerCert" label="RTMP Server Cert" />
      </CardContent>
    </Card>
  )
}
