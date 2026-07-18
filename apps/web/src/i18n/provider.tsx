import type { Locale } from './locales'
import { createContext, use, useEffect, useMemo, useState } from 'react'
import { IntlProvider } from 'use-intl'
import { logger } from '@/lib/logger'
import enMessages from '../../messages/en.json'
import { defaultLocale, detectLocale, isLocale } from './locales'

const LOCALE_STORAGE_KEY = 'locale'

type Messages = Record<string, unknown>

// English is bundled eagerly; every other locale loads on demand.
const messageModules = import.meta.glob<{ default: Messages }>('../../messages/*.json')

async function loadMessages(locale: Locale): Promise<Messages> {
  if (locale === 'en')
    return enMessages
  const loader = messageModules[`../../messages/${locale}.json`]
  if (!loader)
    return enMessages
  return (await loader()).default
}

function initialLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored && isLocale(stored))
    return stored
  return detectLocale()
}

export const LocaleContext = createContext<{
  locale: Locale
  setLocale: (locale: Locale) => void
}>({ locale: defaultLocale, setLocale: () => {} })

export function useLocaleSwitcher() {
  return use(LocaleContext)
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [messages, setMessages] = useState<Messages>(enMessages)

  useEffect(() => {
    let cancelled = false
    loadMessages(locale)
      .then((m) => {
        if (!cancelled)
          setMessages(m)
      })
      .catch(err => logger.error(`Failed to load messages for ${locale}`, err))
    document.documentElement.lang = locale
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    return () => {
      cancelled = true
    }
  }, [locale])

  const context = useMemo(() => ({ locale, setLocale }), [locale])

  return (
    <LocaleContext value={context}>
      <IntlProvider
        locale={locale}
        messages={messages as never}
        timeZone={new Intl.DateTimeFormat().resolvedOptions().timeZone}
      >
        {children}
      </IntlProvider>
    </LocaleContext>
  )
}
