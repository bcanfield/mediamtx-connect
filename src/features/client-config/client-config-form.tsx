'use client'

import type { Config } from '@prisma/client'

import type { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

import { updateClientConfig } from './client-config.actions'
import { ClientConfigSchema } from './client-config.schemas'

export function ClientConfigForm({
  clientConfig,
}: {
  clientConfig: Config | null
}) {
  const form = useForm({
    resolver: zodResolver(ClientConfigSchema),
    mode: 'onBlur',
    defaultValues: clientConfig ?? undefined,
  })

  const onSubmit = async (values: z.output<typeof ClientConfigSchema>) => {
    const updated = await updateClientConfig({ clientConfig: values })
    if (updated) {
      toast.success('Updated Client Config')
    }
    else {
      toast.error('There was an issue updating the Client Config', {
        description: 'Please double check your form values.',
      })
    }
  }

  const onReset = () => form.reset(clientConfig ?? undefined)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>
              Connection and storage paths used by MediaMTX Connect.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-medium">MediaMTX connection</h3>

              <FormField
                name="mediaMtxUrl"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MediaMtx Url</FormLabel>
                    <FormControl {...field}>
                      <Input placeholder="http://mediamtx" />
                    </FormControl>
                    <FormDescription>
                      The address to your MediaMTX Instance. Within a Docker
                      Network, you can use the container name. Otherwise, use
                      the external IP / hostname.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="mediaMtxApiPort"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MediaMtx Api Port</FormLabel>
                    <FormControl {...field}>
                      <Input type="number" placeholder="9997" />
                    </FormControl>
                    <FormDescription>The port to the MediaMTX API</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="remoteMediaMtxUrl"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remote MediaMtx URL</FormLabel>
                    <FormControl {...field}>
                      <Input placeholder="http://localhost" />
                    </FormControl>
                    <FormDescription>
                      This is the browser-accessible, externally-facing IP /
                      hostname of your MediaMTX Server.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-medium">Storage</h3>

              <FormField
                name="recordingsDirectory"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recordings Directory</FormLabel>
                    <FormControl {...field}>
                      <Input placeholder="/recordings" />
                    </FormControl>
                    <FormDescription>
                      Directory containing MediaMTX recordings (Not recommended
                      to change if using Docker)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="screenshotsDirectory"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Screenshots Directory</FormLabel>
                    <FormControl {...field}>
                      <Input placeholder="/screenshots" />
                    </FormControl>
                    <FormDescription>
                      Directory to store generated screenshots (Not recommended
                      to change if using Docker)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              disabled={!form.formState.isDirty}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid || !form.formState.isDirty}
            >
              Submit
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
