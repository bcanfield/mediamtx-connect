'use client'

import { Check, Globe } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'

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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

const LANGUAGE_NAMES: Record<(typeof routing.locales)[number], string> = {
  'en': 'English',
  'es': 'Español',
  'zh': '中文',
  'it': 'Italiano',
  'de': 'Deutsch',
  'ru': 'Русский',
  'fr': 'Français',
  'pt': 'Português',
  'ja': '日本語',
  'pl': 'Polski',
  'ko': '한국어',
  'tr': 'Türkçe',
  'nl': 'Nederlands',
  'cs': 'Čeština',
  'zh-tw': '繁體中文',
  'pt-br': 'Português (BR)',
  'id': 'Bahasa Indonesia',
  'ro': 'Română',
  'sv': 'Svenska',
  'da': 'Dansk',
  'no': 'Norsk',
  'fi': 'Suomi',
  'el': 'Ελληνικά',
  'hu': 'Magyar',
  'uk': 'Українська',
  'vi': 'Tiếng Việt',
  'tl': 'Tagalog',
  'th': 'ไทย',
  'hi': 'हिन्दी',
  'bn': 'বাংলা',
}

export function LocaleSwitcher() {
  const t = useTranslations('Common.locale')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const switchTo = (next: (typeof routing.locales)[number]) => {
    setOpen(false)
    if (next === locale)
      return
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton tooltip={t('switchLanguage')} aria-label={t('switchLanguage')} disabled={isPending}>
              <Globe className="size-4" />
              <span>{LANGUAGE_NAMES[locale as keyof typeof LANGUAGE_NAMES] ?? locale}</span>
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-56 p-0">
            <Command>
              <CommandInput placeholder={t('searchPlaceholder')} />
              <CommandList>
                <CommandEmpty>{t('noResults')}</CommandEmpty>
                <CommandGroup>
                  {routing.locales.map(loc => (
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
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
