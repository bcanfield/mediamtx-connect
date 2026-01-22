import type { Url } from 'next/dist/shared/lib/router/router'

import type { StreamRecording } from '../types'
import path from 'node:path'
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'

import Link from 'next/link'
import { getAppConfig } from '@/features/config/client'
import { GridLayout, PageLayout } from '@/shared/components/layout'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'

import { getFilesInDirectory } from '@/shared/utils/file-operations'
import { getStreamRecordings } from '../actions/getStreamRecordings'
import { RecordingCard } from './RecordingCard'

export const dynamic = 'force-dynamic'

interface StreamRecordingsPageProps {
  streamName: string
  page?: number
  take?: number
}

export async function StreamRecordingsPage({
  streamName,
  page: pageParam,
  take: takeParam,
}: StreamRecordingsPageProps) {
  const config = await getAppConfig()
  if (!config) {
    return <div>Invalid Config</div>
  }

  const page = pageParam || 1
  const take = takeParam || 10

  const p = path.join(config.recordingsDirectory, streamName)

  const startIndex = (page - 1) * +take
  const endIndex = startIndex + +take

  let filesInDirectory: string[] = []
  let streamRecordings: StreamRecording[] = []
  let error = false
  try {
    filesInDirectory = getFilesInDirectory(p)
    streamRecordings = await getStreamRecordings({
      recordingsDirectory: config.recordingsDirectory,
      screenshotsDirectory: config.screenshotsDirectory,
      streamName,
      page,
      take,
    })
  }
  catch {
    error = true
  }

  return (
    <PageLayout
      header="Recordings"
      subHeader={`Recordings for: ${streamName}`}
    >
      {error
        ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Uh oh!</AlertTitle>
              <AlertDescription>
                Could not read recordings directory. Please make sure the directory exists
              </AlertDescription>
            </Alert>
          )
        : (
            <div className="flex justify-end text-xs">
              <div className="flex gap-2">
                <LinkWrapper
                  href={{ query: { page: +page > 0 ? +page - 1 : 0 } }}
                  disabled={+page === 1}
                >
                  <ChevronLeft className="w-4 h-4"></ChevronLeft>
                </LinkWrapper>
                {`Showing ${startIndex} - ${Math.min(
                  endIndex,
                  filesInDirectory.length,
                )} of ${filesInDirectory.length}`}
                <LinkWrapper
                  href={{ query: { page: +page + 1 } }}
                  disabled={endIndex >= filesInDirectory.length}
                >
                  <ChevronRight className="w-4 h-4"></ChevronRight>
                </LinkWrapper>
              </div>
            </div>
          )}

      <GridLayout columnLayout="small">
        {streamRecordings.map(({ name, createdAt, base64, fileSize }) => (
          <RecordingCard
            key={name}
            props={{
              thumbnail: base64,
              createdAt,
              fileName: name,
              streamName,
              fileSize,
            }}
          >
          </RecordingCard>
        ))}
      </GridLayout>
    </PageLayout>
  )
}

function LinkWrapper({
  href,
  children,
  disabled = false,
}: {
  href: Url
  children: React.ReactNode
  disabled?: boolean
}) {
  if (disabled) {
    return <div className="text-secondary">{children}</div>
  }
  return <Link href={href}>{children}</Link>
}
