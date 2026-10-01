import { MEDIAMTX_MIN_VERSION } from '@connect/contract'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useFormatter, useTranslations } from 'use-intl'

import { PageLayout } from '@/components/page-layout'
import { StatusPanel } from '@/components/status-panel'
import { orpc } from '@/orpc'

import { MediaMTXConfigForm } from './mediamtx-config-form'
import { GLOBAL_SCOPE } from './sections'

export function MediaMTXConfigPage({ section }: { section?: string }) {
  const t = useTranslations('Config')
  const format = useFormatter()
  const globalConf = useQuery(orpc.config.mediamtx.getGlobal.queryOptions())
  const info = useQuery({ ...orpc.mediamtx.info.queryOptions(), staleTime: 60_000 })
  const updateGlobalConfig = useMutation(orpc.config.mediamtx.updateGlobal.mutationOptions())

  const version = info.data?.version
  const started = info.data?.started

  return (
    <PageLayout
      width="wide"
      header={t('mediamtxConfig.pageHeader')}
      subHeader={t('mediamtxConfig.pageSubHeader')}
    >
      {version && (
        <p className="mb-4 font-mono text-meta text-muted-foreground">
          {started
            ? t('mediamtxConfig.versionSince', {
                version,
                started: format.dateTime(started, { dateStyle: 'medium', timeStyle: 'short' }),
              })
            : t('mediamtxConfig.version', { version })}
        </p>
      )}
      {/* Non-blocking: the form below still loads and saves what this server serves. */}
      {version && info.data?.belowMinimum && (
        <StatusPanel
          tone="warning"
          layout="banner"
          className="mb-6"
          title={t('mediamtxConfig.tooOldTitle', { version, minimum: `v${MEDIAMTX_MIN_VERSION}` })}
          description={t('mediamtxConfig.tooOldBody')}
        />
      )}
      {globalConf.isSuccess && (
        globalConf.data
          ? (
              <MediaMTXConfigForm
                scope={GLOBAL_SCOPE}
                conf={globalConf.data}
                initialSection={section}
                onSave={values => updateGlobalConfig.mutateAsync(values)}
              />
            )
          : <div className="text-control text-muted-foreground">{t('invalidConfig')}</div>
      )}
    </PageLayout>
  )
}
