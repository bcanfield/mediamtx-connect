'use client'

import type { Locale } from '@/i18n/config'
import { Globe } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import { useCallback, useTransition } from 'react'
import { localeNames, locales } from '@/i18n/config'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

export function LanguageSwitcher() {
  const t = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLanguageChange = useCallback(
    (newLocale: Locale) => {
      // Set cookie for locale persistence
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`

      startTransition(() => {
        router.refresh()
      })
    },
    [router],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map(l => (
          <DropdownMenuItem
            key={l}
            onClick={() => handleLanguageChange(l)}
            className={locale === l ? 'bg-accent' : ''}
          >
            {localeNames[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
