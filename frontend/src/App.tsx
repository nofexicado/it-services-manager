import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Skeleton } from '@/components/ui/misc'

const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)
const TicketPage = lazy(() =>
  import('@/features/ticket/TicketPage').then((m) => ({ default: m.TicketPage })),
)

function RouteFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <Suspense fallback={<RouteFallback />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="ticket/:id"
          element={
            <Suspense fallback={<RouteFallback />}>
              <TicketPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
