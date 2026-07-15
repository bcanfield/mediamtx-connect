import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const statusPanelVariants = cva('rounded-panel border', {
  variants: {
    tone: {
      error: 'border-live/25 bg-linear-to-b from-live/[0.04] to-transparent',
      warning: 'border-warning/30 bg-linear-to-b from-warning/[0.06] to-transparent',
    },
    layout: {
      panel: 'mx-auto my-14 flex w-full max-w-md flex-col items-center gap-4 px-8 py-12 text-center',
      banner: 'flex flex-wrap items-center justify-between gap-3 px-4 py-3',
    },
  },
  defaultVariants: {
    tone: 'error',
    layout: 'panel',
  },
})

const iconCircleVariants = cva(
  'flex size-10 items-center justify-center rounded-full border',
  {
    variants: {
      tone: {
        error: 'border-live/35 text-live-foreground',
        warning: 'border-warning/40 text-warning',
      },
    },
    defaultVariants: { tone: 'error' },
  },
)

const dotVariants = cva('size-1.5 shrink-0 rounded-full', {
  variants: {
    tone: {
      error: 'bg-live',
      warning: 'bg-warning',
    },
  },
  defaultVariants: { tone: 'error' },
})

export function StatusPanel({
  tone,
  layout,
  icon,
  title,
  description,
  action,
  className,
  children,
}: VariantProps<typeof statusPanelVariants> & {
  icon?: React.ReactNode
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
  children?: React.ReactNode
}) {
  if (layout === 'banner') {
    return (
      <div className={cn(statusPanelVariants({ tone, layout }), className)}>
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden className={dotVariants({ tone })} />
          <div className="min-w-0">
            <p className="text-[13px] font-medium">{title}</p>
            {description && (
              <p className="truncate text-[11.5px] text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
        {children}
      </div>
    )
  }

  return (
    <div className={cn(statusPanelVariants({ tone, layout }), className)}>
      {icon && <span className={iconCircleVariants({ tone })}>{icon}</span>}
      <div className="space-y-1.5">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">{title}</h2>
        {description && (
          <p className="text-[12px] text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
      {children}
    </div>
  )
}
