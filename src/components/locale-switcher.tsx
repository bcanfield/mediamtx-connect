'use client'

import { Globe } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

const LANGUAGE_NAMES: Record<(typeof routing.locales)[number], string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  it: 'Italiano',
  de: 'Deutsch',
  ru: 'Русский',
  fr: 'Français',
  pt: 'Português',
  ja: '日本語',
  pl: 'Polski',
  ko: '한국어',
  tr: 'Türkçe',
  nl: 'Nederlands',
  cs: 'Čeština',
  'zh-tw': '繁體中文',
  'pt-br': 'Português (BR)',
  id: 'Bahasa Indonesia',
  ro: 'Română',
  sv: 'Svenska',
  da: 'Dansk',
  no: 'Norsk',
  fi: 'Suomi',
  el: 'Ελληνικά',
  hu: 'Magyar',
  uk: 'Українська',
  vi: 'Tiếng Việt',
  tl: 'Tagalog',
  th: 'ไทย',
  hi: 'हिन्दी',
  bn: 'বাংলা',
}

export function LocaleSwitcher() {
  const t = useTranslations('Common.locale')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const switchTo = (next: (typeof routing.locales)[number]) => {
    if (next === locale)
      return
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip={t('switchLanguage')} aria-label={t('switchLanguage')} disabled={isPending}>
              <Globe className="size-4" />
              <span>{LANGUAGE_NAMES[locale as keyof typeof LANGUAGE_NAMES] ?? locale}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            {routing.locales.map(loc => (
              <DropdownMenuItem
                key={loc}
                onClick={() => switchTo(loc)}
                disabled={loc === locale}
              >
                {LANGUAGE_NAMES[loc]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
