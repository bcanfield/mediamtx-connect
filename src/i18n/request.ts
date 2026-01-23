import type { Locale } from './config'
import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { defaultLocale, locales } from './config'

export default getRequestConfig(async () => {
  // Try to get locale from cookie first
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value

  // Then try Accept-Language header
  let locale: Locale = defaultLocale

  if (localeCookie && locales.includes(localeCookie as Locale)) {
    locale = localeCookie as Locale
  }
  else {
    const headersList = await headers()
    const acceptLanguage = headersList.get('Accept-Language')
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim().substring(0, 2))
        .find(lang => locales.includes(lang as Locale))

      if (preferredLocale) {
        locale = preferredLocale as Locale
      }
    }
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'UTC',
  }
})
