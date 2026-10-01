import type { Session, SessionProtocol, SessionProtocolStatus, SessionsState } from '@connect/contract'
import { ORPCError } from '@orpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useFormatter, useTranslations } from 'use-intl'

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
import { ServerUnreachablePanel } from '@/features/streams/live-view-states'
import { formatBytes, formatUptime } from '@/lib/format'
import { orpc } from '@/orpc'

// Each poll costs MediaMTX seven list calls, one per protocol, so this is a
// floor rather than a setting.
const SESSIONS_POLL_MS = 5000

// Protocol names are names, not copy: they render the same in every locale.
const PROTOCOL_LABELS: Record<SessionProtocol, string> = {
  rtsp: 'RTSP',
  rtsps: 'RTSPS',
  rtmp: 'RTMP',
  rtmps: 'RTMPS',
  srt: 'SRT',
  webrtc: 'WebRTC',
  hls: 'HLS',
}

export function SessionsPage() {
  const t = useTranslations('Sessions')
  const sessions = useQuery({
    ...orpc.sessions.list.queryOptions(),
    refetchInterval: SESSIONS_POLL_MS,
  })
  // Annotated because the union `useQuery` infers doesn't narrow on `status`.
  const state: SessionsState | undefined = sessions.data

  return (
    <PageLayout width="wide" header={t('pageHeader')} subHeader={t('pageSubHeader')}>
      {state?.status === 'connection-error' && (
        <ServerUnreachablePanel
          mediaMtxUrl={state.mediaMtxUrl}
          mediaMtxApiPort={state.mediaMtxApiPort}
          onRetry={() => sessions.refetch()}
        />
      )}
      {state?.status === 'connected' && (
        <div className="flex flex-col gap-4">
          {state.sessions.length === 0
            ? <EmptyPanel />
            : (
                <>
                  <p className="text-control text-muted-foreground">
                    {t('summary', { count: state.sessions.length })}
                  </p>
                  <SessionsTable sessions={state.sessions} />
                </>
              )}
          <ProtocolNotes protocols={state.protocols} pageSize={state.pageSize} />
        </div>
      )}
    </PageLayout>
  )
}

function SessionsTable({ sessions }: { sessions: Session[] }) {
  const t = useTranslations('Sessions')
  const format = useFormatter()

  return (
    <div className="overflow-x-auto rounded-panel border">
      <table className="w-full text-control">
        <thead>
          <tr className="border-b bg-card text-left text-meta text-muted-foreground">
            <th scope="col" className="px-4 py-2.5 font-medium">{t('columns.path')}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{t('columns.protocol')}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{t('columns.remoteAddr')}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{t('columns.state')}</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">{t('columns.bytesIn')}</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">{t('columns.bytesOut')}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{t('columns.uptime')}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              <span className="sr-only">{t('columns.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <tr key={`${session.protocol}:${session.id}`} className="border-b last:border-b-0">
              <td className="px-4 py-2.5 font-mono">{session.path}</td>
              <td className="px-4 py-2.5 font-mono text-meta">{PROTOCOL_LABELS[session.protocol]}</td>
              <td className="px-4 py-2.5 font-mono text-muted-foreground">{session.remoteAddr}</td>
              <td className="px-4 py-2.5 font-mono text-meta">{t(`states.${session.state}`)}</td>
              <td className="px-4 py-2.5 text-right font-mono">
                {session.inboundBytes === null ? t('noCounter') : formatBytes(format, session.inboundBytes)}
              </td>
              <td className="px-4 py-2.5 text-right font-mono">{formatBytes(format, session.outboundBytes)}</td>
              <td className="px-4 py-2.5 font-mono">{formatUptime(session.created.toISOString())}</td>
              <td className="px-4 py-2.5 text-right">
                <KickDialog session={session} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function KickDialog({ session }: { session: Session }) {
  const t = useTranslations('Sessions.kick')
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const kick = useMutation(orpc.sessions.kick.mutationOptions())
  const { remoteAddr } = session

  const confirm = async () => {
    try {
      await kick.mutateAsync({ protocol: session.protocol, id: session.id })
      toast.success(t('toasts.success', { remoteAddr }))
    }
    catch (error) {
      if (error instanceof ORPCError && error.code === 'NOT_FOUND')
        toast.info(t('toasts.alreadyGone', { remoteAddr }))
      else
        toast.error(t('toasts.errorTitle'), { description: t('toasts.errorDescription') })
    }
    setOpen(false)
    await queryClient.invalidateQueries({ queryKey: orpc.sessions.list.key() })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">{t('action')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('confirmTitle', { protocol: PROTOCOL_LABELS[session.protocol], remoteAddr, path: session.path })}
          </DialogTitle>
          <DialogDescription>{t('confirmDescription')}</DialogDescription>
        </DialogHeader>
        {/* An HLS player re-requests its playlist straight away and gets a
            new session, so the kick mostly just resets it. */}
        {session.protocol === 'hls' && (
          <p className="text-meta text-muted-foreground">{t('hlsCaveat')}</p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">{t('cancel')}</Button>
          </DialogClose>
          <Button type="button" variant="destructive" disabled={kick.isPending} onClick={confirm}>
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// A protocol we didn't list is not a protocol with nobody on it, so the page
// says which ones are missing from the table and why.
function ProtocolNotes({ protocols, pageSize }: { protocols: SessionProtocolStatus[], pageSize: number }) {
  const t = useTranslations('Sessions.protocols')
  const format = useFormatter()
  const unlisted = protocols
    .filter(p => p.status !== 'listed')
    .map(p => t(p.status === 'disabled' ? 'disabled' : 'failed', { protocol: PROTOCOL_LABELS[p.protocol] }))
  const truncated = protocols.filter(p => p.truncated)

  if (unlisted.length === 0 && truncated.length === 0)
    return null

  return (
    <div className="flex flex-col gap-1 text-meta text-muted-foreground">
      {truncated.map(p => (
        <p key={p.protocol}>{t('truncated', { protocol: PROTOCOL_LABELS[p.protocol], count: pageSize })}</p>
      ))}
      {unlisted.length > 0 && (
        <p>{t('unlisted', { protocols: format.list(unlisted, { type: 'unit', style: 'short' }) })}</p>
      )}
    </div>
  )
}

function EmptyPanel() {
  const t = useTranslations('Sessions.empty')

  return (
    <div className="mx-auto my-14 flex w-full max-w-lg flex-col items-center gap-1.5 rounded-panel border border-dashed border-border-hover px-8 py-12 text-center">
      <h2 className="text-section font-semibold tracking-title">{t('title')}</h2>
      <p className="text-lead text-muted-foreground">{t('lead')}</p>
    </div>
  )
}
