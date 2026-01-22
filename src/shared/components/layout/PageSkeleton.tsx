import { Skeleton } from '@/shared/components/ui/skeleton'

import GridLayout from './GridLayout'

export default async function PageSkeleton() {
  return (
    <main className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </header>
      <GridLayout columnLayout="small">
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </GridLayout>
    </main>
  )
}
