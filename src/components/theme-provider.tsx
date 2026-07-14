'use client'

import type { ResolvedTheme, Theme } from './theme-config'
import type { ThemeContextValue } from './theme-context'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { PREFERS_DARK, THEME_DEFAULT, THEME_STORAGE_KEY } from './theme-config'
import { ThemeContext } from './theme-context'

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(PREFERS_DARK).matches ? 'dark' : 'light'
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  }
  catch {
    // localStorage can throw in private mode — fall back to the default.
  }
  return THEME_DEFAULT
}

// Momentarily kill CSS transitions so a theme swap doesn't animate the whole page.
function withTransitionsDisabled(apply: () => void) {
  const style = document.createElement('style')
  style.appendChild(
    document.createTextNode('*,*::before,*::after{transition:none!important}'),
  )
  document.head.appendChild(style)
  apply()
  // Force a reflow so the disabling styles take effect before we remove them.
  window.getComputedStyle(document.body)
  setTimeout(() => document.head.removeChild(style), 1)
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  withTransitionsDisabled(() => {
    const html = document.documentElement
    html.classList.remove('light', 'dark')
    html.classList.add(resolved)
    html.style.colorScheme = resolved
  })
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(THEME_DEFAULT)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('dark')

  // Sync React state to what's stored, and re-assert the resolved theme on the
  // <html> element. Re-asserting matters when this provider remounts on a locale
  // switch (the layout is scoped to [locale]): the anti-flash script only runs on
  // the initial document load, so without this a remount would leave the class stale.
  useEffect(() => {
    const stored = readStoredTheme()
    const system = getSystemTheme()
    setThemeState(stored)
    setSystemTheme(system)
    applyResolvedTheme(stored === 'system' ? system : stored)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    }
    catch {
      // Ignore storage failures; the class change below still applies.
    }
    applyResolvedTheme(next === 'system' ? getSystemTheme() : next)
  }, [])

  useEffect(() => {
    const media = window.matchMedia(PREFERS_DARK)
    const onChange = () => {
      const resolved = getSystemTheme()
      setSystemTheme(resolved)
      if (theme === 'system') {
        applyResolvedTheme(resolved)
      }
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  // Keep tabs in sync when the theme changes elsewhere.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY)
        return
      const next = readStoredTheme()
      setThemeState(next)
      applyResolvedTheme(next === 'system' ? getSystemTheme() : next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      systemTheme,
      resolvedTheme: theme === 'system' ? systemTheme : theme,
    }),
    [theme, setTheme, systemTheme],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}

export { ThemeProvider }
