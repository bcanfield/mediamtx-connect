import type { PathConfigResult } from '@connect/contract'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'use-intl'

import { PageLayout } from '@/components/page-layout'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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

  // Annotated because the union `useQuery` infers doesn't narrow on `status`.
  const result: PathConfigResult | null | undefined = pathConfig.data
  const effective = result?.status === 'resolved' ? result : null
  // Values come from a wildcard entry until this path has one of its own.
  const inheritedFrom = effective && effective.confName !== name ? effective.confName : null
  const unresolved = result?.status === 'unresolved'

  return (
    <PageLayout
      width="wide"
      header={t('pathConfig.pageHeader', { name })}
      subHeader={
        // Nothing is shown below, so "Settings for this stream" would be a lie.
        unresolved
          ? null
          : inheritedFrom
            ? t('pathConfig.inheritedSubHeader', { confName: inheritedFrom })
            : t('pathConfig.pageSubHeader')
      }
      actions={
        // Nothing to revert while the path is still tracking a wildcard entry.
        effective && !inheritedFrom
          ? <RevertToInherited name={name} queryKey={options.queryKey} />
          : null
      }
    >
      {effective && (
        <MediaMTXConfigForm
          // Reverting swaps every value for the inherited one, and the
          // form only reads `conf` when it mounts.
          key={effective.confName}
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
      {unresolved && <UnresolvedPathConfig name={name} />}
      {pathConfig.isSuccess && result === null && (
        <div className="text-control text-muted-foreground">{t('invalidConfig')}</div>
      )}
    </PageLayout>
  )
}

// Read-only on purpose. Both routes here — a stream that stopped publishing and
// a name that was never a path — look identical to MediaMTX, so the copy can't
// claim either, and there is no effective config to offer editing of.
function UnresolvedPathConfig({ name }: { name: string }) {
  const t = useTranslations('Config.pathConfig.unresolved')

  return (
    <div className="mx-auto my-14 flex w-full max-w-lg flex-col items-center gap-5 rounded-panel border border-dashed border-border-hover px-8 py-12 text-center">
      <div className="space-y-1.5">
        <h2 className="text-section font-semibold tracking-title">{t('title', { name })}</h2>
        <p className="text-lead text-muted-foreground">{t('lead')}</p>
      </div>
      <Button asChild variant="outline">
        <Link href="/config/mediamtx/path-defaults">{t('openPathDefaults')}</Link>
      </Button>
    </div>
  )
}

// Deleting the path's own entry is the only way back to pure inheritance, and
// it drops every override in one click — hence the confirm.
function RevertToInherited({ name, queryKey }: { name: string, queryKey: readonly unknown[] }) {
  const t = useTranslations('Config.pathConfig.revert')
  const queryClient = useQueryClient()
  const deletePathConfig = useMutation(orpc.config.mediamtx.deletePathConfig.mutationOptions())
  const [open, setOpen] = useState(false)

  const revert = async () => {
    try {
      await deletePathConfig.mutateAsync({ name })
      setOpen(false)
      toast.success(t('toasts.success'))
      // Every value on the page came from the entry that just went away.
      await queryClient.invalidateQueries({ queryKey })
    }
    catch {
      toast.error(t('toasts.errorTitle'), { description: t('toasts.errorDescription') })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">{t('action')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('confirmTitle', { name })}</DialogTitle>
          <DialogDescription>{t('confirmDescription')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">{t('cancel')}</Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={revert}
            disabled={deletePathConfig.isPending}
          >
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
