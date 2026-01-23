'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { useToast } from '@/shared/components/ui/use-toast'
import { runCleanup } from '../actions/runCleanup'

function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

export function ManualCleanupButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleCleanup = async () => {
    setIsLoading(true)

    try {
      const result = await runCleanup()

      if (result.success) {
        toast({
          title: 'Cleanup Completed',
          description: result.filesDeleted > 0
            ? `Deleted ${result.filesDeleted} file(s), freed ${formatBytes(result.bytesFreed)}`
            : 'No recordings needed to be deleted.',
        })
        router.refresh()
      }
      else {
        toast({
          variant: 'destructive',
          title: 'Cleanup Failed',
          description: result.errorMessage || 'An unknown error occurred.',
        })
      }
    }
    catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cleanup Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      })
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCleanup}
      disabled={isLoading}
      variant="secondary"
    >
      {isLoading ? 'Running Cleanup...' : 'Run Manual Cleanup'}
    </Button>
  )
}
