import { cn } from '@/lib/utils'

export function PageLayout({
  children,
  header,
  subHeader,
  actions,
  width = 'default',
}: {
  children: React.ReactNode
  header?: React.ReactNode
  subHeader?: React.ReactNode
  actions?: React.ReactNode
  width?: 'default' | 'narrow' | 'reading' | 'wide'
}) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-7 sm:px-7',
        width === 'default' && 'max-w-7xl',
        width === 'wide' && 'max-w-265',
        width === 'reading' && 'max-w-230',
        width === 'narrow' && 'max-w-160',
      )}
    >
      {(header || subHeader || actions) && (
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            {header && (
              <h1 className="text-xl font-semibold tracking-[-0.02em]">{header}</h1>
            )}
            {subHeader && (
              <p className="text-[13px] text-muted-foreground">{subHeader}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  )
}
