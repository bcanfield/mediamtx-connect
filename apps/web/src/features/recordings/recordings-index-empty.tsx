import { useTranslations } from 'use-intl'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export function RecordingsIndexEmpty() {
  const t = useTranslations('Recordings.empty')
  return (
    <div className="mx-auto my-14 flex w-full max-w-md flex-col items-center gap-4 rounded-panel border border-dashed border-border-hover px-8 py-12 text-center">
      <div className="space-y-1.5">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
          {t('noRecordingsTitle')}
        </h2>
        <p className="text-[12px] text-muted-foreground">{t('noRecordingsLead')}</p>
      </div>
      <Button asChild size="sm">
        <Link href="/config/mediamtx/global">{t('enableRecording')}</Link>
      </Button>
    </div>
  )
}
