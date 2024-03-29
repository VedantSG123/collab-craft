import type { Metadata } from "next"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/lib/providers/next-theme-provider"
import AppStateProvider from "@/lib/providers/state-provider"
import SupabaseUserProvider from "@/lib/providers/supabase-user-provider"
import { Toaster } from "@/components/ui/toaster"
import { SocketProvider } from "@/lib/providers/socket-provider"

export const metadata: Metadata = {
  title: "Collab Craft",
  description: "Collaborative web platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background text-foreground font-sans antialiased"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AppStateProvider>
            <SupabaseUserProvider>
              <SocketProvider>
                {children}
                <Toaster />
              </SocketProvider>
            </SupabaseUserProvider>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
