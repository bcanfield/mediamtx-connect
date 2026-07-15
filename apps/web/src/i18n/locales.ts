export const locales = [
  'en',
  'es',
  'zh',
  'it',
  'de',
  'ru',
  'fr',
  'pt',
  'ja',
  'pl',
  'ko',
  'tr',
  'nl',
  'cs',
  'zh-tw',
  'pt-br',
  'id',
  'ro',
  'sv',
  'da',
  'no',
  'fi',
  'el',
  'hu',
  'uk',
  'vi',
  'tl',
  'th',
  'hi',
  'bn',
] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const LANGUAGE_NAMES: Record<Locale, string> = {
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

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

// Best-effort match against the browser's language preferences.
export function detectLocale(): Locale {
  for (const lang of navigator.languages ?? []) {
    const lower = lang.toLowerCase()
    if (isLocale(lower))
      return lower
    const base = lower.split('-')[0] ?? ''
    if (isLocale(base))
      return base
  }
  return defaultLocale
}
