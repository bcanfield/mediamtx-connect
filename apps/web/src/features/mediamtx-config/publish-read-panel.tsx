import type { Endpoint } from '@/lib/publish'
import { useQuery } from '@tanstack/react-query'
import { CopyIcon, ExternalLinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'use-intl'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { publishEndpoints, publishHost, readEndpoints } from '@/lib/publish'
import { orpc } from '@/orpc'

// "What URL do I put in OBS?" answered from the server's own listen addresses.
// `source` is the path's effective source: anything but `publisher` (MediaMTX's
// default when unset) means MediaMTX pulls the stream and refuses publishers.
export function PublishReadPanel({ name, source }: { name: string, source: string | undefined }) {
  const t = useTranslations('Config.pathConfig.publishRead')
  const appConfig = useQuery(orpc.config.app.get.queryOptions())
  const global = useQuery(orpc.config.mediamtx.getGlobal.queryOptions())

  if (global.isPending || appConfig.isPending)
    return null

  const pulled = source !== undefined && source !== 'publisher'
  // Never `mediaMtxUrl`: that's where the API reaches MediaMTX, not the browser.
  const host = publishHost(appConfig.data?.remoteMediaMtxUrl ?? null)

  return (
    <section className="rounded-panel border">
      <header className="border-b px-4 py-2.5">
        <h2 className="text-control font-medium">{t('title')}</h2>
      </header>
      {global.data === null
        ? <p className="px-4 py-3.5 text-meta text-muted-foreground">{t('readFailed')}</p>
        : (
            <Tabs defaultValue="publish" className="px-4 py-3.5">
              <TabsList>
                <TabsTrigger value="publish">{t('publishTab')}</TabsTrigger>
                <TabsTrigger value="read">{t('readTab')}</TabsTrigger>
              </TabsList>
              <TabsContent value="publish">
                {pulled
                  ? <p className="py-2 text-meta text-muted-foreground">{t('pullSource')}</p>
                  : <EndpointList endpoints={publishEndpoints(host, name, global.data)} />}
              </TabsContent>
              <TabsContent value="read">
                <EndpointList endpoints={readEndpoints(host, name, global.data)} />
              </TabsContent>
            </Tabs>
          )}
    </section>
  )
}

function EndpointList({ endpoints }: { endpoints: Endpoint[] }) {
  const t = useTranslations('Config.pathConfig.publishRead')
  if (endpoints.length === 0)
    return <p className="py-2 text-meta text-muted-foreground">{t('noProtocols')}</p>
  return (
    <div className="flex flex-col divide-y">
      {endpoints.map(endpoint => <EndpointBlock key={endpoint.protocol} endpoint={endpoint} />)}
    </div>
  )
}

function EndpointBlock({ endpoint }: { endpoint: Endpoint }) {
  const t = useTranslations('Config.pathConfig.publishRead')
  const { protocol } = endpoint

  return (
    <section className="flex flex-col gap-2 py-3">
      <h3 className="text-meta font-medium">{protocol}</h3>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1 font-mono text-meta">{endpoint.url}</code>
        <CopyButton text={endpoint.url} label={t('copyUrl', { protocol })} />
      </div>
      {endpoint.snippets.map(snippet => (
        <div key={snippet.client} className="flex flex-col gap-1">
          <span className="text-meta text-muted-foreground">{snippet.client}</span>
          <div className="flex items-start gap-2">
            <pre className="min-w-0 flex-1 overflow-x-auto rounded-md bg-muted px-2 py-1 font-mono text-meta">{snippet.text}</pre>
            <CopyButton text={snippet.text} label={t('copySnippet', { client: snippet.client, protocol })} />
          </div>
          {snippet.note && <p className="text-meta text-muted-foreground">{t(`notes.${snippet.note}`)}</p>}
        </div>
      ))}
      {endpoint.links.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {endpoint.links.map(link => (
            <a
              key={link.kind}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-meta underline-offset-4 hover:underline"
            >
              {t(`links.${link.kind}`)}
              <ExternalLinkIcon aria-hidden className="size-3" />
            </a>
          ))}
        </div>
      )}
    </section>
  )
}

function CopyButton({ text, label }: { text: string, label: string }) {
  const t = useTranslations('Config.pathConfig.publishRead.toasts')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('copied'))
    }
    catch {
      toast.error(t('copyFailedTitle'), { description: t('copyFailedDescription') })
    }
  }

  return (
    <Button type="button" variant="ghost" size="icon" aria-label={label} title={label} onClick={copy}>
      <CopyIcon aria-hidden />
    </Button>
  )
}
