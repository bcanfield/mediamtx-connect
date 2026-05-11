'use client'

import { RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

export function RefreshButton() {
  const t = useTranslations('Common')
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.location.reload()}
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      {t('retry')}
    </Button>
  )
}
