'use client'

import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'

interface I18nProviderProps {
  children: ReactNode
  locale: string
  messages: Record<string, unknown>
}

export function I18nProvider({ children, locale, messages }: I18nProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  )
}
