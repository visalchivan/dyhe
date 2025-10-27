import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/theme-provider'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">    
        <Toaster />
        <Outlet />
      </ThemeProvider>
    </AuthProvider>
  )
}
