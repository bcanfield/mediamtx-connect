import { PageLayout, SidebarNav } from '@/shared/components/layout'

export default async function ConfigLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const clientConfigItems = [
    {
      title: 'Client Config',
      href: '/config',
    },
  ]

  const mediaMtxConfigItems = [
    {
      title: 'MediaMTX Global Config',
      href: '/config/mediamtx/global',
    },
  ]

  return (
    <PageLayout header="Config" subHeader="Manage your App Configuration">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav
            clientConfigItems={clientConfigItems}
            mediaMtxConfigItems={mediaMtxConfigItems}
          />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </PageLayout>
  )
}
