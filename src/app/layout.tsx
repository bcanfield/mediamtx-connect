import type { Viewport } from 'next'
import { getLocale, getMessages } from 'next-intl/server'

import { I18nProvider } from '@/i18n'
import { ServiceWorker, ThemeProvider } from '@/shared/components/providers'
import { Toaster } from '@/shared/components/ui/toaster'
import { cn } from '@/shared/utils'

import NavBar from './nav-bar'
import './globals.css'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  themeColor: '#020817',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased flex flex-col gap-4 items-center',
        )}
      >
        <I18nProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <header className="flex sticky top-0 z-40 w-full bg-background/75 shadow border-b justify-center backdrop-blur">
              <div className="px-4 w-full max-w-7xl">
                <NavBar />
              </div>
            </header>
            <div className="max-w-7xl p-4 w-full">{children}</div>
          </ThemeProvider>
          <Toaster></Toaster>
        </I18nProvider>
      </body>

      <ServiceWorker></ServiceWorker>
    </html>
  )
}
