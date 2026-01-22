import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

export default async function PageLayout({
  children,
  header,
  subHeader,
}: {
  children: React.ReactNode;
  header?: string;
  subHeader?: string;
}) {
  return (
    <main className="flex flex-col gap-4">
      <header className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{header}</h2>
        <Suspense fallback={<p>Loading feed...</p>}>
          {subHeader && <p className="text-muted-foreground">{subHeader}</p>}
        </Suspense>
      </header>
      <Separator />
      {children}
    </main>
  );
}
