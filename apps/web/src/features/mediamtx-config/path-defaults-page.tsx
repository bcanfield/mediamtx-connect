import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'use-intl'

import { PageLayout } from '@/components/page-layout'
import { orpc } from '@/orpc'

import { MediaMTXConfigForm } from './mediamtx-config-form'
import { PATH_DEFAULTS_SCOPE } from './sections'

export function PathDefaultsPage() {
  const t = useTranslations('Config')
  const pathDefaults = useQuery(orpc.config.mediamtx.getPathDefaults.queryOptions())
  const updatePathDefaults = useMutation(orpc.config.mediamtx.updatePathDefaults.mutationOptions())

  return (
    <PageLayout
      width="wide"
      header={t('pathDefaults.pageHeader')}
      subHeader={t('pathDefaults.pageSubHeader')}
    >
      {pathDefaults.isSuccess && (
        pathDefaults.data
          ? (
              <MediaMTXConfigForm
                scope={PATH_DEFAULTS_SCOPE}
                conf={pathDefaults.data}
                onSave={values => updatePathDefaults.mutateAsync(values)}
              />
            )
          : <div className="text-[13px] text-muted-foreground">{t('invalidConfig')}</div>
      )}
    </PageLayout>
  )
}
