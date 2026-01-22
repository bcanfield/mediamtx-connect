'use client'

import { Moon, Sun } from 'lucide-react'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined')
    return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

let currentTheme: 'dark' | 'light' | 'system' | undefined
const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot(): 'dark' | 'light' | 'system' | undefined {
  return currentTheme
}

function getServerSnapshot(): 'dark' | 'light' | 'system' | undefined {
  return undefined
}

export function ModeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const updateTheme = useCallback((newTheme: 'dark' | 'light' | 'system') => {
    currentTheme = newTheme
    listeners.forEach(listener => listener())
  }, [])

  useEffect(() => {
    if (currentTheme === undefined) {
      currentTheme = getSystemTheme()
      listeners.forEach(listener => listener())
    }
  }, [])

  useEffect(() => {
    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    }
    else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => updateTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
