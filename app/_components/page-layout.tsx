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
    <main className="flex flex-col gap-4 p-4">
      <header id="header" className="relative z-2">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold tracking-tight">{header}</h2>
          {subHeader && <h2 className="text-md">{subHeader}</h2>}
        </div>
      </header>

      {children}
    </main>
  );
}
