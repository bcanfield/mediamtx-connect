import { useQuery } from '@tanstack/react-query'
import { orpc } from '../orpc'

export function AboutPage() {
  const health = useQuery(orpc.health.queryOptions())

  return (
    <main>
      <h1>About</h1>
      <p>
        Vite + React + TanStack Router SPA, served as static files by a Hono
        (Node 22) backend, type-safe end to end via a shared oRPC contract — all
        in one distroless Docker image.
      </p>
      <p>
        API health:
        {' '}
        {health.data
          ? `${health.data.status} (up ${Math.round(health.data.uptime)}s)`
          : 'checking…'}
      </p>
    </main>
  )
}
