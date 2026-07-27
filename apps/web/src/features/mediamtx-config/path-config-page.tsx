import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleDashed } from 'lucide-react'
import { useTranslations } from 'use-intl'

import { PageLayout } from '@/components/page-layout'
import { StatusPanel } from '@/components/status-panel'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { orpc } from '@/orpc'

import { MediaMTXConfigForm } from './mediamtx-config-form'
import { PATH_CONFIG_SCOPE } from './sections'

export function PathConfigPage({ name, section }: { name: string, section?: string }) {
  const t = useTranslations('Config')
  const queryClient = useQueryClient()
  const options = orpc.config.mediamtx.getPathConfig.queryOptions({ input: { name } })
  const pathConfig = useQuery(options)
  const updatePathConfig = useMutation(orpc.config.mediamtx.updatePathConfig.mutationOptions())

  const state = pathConfig.data
  const effective = state?.status === 'resolved' ? state : null
  // Values come from a wildcard entry until this path has one of its own.
  const inheritedFrom = effective && effective.confName !== name ? effective.confName : null

  return (
    <PageLayout
      width="wide"
      header={t('pathConfig.pageHeader', { name })}
      subHeader={
        inheritedFrom
          ? t('pathConfig.inheritedSubHeader', { confName: inheritedFrom })
          : t('pathConfig.pageSubHeader')
      }
    >
      {effective && (
        <MediaMTXConfigForm
          scope={PATH_CONFIG_SCOPE}
          conf={effective.conf}
          initialSection={section}
          onSave={async (_values, changed) => {
            await updatePathConfig.mutateAsync({ name, conf: changed })
            // The first save materializes an entry, so confName and the
            // subheader that reports it are stale until this settles.
            await queryClient.invalidateQueries({ queryKey: options.queryKey })
          }}
        />
      )}
      {state?.status === 'not-publishing' && <NotPublishingPanel />}
      {pathConfig.isSuccess && !state && (
        <div className="text-[13px] text-muted-foreground">{t('invalidConfig')}</div>
      )}
    </PageLayout>
  )
}

// Nothing to edit: MediaMTX names the wildcard entry a path inherits from only
// through its runtime path, so a stopped wildcard-backed path resolves to
// nothing. Path defaults is where its settings actually live meanwhile.
function NotPublishingPanel() {
  const t = useTranslations('Config.pathConfig.notPublishing')

  return (
    <StatusPanel
      tone="warning"
      icon={<CircleDashed aria-hidden className="size-4" />}
      title={t('title')}
      description={t('lead')}
      action={(
        <Button asChild size="sm" variant="outline">
          <Link href="/config/mediamtx/path-defaults">{t('openPathDefaults')}</Link>
        </Button>
      )}
    />
  )
}
