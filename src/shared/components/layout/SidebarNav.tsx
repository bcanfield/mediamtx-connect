'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { buttonVariants } from '@/shared/components/ui/button-variants'
import { cn } from '@/shared/utils'

interface NavItem {
  href: string
  title: string
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  clientConfigItems: NavItem[]
  mediaMtxConfigItems: NavItem[]
  backupConfigItems?: NavItem[]
  retentionConfigItems?: NavItem[]
}

export function SidebarNav({
  className,
  clientConfigItems,
  mediaMtxConfigItems,
  backupConfigItems = [],
  retentionConfigItems = [],
  ...props
}: SidebarNavProps) {
  const pathname = usePathname()

  const allItems = [...clientConfigItems, ...mediaMtxConfigItems, ...backupConfigItems, ...retentionConfigItems]

  return (
    <nav
      className={cn(
        'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
        className,
      )}
      {...props}
    >
      {allItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            pathname === item.href
              ? 'bg-muted hover:bg-muted'
              : 'hover:bg-transparent hover:underline',
            'justify-start',
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
