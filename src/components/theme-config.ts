export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'
export const THEME_DEFAULT: Theme = 'dark'
export const PREFERS_DARK = '(prefers-color-scheme: dark)'
