import { PageLayout } from '@/components/page-layout'
import { SidebarNav } from '@/components/sidebar-nav'

const configNavItems = [
  { title: 'Client Config', href: '/config' },
  { title: 'MediaMTX Global Config', href: '/config/mediamtx/global' },
]

export default async function ConfigLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PageLayout header="Config" subHeader="Manage your App Configuration">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav items={configNavItems} />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </PageLayout>
  )
}
