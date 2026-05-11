import { FolderOpen } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { EmptyState } from '@/components/empty-state'

export async function RecordingsIndexEmpty() {
  const t = await getTranslations('Recordings.empty')
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
