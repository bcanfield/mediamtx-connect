import type { ReactElement } from 'react'
import { cn } from '@/lib/utils'
import { FormItem, FormLabel } from './ui/form'

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
