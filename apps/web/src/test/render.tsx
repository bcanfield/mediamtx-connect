import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IntlProvider } from 'use-intl'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { I18nProvider } from '@/i18n/provider'
import messages from '../../messages/en.json'

// The real provider stack minus the browser: same messages the app ships, same
// query client semantics, a memory router instead of the DOM one. Components
// under test read `useSearch`/`useNavigate`, so a bare render throws.
function testRouter(ui: ReactNode, initialPath: string) {
  const rootRoute = createRootRoute({ component: () => ui })
  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })
}

export interface RenderOptions {
  /** Seeds `useSearch` — e.g. '/?play=stream1' to mount a card already playing. */
  path?: string
  /**
   * Use the app's real `I18nProvider` — localStorage persistence, on-demand
   * message loading, `<html lang>` — instead of a fixed English `IntlProvider`.
   * Only for tests *about* locale switching; everything else wants the fixed
   * one, which needs no async message load to settle.
   */
  realI18n?: boolean
}

export async function renderWithProviders(
  ui: ReactNode,
  { path = '/', realI18n = false }: RenderOptions = {},
) {
  const queryClient = new QueryClient({
    // A retrying mutation turns an asserted error toast into a 3-attempt wait.
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = testRouter(ui, path)
  // RouterProvider renders nothing until the route resolves. Without this the
  // DOM is empty and every `queryBy*` negative assertion passes vacuously.
  await router.load()

  // Mirrors main.tsx's stack: mutation success/failure is reported by a toast,
  // and the Toaster reads the theme.
  const inner = (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  )

  const result = render(
    <QueryClientProvider client={queryClient}>
      {realI18n
        ? <I18nProvider>{inner}</I18nProvider>
        : (
            <IntlProvider
              locale="en"
              messages={messages}
              timeZone="UTC"
              now={new Date('2026-07-27T12:00:00Z')}
            >
              {inner}
            </IntlProvider>
          )}
    </QueryClientProvider>,
  )

  // The router comes back so a test can assert where a component navigated to.
  return { ...result, user: userEvent.setup(), queryClient, router }
}
