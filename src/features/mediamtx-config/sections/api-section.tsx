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

export function ApiSection({ control }: { control: Control<GlobalConfigFormData> }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>HTTP API</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SwitchField
            control={control}
            name="api"
            label="API"
            description="Enable the MediaMTX HTTP API."
          />
          <TextField control={control} name="apiAddress" label="API Address" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metrics</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SwitchField control={control} name="metrics" label="Metrics" />
          <TextField control={control} name="metricsAddress" label="Metrics Address" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PPROF</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SwitchField control={control} name="pprof" label="PPROF" />
          <TextField control={control} name="pprofAddress" label="PPROF Address" />
        </CardContent>
      </Card>
    </div>
  )
}
