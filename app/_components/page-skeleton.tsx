import { Skeleton } from "@/components/ui/skeleton";
import GridLayout from "./grid-layout";

export default async function PageSkeleton() {
  return (
    <main className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-2">
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </header>
      <GridLayout columnLayout="small">
        {Array(4)
          .fill(0)
          .map((i, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-md" />
          ))}
      </GridLayout>
    </main>
  );
}
