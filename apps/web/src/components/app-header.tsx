import { useTranslations } from 'use-intl'

import { ConnectionStatus } from '@/components/connection-status'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { ModeToggle } from '@/components/mode-toggle'
import { useConnectionState } from '@/hooks/use-connection-state'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { key: 'live', href: '/' },
  { key: 'recordings', href: '/recordings' },
  { key: 'appConfig', href: '/config' },
  { key: 'mediamtxConfig', href: '/config/mediamtx/global' },
] as const

function isActiveRoute(pathname: string | null, href: string) {
  if (!pathname)
    return false
  if (href === '/')
    return pathname === '/'
  if (href === '/config')
    return pathname === '/config'
  return pathname.startsWith(href)
}

export function AppHeader() {
  const t = useTranslations('Nav')
  const pathname = usePathname()
  const { connected, liveCount } = useConnectionState()

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-background">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-7">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-foreground font-mono text-[13px] font-semibold text-background"
          >
            {t('logoMark')}
          </span>
          <span className="truncate text-sm">
            <span className="font-medium">{t('brandPrimary')}</span>
            {' '}
            <span className="font-normal text-mute">{t('brandSecondary')}</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          <ConnectionStatus />
          <LocaleSwitcher />
          <ModeToggle />
        </div>
      </div>

      <nav
        aria-label={t('primaryAria')}
        className="flex items-stretch gap-4 overflow-x-auto px-4 sm:px-7"
      >
        {tabs.map((tab, i) => {
          const active = isActiveRoute(pathname, tab.href)
          return (
            <div key={tab.href} className="flex items-stretch gap-4">
              {i === 2 && (
                <span aria-hidden className="my-3 w-px self-stretch bg-border-subtle" />
              )}
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-11 items-center gap-1.5 whitespace-nowrap border-b-2 px-0.5 text-[13px] transition-colors',
                  active
                    ? 'border-foreground font-medium text-foreground'
                    : 'border-transparent font-normal text-mute hover:text-foreground',
                )}
              >
                {t(`items.${tab.key}`)}
                {tab.key === 'live' && connected && liveCount > 0 && (
                  <span aria-hidden className="size-1.5 rounded-full bg-live" />
                )}
              </Link>
            </div>
          )
        })}
      </nav>
    </header>
  )
}
