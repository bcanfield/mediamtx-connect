import type { GlobalConfigFormData } from '@connect/contract'

import type { Control } from 'react-hook-form'

import { useTranslations } from 'use-intl'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SwitchField, TextField } from '../form-fields'

export function SrtSection({ control }: { control: Control<GlobalConfigFormData> }) {
  const t = useTranslations('Config.mediamtxForm.sections.srt')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('srt')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <SwitchField
          control={control}
          name="srt"
          label="SRT"
          description={t('enableDescription')}
        />
        <TextField control={control} name="srtAddress" label="SRT Address" />
      </CardContent>
    </Card>
  )
}
