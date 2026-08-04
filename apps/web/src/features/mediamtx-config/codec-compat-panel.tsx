import type { ProtocolCompat, ProtocolVerdict } from '@/lib/codec-compat'
import { useTranslations } from 'use-intl'

import {
  codecMix,
  compatFor,
  MEDIAMTX_CODEC_TABLE_VERSION,
  MEDIAMTX_TRANSCODE_DOCS,
  READ_PROTOCOL_LABELS,
} from '@/lib/codec-compat'
import { cn } from '@/lib/utils'

// Why a stream plays over one protocol and not another, for the tracks the path
// is publishing right now. MediaMTX routes one source to many readers without
// re-encoding, so this is the question its operators actually end up asking.
export function CodecCompatPanel({ codecs }: { codecs: string[] }) {
  const t = useTranslations('Config.pathConfig.compat')
  const mix = codecMix(codecs)

  return (
    <section className="flex flex-col gap-3">
      <div className="space-y-1">
        <h2 className="text-section font-semibold tracking-title">{t('title')}</h2>
        <p className="text-meta text-muted-foreground">
          {t('note', { version: MEDIAMTX_CODEC_TABLE_VERSION })}
        </p>
      </div>

      {mix.length === 0
        ? (
            <p className="rounded-panel border border-dashed border-border-hover px-4 py-6 text-center text-control text-muted-foreground">
              {t('noTracks')}
            </p>
          )
        : <CompatMatrix mix={mix} rows={compatFor(mix)} />}
    </section>
  )
}

const verdictTone: Record<ProtocolVerdict, string> = {
  plays: 'text-success',
  partial: 'text-warning',
  blocked: 'text-destructive',
}

// One path, one codec mix: every row holds the same columns — `mix` — and only
// the verdicts across them differ.
function CompatMatrix({ mix, rows }: { mix: string[], rows: ProtocolCompat[] }) {
  const t = useTranslations('Config.pathConfig.compat')
  const verdictLabel: Record<ProtocolVerdict, string> = {
    plays: t('plays'),
    partial: t('partial'),
    blocked: t('blocked'),
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-panel border">
        <table className="w-full text-control">
          <thead>
            <tr className="border-b bg-card text-left text-meta text-muted-foreground">
              <th scope="col" className="px-4 py-2.5 font-medium">{t('columnProtocol')}</th>
              {mix.map(codec => (
                <th scope="col" key={codec} className="px-4 py-2.5 font-mono font-medium">{codec}</th>
              ))}
              <th scope="col" className="px-4 py-2.5 font-medium">{t('columnWhy')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.protocol} className="border-b align-top last:border-b-0">
                <th scope="row" className="px-4 py-2.5 text-left font-medium">
                  <span className="flex flex-col gap-0.5">
                    {READ_PROTOCOL_LABELS[row.protocol]}
                    <span className={cn('font-mono text-label uppercase tracking-[0.07em]', verdictTone[row.verdict])}>
                      {verdictLabel[row.verdict]}
                    </span>
                  </span>
                </th>
                {row.codecs.map(({ codec, support }) => (
                  <td
                    key={codec}
                    className={cn('px-4 py-2.5', support === 'carried' ? 'text-success' : 'text-destructive')}
                  >
                    {/* The tick is decorative; the sentence beside it is what a
                        screen reader gets, so no cell rests on colour alone. */}
                    <span aria-hidden>{support === 'carried' ? '✓' : '✗'}</span>
                    <span className="sr-only">
                      {support === 'carried'
                        ? t('carried', { codec, protocol: READ_PROTOCOL_LABELS[row.protocol] })
                        : t('dropped', { codec, protocol: READ_PROTOCOL_LABELS[row.protocol] })}
                    </span>
                  </td>
                ))}
                <td className="px-4 py-2.5 text-meta text-muted-foreground">
                  {row.verdict === 'blocked' && t('reasonBlocked', { protocol: READ_PROTOCOL_LABELS[row.protocol] })}
                  {row.verdict === 'partial' && t('reasonPartial', {
                    protocol: READ_PROTOCOL_LABELS[row.protocol],
                    codecs: row.dropped.join(', '),
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The one remedy in scope: MediaMTX won't convert a track for you, so a
          reader that can't take the mix needs the source re-encoded. */}
      {rows.some(row => row.verdict !== 'plays') && (
        <p className="text-meta text-muted-foreground">
          <a
            href={MEDIAMTX_TRANSCODE_DOCS}
            target="_blank"
            rel="noreferrer"
            className="text-link underline-offset-2 hover:underline"
          >
            {t('transcode')}
          </a>
        </p>
      )}
    </div>
  )
}
