import { useTranslations } from 'use-intl'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export function RecordingsIndexEmpty() {
  const t = useTranslations('Recordings.empty')
  return (
    <div className="mx-auto my-14 flex w-full max-w-md flex-col items-center gap-4 rounded-panel border border-dashed border-border-hover px-8 py-12 text-center">
      <div className="space-y-1.5">
        <h2 className="text-section font-semibold tracking-title">
          {t('noRecordingsTitle')}
        </h2>
        <p className="text-lead text-muted-foreground">{t('noRecordingsLead')}</p>
      </div>
      <Button asChild size="sm">
        <Link href="/config/mediamtx/path-defaults">{t('enableRecording')}</Link>
      </Button>
    </div>
  )
}
