import type { PathConfigResult, PathConnections } from '@connect/contract'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
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
  // What the values below are measured against: a key still equal to its
  // default is inherited, one that differs is overridden on the path (ADR
  // 0002). Null while MediaMTX is unreachable, and then nothing is marked.
  const pathDefaults = useQuery(orpc.config.mediamtx.getPathDefaults.queryOptions())
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
        // Nothing to delete while the path is still tracking a wildcard entry.
        effective && !inheritedFrom ? <DeletePath name={name} /> : null
      }
    >
      {effective && (
        <MediaMTXConfigForm
          // Materializing swaps the entry the values come from, and the form
          // only reads `conf` when it mounts.
          key={effective.confName}
          scope={PATH_CONFIG_SCOPE}
          conf={effective.conf}
          initialSection={section}
          inheritedValues={pathDefaults.data ?? undefined}
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

// Deleting the path's own entry drops every override in one click, and MediaMTX
// will happily cut off a publisher doing it — hence the confirm, and hence the
// live read behind it.
function DeletePath({ name }: { name: string }) {
  const t = useTranslations('Config.pathConfig.delete')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deletePathConfig = useMutation(orpc.config.mediamtx.deletePathConfig.mutationOptions())
  const [open, setOpen] = useState(false)
  // Read when the dialog opens rather than with the page: what it names has to
  // be what is connected at the moment the operator is deciding.
  const connections = useQuery({
    ...orpc.config.mediamtx.getPathConnections.queryOptions({ input: { name } }),
    enabled: open,
    staleTime: 0,
  })

  // Annotated because the union `useQuery` infers doesn't narrow on `status`.
  const result: PathConnections | undefined = connections.data
  const read = result?.status === 'read' ? result : null
  const active = read && (read.publisher !== null || read.readers.length > 0)
  // Reopening the dialog serves the last answer while it refetches, and a
  // connection list from a minute ago is exactly what this guard can't show.
  const checking = connections.isPending || connections.isFetching

  const remove = async () => {
    try {
      await deletePathConfig.mutateAsync({ name })
      setOpen(false)
      toast.success(t('toasts.success', { name }))
      // The catalog lists config entries, and one of them just went away.
      await queryClient.invalidateQueries()
      await navigate({ to: '/config/mediamtx/paths' })
    }
    catch {
      toast.error(t('toasts.errorTitle', { name }), { description: t('toasts.errorDescription') })
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
        {checking && (
          <p className="text-meta text-muted-foreground">{t('checking')}</p>
        )}
        {!checking && result?.status === 'unreadable' && (
          <p className="rounded-panel border border-warning/30 bg-warning/[0.06] px-4 py-3 text-control">
            {t('unreadable')}
          </p>
        )}
        {!checking && active && (
          <div className="flex flex-col gap-1.5 rounded-panel border border-warning/30 bg-warning/[0.06] px-4 py-3">
            <p className="text-control font-medium">{t('activeTitle')}</p>
            {read.publisher && (
              <p className="text-meta text-muted-foreground">
                {t('publisher', { type: read.publisher })}
              </p>
            )}
            {read.readers.length > 0 && (
              <p className="text-meta text-muted-foreground">
                {t('readers', { count: read.readers.length, types: read.readers.join(', ') })}
              </p>
            )}
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">{t('cancel')}</Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={remove}
            // Confirming before the read lands would skip the whole guard.
            disabled={deletePathConfig.isPending || checking}
          >
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
