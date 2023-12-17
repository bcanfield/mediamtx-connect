"use client";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  clientConfigItems: {
    href: string;
    title: string;
  }[];
  mediaMtxConfigItems: {
    href: string;
    title: string;
  }[];
}

export function SidebarNav({
  className,
  clientConfigItems,
  mediaMtxConfigItems,
  ...props
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className,
      )}
      {...props}
    >
      {clientConfigItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start",
          )}
        >
          {item.title}
        </Link>
      ))}
      {mediaMtxConfigItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
