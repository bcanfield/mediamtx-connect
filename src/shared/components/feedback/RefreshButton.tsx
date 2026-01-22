'use client'

import { RefreshCw } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'

export default function RefreshButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.location.reload()}
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Retry
    </Button>
  )
}
