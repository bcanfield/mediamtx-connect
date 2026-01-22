'use client'

import type { Config } from '@prisma/client'

import type { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { GridFormItem } from '@/shared/components/forms'
import { Button } from '@/shared/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { useToast } from '@/shared/components/ui/use-toast'

import { updateClientConfig } from '../actions/updateClientConfig'
import { ClientConfigSchema } from '../schemas/client-config.schema'

export function ClientConfigForm({
  clientConfig,
}: {
  clientConfig: Config | null
}) {
  const { toast } = useToast()
  const form = useForm({
    resolver: zodResolver(ClientConfigSchema),
    mode: 'onBlur',
    defaultValues: clientConfig ?? undefined,
  })
  const onSubmit = async (values: z.output<typeof ClientConfigSchema>) => {
    const updated = await updateClientConfig({ clientConfig: values })

    if (updated) {
      toast({
        title: 'Updated Global Config',
      })
    }
    else {
      toast({
        variant: 'destructive',
        title: 'There was an issue updating the Global Config',
        description: 'Please double check your form values.',
      })
    }
  }
  return (
    <Form {...form}>
      <form
        className="space-y-2 py-2 flex flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex justify-end py-2">
          <Button
            type="submit"
            disabled={!form.formState.isValid || !form.formState.isDirty}
          >
            Submit
          </Button>
        </div>
        <FormField
          name="mediaMtxUrl"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="MediaMtx Url">
              <>
                <FormControl {...field}>
                  <Input placeholder="http://mediamtx" />
                </FormControl>
                <FormDescription>
                  The address to your MediaMTX Instance. Within a Docker
                  Network, you can use the container name. Otherwise, use the
                  external IP / hostname.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        >
        </FormField>
        <FormField
          name="mediaMtxApiPort"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="MediaMtx Api Port">
              <>
                <FormControl {...field}>
                  <Input type="number" placeholder="9997" />
                </FormControl>
                <FormDescription>The port to the MediaMTX API</FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        >
        </FormField>
        <FormField
          name="remoteMediaMtxUrl"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Remote MediaMtx URL">
              <>
                <FormControl {...field}>
                  <Input placeholder="http://localhost" />
                </FormControl>
                <FormDescription>
                  This is the browser-accessible, externally-facing IP /
                  hostname of your MediaMTX Server.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        >
        </FormField>
        <FormField
          name="recordingsDirectory"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Recordings Directory">
              <>
                <FormControl {...field}>
                  <Input placeholder="/recordings" />
                </FormControl>
                <FormDescription>
                  Directory containing MediaMTX recordings (Not recommended to
                  change if using Docker)
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        >
        </FormField>
        <FormField
          name="screenshotsDirectory"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Screenshots Directory">
              <>
                <FormControl {...field}>
                  <Input placeholder="/screenshots" />
                </FormControl>
                <FormDescription>
                  Directory to store generated screenshots (Not recommended to
                  change if using Docker)
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        >
        </FormField>
      </form>
    </Form>
  )
}
