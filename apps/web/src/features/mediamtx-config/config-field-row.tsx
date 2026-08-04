import type { ChangeEvent } from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { useFormState } from 'react-hook-form'
import { useTranslations } from 'use-intl'

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

function fromTextarea(event: ChangeEvent<HTMLTextAreaElement>): string[] {
  return event.target.value.split('\n')
}

function toTextarea(value: string[] | undefined): string {
  return value?.join('\n') ?? ''
}

// ConfigFieldRow (handoff §3): fixed key column with the MediaMTX config key
// verbatim in mono (never localized — docs/I18N.md), localized help below,
// control on the right, hairline row separator.
export function RowShell({
  name,
  help,
  dirty,
  inheritedValues,
  value,
  alignEnd = false,
  children,
}: {
  name: string
  help?: string
  dirty: boolean
  inheritedValues?: Record<string, unknown>
  value?: unknown
  alignEnd?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      data-testid={`field-${name}`}
      className="grid grid-cols-1 items-start gap-x-6 gap-y-2 border-b border-border-row py-3.5 last:border-0 sm:grid-cols-[280px_minmax(0,1fr)]"
    >
      <div className="min-w-0">
        <span className="flex items-center gap-1.5 font-mono text-control font-medium">
          <span className="truncate">{name}</span>
          {dirty && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-warning" />}
          <InheritanceMarker inheritedValues={inheritedValues} name={name} value={value} />
        </span>
        {help && <p className="mt-1 text-meta leading-relaxed text-muted-foreground">{help}</p>}
      </div>
      <div className={cn('flex flex-col gap-1.5', alignEnd && 'items-end')}>{children}</div>
    </div>
  )
}

// MediaMTX resolves path defaults into the entry it serves, so every key comes
// back filled in and "unset" is not a state the API can report. What it can
// report is whether the value still matches the one it inherits — that is what
// this marks. A path that sets a key to the value its default already holds is
// indistinguishable from one that leaves it alone, and reads as inherited.
//
// Renders nothing for the scopes that inherit from nothing (global, path
// defaults), which pass no `inheritedValues`.
export function InheritanceMarker({
  inheritedValues,
  name,
  value,
}: {
  inheritedValues?: Record<string, unknown>
  name: string
  value: unknown
}) {
  const t = useTranslations('Config.mediamtxForm.inheritance')
  if (!inheritedValues)
    return null

  const inherited = sameValue(value, inheritedValues[name])
  return (
    <span
      title={inherited ? t('inheritedTitle') : t('overriddenTitle')}
      className={cn(
        'shrink-0 font-mono text-micro font-medium uppercase tracking-[0.06em]',
        inherited ? 'text-faint' : 'text-link',
      )}
    >
      {inherited ? t('inherited') : t('overridden')}
    </span>
  )
}

// Both sides come off the same schema, so identity covers everything but the
// list fields.
function sameValue(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((item, i) => item === b[i])
  return a === b
}

function useFieldHelp(name: string): string | undefined {
  const t = useTranslations('Config.mediamtxForm.help')
  return t.has(name) ? t(name) : undefined
}

export function TextFieldRow<T extends FieldValues>({
  control,
  name,
  kind = 'text',
  inheritedValues,
}: {
  control: Control<T>
  name: FieldPath<T>
  kind?: 'text' | 'number'
  inheritedValues?: Record<string, unknown>
}) {
  const help = useFieldHelp(name)
  const { dirtyFields } = useFormState({ control, name, exact: true })
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <RowShell
          name={name}
          help={help}
          dirty={Boolean((dirtyFields as Record<string, unknown>)[name])}
          inheritedValues={inheritedValues}
          value={field.value}
        >
          <FormItem className="w-full space-y-1.5">
            <FormControl {...field}>
              <Input type={kind} className="font-mono" aria-label={name} />
            </FormControl>
            <FormMessage />
          </FormItem>
        </RowShell>
      )}
    />
  )
}

export function SwitchFieldRow<T extends FieldValues>({
  control,
  name,
  inheritedValues,
}: {
  control: Control<T>
  name: FieldPath<T>
  inheritedValues?: Record<string, unknown>
}) {
  const help = useFieldHelp(name)
  const { dirtyFields } = useFormState({ control, name, exact: true })
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <RowShell
          name={name}
          help={help}
          dirty={Boolean((dirtyFields as Record<string, unknown>)[name])}
          inheritedValues={inheritedValues}
          value={field.value}
          alignEnd
        >
          <FormItem className="space-y-1.5">
            <FormControl>
              <Switch
                checked={field.value === true}
                onCheckedChange={field.onChange}
                aria-label={name}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </RowShell>
      )}
    />
  )
}

export function ListFieldRow<T extends FieldValues>({
  control,
  name,
  inheritedValues,
}: {
  control: Control<T>
  name: FieldPath<T>
  inheritedValues?: Record<string, unknown>
}) {
  const t = useTranslations('Config.formFields')
  const help = useFieldHelp(name)
  const { dirtyFields } = useFormState({ control, name, exact: true })
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <RowShell
          name={name}
          help={help ? `${help} ${t('oneValuePerLine')}` : t('oneValuePerLine')}
          dirty={Boolean((dirtyFields as Record<string, unknown>)[name])}
          inheritedValues={inheritedValues}
          value={field.value}
        >
          <FormItem className="w-full space-y-1.5">
            <FormControl>
              <Textarea
                {...field}
                aria-label={name}
                className="min-h-16 font-mono text-control"
                value={toTextarea(field.value as string[] | undefined)}
                onChange={e => field.onChange(fromTextarea(e))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </RowShell>
      )}
    />
  )
}
