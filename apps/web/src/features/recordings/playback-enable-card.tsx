import type { PathDefaults } from '@connect/contract'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'use-intl'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { orpc } from '@/orpc'

interface Change {
  key: string
  from: string
  to: string
}

// What path defaults need before MediaMTX will serve this path's recordings:
// fMP4, and `%f` in recordPath, without which MediaMTX refuses `playback: true`.
// Only the keys that aren't there yet.
function pathDefaultsPatch(defaults: PathDefaults): PathDefaults {
  const patch: PathDefaults = {}
  if (defaults.recordFormat !== 'fmp4')
    patch.recordFormat = 'fmp4'
  if (!defaults.recordPath?.includes('%f'))
    patch.recordPath = `${defaults.recordPath ?? ''}-%f`
  return patch
}

// Shown in place of the timeline while MediaMTX's playback server can't read
// this path. It names what's missing and offers the exact writes that fix it,
// unless the path's own config sets the format, which path defaults can't reach.
export function PlaybackEnableCard({
  streamName,
  playbackEnabled,
  recordFormat,
  onEnabled,
}: {
  streamName: string
  playbackEnabled: boolean
  /** The path's effective format, null when it couldn't be resolved. */
  recordFormat: string | null
  onEnabled: () => Promise<void>
}) {
  const t = useTranslations('Recordings.enablePlayback')
  const pathDefaults = useQuery(orpc.config.mediamtx.getPathDefaults.queryOptions())

  const updatePathDefaults = useMutation(orpc.config.mediamtx.updatePathDefaults.mutationOptions())
  const updateGlobal = useMutation(orpc.config.mediamtx.updateGlobal.mutationOptions())
  // One action to the operator, so one pending/error state for the card.
  const apply = useMutation({
    // Path defaults first: MediaMTX refuses `playback` while recordPath lacks %f.
    mutationFn: async (patch: PathDefaults) => {
      if (Object.keys(patch).length > 0)
        await updatePathDefaults.mutateAsync(patch)
      if (!playbackEnabled)
        await updateGlobal.mutateAsync({ playback: true })
      await onEnabled()
    },
  })

  const defaults = pathDefaults.data
  const overridden = recordFormat !== null && recordFormat !== 'fmp4' && defaults?.recordFormat === 'fmp4'
  const patch = defaults ? pathDefaultsPatch(defaults) : {}
  const changes: Change[] = [
    ...(patch.recordFormat ? [{ key: 'recordFormat', from: defaults?.recordFormat ?? '', to: patch.recordFormat }] : []),
    ...(patch.recordPath ? [{ key: 'recordPath', from: defaults?.recordPath ?? '', to: patch.recordPath }] : []),
    ...(playbackEnabled ? [] : [{ key: 'playback', from: 'false', to: 'true' }]),
  ]

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-card p-4">
      <h2 className="text-section font-semibold tracking-title">{t('title')}</h2>

      <ul className="list-disc space-y-1 pl-5 text-meta text-muted-foreground">
        {!playbackEnabled && <li>{t('playbackOff')}</li>}
        {recordFormat !== null && recordFormat !== 'fmp4' && (
          <li>{t('notFmp4', { format: recordFormat })}</li>
        )}
      </ul>

      {pathDefaults.isSuccess && !defaults && (
        <p className="text-meta text-live-foreground">{t('pathDefaultsUnreadable')}</p>
      )}

      {overridden && (
        <>
          <p className="text-meta">
            {t.rich('override', {
              format: recordFormat,
              code: chunks => <code className="font-mono">{chunks}</code>,
            })}
          </p>
          <Button asChild size="sm" variant="outline" className="self-start">
            <Link href={`/config/mediamtx/paths/${encodeURIComponent(streamName)}`} search={{ section: 'recording' }}>
              {t('openPathConfig')}
            </Link>
          </Button>
        </>
      )}

      {defaults && !overridden && (
        <>
          <p className="text-meta">{t('changesIntro')}</p>
          <ul aria-label={t('changesAria')} className="space-y-1 font-mono text-meta">
            {changes.map(change => (
              <li key={change.key} className="break-all">
                {`${change.key}: ${change.from} → ${change.to}`}
              </li>
            ))}
          </ul>
          <p className="text-meta text-mute">{t('olderNote')}</p>

          {apply.isError && (
            <div role="alert" className="text-meta">
              <p className="font-medium text-live-foreground">{t('refused')}</p>
              <p className="font-mono">{apply.error.message}</p>
            </div>
          )}

          <Button
            type="button"
            size="sm"
            className="self-start"
            disabled={apply.isPending}
            onClick={() => apply.mutate(patch)}
          >
            {apply.isPending ? t('applying') : t('apply')}
          </Button>
        </>
      )}
    </section>
  )
}
