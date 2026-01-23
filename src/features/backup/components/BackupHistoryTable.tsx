'use client'

import type { BackupHistory } from '@prisma/client'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

dayjs.extend(relativeTime)

interface BackupHistoryTableProps {
  history: BackupHistory[]
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

function formatDuration(ms: number | null): string {
  if (ms === null)
    return '-'
  if (ms < 1000)
    return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export function BackupHistoryTable({ history }: BackupHistoryTableProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No backups have been performed yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Time</th>
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-left py-2 px-2">Status</th>
                <th className="text-left py-2 px-2">Size</th>
                <th className="text-left py-2 px-2">Duration</th>
                <th className="text-left py-2 px-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {history.map(backup => (
                <tr key={backup.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-2">
                    <span title={dayjs(backup.timestamp).format('YYYY-MM-DD HH:mm:ss')}>
                      {dayjs(backup.timestamp).fromNow()}
                    </span>
                  </td>
                  <td className="py-2 px-2 capitalize">{backup.type}</td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(backup.status)}`}
                    >
                      {backup.status}
                    </span>
                  </td>
                  <td className="py-2 px-2">{formatBytes(backup.sizeBytes)}</td>
                  <td className="py-2 px-2">{formatDuration(backup.duration)}</td>
                  <td className="py-2 px-2 max-w-xs truncate">
                    {backup.errorMessage || backup.localPath || '-'}
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
