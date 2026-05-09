'use client'

import type { Control } from 'react-hook-form'

import type { GlobalConfigFormData } from '../mediamtx-config.schemas'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ListField, SwitchField, TextField } from '../form-fields'

export function RtspSection({ control }: { control: Control<GlobalConfigFormData> }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Server</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SwitchField
            control={control}
            name="rtsp"
            label="RTSP"
            description="Enable the RTSP server."
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
          <CardTitle>TLS</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TextField control={control} name="encryption" label="Encryption" />
          <TextField control={control} name="serverKey" label="Server Key" />
          <TextField control={control} name="serverCert" label="Server Cert" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auth</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ListField control={control} name="authMethods" label="Auth Methods" />
        </CardContent>
      </Card>
    </div>
  )
}
