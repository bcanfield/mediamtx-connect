import { Separator } from '@/components/ui/separator'

export function PageLayout({
  children,
  header,
  subHeader,
}: {
  children: React.ReactNode
  header?: string
  subHeader?: string
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3 p-4">
      <header className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{header}</h2>
        {subHeader && <p className="text-muted-foreground">{subHeader}</p>}
      </header>
      <Separator />
      {children}
    </div>
  )
}
