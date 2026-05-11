import type { Metadata, Viewport } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { AppSidebar } from '@/components/app-sidebar'
import { ServiceWorker } from '@/components/service-worker'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

import '../globals.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  return {
    title: {
      default: t('titleDefault'),
      template: t('titleTemplate'),
    },
    description: t('description'),
    alternates: {
      languages: {
        'en': '/',
        'es': '/es',
        'zh': '/zh',
        'it': '/it',
        'de': '/de',
        'ru': '/ru',
        'fr': '/fr',
        'pt': '/pt',
        'ja': '/ja',
        'pl': '/pl',
        'ko': '/ko',
        'tr': '/tr',
        'nl': '/nl',
        'cs': '/cs',
        'x-default': '/',
      },
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#0c1016',
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>{children}</SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
          <Toaster />

          <ServiceWorker />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
