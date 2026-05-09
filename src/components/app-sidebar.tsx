'use client'

import { Cctv, Film, MonitorPlay, Server, Settings2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { LocaleSwitcher } from '@/components/locale-switcher'
import { ModeToggle } from '@/components/mode-toggle'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Link, usePathname } from '@/i18n/navigation'

const application = [
  { key: 'live', href: '/', icon: MonitorPlay },
  { key: 'recordings', href: '/recordings', icon: Film },
] as const

const settings = [
  { key: 'clientConfig', href: '/config', icon: Settings2 },
  { key: 'mediamtx', href: '/config/mediamtx/global', icon: Server },
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

export function AppSidebar() {
  const pathname = usePathname()
  const t = useTranslations('Nav')

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Cctv className="size-4" />
                </div>
                <span className="font-semibold">{t('brand')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('groups.application')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {application.map((item) => {
                const label = t(`items.${item.key}`)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveRoute(pathname, item.href)}
                      tooltip={label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('groups.settings')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settings.map((item) => {
                const label = t(`items.${item.key}`)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveRoute(pathname, item.href)}
                      tooltip={label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <LocaleSwitcher />
        <ModeToggle />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
