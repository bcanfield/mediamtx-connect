// Which primary-nav tab reads as current, given the pathname.
//
// Its own module rather than a helper inside app-header.tsx so the rule can be
// tested in the `logic` project: importing it from the header would pull React,
// the orpc client and the connection-state hook into a node-environment test.
//
// Deliberately NOT TanStack Link's own notion of active, which is prefix-based.
// `/config` and `/config/mediamtx/*` are adjacent tabs, and a prefix rule lights
// both of them on every MediaMTX config page.
export function isActiveRoute(pathname: string | null, href: string) {
  if (!pathname)
    return false
  if (href === '/')
    return pathname === '/'
  if (href === '/config')
    return pathname === '/config'
  return pathname.startsWith(href)
}
