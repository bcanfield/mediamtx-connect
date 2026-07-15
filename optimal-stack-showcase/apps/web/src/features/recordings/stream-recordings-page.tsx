import type { Recording } from '@connect/contract'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { FolderX } from 'lucide-react'

import { useFormatter, useTranslations } from 'use-intl'
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

import { orpc } from '@/orpc'

import { RecordingCard } from './recording-card'

interface StreamRecordingsPageProps {
  streamName: string
  page?: number
  take?: number
}

export function StreamRecordingsPage({
  streamName,
  page: pageParam,
  take: takeParam,
}: StreamRecordingsPageProps) {
  const t = useTranslations('Recordings')
  const format = useFormatter()

  const crumbs = [
    { label: t('crumbRecordings'), href: '/recordings' },
    { label: streamName },
  ]

  const page = Number(pageParam) || 1
  const take = Number(takeParam) || 10

  const recordingsQuery = useQuery(
    orpc.recordings.listForStream.queryOptions({ input: { streamName, page, take } }),
  )

  const streamRecordings = recordingsQuery.data?.recordings ?? []
  const totalCount = recordingsQuery.data?.totalCount ?? 0
  const error = recordingsQuery.isError

  const totalPages = Math.max(1, Math.ceil(totalCount / take))
  const groups = groupByDay(streamRecordings, {
    today: t('groups.today'),
    yesterday: t('groups.yesterday'),
    formatDay: (d: Date) => format.dateTime(d, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
  })

  return (
    <>
      <PageHeader crumbs={crumbs} />
      <PageLayout
        header={t('header')}
        subHeader={t('subHeaderForStream', { streamName })}
      >
        {error
          ? (
              <EmptyState
                icon={FolderX}
                title={t('errors.readErrorTitle')}
                description={t('errors.readErrorDescription')}
              />
            )
          : (
              <>
                {groups.map(group => (
                  <section key={group.key} className="flex flex-col gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {group.label}
                    </h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {group.recordings.map(rec => (
                        <RecordingCard
                          key={rec.name}
                          streamName={streamName}
                          fileName={rec.name}
                          screenshotUrl={rec.screenshotUrl}
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

function groupByDay(
  recordings: Recording[],
  labels: { today: string, yesterday: string, formatDay: (d: Date) => string },
) {
  const today = dayjs().startOf('day')
  const yesterday = today.subtract(1, 'day')
  const buckets = new Map<string, { key: string, label: string, recordings: Recording[] }>()

  for (const rec of recordings) {
    const day = dayjs(rec.createdAt).startOf('day')
    const key = day.format('YYYY-MM-DD')
    const label = day.isSame(today)
      ? labels.today
      : day.isSame(yesterday)
        ? labels.yesterday
        : labels.formatDay(day.toDate())

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
  const navigate = useNavigate()

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (p !== 1)
      params.set('page', String(p))
    if (take !== 10)
      params.set('take', String(take))
    const qs = params.toString()
    return qs ? `?${qs}` : '?'
  }

  const goTo = (p: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (p < 1 || p > totalPages)
      return
    navigate({
      to: '.',
      search: prev => ({
        ...prev,
        page: p === 1 ? undefined : p,
        take: take === 10 ? undefined : take,
      }),
    })
  }

  const pages = pageNumbers(currentPage, totalPages)

  return (
    <Pagination className="pt-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? buildHref(currentPage - 1) : '#'}
            onClick={goTo(currentPage - 1)}
            aria-disabled={currentPage <= 1}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        {pages.map(p => (
          <PaginationItem key={p}>
            <PaginationLink
              href={buildHref(p)}
              onClick={goTo(p)}
              isActive={p === currentPage}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={currentPage < totalPages ? buildHref(currentPage + 1) : '#'}
            onClick={goTo(currentPage + 1)}
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
