import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es', 'zh', 'it', 'de', 'ru', 'fr', 'pt', 'ja', 'pl', 'ko', 'tr', 'nl', 'cs'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
