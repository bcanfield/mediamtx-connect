import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <nav className="mb-6 flex items-baseline gap-4 border-b border-gray-200 pb-4">
        <Link to="/" className="text-lg font-semibold [&.active]:underline">
          Streams
        </Link>
        <a href="/docs" className="ml-auto text-sm text-gray-500 hover:underline">
          API docs
        </a>
      </nav>
      <Outlet />
    </div>
  )
}
