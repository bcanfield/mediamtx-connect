import { useQueries } from '@tanstack/react-query'
import { AlertTriangle, Settings } from 'lucide-react'
import { useTranslations } from 'use-intl'

import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { orpc } from '@/orpc'

import { RecordingsIndexEmpty } from './recordings-index-empty'
import { RecordingsIndexView } from './recordings-index-view'

export function RecordingsIndexPage() {
  const t = useTranslations('Recordings')
  const crumbs = [{ label: t('crumbRecordings') }]
  const [streamsQuery, configQuery] = useQueries({
    queries: [
      orpc.recordings.listStreams.queryOptions(),
      orpc.config.app.get.queryOptions(),
    ],
  })

  const error = streamsQuery.isError
  const streams = streamsQuery.data ?? []
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
                  {configQuery.data?.recordingsDirectory}
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

        {streamsQuery.isSuccess && !hasRecordings && <RecordingsIndexEmpty />}

        {streamsQuery.isSuccess && hasRecordings && <RecordingsIndexView streams={streams} />}
      </PageLayout>
    </>
  )
}
