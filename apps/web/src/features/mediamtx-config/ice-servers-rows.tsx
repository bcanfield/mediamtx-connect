import type { GlobalConfigFormData } from '@connect/contract'
import type { Control } from 'react-hook-form'
import { Plus, X } from 'lucide-react'
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
const ICE_SERVERS_KEY = 'webrtcICEServers2'

// Repeatable [url | username | password] rows (board 2e, WebRTC section).
export function IceServersRows({ control }: { control: Control<GlobalConfigFormData> }) {
  const t = useTranslations('Config.mediamtxForm.iceServers')
  const help = useTranslations('Config.mediamtxForm.help')
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'webrtcICEServers2',
  })
  const { dirtyFields } = useFormState({ control, name: 'webrtcICEServers2', exact: true })
  const dirty = Boolean(dirtyFields.webrtcICEServers2)

  return (
    <RowShell name={ICE_SERVERS_KEY} help={help('webrtcICEServers2')} dirty={dirty}>
      {fields.map((field, index) => (
        <div key={field.id} className="flex w-full flex-col gap-2 lg:flex-row lg:items-start">
          <FormField
            control={control}
            name={`webrtcICEServers2.${index}.url`}
            render={({ field: f }) => (
              <FormItem className="min-w-0 space-y-1 lg:flex-[2]">
                <FormControl {...f}>
                  <Input
                    className="font-mono"
                    placeholder={t('urlPlaceholder')}
                    aria-label={t('urlAria', { index: index + 1 })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`webrtcICEServers2.${index}.username`}
            render={({ field: f }) => (
              <FormItem className="min-w-0 space-y-1 lg:flex-1">
                <FormControl {...f}>
                  <Input
                    className="font-mono"
                    placeholder={t('usernamePlaceholder')}
                    aria-label={t('usernameAria', { index: index + 1 })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`webrtcICEServers2.${index}.password`}
            render={({ field: f }) => (
              <FormItem className="min-w-0 space-y-1 lg:flex-1">
                <FormControl {...f}>
                  <Input
                    className="font-mono"
                    placeholder={t('passwordPlaceholder')}
                    aria-label={t('passwordAria', { index: index + 1 })}
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
            className="size-8 shrink-0 self-end text-mute hover:text-foreground lg:self-auto"
            aria-label={t('removeAria', { index: index + 1 })}
            onClick={() => remove(index)}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start border-dashed"
        onClick={() => append({ url: '', username: '', password: '' })}
      >
        <Plus className="mr-1.5 size-3.5" />
        {t('add')}
      </Button>
    </RowShell>
  )
}
