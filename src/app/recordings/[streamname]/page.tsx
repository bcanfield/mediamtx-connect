import type { RecordingFilters } from '@/features/recordings/browse/types'
import { StreamRecordingsPage } from '@/features/recordings/browse'

export const dynamic = 'force-dynamic'

interface SearchParamsType {
  take?: number
  page?: number
  search?: string
  dateFrom?: string
  dateTo?: string
  fileSizeMin?: string
  fileSizeMax?: string
}

export default async function Recordings({
  params,
  searchParams,
}: {
  params: Promise<{ streamname: string }>
  searchParams: Promise<SearchParamsType>
}) {
  const { streamname } = await params
  const {
    take,
    page,
    search,
    dateFrom,
    dateTo,
    fileSizeMin,
    fileSizeMax,
  } = await searchParams

  // Build filters object
  const filters: RecordingFilters = {
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    fileSizeMin: fileSizeMin ? Number.parseFloat(fileSizeMin) : undefined,
    fileSizeMax: fileSizeMax ? Number.parseFloat(fileSizeMax) : undefined,
  }

  return (
    <StreamRecordingsPage
      streamName={streamname}
      page={page}
      take={take}
      filters={filters}
    />
  )
}
