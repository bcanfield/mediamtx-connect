import type { GlobalConfig, GlobalConfigFormData } from '@connect/contract'
import type { Control } from 'react-hook-form'
import type { SectionDef } from './sections'
import { GlobalConfigSchema } from '@connect/contract'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm, useFormState, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslations } from 'use-intl'

import { SaveBar } from '@/components/save-bar'
import { Form, FormField } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { useScrollSpy } from '@/hooks/use-scroll-spy'
import { cn } from '@/lib/utils'
import { orpc } from '@/orpc'

import { ListFieldRow, SwitchFieldRow, TextFieldRow } from './config-field-row'
import { IceServersRows } from './ice-servers-rows'
import { countErrorsForSection, SECTIONS } from './sections'

const SECTION_IDS = SECTIONS.map(s => `mtx-${s.id}`)

export function MediaMTXConfigForm({
  globalConf,
}: {
  globalConf?: GlobalConfig
}) {
  const t = useTranslations('Config.mediamtxForm')
  const tSaveBar = useTranslations('Config.saveBar')
  const form = useForm({
    resolver: zodResolver(GlobalConfigSchema),
    mode: 'onBlur',
    defaultValues: globalConf,
  })

  const updateGlobalConfig = useMutation(orpc.config.mediamtx.updateGlobal.mutationOptions())

  const onSubmit = async (values: GlobalConfig) => {
    try {
      await updateGlobalConfig.mutateAsync(values)
      form.reset(values)
      toast.success(t('toasts.success'))
    }
    catch {
      toast.error(t('toasts.errorTitle'), {
        description: t('toasts.errorDescription'),
      })
    }
  }

  const onReset = () => form.reset(globalConf)

  const { isDirty, isValid, dirtyFields, errors } = form.formState
  const dirtyKeys = Object.keys(dirtyFields)
  const errorCount = Object.keys(errors).length
  const summary = errorCount > 0
    ? `${tSaveBar('unsaved', { count: dirtyKeys.length })} · ${tSaveBar('needsAttention', { count: errorCount })}`
    : tSaveBar('unsaved', { count: dirtyKeys.length })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <SectionRail control={form.control} variant="chips" />

        <div className="flex items-start gap-8">
          <SectionRail control={form.control} variant="rail" />

          <div className="flex min-w-0 flex-1 flex-col gap-8">
            {SECTIONS.map(section => (
              <ConfigSection key={section.id} section={section} control={form.control} />
            ))}
          </div>
        </div>

        {dirtyKeys.length > 0 && (
          <SaveBar
            summary={summary}
            chips={dirtyKeys.map(key => ({ key, error: Boolean(errors[key as keyof typeof errors]) }))}
            onDiscard={onReset}
            discardLabel={tSaveBar('discard')}
            saveLabel={tSaveBar('saveToServer')}
            saveDisabled={!isValid || !isDirty}
          />
        )}
      </form>
    </Form>
  )
}

// One nav, two renderings: sticky side rail on desktop, horizontal chip row
// on mobile (board 2e). Error counts and OFF states roll up live.
function SectionRail({
  control,
  variant,
}: {
  control: Control<GlobalConfigFormData>
  variant: 'rail' | 'chips'
}) {
  const t = useTranslations('Config.mediamtxForm')
  const activeId = useScrollSpy(SECTION_IDS)
  const { errors } = useFormState({ control })
  const enables = useWatch({ control, name: ['api', 'rtsp', 'rtmp', 'hls', 'webrtc', 'srt'] })
  const enabledById: Record<string, boolean | undefined> = {
    api: enables[0],
    rtsp: enables[1],
    rtmp: enables[2],
    hls: enables[3],
    webrtc: enables[4],
    srt: enables[5],
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const rows = SECTIONS.map((section) => {
    const errCount = countErrorsForSection(errors, section)
    const off = section.enableField ? enabledById[section.id] === false : false
    return { section, errCount, off }
  })

  if (variant === 'chips') {
    return (
      <nav
        aria-label={t('rail.aria')}
        className="sticky top-25 z-20 -mx-4 flex gap-1.5 overflow-x-auto border-b border-border-subtle bg-background px-4 py-2 sm:-mx-7 sm:px-7 lg:hidden"
      >
        {rows.map(({ section, errCount, off }) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(`mtx-${section.id}`)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20',
              activeId === `mtx-${section.id}`
                ? 'border-transparent bg-accent font-medium text-foreground'
                : 'text-mute hover:text-foreground',
            )}
          >
            {t(`sectionTitles.${section.id}`)}
            {errCount > 0 && <RailErrorBadge count={errCount} />}
            {errCount === 0 && off && <RailOffLabel />}
          </button>
        ))}
      </nav>
    )
  }

  return (
    <aside className="sticky top-28 hidden w-50 shrink-0 self-start lg:block">
      <p className="mb-2 px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-faint">
        {t('rail.onThisPage')}
      </p>
      <nav aria-label={t('rail.aria')} className="flex flex-col gap-0.5">
        {rows.map(({ section, errCount, off }) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(`mtx-${section.id}`)}
            className={cn(
              'flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20',
              activeId === `mtx-${section.id}`
                ? 'bg-accent font-medium text-foreground'
                : 'text-mute hover:text-foreground',
            )}
          >
            {t(`sectionTitles.${section.id}`)}
            {errCount > 0
              ? <RailErrorBadge count={errCount} />
              : off && <RailOffLabel />}
          </button>
        ))}
      </nav>
    </aside>
  )
}

function RailErrorBadge({ count }: { count: number }) {
  return (
    <span className="rounded-full bg-destructive px-1.5 py-px font-mono text-[10px] font-medium text-destructive-foreground">
      {count}
    </span>
  )
}

function RailOffLabel() {
  const t = useTranslations('Config.mediamtxForm')
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-faint">
      {t('off')}
    </span>
  )
}

function ConfigSection({
  section,
  control,
}: {
  section: SectionDef
  control: Control<GlobalConfigFormData>
}) {
  const t = useTranslations('Config.mediamtxForm')
  const enabled = useWatch({ control, name: section.enableField ?? 'api' })
  const isOff = section.enableField ? enabled === false : false

  return (
    <section id={`mtx-${section.id}`} className="scroll-mt-30">
      <header
        className={cn(
          'flex items-center justify-between gap-4 border-b border-border-subtle pb-3',
          isOff && 'opacity-55',
        )}
      >
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
            {t(`sectionTitles.${section.id}`)}
          </h2>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            {t(`sectionDescriptions.${section.id}`)}
          </p>
        </div>

        {section.enableField && (
          <SectionEnableSwitch control={control} section={section} />
        )}
      </header>

      {isOff
        ? (
            <p className="py-3.5 font-mono text-[11px] text-faint">
              {t('hiddenWhileOff', { count: section.fields.length + (section.hasIceServers ? 1 : 0) })}
            </p>
          )
        : (
            <div className="flex flex-col">
              {section.fields.map(field =>
                field.kind === 'switch'
                  ? <SwitchFieldRow key={field.name} control={control} name={field.name} />
                  : field.kind === 'list'
                    ? <ListFieldRow key={field.name} control={control} name={field.name} />
                    : (
                        <TextFieldRow
                          key={field.name}
                          control={control}
                          name={field.name}
                          kind={field.kind === 'number' ? 'number' : 'text'}
                        />
                      ),
              )}
              {section.hasIceServers && <IceServersRows control={control} />}
            </div>
          )}
    </section>
  )
}

function SectionEnableSwitch({
  section,
  control,
}: {
  section: SectionDef
  control: Control<GlobalConfigFormData>
}) {
  const t = useTranslations('Config.mediamtxForm')

  return (
    <FormField
      control={control}
      name={section.enableField!}
      render={({ field }) => (
        <span className="flex shrink-0 items-center gap-2.5">
          <span
            className={cn(
              'font-mono text-[10px] font-medium uppercase tracking-[0.07em]',
              field.value === false ? 'text-faint' : 'text-link',
            )}
          >
            {field.value === false ? t('off') : t('enabled')}
          </span>
          <Switch
            checked={field.value === true}
            onCheckedChange={field.onChange}
            aria-label={t(`sectionTitles.${section.id}`)}
          />
        </span>
      )}
    />
  )
}
