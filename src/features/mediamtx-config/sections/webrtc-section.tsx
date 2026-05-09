'use client'

import type { Control } from 'react-hook-form'
import type { GlobalConfigFormData } from '../mediamtx-config.schemas'

import { Plus, Trash } from 'lucide-react'
import { useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Input } from '@/components/ui/input'
import { ListField, SwitchField, TextField } from '../form-fields'

export function WebrtcSection({ control }: { control: Control<GlobalConfigFormData> }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'webrtcICEServers2',
  })

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Server</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SwitchField
            control={control}
            name="webrtc"
            label="WebRTC"
            description="Enable the WebRTC server."
          />
          <TextField control={control} name="webrtcAddress" label="WebRTC Address" />
          <SwitchField control={control} name="webrtcEncryption" label="WebRTC Encryption" />
          <TextField control={control} name="webrtcServerKey" label="WebRTC Server Key" />
          <TextField control={control} name="webrtcServerCert" label="WebRTC Server Cert" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Network</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TextField control={control} name="webrtcAllowOrigin" label="WebRTC Allow Origin" />
          <ListField control={control} name="webrtcTrustedProxies" label="WebRTC Trusted Proxies" />
          <TextField control={control} name="webrtcLocalUDPAddress" label="WebRTC Local UDP Address" />
          <TextField control={control} name="webrtcLocalTCPAddress" label="WebRTC Local TCP Address" />
          <SwitchField control={control} name="webrtcIPsFromInterfaces" label="WebRTC IPs From Interfaces" />
          <ListField control={control} name="webrtcIPsFromInterfacesList" label="WebRTC IPs From Interfaces List" />
          <ListField control={control} name="webrtcAdditionalHosts" label="WebRTC Additional Hosts" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>ICE Servers</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ url: '', username: '', password: '' })}
          >
            <Plus className="mr-2 size-4" />
            Add server
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">No ICE servers configured.</p>
          )}
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-3 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{`ICE Server ${index + 1}`}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove ICE server"
                  onClick={() => remove(index)}
                >
                  <Trash className="size-4" />
                </Button>
              </div>
              <FormField
                control={control}
                name={`webrtcICEServers2.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`webrtcICEServers2.${index}.username`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`webrtcICEServers2.${index}.password`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
