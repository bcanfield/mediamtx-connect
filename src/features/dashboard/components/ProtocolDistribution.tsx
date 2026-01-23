import type { ProtocolStats } from '../types'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Progress } from '@/shared/components/ui/progress'
import { cn } from '@/shared/utils'

interface ProtocolDistributionProps {
  stats: ProtocolStats
}

interface ProtocolItem {
  name: string
  key: keyof ProtocolStats
  color: string
}

const protocols: ProtocolItem[] = [
  { name: 'RTSP', key: 'rtsp', color: 'bg-blue-500' },
  { name: 'RTMP', key: 'rtmp', color: 'bg-green-500' },
  { name: 'WebRTC', key: 'webrtc', color: 'bg-purple-500' },
  { name: 'HLS', key: 'hls', color: 'bg-orange-500' },
  { name: 'SRT', key: 'srt', color: 'bg-pink-500' },
]

export function ProtocolDistribution({ stats }: ProtocolDistributionProps) {
  const total = Object.values(stats).reduce((sum, val) => sum + val, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Clients by Protocol</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {protocols.map(({ name, key, color }) => {
          const value = stats[key]
          const percentage = total > 0 ? (value / total) * 100 : 0

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn('h-3 w-3 rounded-full', color)} />
                  <span className="font-medium">{name}</span>
                </div>
                <span className="text-muted-foreground">
                  {value}
                  {' '}
                  {value === 1 ? 'client' : 'clients'}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          )
        })}
        {total === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No active connections
          </p>
        )}
      </CardContent>
    </Card>
  )
}
