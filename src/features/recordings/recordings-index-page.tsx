import { AlertTriangle, Settings } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getAppConfig } from '@/features/client-config/client-config.queries'
import { summarizeStreamRecordings } from '@/features/recordings/file-operations'
import { Link } from '@/i18n/navigation'

import { RecordingsIndexEmpty } from './recordings-index-empty'
import { RecordingsIndexView } from './recordings-index-view'

export const dynamic = 'force-dynamic'

export async function RecordingsIndexPage() {
  const t = await getTranslations('Recordings')
  const crumbs = [{ label: t('crumbRecordings') }]
  const config = await getAppConfig()
  if (!config) {
    return (
      <>
        <PageHeader crumbs={crumbs} />
        <PageLayout
          header={t('header')}
          subHeader={t('subHeader')}
        >
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('errors.configTitle')}</AlertTitle>
            <AlertDescription>
              {t('errors.configDescription')}
            </AlertDescription>
          </Alert>
        </PageLayout>
      </>
    )
  }

  let error = false
  let summary: ReturnType<typeof summarizeStreamRecordings> = {}

  try {
    summary = summarizeStreamRecordings(config.recordingsDirectory)
  }
  catch {
    error = true
  }

  const streams = Object.entries(summary).map(([name, value]) => ({
    name,
    count: value.count,
    latestMtime: value.latestMtime ? value.latestMtime.toISOString() : null,
  }))

  const hasRecordings = streams.length > 0

  return (
    <>
      <PageHeader crumbs={crumbs} />
      <PageLayout
        header={t('header')}
        subHeader={t('subHeader')}
      >
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('errors.directoryTitle')}</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                {t('errors.directoryLead')}
                {' '}
                <code className="bg-muted px-1 rounded">
                  {config.recordingsDirectory}
                </code>
              </p>
              <p className="text-sm">
                {t('errors.directoryHint')}
              </p>
              <Link href="/config" className="mt-2 inline-block">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('errors.checkConfigBtn')}
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {!error && !hasRecordings && <RecordingsIndexEmpty />}

        {!error && hasRecordings && <RecordingsIndexView streams={streams} />}
      </PageLayout>
    </>
  )
}
