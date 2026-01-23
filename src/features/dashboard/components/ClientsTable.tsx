import type { ClientConnection } from '../types'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

import { cn } from '@/shared/utils'
import { formatBytes } from '../types'

interface ClientsTableProps {
  clients: ClientConnection[]
}

const protocolColors: Record<string, string> = {
  RTSP: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  RTMP: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  WebRTC: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  HLS: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  SRT: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
}

const stateColors: Record<string, string> = {
  idle: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  read: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  publish: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

function formatDuration(created: string): string {
  if (!created)
    return '-'
  const start = new Date(created)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - start.getTime()) / 1000)

  if (seconds < 60)
    return `${seconds}s`
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400)
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`
}

export function ClientsTable({ clients }: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connected Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No connected clients
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Connected Clients (
          {clients.length}
          )
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium">Protocol</th>
                <th className="text-left py-3 px-2 font-medium">Remote Address</th>
                <th className="text-left py-3 px-2 font-medium">Path</th>
                <th className="text-left py-3 px-2 font-medium">State</th>
                <th className="text-right py-3 px-2 font-medium">Duration</th>
                <th className="text-right py-3 px-2 font-medium">Received</th>
                <th className="text-right py-3 px-2 font-medium">Sent</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id || `${client.protocol}-${client.remoteAddr}-${client.path}`} className="border-b last:border-0">
                  <td className="py-3 px-2">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      protocolColors[client.protocol] || 'bg-gray-100 text-gray-800',
                    )}
                    >
                      {client.protocol}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-mono text-xs">
                    {client.remoteAddr || '-'}
                  </td>
                  <td className="py-3 px-2 font-medium">{client.path || '-'}</td>
                  <td className="py-3 px-2">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      stateColors[client.state] || 'bg-gray-100 text-gray-800',
                    )}
                    >
                      {client.state}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {formatDuration(client.created)}
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {formatBytes(client.bytesReceived)}
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {formatBytes(client.bytesSent)}
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
