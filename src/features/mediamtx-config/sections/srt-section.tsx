'use client'

import type { Control } from 'react-hook-form'

import type { GlobalConfigFormData } from '../mediamtx-config.schemas'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SwitchField, TextField } from '../form-fields'

export function SrtSection({ control }: { control: Control<GlobalConfigFormData> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SRT</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SwitchField
          control={control}
          name="srt"
          label="SRT"
          description="Enable the SRT server."
        />
        <TextField control={control} name="srtAddress" label="SRT Address" />
      </CardContent>
    </Card>
  )
}
