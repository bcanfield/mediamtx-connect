import { FolderOpen } from 'lucide-react'
import { useTranslations } from 'use-intl'

import { EmptyState } from '@/components/empty-state'

export function RecordingsIndexEmpty() {
  const t = useTranslations('Recordings.empty')
  return (
    <EmptyState
      icon={FolderOpen}
      title={t('noRecordingsTitle')}
      description={(
        <>
          <p>{t('noRecordingsLead')}</p>
          <p className="mt-2">
            {t.rich('noRecordingsHint', {
              code: chunks => <code className="rounded bg-muted px-1">{chunks}</code>,
            })}
          </p>
        </>
      )}
    />
  )
}
