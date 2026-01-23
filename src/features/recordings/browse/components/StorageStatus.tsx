import type { StorageStats } from '../actions/getStorageStats'

import { AlertTriangle, HardDrive } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { cn, formatBytes } from '@/shared/utils'

interface StorageStatusProps {
  stats: StorageStats
}

export function StorageStatus({ stats }: StorageStatusProps) {
  const {
    totalSpace,
    usedSpace,
    availableSpace,
    recordingsSize,
    usagePercentage,
    warningLevel,
  } = stats

  const progressColor = warningLevel === 'critical'
    ? 'bg-destructive'
    : warningLevel === 'low'
      ? 'bg-yellow-500'
      : 'bg-primary'

  return (
    <div className="space-y-4">
      {/* Warning Alert */}
      {warningLevel !== 'none' && (
        <Alert
          variant={warningLevel === 'critical' ? 'destructive' : 'default'}
          className={cn(
            warningLevel === 'low' && 'border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600',
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {warningLevel === 'critical' ? 'Critical: Storage Almost Full' : 'Warning: Storage Running Low'}
          </AlertTitle>
          <AlertDescription>
            {warningLevel === 'critical'
              ? `Storage is ${usagePercentage.toFixed(1)}% full. Immediate action required to prevent recording failures. Consider deleting old recordings or expanding storage.`
              : `Storage is ${usagePercentage.toFixed(1)}% full. Consider freeing up space to ensure uninterrupted recording.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Storage Stats Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HardDrive className="h-5 w-5" />
            Storage Status
          </CardTitle>
          <CardDescription>
            Disk usage for recordings directory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Disk Usage</span>
              <span className={cn(
                'font-medium',
                warningLevel === 'critical' && 'text-destructive',
                warningLevel === 'low' && 'text-yellow-600 dark:text-yellow-400',
              )}
              >
                {usagePercentage.toFixed(1)}
                %
              </span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn('h-full transition-all', progressColor)}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Space</p>
              <p className="text-sm font-medium">{formatBytes(totalSpace)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Used Space</p>
              <p className="text-sm font-medium">{formatBytes(usedSpace)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Available</p>
              <p className={cn(
                'text-sm font-medium',
                warningLevel === 'critical' && 'text-destructive',
                warningLevel === 'low' && 'text-yellow-600 dark:text-yellow-400',
              )}
              >
                {formatBytes(availableSpace)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Recordings Size</p>
              <p className="text-sm font-medium">{formatBytes(recordingsSize)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
