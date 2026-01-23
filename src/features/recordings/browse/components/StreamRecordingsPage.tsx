import type { Url } from 'next/dist/shared/lib/router/router'

import type { GetRecordingsResult, RecordingFilters } from '../types'
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'

import Link from 'next/link'
import { getAppConfig } from '@/features/config/client'
import { GridLayout, PageLayout } from '@/shared/components/layout'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'

import { getStreamRecordings } from '../actions/getStreamRecordings'
import { RecordingCard } from './RecordingCard'
import { RecordingFilters as RecordingFiltersComponent } from './RecordingFilters'

export const dynamic = 'force-dynamic'

interface StreamRecordingsPageProps {
  streamName: string
  page?: number
  take?: number
  filters?: RecordingFilters
}

export async function StreamRecordingsPage({
  streamName,
  page: pageParam,
  take: takeParam,
  filters = {},
}: StreamRecordingsPageProps) {
  const config = await getAppConfig()
  if (!config) {
    return <div>Invalid Config</div>
  }

  const page = pageParam || 1
  const take = takeParam || 10

  const startIndex = (page - 1) * +take
  const endIndex = startIndex + +take

  let result: GetRecordingsResult = { recordings: [], totalCount: 0, filteredCount: 0 }
  let error = false
  try {
    result = await getStreamRecordings({
      recordingsDirectory: config.recordingsDirectory,
      screenshotsDirectory: config.screenshotsDirectory,
      streamName,
      page,
      take,
      filters,
    })
  }
  catch {
    error = true
  }

  const { recordings: streamRecordings, totalCount, filteredCount } = result

  // Build query string for pagination links (preserve filters)
  const buildPaginationQuery = (newPage: number) => {
    const params = new URLSearchParams()
    params.set('page', String(newPage))
    if (filters.search)
      params.set('search', filters.search)
    if (filters.dateFrom)
      params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo)
      params.set('dateTo', filters.dateTo)
    if (filters.fileSizeMin !== undefined)
      params.set('fileSizeMin', String(filters.fileSizeMin))
    if (filters.fileSizeMax !== undefined)
      params.set('fileSizeMax', String(filters.fileSizeMax))
    return `?${params.toString()}`
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
            <>
              <RecordingFiltersComponent
                totalCount={totalCount}
                filteredCount={filteredCount}
              />
              <div className="flex justify-end text-xs mb-4">
                <div className="flex gap-2 items-center">
                  <LinkWrapper
                    href={buildPaginationQuery(+page > 0 ? +page - 1 : 0)}
                    disabled={+page === 1}
                  >
                    <ChevronLeft className="w-4 h-4"></ChevronLeft>
                  </LinkWrapper>
                  {`Showing ${Math.min(startIndex + 1, filteredCount)} - ${Math.min(
                    endIndex,
                    filteredCount,
                  )} of ${filteredCount}`}
                  <LinkWrapper
                    href={buildPaginationQuery(+page + 1)}
                    disabled={endIndex >= filteredCount}
                  >
                    <ChevronRight className="w-4 h-4"></ChevronRight>
                  </LinkWrapper>
                </div>
              </div>
            </>
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
  href: Url | string
  children: React.ReactNode
  disabled?: boolean
}) {
  if (disabled) {
    return <div className="text-secondary">{children}</div>
  }
  return <Link href={href}>{children}</Link>
}
