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

export function HooksSection({ control }: { control: Control<GlobalConfigFormData> }) {
  const t = useTranslations('Config.mediamtxForm.sections.hooks')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('hooks')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <TextField control={control} name="runOnConnect" label="Run on Connect" />
        <SwitchField control={control} name="runOnConnectRestart" label="Run on Connect Restart" />
        <TextField control={control} name="runOnDisconnect" label="Run on Disconnect" />
      </CardContent>
    </Card>
  )
}
