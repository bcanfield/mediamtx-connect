import { useQueries } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useTranslations } from 'use-intl'

import { PageLayout } from '@/components/page-layout'
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
        <div className="mx-auto my-14 flex w-full max-w-md flex-col items-center gap-4 rounded-[10px] border border-[#f3d1d1] bg-gradient-to-b from-live/[0.04] to-transparent px-8 py-12 text-center dark:border-[#2e1414]">
          <span className="flex size-10 items-center justify-center rounded-full border border-live/35 text-live-foreground">
            <X aria-hidden className="size-4" />
          </span>
          <div className="space-y-1.5">
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
              {t('errors.directoryTitle')}
            </h2>
            <p className="text-[12px] text-muted-foreground">
              {t('errors.directoryLead')}
              {' '}
              <code className="font-mono text-foreground">
                {configQuery.data?.recordingsDirectory}
              </code>
            </p>
          </div>
          <Link href="/config">
            <Button size="sm">{t('errors.openAppConfig')}</Button>
          </Link>
        </div>
      )}

      {streamsQuery.isSuccess && !hasRecordings && <RecordingsIndexEmpty />}

      {streamsQuery.isSuccess && hasRecordings && <RecordingsIndexView streams={streams} />}
    </PageLayout>
  )
}
