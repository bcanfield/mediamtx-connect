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
      <header>
        {header && <h2 className="text-lg font-semibold">{header}</h2>}
        {subHeader && <h2 className="text-md">{subHeader}</h2>}
      </header>
      {children}
    </main>
  );
}
