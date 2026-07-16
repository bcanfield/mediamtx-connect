// Compat layer over TanStack Router matching the old next-intl navigation
// surface, so ported components keep their `href`-based Link and usePathname.
import type { ComponentProps } from 'react'
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { createElement } from 'react'

// TanStack types `search` off a literal `to`; this shim's `to` is a plain
// string, which collapses that inference to `never`. The route's own
// validateSearch is what actually parses these, so take them as a record.
export function Link({
  href,
  search,
  ...props
}: Omit<ComponentProps<typeof RouterLink>, 'to' | 'search'> & {
  href: string
  search?: Record<string, string>
}) {
  return createElement(RouterLink, { to: href, search: search as never, ...props })
}

export function usePathname(): string {
  return useLocation({ select: l => l.pathname })
}

export function useRouter() {
  const navigate = useNavigate()
  return {
    push: (href: string) => navigate({ to: href }),
    replace: (href: string) => navigate({ to: href, replace: true }),
  }
}
