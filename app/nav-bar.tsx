"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  items?: { name: string; location: string }[];
};

export default function NavBar({ items }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex h-16 items-center max-w-8xl space-x-4 sm:justify-between sm:space-x-0 mx-auto">
      <div className="flex gap-6 sm:gap-10 w-full">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold inline-block">{"Connect"}</span>
        </Link>
        <>
          <nav className="hidden gap-6 sm:flex">
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
          <div className="flex w-full sm:hidden items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="flex items-center p-2">
                <Button variant="ghost">
                  <Menu></Menu>
                  <ChevronDown className="w-4 h-4"></ChevronDown>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {items?.map(({ location, name }, index) => (
                  <DropdownMenuItem asChild key={index}>
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
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      </div>

      <div className="flex flex-1 items-center space-x-4 justify-end">
        {/* <nav className="flex space-x-4">User</nav> */}
      </div>
    </div>
  );
}
