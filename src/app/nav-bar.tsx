'use client'

import { Menu, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ModeToggle } from '../components/mode-toggle'

interface Props {
  items?: { name: string, location: string }[]
}

export default function NavBar({ items }: Props) {
  const pathname = usePathname()

  return (
    <div className="flex h-16 items-center max-w-8xl sm:justify-between sm:space-x-0 mx-auto">
      <div className="flex gap-6 sm:gap-10 w-full">
        <Link href="/" className="items-center space-x-2 hidden sm:flex">
          <span className="font-bold inline-block">Connect</span>
        </Link>
        <>
          <nav className="hidden gap-6 sm:flex">
            {items?.map(({ location, name }) => (
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
                    Home
                  </Link>
                </DropdownMenuItem>
                {items?.map(({ location, name }) => (
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
          <ModeToggle />
        </nav>
      </div>
    </div>
  )
}
