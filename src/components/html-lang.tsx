'use client'

import { useLocale } from 'next-intl'
import { useEffect } from 'react'

// The root layout sets <html lang> on full page loads, but it stays mounted
// across client-side locale switches. Keep the attribute in sync here, since the
// [locale] subtree re-renders when the locale changes.
export function HtmlLang() {
  const locale = useLocale()

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return null
}
