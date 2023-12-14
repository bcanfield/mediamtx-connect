"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Menu } from "lucide-react";

type Props = {
  items?: { name: string; location: string }[];
};

export default function NavBar({ items }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex h-16 items-center max-w-8xl space-x-4 sm:justify-between sm:space-x-0 mx-auto">
      <div className="flex gap-6 md:gap-10">
        <Link href="/" className="hidden md:flex items-center space-x-2">
          <span className="font-bold inline-block">{"Connect"}</span>
        </Link>
        <>
          <nav className="hidden gap-6 md:flex">
            {items?.map(({ location, name }) => (
              <Link
                key={location}
                href={location}
                className={cn(
                  "text-muted-foreground transition-colors hover:text-primary",
                  { "text-primary": pathname?.includes(location) },
                )}
              >
                {name}
              </Link>
            ))}
          </nav>
          <div className="flex md:hidden items-center">
            <Sheet>
              <SheetTrigger>
                <Menu className="w-6 h-6" />
              </SheetTrigger>
              <SheetContent side={"left"} className="flex flex-col gap-2">
                <SheetHeader>
                  <SheetTitle>
                    <Link href="/" className="flex items-center space-x-2">
                      <span className="font-bold inline-block">NextCams</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                {items?.map(({ location, name }) => (
                  <Link
                    key={location}
                    href={location}
                    className={cn(
                      "text-muted-foreground transition-colors hover:text-primary",
                      { "text-primary": pathname?.includes(location) },
                    )}
                  >
                    {name}
                  </Link>
                ))}
                {/* {links} */}
              </SheetContent>
            </Sheet>
          </div>
        </>
      </div>

      <div className="flex flex-1 items-center space-x-4 justify-end">
        {/* <nav className="flex space-x-4">User</nav> */}
      </div>
    </div>
  );
}
