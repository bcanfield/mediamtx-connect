import { AlertTriangle, FolderOpen, Settings, Video } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { getAppConfig } from '@/features/config/client'
import { GridLayout, PageLayout } from '@/shared/components/layout'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { countFilesInSubdirectories } from '@/shared/utils/file-operations'
import { getStorageStats } from '../actions/getStorageStats'
import { StorageStatus } from './StorageStatus'

export const dynamic = 'force-dynamic'

export async function RecordingsIndexPage() {
  const t = await getTranslations('recordings')
  const tErrors = await getTranslations('errors')
  const config = await getAppConfig()
  if (!config) {
    return (
      <PageLayout
        header={t('title')}
        subHeader={t('subHeader')}
      >
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('configurationError')}</AlertTitle>
          <AlertDescription>
            {tErrors('loadingFailed')}
          </AlertDescription>
        </Alert>
      </PageLayout>
    )
  }

  let error = false
  let streamRecordingDirectories: Record<string, number> = {}

  try {
    streamRecordingDirectories = countFilesInSubdirectories(
      config.recordingsDirectory,
    )
  }
  catch {
    error = true
  }

  const hasRecordings = Object.keys(streamRecordingDirectories).length > 0

  // Get storage statistics
  const storageStats = await getStorageStats(config.recordingsDirectory)

  return (
    <PageLayout
      header={t('title')}
      subHeader={t('subHeader')}
    >
      {/* Storage Status */}
      {!error && storageStats && (
        <StorageStatus stats={storageStats} />
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('cannotAccessDirectory')}</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              {t('unableToReadDirectory')}
              {' '}
              <code className="bg-muted px-1 rounded">
                {config.recordingsDirectory}
              </code>
            </p>
            <p className="text-sm">
              {t('checkPermissions')}
            </p>
            <Link href="/config" className="mt-2 inline-block">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                {t('checkConfig')}
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {!error && !hasRecordings && (
        <Alert>
          <FolderOpen className="h-4 w-4" />
          <AlertTitle>{t('noRecordingsTitle')}</AlertTitle>
          <AlertDescription>
            <p>
              {t('noRecordingsDescription')}
            </p>
            <p className="text-sm mt-2">
              {t('recordingHint')}
            </p>
          </AlertDescription>
        </Alert>
      )}

      {!error && hasRecordings && (
        <GridLayout columnLayout="xs">
          {Object.entries(streamRecordingDirectories).map(([key, value]) => (
            <Card key={key} className="flex items-center">
              <CardHeader className="flex-auto">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  {key}
                </CardTitle>
                <CardDescription>
                  {value}
                  {' '}
                  {value === 1 ? t('recordingSingular') : t('recordingPlural')}
                </CardDescription>
              </CardHeader>
              <div className="p-4">
                <Link href={`recordings/${key}`}>
                  <Button variant="outline">{t('view')}</Button>
                </Link>
              </div>
            </Card>
          ))}
        </GridLayout>
      )}
    </PageLayout>
  )
}
