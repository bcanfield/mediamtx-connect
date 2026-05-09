import type { Metadata, Viewport } from 'next'

import { AppSidebar } from '@/components/app-sidebar'
import { ServiceWorker } from '@/components/service-worker'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    default: 'MediaMTX Connect',
    template: '%s | MediaMTX Connect',
  },
}

export const viewport: Viewport = {
  themeColor: '#0c1016',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
        <Toaster />

        <ServiceWorker />
      </body>
    </html>
  )
}
