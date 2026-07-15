import { useTranslations } from 'use-intl'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export function RecordingsIndexEmpty() {
  const t = useTranslations('Recordings.empty')
  return (
    <div className="mx-auto my-14 flex w-full max-w-md flex-col items-center gap-4 rounded-[10px] border border-dashed border-[#d9d9d9] px-8 py-12 text-center dark:border-[#2a2a2a]">
      <div className="space-y-1.5">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
          {t('noRecordingsTitle')}
        </h2>
        <p className="text-[12px] text-muted-foreground">{t('noRecordingsLead')}</p>
      </div>
      <Link href="/config/mediamtx/global">
        <Button size="sm">{t('enableRecording')}</Button>
      </Link>
    </div>
  )
}
