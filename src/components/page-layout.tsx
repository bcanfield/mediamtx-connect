import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { Separator } from '@/components/ui/separator'

export async function PageLayout({
  children,
  header,
  subHeader,
}: {
  children: React.ReactNode
  header?: string
  subHeader?: string
}) {
  const t = await getTranslations('Common')
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3 p-4">
      <header className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{header}</h2>
        <Suspense fallback={<p>{t('loading')}</p>}>
          {subHeader && <p className="text-muted-foreground">{subHeader}</p>}
        </Suspense>
      </header>
      <Separator />
      {children}
    </div>
  )
}
