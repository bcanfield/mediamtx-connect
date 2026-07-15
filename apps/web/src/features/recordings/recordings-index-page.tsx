import { useQueries } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useTranslations } from 'use-intl'

import { PageLayout } from '@/components/page-layout'
import { StatusPanel } from '@/components/status-panel'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { orpc } from '@/orpc'

import { RecordingsIndexEmpty } from './recordings-index-empty'
import { RecordingsIndexView } from './recordings-index-view'

export function RecordingsIndexPage() {
  const t = useTranslations('Recordings')
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
    <PageLayout>
      {error && (
        <StatusPanel
          tone="error"
          icon={<X aria-hidden className="size-4" />}
          title={t('errors.directoryTitle')}
          description={(
            <>
              {t('errors.directoryLead')}
              {' '}
              <code className="font-mono text-foreground">
                {configQuery.data?.recordingsDirectory}
              </code>
            </>
          )}
          action={(
            <Button asChild size="sm">
              <Link href="/config">{t('errors.openAppConfig')}</Link>
            </Button>
          )}
        />
      )}

      {streamsQuery.isSuccess && !hasRecordings && <RecordingsIndexEmpty />}

      {streamsQuery.isSuccess && hasRecordings && <RecordingsIndexView streams={streams} />}
    </PageLayout>
  )
}
