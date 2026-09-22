import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/auth/AuthProvider'
import { UiProvider } from '@/ui/UiProvider'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/itsm">
        <AuthProvider>
          <UiProvider>
            <App />
          </UiProvider>
          <Toaster
            position="bottom-right"
            theme="system"
            richColors
            closeButton
            toastOptions={{ className: 'font-sans' }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
