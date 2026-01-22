'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Progress({ ref, className, value, ...props }: React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { ref?: React.Ref<React.ElementRef<typeof ProgressPrimitive.Root> | null> }) {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
