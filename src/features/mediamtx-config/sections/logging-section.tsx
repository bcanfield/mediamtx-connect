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
import { ListField, TextField } from '../form-fields'

export function LoggingSection({ control }: { control: Control<GlobalConfigFormData> }) {
  const t = useTranslations('Config.mediamtxForm.sections.logging')
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('logging')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TextField control={control} name="logLevel" label="Log Level" />
          <ListField control={control} name="logDestinations" label="Log Destinations" />
          <TextField control={control} name="logFile" label="Log File" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('limits')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TextField control={control} name="readTimeout" label="Read Timeout" />
          <TextField control={control} name="writeTimeout" label="Write Timeout" />
          <TextField control={control} name="writeQueueSize" label="Write Queue Size" type="number" />
          <TextField control={control} name="udpMaxPayloadSize" label="UDP Max Payload Size" type="number" />
          <TextField control={control} name="externalAuthenticationURL" label="External Authentication URL" />
        </CardContent>
      </Card>
    </div>
  )
}
