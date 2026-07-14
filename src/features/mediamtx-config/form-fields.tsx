'use client'

import type { ChangeEvent } from 'react'
import type { Control, FieldPath } from 'react-hook-form'

import type { GlobalConfigFormData } from './mediamtx-config.schemas'
import { useTranslations } from 'next-intl'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

import { Textarea } from '@/components/ui/textarea'

type Ctrl = Control<GlobalConfigFormData>

function fromTextarea(event: ChangeEvent<HTMLTextAreaElement>): string[] {
  return event.target.value.split('\n')
}

function toTextarea(value: string[] | undefined): string {
  return value?.join('\n') ?? ''
}

export function SwitchField({
  control,
  name,
  label,
  description,
}: {
  control: Ctrl
  name: FieldPath<GlobalConfigFormData>
  label: string
  description?: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between gap-4 rounded-md border px-3 py-2">
          <div className="space-y-0.5">
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={field.value === true}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}

export function TextField({
  control,
  name,
  label,
  description,
  placeholder,
  type = 'text',
}: {
  control: Ctrl
  name: FieldPath<GlobalConfigFormData>
  label: string
  description?: string
  placeholder?: string
  type?: 'text' | 'number'
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl {...field}>
            <Input type={type} placeholder={placeholder} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function ListField({
  control,
  name,
  label,
  description,
}: {
  control: Ctrl
  name: FieldPath<GlobalConfigFormData>
  label: string
  description?: string
}) {
  const t = useTranslations('Config.formFields')
  const resolvedDescription = description ?? t('oneValuePerLine')
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              value={toTextarea(field.value as string[] | undefined)}
              onChange={e => field.onChange(fromTextarea(e))}
            />
          </FormControl>
          <FormDescription>{resolvedDescription}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
