import type { PathCatalogEntry, PathCatalogState } from '@connect/contract'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useTranslations } from 'use-intl'

import { PageLayout } from '@/components/page-layout'
import { StatusPanel } from '@/components/status-panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { orpc } from '@/orpc'

export function PathsCatalogPage() {
  const t = useTranslations('Config.pathsCatalog')
  const paths = useQuery(orpc.config.mediamtx.listPaths.queryOptions())
  // Annotated because the union `useQuery` infers doesn't narrow on `status`.
  const state: PathCatalogState | undefined = paths.data

  return (
    <PageLayout width="wide" header={t('pageHeader')} subHeader={t('pageSubHeader')}>
      {state?.status === 'connection-error' && (
        <UnreachablePanel
          mediaMtxUrl={state.mediaMtxUrl}
          mediaMtxApiPort={state.mediaMtxApiPort}
          onRetry={() => paths.refetch()}
        />
      )}
      {state?.status === 'connected' && (
        state.paths.length === 0
          ? <EmptyPanel />
          : (
              <div className="flex flex-col gap-4">
                <p className="text-control text-muted-foreground">
                  {t('summary', { count: state.paths.length })}
                </p>
                <PathsTable paths={state.paths} />
              </div>
            )
      )}
    </PageLayout>
  )
}

function PathsTable({ paths }: { paths: PathCatalogEntry[] }) {
  const t = useTranslations('Config.pathsCatalog')

  return (
    <div className="overflow-x-auto rounded-panel border">
      <table className="w-full text-control">
        <thead>
          <tr className="border-b bg-card text-left text-meta text-muted-foreground">
            <th scope="col" className="px-4 py-2.5 font-medium">{t('columnName')}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{t('columnSource')}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{t('columnState')}</th>
          </tr>
        </thead>
        <tbody>
          {paths.map(path => (
            <tr key={path.name} className="border-b last:border-b-0">
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono">{path.name}</span>
                  {path.isRegex && (
                    <Badge variant="secondary" title={t('regexTitle')}>{t('regexBadge')}</Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-2.5 font-mono text-muted-foreground">
                {path.source ?? t('sourceUnset')}
              </td>
              <td className="px-4 py-2.5">
                {path.active
                  ? (
                      <span className="flex items-center gap-1.5 font-mono text-meta">
                        <span aria-hidden className="size-1.5 rounded-full bg-live" />
                        {t('stateActive')}
                      </span>
                    )
                  : <span className="font-mono text-meta text-mute">{t('stateIdle')}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyPanel() {
  const t = useTranslations('Config.pathsCatalog.empty')

  return (
    <div className="mx-auto my-14 flex w-full max-w-lg flex-col items-center gap-5 rounded-panel border border-dashed border-border-hover px-8 py-12 text-center">
      <div className="space-y-1.5">
        <h2 className="text-section font-semibold tracking-title">{t('title')}</h2>
        <p className="text-lead text-muted-foreground">{t('lead')}</p>
      </div>
      <Button asChild variant="outline">
        <Link href="/config/mediamtx/path-defaults">{t('openPathDefaults')}</Link>
      </Button>
    </div>
  )
}

// A server we couldn't read is not a server with no paths, so this replaces the
// catalog rather than letting an empty list stand in for it.
function UnreachablePanel({
  mediaMtxUrl,
  mediaMtxApiPort,
  onRetry,
}: {
  mediaMtxUrl: string
  mediaMtxApiPort: number
  onRetry: () => void
}) {
  const t = useTranslations('Config.pathsCatalog.errors')
  const common = useTranslations('Common')

  return (
    <StatusPanel
      tone="error"
      icon={<X aria-hidden className="size-4" />}
      title={t('unreachableTitle')}
      description={(
        <>
          {t('unreachableLead')}
          {' '}
          <code className="font-mono text-foreground">
            {mediaMtxUrl}
            :
            {mediaMtxApiPort}
          </code>
        </>
      )}
      action={(
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/config">{t('openAppConfig')}</Link>
          </Button>
          <Button size="sm" variant="outline" onClick={onRetry}>
            {common('retry')}
          </Button>
        </div>
      )}
    />
  )
}
