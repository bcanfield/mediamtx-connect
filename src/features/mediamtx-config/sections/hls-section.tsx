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

export function HlsSection({ control }: { control: Control<GlobalConfigFormData> }) {
  const t = useTranslations('Config.mediamtxForm.sections.hls')
  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader>
          <CardTitle>{t('server')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <SwitchField
            control={control}
            name="hls"
            label="HLS"
            description={t('enableDescription')}
          />
          <TextField control={control} name="hlsAddress" label="HLS Address" />
          <SwitchField control={control} name="hlsEncryption" label="HLS Encryption" />
          <TextField control={control} name="hlsServerKey" label="HLS Server Key" />
          <TextField control={control} name="hlsServerCert" label="HLS Server Cert" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('segments')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <SwitchField control={control} name="hlsAlwaysRemux" label="HLS Always Remux" />
          <TextField control={control} name="hlsVariant" label="HLS Variant" />
          <TextField control={control} name="hlsSegmentCount" label="HLS Segment Count" type="number" />
          <TextField control={control} name="hlsSegmentDuration" label="HLS Segment Duration" />
          <TextField control={control} name="hlsPartDuration" label="HLS Part Duration" />
          <TextField control={control} name="hlsSegmentMaxSize" label="HLS Segment Max Size" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('corsProxies')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <TextField control={control} name="hlsAllowOrigin" label="HLS Allow Origin" />
          <ListField control={control} name="hlsTrustedProxies" label="HLS Trusted Proxies" />
          <TextField control={control} name="hlsDirectory" label="HLS Directory" />
        </CardContent>
      </Card>
    </div>
  )
}
