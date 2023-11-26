import { cn } from "@/lib/utils";

export default async function GridLayout({
  children,
  columnLayout = "medium",
}: {
  children: React.ReactNode;
  columnLayout?: "small" | "medium" | "large";
}) {
  return (
    <div
      className={cn("grid gap-4", {
        "sm:grid-cols-2 grid-cols-1": columnLayout === "small",
        "sm:grid-cols-4 grid-cols-2": columnLayout === "medium",
        "sm:grid-cols-6 grid-cols-3": columnLayout === "large",
      })}
    >
      {children}
    </div>
  );
}
