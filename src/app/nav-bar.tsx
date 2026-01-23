'use client'

import { Menu, RefreshCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { LanguageSwitcher, ModeToggle } from '@/shared/components/feedback'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/utils'

export default function NavBar() {
  const pathname = usePathname()
  const t = useTranslations('navigation')

  const navItems = [
    { name: t('dashboard'), location: '/dashboard' },
    { name: t('recordings'), location: '/recordings' },
    { name: t('config'), location: '/config' },
  ]

  return (
    <div className="flex h-16 items-center max-w-8xl sm:justify-between sm:space-x-0 mx-auto">
      <div className="flex gap-6 sm:gap-10 w-full">
        <Link href="/" className="items-center space-x-2 hidden sm:flex">
          <span className="font-bold inline-block">Connect</span>
        </Link>
        <>
          <nav className="hidden gap-6 sm:flex">
            {navItems.map(({ location, name }) => (
              <Link
                key={location}
                href={location}
                className={cn(
                  'text-muted-foreground transition-colors hover:text-primary',
                  { 'text-primary': pathname?.includes(location) },
                )}
              >
                {name}
              </Link>
            ))}
          </nav>
          <div className="flex w-full sm:hidden items-center justify-start ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="flex items-center  ">
                <Button variant="ghost" size="icon">
                  <Menu></Menu>
                  <span className="sr-only">{t('toggleNavigationMenu')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link
                    href="/"
                    className={cn(
                      'text-primary font-extrabold transition-colors hover:text-primary',
                    )}
                  >
                    {t('home')}
                  </Link>
                </DropdownMenuItem>
                {navItems.map(({ location, name }) => (
                  <DropdownMenuItem asChild key={location}>
                    <Link
                      key={location}
                      href={location}
                      className={cn(
                        'text-muted-foreground transition-colors hover:text-primary',
                        { 'text-primary': pathname?.includes(location) },
                      )}
                    >
                      {name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      </div>

      <div className="flex flex-1 items-center justify-end">
        <nav className="flex space-x-4 px-2 items-center">
          <Button variant="ghost" onClick={() => window.location.reload()}>
            <RefreshCcw></RefreshCcw>
          </Button>
          <LanguageSwitcher />
          <ModeToggle />
        </nav>
      </div>
    </div>
  )
}
