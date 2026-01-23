import type { ConnectionStats } from '../types'

import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

import { cn } from '@/shared/utils'
import { formatBytes } from '../types'

interface ConnectionHealthProps {
  stats: ConnectionStats
  isConnected: boolean
  error?: string
}

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

function getHealthStatus(stats: ConnectionStats, isConnected: boolean): HealthStatus {
  if (!isConnected)
    return 'unhealthy'
  if (stats.totalStreams === 0)
    return 'degraded'
  if (stats.activeStreams < stats.totalStreams)
    return 'degraded'
  return 'healthy'
}

const statusConfig: Record<HealthStatus, { icon: typeof CheckCircle, color: string, label: string }> = {
  healthy: { icon: CheckCircle, color: 'text-green-500', label: 'Healthy' },
  degraded: { icon: AlertTriangle, color: 'text-yellow-500', label: 'Degraded' },
  unhealthy: { icon: XCircle, color: 'text-red-500', label: 'Unhealthy' },
}

export function ConnectionHealth({ stats, isConnected, error }: ConnectionHealthProps) {
  const status = getHealthStatus(stats, isConnected)
  const { icon: StatusIcon, color, label } = statusConfig[status]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Connection Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <StatusIcon className={cn('h-8 w-8', color)} />
          <div>
            <p className={cn('text-lg font-semibold', color)}>{label}</p>
            {error
              ? (
                  <p className="text-sm text-muted-foreground">{error}</p>
                )
              : (
                  <p className="text-sm text-muted-foreground">
                    {isConnected
                      ? `${stats.activeStreams} of ${stats.totalStreams} streams active`
                      : 'Unable to connect to MediaMTX'}
                  </p>
                )}
          </div>
        </div>

        {isConnected && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Received</p>
              <p className="text-sm font-medium">{formatBytes(stats.totalBytesReceived)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Sent</p>
              <p className="text-sm font-medium">{formatBytes(stats.totalBytesSent)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
