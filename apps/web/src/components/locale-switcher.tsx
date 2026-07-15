import type { Locale } from '@/i18n/locales'
import { Check, Languages } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'use-intl'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { LANGUAGE_NAMES, locales } from '@/i18n/locales'
import { useLocaleSwitcher } from '@/i18n/provider'
import { cn } from '@/lib/utils'

export function LocaleSwitcher() {
  const t = useTranslations('Common.locale')
  const { locale, setLocale } = useLocaleSwitcher()
  const [open, setOpen] = useState(false)

  const switchTo = (next: Locale) => {
    setOpen(false)
    if (next === locale)
      return
    setLocale(next)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('switchLanguage')}
          title={t('switchLanguage')}
        >
          <Languages className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-56 p-0">
        <Command>
          <CommandInput placeholder={t('searchPlaceholder')} />
          <CommandList>
            <CommandEmpty>{t('noResults')}</CommandEmpty>
            <CommandGroup>
              {locales.map(loc => (
                <CommandItem
                  key={loc}
                  value={LANGUAGE_NAMES[loc]}
                  onSelect={() => switchTo(loc)}
                >
                  <Check className={cn('size-4', loc === locale ? 'opacity-100' : 'opacity-0')} />
                  {LANGUAGE_NAMES[loc]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
