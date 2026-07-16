import type { GlobalConfigFormData } from '@connect/contract'
import type { Control, FieldErrors, FieldPath, FieldValues, Resolver } from 'react-hook-form'
import type { ConfigScope, SectionDef } from './sections'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm, useFormState, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslations } from 'use-intl'

import { SaveBar } from '@/components/save-bar'
import { Form, FormField } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { useScrollSpy } from '@/hooks/use-scroll-spy'
import { cn } from '@/lib/utils'

import { ListFieldRow, SwitchFieldRow, TextFieldRow } from './config-field-row'
import { IceServersRows } from './ice-servers-rows'
import { countErrorsForSection } from './sections'

// The rail form for one MediaMTX config scope (ADR 0002). Global and path
// defaults differ only in schema, sections, and the procedure that saves them.
export function MediaMTXConfigForm<T extends FieldValues>({
  scope,
  conf,
  onSave,
}: {
  scope: ConfigScope<T>
  conf: T
  // `changed` holds only the keys the operator edited. Scopes that PATCH a
  // whole config ignore it; the path scope sends it as its sparse override so
  // untouched keys keep tracking path defaults (ADR 0002).
  onSave: (values: T, changed: Partial<T>) => Promise<unknown>
}) {
  const t = useTranslations('Config.mediamtxForm')
  const tSaveBar = useTranslations('Config.saveBar')
  const form = useForm<T>({
    // The scope pairs its schema with its section descriptors; a generic T
    // can't prove that to the resolver's own inference.
    resolver: zodResolver(scope.schema) as Resolver<T, unknown, T>,
    mode: 'onBlur',
    defaultValues: conf as never,
  })

  const onSubmit = async (values: T) => {
    const changed = Object.fromEntries(
      Object.keys(form.formState.dirtyFields).map(key => [key, values[key]]),
    ) as Partial<T>
    try {
      await onSave(values, changed)
      form.reset(values)
      toast.success(t('toasts.success'))
    }
    catch {
      toast.error(t('toasts.errorTitle'), {
        description: t('toasts.errorDescription'),
      })
    }
  }

  const onReset = () => form.reset(conf)

  const offById = useOffById(form.control, scope)
  const { isDirty, isValid, dirtyFields } = form.formState
  const errors = form.formState.errors as Record<string, unknown>
  const dirtyKeys = Object.keys(dirtyFields)
  const errorCount = Object.keys(errors).length
  const summary = errorCount > 0
    ? `${tSaveBar('unsaved', { count: dirtyKeys.length })} · ${tSaveBar('needsAttention', { count: errorCount })}`
    : tSaveBar('unsaved', { count: dirtyKeys.length })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <SectionRail control={form.control} scope={scope} offById={offById} variant="chips" />

        <div className="flex items-start gap-8">
          <SectionRail control={form.control} scope={scope} offById={offById} variant="rail" />

          <div className="flex min-w-0 flex-1 flex-col gap-8">
            {scope.sections.map(section => (
              <ConfigSection
                key={section.id}
                section={section}
                control={form.control}
                isOff={offById[section.id] ?? false}
              />
            ))}
          </div>
        </div>

        {dirtyKeys.length > 0 && (
          <SaveBar
            summary={summary}
            chips={dirtyKeys.map(key => ({ key, error: Boolean(errors[key]) }))}
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

// Watches only the sections' enable switches — never the whole form, which
// would re-render every section on each keystroke.
function useOffById<T extends FieldValues>(
  control: Control<T>,
  scope: ConfigScope<T>,
): Record<string, boolean> {
  const enableFields = useMemo(
    () => scope.sections
      .map(s => s.enableField)
      .filter((name): name is FieldPath<T> => Boolean(name)),
    [scope],
  )
  const values = useWatch({ control, name: enableFields })

  const offByField = new Map(enableFields.map((name, i) => [name, values[i] === false]))
  return Object.fromEntries(
    scope.sections.map(s => [s.id, s.enableField ? offByField.get(s.enableField) === true : false]),
  )
}

// One nav, two renderings: sticky side rail on desktop, horizontal chip row
// on mobile (board 2e). Error counts and OFF states roll up live.
function SectionRail<T extends FieldValues>({
  control,
  scope,
  offById,
  variant,
}: {
  control: Control<T>
  scope: ConfigScope<T>
  offById: Record<string, boolean>
  variant: 'rail' | 'chips'
}) {
  const t = useTranslations('Config.mediamtxForm')
  // useScrollSpy re-arms its observer when this array's identity changes.
  const sectionIds = useMemo(() => scope.sections.map(s => `mtx-${s.id}`), [scope])
  const activeId = useScrollSpy(sectionIds)
  const { errors } = useFormState({ control })

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const rows = scope.sections.map(section => ({
    section,
    errCount: countErrorsForSection(errors as FieldErrors<FieldValues>, section),
    off: offById[section.id] ?? false,
  }))

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

function ConfigSection<T extends FieldValues>({
  section,
  control,
  isOff,
}: {
  section: SectionDef<T>
  control: Control<T>
  isOff: boolean
}) {
  const t = useTranslations('Config.mediamtxForm')

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
              {/* webrtcICEServers2 exists only on the global scope. */}
              {section.hasIceServers && (
                <IceServersRows control={control as unknown as Control<GlobalConfigFormData>} />
              )}
            </div>
          )}
    </section>
  )
}

function SectionEnableSwitch<T extends FieldValues>({
  section,
  control,
}: {
  section: SectionDef<T>
  control: Control<T>
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
