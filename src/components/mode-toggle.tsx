'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const TRANSITION_DURATION_MS = 450

export function ModeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  const toggle = useCallback(() => {
    const button = buttonRef.current
    const next = isDark ? 'light' : 'dark'

    const apply = () => setTheme(next)

    if (!button || typeof document.startViewTransition !== 'function') {
      apply()
      return
    }

    const { top, left, width, height } = button.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const transition = document.startViewTransition(() => {
      // flushSync is required so the View Transitions API captures the new DOM in this frame.
      // eslint-disable-next-line react-dom/no-flush-sync
      flushSync(apply)
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: TRANSITION_DURATION_MS,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }, [isDark, setTheme])

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn('relative overflow-hidden', className)}
    >
      <Sun
        className={cn(
          'size-4 transition-all duration-500',
          isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
        )}
      />
      <Moon
        className={cn(
          'absolute size-4 transition-all duration-500',
          isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0',
        )}
      />
    </Button>
  )
}
