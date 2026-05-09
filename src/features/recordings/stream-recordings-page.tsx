import type { StreamRecording } from './recordings.types'
import path from 'node:path'

import dayjs from 'dayjs'
import { FolderX } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { getAppConfig } from '@/features/client-config/client-config.queries'
import { getFilesInDirectory } from '@/features/recordings/file-operations'

import { RecordingCard } from './recording-card'
import { getStreamRecordings } from './recordings.queries'

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

  const crumbs = [
    { label: 'Recordings', href: '/recordings' },
    { label: streamName },
  ]

  const page = Number(pageParam) || 1
  const take = Number(takeParam) || 10

  const p = path.join(config.recordingsDirectory, streamName)

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

  const totalPages = Math.max(1, Math.ceil(filesInDirectory.length / take))
  const groups = groupByDay(streamRecordings)

  return (
    <>
      <PageHeader crumbs={crumbs} />
      <PageLayout
        header="Recordings"
        subHeader={`Recordings for: ${streamName}`}
      >
        {error
          ? (
              <EmptyState
                icon={FolderX}
                title="Could not read recordings"
                description="Could not read recordings directory. Please make sure the directory exists."
              />
            )
          : (
              <>
                {groups.map(group => (
                  <section key={group.key} className="flex flex-col gap-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {group.label}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {group.recordings.map(rec => (
                        <RecordingCard
                          key={rec.name}
                          streamName={streamName}
                          fileName={rec.name}
                          thumbnail={rec.base64}
                          createdAt={rec.createdAt}
                          fileSize={rec.fileSize}
                        />
                      ))}
                    </div>
                  </section>
                ))}

                {totalPages > 1 && (
                  <PaginationBar
                    currentPage={page}
                    totalPages={totalPages}
                    take={take}
                  />
                )}
              </>
            )}
      </PageLayout>
    </>
  )
}

function groupByDay(recordings: StreamRecording[]) {
  const today = dayjs().startOf('day')
  const yesterday = today.subtract(1, 'day')
  const buckets = new Map<string, { key: string, label: string, recordings: StreamRecording[] }>()

  for (const rec of recordings) {
    const day = dayjs(rec.createdAt).startOf('day')
    const key = day.format('YYYY-MM-DD')
    const label = day.isSame(today)
      ? 'Today'
      : day.isSame(yesterday)
        ? 'Yesterday'
        : day.format('ddd, MMM D, YYYY')

    if (!buckets.has(key))
      buckets.set(key, { key, label, recordings: [] })
    buckets.get(key)!.recordings.push(rec)
  }

  return Array.from(buckets.values())
}

function PaginationBar({
  currentPage,
  totalPages,
  take,
}: {
  currentPage: number
  totalPages: number
  take: number
}) {
  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (p !== 1)
      params.set('page', String(p))
    if (take !== 10)
      params.set('take', String(take))
    const qs = params.toString()
    return qs ? `?${qs}` : '?'
  }

  const pages = pageNumbers(currentPage, totalPages)

  return (
    <Pagination className="pt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? buildHref(currentPage - 1) : '#'}
            aria-disabled={currentPage <= 1}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        {pages.map(p => (
          <PaginationItem key={p}>
            <PaginationLink
              href={buildHref(p)}
              isActive={p === currentPage}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={currentPage < totalPages ? buildHref(currentPage + 1) : '#'}
            aria-disabled={currentPage >= totalPages}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function pageNumbers(current: number, total: number): number[] {
  const window = 2
  const start = Math.max(1, current - window)
  const end = Math.min(total, current + window)
  const pages: number[] = []
  for (let p = start; p <= end; p++)
    pages.push(p)
  return pages
}
