import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'use-intl'

import { PageLayout } from '@/components/page-layout'
import { orpc } from '@/orpc'

import { MediaMTXConfigForm } from './mediamtx-config-form'
import { PATH_CONFIG_SCOPE } from './sections'

export function PathConfigPage({ name }: { name: string }) {
  const t = useTranslations('Config')
  const queryClient = useQueryClient()
  const options = orpc.config.mediamtx.getPathConfig.queryOptions({ input: { name } })
  const pathConfig = useQuery(options)
  const updatePathConfig = useMutation(orpc.config.mediamtx.updatePathConfig.mutationOptions())

  const effective = pathConfig.data
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
      {pathConfig.isSuccess && (
        effective
          ? (
              <MediaMTXConfigForm
                scope={PATH_CONFIG_SCOPE}
                conf={effective.conf}
                onSave={async (_values, changed) => {
                  await updatePathConfig.mutateAsync({ name, conf: changed })
                  // The first save materializes an entry, so confName and the
                  // subheader that reports it are stale until this settles.
                  await queryClient.invalidateQueries({ queryKey: options.queryKey })
                }}
              />
            )
          : <div className="text-[13px] text-muted-foreground">{t('invalidConfig')}</div>
      )}
    </PageLayout>
  )
}
