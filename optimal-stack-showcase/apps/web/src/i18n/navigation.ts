// Compat layer over TanStack Router matching the old next-intl navigation
// surface, so ported components keep their `href`-based Link and usePathname.
import type { ComponentProps } from 'react'
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { createElement } from 'react'

export function Link({
  href,
  ...props
}: Omit<ComponentProps<typeof RouterLink>, 'to'> & { href: string }) {
  return createElement(RouterLink, { to: href, ...props })
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
