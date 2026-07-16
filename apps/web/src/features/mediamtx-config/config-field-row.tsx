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
  alignEnd = false,
  children,
}: {
  name: string
  help?: string
  dirty: boolean
  alignEnd?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-x-6 gap-y-2 border-b border-border-row py-3.5 last:border-0 sm:grid-cols-[280px_minmax(0,1fr)]">
      <div className="min-w-0">
        <span className="flex items-center gap-1.5 font-mono text-[13px] font-medium">
          <span className="truncate">{name}</span>
          {dirty && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-warning" />}
        </span>
        {help && <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{help}</p>}
      </div>
      <div className={cn('flex flex-col gap-1.5', alignEnd && 'items-end')}>{children}</div>
    </div>
  )
}

function useFieldHelp(name: string): string | undefined {
  const t = useTranslations('Config.mediamtxForm.help')
  return t.has(name) ? t(name) : undefined
}

export function TextFieldRow<T extends FieldValues>({
  control,
  name,
  kind = 'text',
}: {
  control: Control<T>
  name: FieldPath<T>
  kind?: 'text' | 'number'
}) {
  const help = useFieldHelp(name)
  const { dirtyFields } = useFormState({ control, name, exact: true })
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <RowShell name={name} help={help} dirty={Boolean(dirtyFields[name as keyof typeof dirtyFields])}>
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
}: {
  control: Control<T>
  name: FieldPath<T>
}) {
  const help = useFieldHelp(name)
  const { dirtyFields } = useFormState({ control, name, exact: true })
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <RowShell name={name} help={help} dirty={Boolean(dirtyFields[name as keyof typeof dirtyFields])} alignEnd>
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
}: {
  control: Control<T>
  name: FieldPath<T>
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
          dirty={Boolean(dirtyFields[name as keyof typeof dirtyFields])}
        >
          <FormItem className="w-full space-y-1.5">
            <FormControl>
              <Textarea
                {...field}
                aria-label={name}
                className="min-h-16 font-mono text-[13px]"
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
