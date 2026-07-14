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

export function ApiSection({ control }: { control: Control<GlobalConfigFormData> }) {
  const t = useTranslations('Config.mediamtxForm.sections.api')
  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader>
          <CardTitle>{t('http')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <SwitchField
            control={control}
            name="api"
            label="API"
            description={t('enableDescription')}
          />
          <TextField control={control} name="apiAddress" label="API Address" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('metrics')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <SwitchField control={control} name="metrics" label="Metrics" />
          <TextField control={control} name="metricsAddress" label="Metrics Address" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('pprof')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <SwitchField control={control} name="pprof" label="PPROF" />
          <TextField control={control} name="pprofAddress" label="PPROF Address" />
        </CardContent>
      </Card>
    </div>
  )
}
