import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { AppSidebar } from '@/components/app-sidebar'
import { HtmlLang } from '@/components/html-lang'
import { ServiceWorker } from '@/components/service-worker'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { routing } from '@/i18n/routing'

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
        'zh-TW': '/zh-tw',
        'pt-BR': '/pt-br',
        'id': '/id',
        'ro': '/ro',
        'sv': '/sv',
        'da': '/da',
        'no': '/no',
        'fi': '/fi',
        'el': '/el',
        'hu': '/hu',
        'uk': '/uk',
        'vi': '/vi',
        'tl': '/tl',
        'th': '/th',
        'hi': '/hi',
        'bn': '/bn',
        'x-default': '/',
      },
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
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
    <NextIntlClientProvider>
      <HtmlLang />
      <ThemeProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
        <Toaster />
      </ThemeProvider>

      <ServiceWorker />
    </NextIntlClientProvider>
  )
}
