import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'use-intl'

import { PageLayout } from '@/components/page-layout'
import { orpc } from '@/orpc'

import { MediaMTXConfigForm } from './mediamtx-config-form'
import { GLOBAL_SCOPE } from './sections'

export function MediaMTXConfigPage() {
  const t = useTranslations('Config')
  const globalConf = useQuery(orpc.config.mediamtx.getGlobal.queryOptions())
  const updateGlobalConfig = useMutation(orpc.config.mediamtx.updateGlobal.mutationOptions())

  return (
    <PageLayout
      width="wide"
      header={t('mediamtxConfig.pageHeader')}
      subHeader={t('mediamtxConfig.pageSubHeader')}
    >
      {globalConf.isSuccess && (
        globalConf.data
          ? (
              <MediaMTXConfigForm
                scope={GLOBAL_SCOPE}
                conf={globalConf.data}
                onSave={updateGlobalConfig.mutateAsync}
              />
            )
          : <div className="text-[13px] text-muted-foreground">{t('invalidConfig')}</div>
      )}
    </PageLayout>
  )
}
