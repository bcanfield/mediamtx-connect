import { RTSP_TRANSPORTS } from '@connect/contract'
import { zodResolver } from '@hookform/resolvers/zod'
import { ORPCError } from '@orpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'use-intl'
import { z } from 'zod'

import { PageLayout } from '@/components/page-layout'
import { StatusPanel } from '@/components/status-panel'
import { Button } from '@/components/ui/button'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { orpc } from '@/orpc'

import { composeRtspSource, maskSourceCredentials } from './rtsp-source'

const monoInput = 'h-9.5 font-mono'

function buildAddPathSchema(messages: { required: string, mustBePositive: string }) {
  return z.object({
    name: z.string().min(1, { message: messages.required }),
    host: z.string().min(1, { message: messages.required }),
    port: z.coerce.number().int().gt(0, { message: messages.mustBePositive }),
    streamPath: z.string(),
    username: z.string(),
    password: z.string(),
    transport: z.enum(RTSP_TRANSPORTS),
  })
}

type AddPathValues = z.output<ReturnType<typeof buildAddPathSchema>>

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-border-subtle pb-2 font-mono text-label font-medium uppercase tracking-[0.07em] text-faint">
      {children}
    </h2>
  )
}

export function AddRtspPathPage() {
  const t = useTranslations('Config.addRtspPath')
  const tForms = useTranslations('Forms.errors')
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  // MediaMTX's own words for a create it turned down. Held rather than toasted:
  // the form is still on screen with the field that has to change.
  const [rejection, setRejection] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(buildAddPathSchema({
      required: tForms('required'),
      mustBePositive: tForms('mustBePositive'),
    })),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      host: '',
      port: 554,
      streamPath: '',
      username: '',
      password: '',
      transport: 'automatic' as const,
    },
  })

  const addPath = useMutation(orpc.config.mediamtx.addPath.mutationOptions())

  const values = form.watch()
  const source = composeRtspSource({
    host: values.host,
    port: Number(values.port),
    streamPath: values.streamPath,
    username: values.username,
    password: values.password,
  })

  const onSubmit = async (submitted: AddPathValues) => {
    setRejection(null)
    const name = submitted.name.trim()
    try {
      await addPath.mutateAsync({
        name,
        source: composeRtspSource(submitted),
        // `automatic` is what an entry without the key already does, and the
        // entry stays a sparse override of path defaults (ADR 0002).
        rtspTransport: submitted.transport === 'automatic' ? undefined : submitted.transport,
      })
      await queryClient.invalidateQueries()
      // The point of the whole flow: the first thing after creating a path is
      // the picture from it.
      await navigate({ to: '/', search: { play: name } })
    }
    catch (error) {
      setRejection(error instanceof ORPCError ? error.message : t('errors.unreachable'))
    }
  }

  return (
    <PageLayout width="narrow" header={t('pageHeader')} subHeader={t('pageSubHeader')}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-7">
          <section className="flex flex-col gap-4.5">
            <SectionEyebrow>{t('sections.path')}</SectionEyebrow>

            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.name.label')}</FormLabel>
                  <FormControl {...field}>
                    <Input className={monoInput} placeholder="front-door" />
                  </FormControl>
                  <FormDescription>{t('fields.name.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="flex flex-col gap-4.5">
            <SectionEyebrow>{t('sections.camera')}</SectionEyebrow>

            <FormField
              name="host"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.host.label')}</FormLabel>
                  <FormControl {...field}>
                    <Input className={monoInput} placeholder="192.168.1.20" />
                  </FormControl>
                  <FormDescription>{t('fields.host.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="port"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.port.label')}</FormLabel>
                  <FormControl {...field}>
                    <Input type="number" className={cn(monoInput, 'w-45')} placeholder="554" />
                  </FormControl>
                  <FormDescription>{t('fields.port.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="streamPath"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.streamPath.label')}</FormLabel>
                  <FormControl {...field}>
                    <Input className={monoInput} placeholder="Streaming/Channels/101" />
                  </FormControl>
                  <FormDescription>{t('fields.streamPath.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.username.label')}</FormLabel>
                  <FormControl {...field}>
                    <Input className={monoInput} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.password.label')}</FormLabel>
                  <FormControl {...field}>
                    <Input type="password" className={monoInput} autoComplete="new-password" />
                  </FormControl>
                  <FormDescription>{t('fields.password.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="transport"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.transport.label')}</FormLabel>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={field.value}
                    // Radix clears the value when the active item is pressed
                    // again; a transport is always one of the four.
                    onValueChange={next => next && field.onChange(next)}
                    aria-label={t('fields.transport.label')}
                  >
                    {RTSP_TRANSPORTS.map(transport => (
                      <ToggleGroupItem key={transport} value={transport} className="font-mono">
                        {transport}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <FormDescription>{t('fields.transport.description')}</FormDescription>
                </FormItem>
              )}
            />
          </section>

          <section className="flex flex-col gap-2 rounded-panel border bg-card px-4 py-3.5">
            <span className="font-mono text-label font-medium uppercase tracking-[0.07em] text-faint">
              {t('preview.label')}
            </span>
            <code data-testid="source-preview" className="break-all font-mono text-control">
              {maskSourceCredentials(source)}
            </code>
            <p className="text-meta text-muted-foreground">{t('preview.description')}</p>
          </section>

          {rejection && (
            <StatusPanel
              tone="error"
              icon={<X aria-hidden className="size-4" />}
              title={t('errors.rejectedTitle')}
              description={<code className="font-mono text-foreground">{rejection}</code>}
            />
          )}

          <div className="flex items-center justify-end gap-2">
            <Button asChild type="button" variant="ghost">
              <Link href="/config/mediamtx/paths">{t('cancel')}</Link>
            </Button>
            <Button type="submit" disabled={addPath.isPending}>{t('submit')}</Button>
          </div>
        </form>
      </Form>
    </PageLayout>
  )
}
