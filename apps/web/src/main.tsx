import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppHeader } from '@/components/app-header'
import { ServiceWorker } from '@/components/service-worker'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ClientConfigPage } from '@/features/client-config/client-config-page'
import { MediaMTXConfigPage } from '@/features/mediamtx-config/mediamtx-config-page'
import { PathConfigPage } from '@/features/mediamtx-config/path-config-page'
import { PathDefaultsPage } from '@/features/mediamtx-config/path-defaults-page'
import { RecordingsIndexPage } from '@/features/recordings/recordings-index-page'
import { StreamRecordingsPage } from '@/features/recordings/stream-recordings-page'
import { LiveViewPage } from '@/features/streams/live-view-page'
import { I18nProvider } from '@/i18n/provider'

import './globals.css'

const rootRoute = createRootRoute({
  component: () => (
    <I18nProvider>
      <ThemeProvider>
        <div className="flex min-h-svh flex-col">
          <AppHeader />
          <main className="flex flex-1 flex-col">
            <Outlet />
          </main>
        </div>
        <Toaster />
      </ThemeProvider>
      <ServiceWorker />
    </I18nProvider>
  ),
})

function playSearch(search: Record<string, unknown>) {
  return { play: typeof search.play === 'string' ? search.play : undefined }
}

const liveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LiveViewPage,
  validateSearch: playSearch,
})

const recordingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recordings',
  component: RecordingsIndexPage,
})

const streamRecordingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recordings/$streamname',
  component: function StreamRecordingsRoute() {
    const { streamname } = streamRecordingsRoute.useParams()
    const { page, take } = streamRecordingsRoute.useSearch()
    return <StreamRecordingsPage streamName={streamname} page={page} take={take} />
  },
  validateSearch: (search: Record<string, unknown>) => ({
    ...playSearch(search),
    page: Number(search.page) >= 1 ? Number(search.page) : undefined,
    take: Number(search.take) >= 1 ? Number(search.take) : undefined,
  }),
})

const configRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/config',
  component: ClientConfigPage,
})

const mediamtxConfigRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/config/mediamtx/global',
  component: MediaMTXConfigPage,
})

// Sibling of the per-path route, not `paths/defaults` — that would reserve
// `defaults` as a path name and shadow a real MediaMTX path (ADR 0002).
const pathDefaultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/config/mediamtx/path-defaults',
  component: PathDefaultsPage,
})

const pathConfigRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/config/mediamtx/paths/$name',
  component: function PathConfigRoute() {
    const { name } = pathConfigRoute.useParams()
    return <PathConfigPage name={name} />
  },
})

const router = createRouter({
  routeTree: rootRoute.addChildren([
    liveRoute,
    recordingsRoute,
    streamRecordingsRoute,
    configRoute,
    mediamtxConfigRoute,
    pathDefaultsRoute,
    pathConfigRoute,
  ]),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')
if (!rootElement)
  throw new Error('missing #root')

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
