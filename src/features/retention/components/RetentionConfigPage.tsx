import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'

import { getCleanupHistory } from '../actions/getCleanupHistory'
import { getRecordingStats } from '../actions/getRecordingStats'
import { getRetentionConfig } from '../actions/getRetentionConfig'
import { CleanupHistoryTable } from './CleanupHistoryTable'
import { ManualCleanupButton } from './ManualCleanupButton'
import { RetentionConfigForm } from './RetentionConfigForm'

function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

export async function RetentionConfigPage() {
  const [retentionConfig, cleanupHistory, recordingStats] = await Promise.all([
    getRetentionConfig(),
    getCleanupHistory(20),
    getRecordingStats(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Recording Retention</h3>
        <p className="text-sm text-muted-foreground">
          Configure automatic cleanup policies to manage recording storage.
        </p>
      </div>

      <Separator />

      {recordingStats && (
        <Card>
          <CardHeader>
            <CardTitle>Recording Statistics</CardTitle>
            <CardDescription>
              Current storage usage and recording information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Recordings</p>
                <p className="text-2xl font-bold">{recordingStats.totalRecordings}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold">{formatBytes(recordingStats.totalSizeBytes)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Oldest Recording</p>
                <p className="text-lg font-medium">
                  {recordingStats.oldestRecording
                    ? new Date(recordingStats.oldestRecording).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Newest Recording</p>
                <p className="text-lg font-medium">
                  {recordingStats.newestRecording
                    ? new Date(recordingStats.newestRecording).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            {Object.keys(recordingStats.recordingsByStream).length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">By Stream</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(recordingStats.recordingsByStream).map(([stream, stats]) => (
                    <div key={stream} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium truncate">{stream}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {stats.count}
                        {' '}
                        files (
                        {formatBytes(stats.sizeBytes)}
                        )
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Retention Configuration</CardTitle>
          <CardDescription>
            Set up automatic cleanup policies based on recording age and storage thresholds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RetentionConfigForm retentionConfig={retentionConfig} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cleanup History</CardTitle>
            <CardDescription>
              Recent cleanup operations and their results.
            </CardDescription>
          </div>
          <ManualCleanupButton />
        </CardHeader>
        <CardContent>
          <CleanupHistoryTable history={cleanupHistory} />
        </CardContent>
      </Card>
    </div>
  )
}
