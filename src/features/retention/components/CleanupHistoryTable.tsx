'use client'

import type { CleanupHistory } from '@prisma/client'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface CleanupHistoryTableProps {
  history: CleanupHistory[]
}

function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

function formatDuration(ms: number | null): string {
  if (!ms)
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
    case 'partial':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

function getTriggerLabel(triggerType: string): string {
  switch (triggerType) {
    case 'scheduled':
      return 'Scheduled'
    case 'storage_threshold':
      return 'Storage Threshold'
    case 'manual':
      return 'Manual'
    default:
      return triggerType
  }
}

function getTriggerBadgeClass(triggerType: string): string {
  switch (triggerType) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'storage_threshold':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'manual':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export function CleanupHistoryTable({ history }: CleanupHistoryTableProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No cleanup history available yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2">Time</th>
            <th className="text-left py-2 px-2">Trigger</th>
            <th className="text-left py-2 px-2">Status</th>
            <th className="text-right py-2 px-2">Files Deleted</th>
            <th className="text-right py-2 px-2">Space Freed</th>
            <th className="text-right py-2 px-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {history.map(item => (
            <tr key={item.id} className="border-b hover:bg-muted/50">
              <td className="py-2 px-2">
                <span title={dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}>
                  {dayjs(item.timestamp).fromNow()}
                </span>
              </td>
              <td className="py-2 px-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getTriggerBadgeClass(item.triggerType)}`}
                >
                  {getTriggerLabel(item.triggerType)}
                </span>
              </td>
              <td className="py-2 px-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(item.status)}`}
                >
                  {item.status}
                </span>
              </td>
              <td className="py-2 px-2 text-right">
                {item.filesDeleted}
              </td>
              <td className="py-2 px-2 text-right">
                {formatBytes(item.bytesFreed)}
              </td>
              <td className="py-2 px-2 text-right">
                {formatDuration(item.duration)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
