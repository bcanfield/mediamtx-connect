import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export interface BreadcrumbCrumb {
  label: string
  href?: string
}

export function PageHeader({
  crumbs = [],
  actions,
}: {
  crumbs?: BreadcrumbCrumb[]
  actions?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/75 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, i) => (
            <PageHeaderCrumb
              key={crumb.href ?? crumb.label}
              crumb={crumb}
              isLast={i === crumbs.length - 1}
            />
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  )
}

function PageHeaderCrumb({
  crumb,
  isLast,
}: {
  crumb: BreadcrumbCrumb
  isLast: boolean
}) {
  return (
    <>
      <BreadcrumbItem>
        {isLast || !crumb.href
          ? <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
          : <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>}
      </BreadcrumbItem>
      {!isLast && <BreadcrumbSeparator />}
    </>
  )
}
