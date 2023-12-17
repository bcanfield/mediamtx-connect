import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Viewport } from "next";
import { Inter } from "next/font/google";
import SW from "./_components/sw";
import "./globals.css";
import NavBar from "./nav-bar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  themeColor: "#020817",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: "Recordings", location: "/recordings" },
    { name: "Config", location: "/config" },
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col gap-4 items-center",
          inter.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <header className="flex sticky top-0 z-40 w-full bg-background/75 shadow border-b justify-center backdrop-blur">
            <div className="px-4 w-full max-w-7xl">
              <NavBar items={navItems}></NavBar>
            </div>
          </header>
          <div className="max-w-7xl p-4 w-full">{children}</div>
        </ThemeProvider>
        <Toaster></Toaster>
      </body>

      <SW></SW>
    </html>
  );
}
