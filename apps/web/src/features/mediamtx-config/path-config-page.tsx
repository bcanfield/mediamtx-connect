import type { PathConfigResult } from '@connect/contract'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { TriangleAlertIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
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
import { pathConfigScope } from './sections'

export function PathConfigPage({ name, section }: { name: string, section?: string }) {
  const t = useTranslations('Config')
  const queryClient = useQueryClient()
  // The form re-arms its scroll spy whenever the scope's identity changes.
  const invalidSource = t('mediamtxForm.errors.invalidSource')
  const scope = useMemo(() => pathConfigScope(invalidSource), [invalidSource])
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
        // Both act on the path's own entry, and there is none to act on while
        // the path is still tracking a wildcard one.
        effective && !inheritedFrom
          ? (
              <div className="flex items-center gap-2">
                <RevertToInherited name={name} queryKey={options.queryKey} />
                <DeletePath name={name} />
              </div>
            )
          : null
      }
    >
      {effective && (
        <MediaMTXConfigForm
          // Reverting swaps every value for the inherited one, and the
          // form only reads `conf` when it mounts.
          key={effective.confName}
          scope={scope}
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

// The same `config/paths/delete` the revert runs, for the other intent: getting
// rid of the path rather than of its overrides. MediaMTX will happily drop an
// entry with a publisher and readers on it and say nothing, so the confirm reads
// the runtime path first and names what the delete would cut off.
function DeletePath({ name }: { name: string }) {
  const t = useTranslations('Config.pathConfig.delete')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deletePathConfig = useMutation(orpc.config.mediamtx.deletePathConfig.mutationOptions())
  const [open, setOpen] = useState(false)

  const connections = useQuery({
    ...orpc.config.mediamtx.getPathConnections.queryOptions({ input: { name } }),
    // A session that connected after the page loaded is exactly the one worth
    // warning about, so this is read when the dialog opens, not before.
    enabled: open,
  })
  // Confirming before the answer lands would skip the warning entirely.
  const checking = connections.isPending || connections.isFetching
  const attached = connections.data
  const readerTypes = [...new Set(attached?.readers)].join(', ')

  const remove = async () => {
    try {
      await deletePathConfig.mutateAsync({ name })
      setOpen(false)
      toast.success(t('toasts.success', { name }))
      // The catalog we are about to land on is now one row shorter.
      await queryClient.invalidateQueries()
      await navigate({ to: '/config/mediamtx/paths' })
    }
    catch {
      toast.error(t('toasts.errorTitle'), { description: t('toasts.errorDescription') })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">{t('action')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('confirmTitle', { name })}</DialogTitle>
          <DialogDescription>{t('confirmDescription')}</DialogDescription>
        </DialogHeader>
        {checking && (
          <p className="text-meta text-muted-foreground">{t('checking')}</p>
        )}
        {!checking && attached === null && (
          <p className="text-meta text-muted-foreground">{t('checkFailed')}</p>
        )}
        {!checking && attached && (attached.publisher || attached.readers.length > 0) && (
          <div className="flex flex-col gap-1.5 rounded-panel border border-warning/30 bg-linear-to-b from-warning/[0.06] to-transparent p-3 text-meta text-muted-foreground">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <TriangleAlertIcon aria-hidden className="size-3.5 shrink-0 text-warning" />
              {t('active.title')}
            </span>
            {attached.publisher && (
              <span>{t('active.publisher', { type: attached.publisher })}</span>
            )}
            {attached.readers.length > 0 && (
              <span>{t('active.readers', { count: attached.readers.length, types: readerTypes })}</span>
            )}
            <span>{t('active.lead')}</span>
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
            disabled={checking || deletePathConfig.isPending}
          >
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
