import type { ReactElement } from 'react'

import { FormItem, FormLabel } from '@/shared/components/ui/form'
import { cn } from '@/shared/utils'

export function GridFormItem({
  children,
  label,
  hidden,
}: {
  children: ReactElement
  label: string
  hidden?: boolean
}) {
  return (
    <FormItem>
      <div
        className={cn(
          'grid grid-cols-2 gap-2 w-full items-center',
          hidden && 'hidden',
        )}
      >
        <FormLabel>{label}</FormLabel>
        {children}
      </div>
    </FormItem>
  )
}
