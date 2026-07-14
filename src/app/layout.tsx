import type { Viewport } from 'next'
import { getLocale } from 'next-intl/server'

import { ThemeScript } from '@/components/theme-script'
import { cn } from '@/lib/utils'

import './globals.css'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  themeColor: '#0c1016',
}

// Root layout holds the <html>/<body> shell and the pre-hydration ThemeScript.
// It stays mounted across locale switches (only the [locale] segment below
// remounts), so the inline script is never re-rendered on the client.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <ThemeScript />
        {children}
      </body>
    </html>
  )
}
