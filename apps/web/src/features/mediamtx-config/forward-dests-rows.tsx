import type { PathConfigFormData } from '@connect/contract'
import type { Control } from 'react-hook-form'
import { Eye, EyeOff, LockIcon, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useFieldArray, useFormState } from 'react-hook-form'
import { useTranslations } from 'use-intl'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { RowShell } from './config-field-row'

// MediaMTX config key, rendered verbatim — never localized (docs/I18N.md).
const FORWARD_KEY = 'forward'

// One row per `forward` destination. The whole list is what gets saved: the
// form diffs by top-level key, and MediaMTX's PATCH replaces the list anyway.
export function ForwardDestsRows({ control }: { control: Control<PathConfigFormData> }) {
  const t = useTranslations('Config.mediamtxForm.forwardDests')
  const { fields, append, remove } = useFieldArray({ control, name: 'forward' })
  const { dirtyFields } = useFormState({ control, name: 'forward', exact: true })

  return (
    <>
      <p role="note" className="mt-3.5 flex items-start gap-2 rounded-panel border border-border-subtle p-3 text-meta text-muted-foreground">
        <LockIcon aria-hidden className="mt-px size-3.5 shrink-0" />
        {t('plaintextNotice')}
      </p>
      <RowShell name={FORWARD_KEY} dirty={Boolean(dirtyFields.forward)}>
        {fields.map((field, index) => (
          <ForwardDestRow
            key={field.id}
            control={control}
            index={index}
            onRemove={() => remove(index)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start border-dashed"
          // `dest` only: the other keys are v1.21-only, and v1.20 refuses them.
          onClick={() => append({ dest: '' })}
        >
          <Plus className="mr-1.5 size-3.5" />
          {t('add')}
        </Button>
      </RowShell>
    </>
  )
}

function ForwardDestRow({
  control,
  index,
  onRemove,
}: {
  control: Control<PathConfigFormData>
  index: number
  onRemove: () => void
}) {
  const t = useTranslations('Config.mediamtxForm.forwardDests')
  // Destinations usually carry a stream key, so each one stays masked until
  // the operator asks to see it.
  const [shown, setShown] = useState(false)

  return (
    <div className="flex w-full items-start gap-2">
      <FormField
        control={control}
        name={`forward.${index}.dest`}
        render={({ field }) => (
          <FormItem className="min-w-0 flex-1 space-y-1">
            <FormControl {...field}>
              <Input
                type={shown ? 'text' : 'password'}
                autoComplete="off"
                className="font-mono"
                placeholder={t('placeholder')}
                aria-label={t('destAria', { index: index + 1 })}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-mute hover:text-foreground"
        aria-label={shown ? t('hideAria', { index: index + 1 }) : t('showAria', { index: index + 1 })}
        onClick={() => setShown(s => !s)}
      >
        {shown ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-mute hover:text-foreground"
        aria-label={t('removeAria', { index: index + 1 })}
        onClick={onRemove}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  )
}
