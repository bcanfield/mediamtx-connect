import type { Recording } from '@connect/contract'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

import { useFormatter, useTranslations } from 'use-intl'
import { PageLayout } from '@/components/page-layout'
import { StatusPanel } from '@/components/status-panel'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { orpc } from '@/orpc'

import { RecordingRow } from './recording-row'

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
    today: (d: Date) => t('groups.todayEyebrow', { date: formatEyebrowDate(d) }),
    yesterday: (d: Date) => t('groups.yesterdayEyebrow', { date: formatEyebrowDate(d) }),
    other: (d: Date) => formatEyebrowDate(d, true),
  })

  function formatEyebrowDate(d: Date, withWeekday = false): string {
    return format.dateTime(d, {
      month: 'long',
      day: 'numeric',
      ...(withWeekday ? { weekday: 'short', year: 'numeric' } : {}),
    })
  }

  return (
    <PageLayout width="reading">
      <Breadcrumb>
        <BreadcrumbList className="text-[12px]">
          <BreadcrumbItem>
            <BreadcrumbLink href="/recordings">{t('crumbRecordings')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono">{streamName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-[-0.02em]">{streamName}</h1>
        {recordingsQuery.isSuccess && (
          <p className="text-[13px] text-muted-foreground">
            {t('detail.totals', { count: totalCount })}
          </p>
        )}
      </header>

      {error
        ? (
            <StatusPanel
              tone="error"
              className="my-10"
              icon={<X aria-hidden className="size-4" />}
              title={t('errors.readErrorTitle')}
              description={t('errors.readErrorDescription')}
            />
          )
        : (
            <>
              {groups.map(group => (
                <section key={group.key} className="flex flex-col gap-2.5">
                  <h2 className="border-b border-border-subtle pb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-faint">
                    {group.label}
                  </h2>
                  <div className="flex flex-col gap-2.5">
                    {group.recordings.map(rec => (
                      <RecordingRow
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
                  totalCount={totalCount}
                  take={take}
                />
              )}
            </>
          )}
    </PageLayout>
  )
}

function groupByDay(
  recordings: Recording[],
  labels: {
    today: (d: Date) => string
    yesterday: (d: Date) => string
    other: (d: Date) => string
  },
) {
  const today = dayjs().startOf('day')
  const yesterday = today.subtract(1, 'day')
  const buckets = new Map<string, { key: string, label: string, recordings: Recording[] }>()

  for (const rec of recordings) {
    const day = dayjs(rec.createdAt).startOf('day')
    const key = day.format('YYYY-MM-DD')
    const label = day.isSame(today)
      ? labels.today(day.toDate())
      : day.isSame(yesterday)
        ? labels.yesterday(day.toDate())
        : labels.other(day.toDate())

    if (!buckets.has(key))
      buckets.set(key, { key, label, recordings: [] })
    buckets.get(key)!.recordings.push(rec)
  }

  return Array.from(buckets.values())
}

function PaginationBar({
  currentPage,
  totalPages,
  totalCount,
  take,
}: {
  currentPage: number
  totalPages: number
  totalCount: number
  take: number
}) {
  const t = useTranslations('Recordings.pagination')
  const navigate = useNavigate()

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages || p === currentPage)
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

  const from = (currentPage - 1) * take + 1
  const to = Math.min(currentPage * take, totalCount)

  return (
    <nav
      aria-label={t('aria')}
      className="flex flex-wrap items-center justify-between gap-3 pt-1"
    >
      <p className="font-mono text-[11px] text-mute">
        {t('showing', { from, to, total: totalCount })}
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={currentPage <= 1}
          aria-label={t('previous')}
          onClick={() => goTo(currentPage - 1)}
        >
          <ChevronLeft className="size-3.5" />
        </Button>

        {pageItems(currentPage, totalPages).map((item, i) =>
          item === 'ellipsis'
            ? (
                // eslint-disable-next-line react/no-array-index-key
                <span key={`e${i}`} aria-hidden className="px-1 text-[12px] text-faint">
                  …
                </span>
              )
            : (
                <button
                  key={item}
                  type="button"
                  aria-current={item === currentPage ? 'page' : undefined}
                  onClick={() => goTo(item)}
                  className={cn(
                    'h-7 min-w-7 rounded-md px-1.5 text-[12.5px] tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20',
                    item === currentPage
                      ? 'bg-accent font-medium text-foreground'
                      : 'text-mute hover:text-foreground',
                  )}
                >
                  {item}
                </button>
              ),
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={currentPage >= totalPages}
          aria-label={t('next')}
          onClick={() => goTo(currentPage + 1)}
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </nav>
  )
}

function pageItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7)
    return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set<number>([1, total, current - 1, current, current + 1])
  const sorted = Array.from(pages)
    .filter(p => p >= 1 && p <= total)
    .sort((a, b) => a - b)

  const items: Array<number | 'ellipsis'> = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1)
      items.push('ellipsis')
    items.push(p)
    prev = p
  }
  return items
}
