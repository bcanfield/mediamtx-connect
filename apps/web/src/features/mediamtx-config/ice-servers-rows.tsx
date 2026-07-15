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
    <div className="grid grid-cols-1 items-start gap-x-6 gap-y-2 py-3.5 sm:grid-cols-[280px_minmax(0,1fr)]">
      <div className="min-w-0">
        <span className="flex items-center gap-1.5 font-mono text-[13px] font-medium">
          <span className="truncate">{ICE_SERVERS_KEY}</span>
          {dirty && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-warning" />}
        </span>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
          {help('webrtcICEServers2')}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <FormField
              control={control}
              name={`webrtcICEServers2.${index}.url`}
              render={({ field: f }) => (
                <FormItem className="min-w-0 flex-[1.6] space-y-1">
                  <FormControl {...f}>
                    <Input
                      className="font-mono"
                      placeholder={t('urlPlaceholder')}
                      aria-label={t('urlAria', { index: index + 1 })}
                    />
                  </FormControl>
                  <FormMessage className="text-[11.5px]" />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`webrtcICEServers2.${index}.username`}
              render={({ field: f }) => (
                <FormItem className="min-w-0 flex-1 space-y-1">
                  <FormControl {...f}>
                    <Input
                      className="font-mono"
                      placeholder={t('usernamePlaceholder')}
                      aria-label={t('usernameAria', { index: index + 1 })}
                    />
                  </FormControl>
                  <FormMessage className="text-[11.5px]" />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`webrtcICEServers2.${index}.password`}
              render={({ field: f }) => (
                <FormItem className="min-w-0 flex-1 space-y-1">
                  <FormControl {...f}>
                    <Input
                      className="font-mono"
                      placeholder={t('passwordPlaceholder')}
                      aria-label={t('passwordAria', { index: index + 1 })}
                    />
                  </FormControl>
                  <FormMessage className="text-[11.5px]" />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-mute hover:text-foreground"
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
      </div>
    </div>
  )
}
