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
    {
      title: 'Stream Paths',
      href: '/config/paths',
    },
  ]

  const backupConfigItems = [
    {
      title: 'Backup Settings',
      href: '/config/backup',
    },
  ]

  const retentionConfigItems = [
    {
      title: 'Recording Retention',
      href: '/config/retention',
    },
  ]

  return (
    <PageLayout header="Config" subHeader="Manage your App Configuration">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav
            clientConfigItems={clientConfigItems}
            mediaMtxConfigItems={mediaMtxConfigItems}
            backupConfigItems={backupConfigItems}
            retentionConfigItems={retentionConfigItems}
          />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </PageLayout>
  )
}
