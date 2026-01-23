import type { StreamInfo } from '../types'

import { CheckCircle, XCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

import { cn } from '@/shared/utils'
import { formatBytes } from '../types'

interface StreamsTableProps {
  streams: StreamInfo[]
}

export function StreamsTable({ streams }: StreamsTableProps) {
  if (streams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No active streams
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Active Streams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium">Name</th>
                <th className="text-left py-3 px-2 font-medium">Status</th>
                <th className="text-left py-3 px-2 font-medium">Source</th>
                <th className="text-right py-3 px-2 font-medium">Readers</th>
                <th className="text-right py-3 px-2 font-medium">Received</th>
                <th className="text-right py-3 px-2 font-medium">Sent</th>
              </tr>
            </thead>
            <tbody>
              {streams.map(stream => (
                <tr key={stream.name} className="border-b last:border-0">
                  <td className="py-3 px-2 font-medium">{stream.name}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1.5">
                      {stream.ready
                        ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-600 dark:text-green-400">Ready</span>
                            </>
                          )
                        : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-600 dark:text-red-400">Not Ready</span>
                            </>
                          )}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    {stream.source
                      ? (
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            'bg-muted text-muted-foreground',
                          )}
                          >
                            {stream.source.type}
                          </span>
                        )
                      : (
                          <span className="text-muted-foreground">-</span>
                        )}
                  </td>
                  <td className="py-3 px-2 text-right">{stream.readers}</td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {formatBytes(stream.bytesReceived)}
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {formatBytes(stream.bytesSent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
