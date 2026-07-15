import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AboutPage } from './pages/about'
import { GuestbookPage } from './pages/guestbook'

const rootRoute = createRootRoute({
  component: () => (
    <div
      style={{ fontFamily: 'system-ui', maxWidth: 640, margin: '2rem auto' }}
    >
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/">Guestbook</Link>
        <Link to="/about">About</Link>
      </nav>
      <Outlet />
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: GuestbookPage,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
})

const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, aboutRoute]),
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
