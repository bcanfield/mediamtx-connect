import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslations } from 'use-intl'

import { PageLayout } from '@/components/page-layout'
import { orpc } from '@/orpc'

import { MediaMTXConfigForm } from './mediamtx-config-form'
import { globalScope } from './sections'

export function MediaMTXConfigPage({ section }: { section?: string }) {
  const t = useTranslations('Config')
  const tForms = useTranslations('Forms.errors')
  const scope = useMemo(
    () => globalScope({ required: tForms('required'), mustBePositive: tForms('mustBePositive') }),
    [tForms],
  )
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
                scope={scope}
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
