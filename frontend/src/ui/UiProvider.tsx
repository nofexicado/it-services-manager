import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/auth/auth-context'
import { NewTicketDialog } from '@/features/dashboard/NewTicketDialog'
import { UiContext } from './ui-context'

const CommandPalette = lazy(() =>
  import('@/components/CommandPalette').then((m) => ({
    default: m.CommandPalette,
  })),
)

export function UiProvider({ children }: { children: React.ReactNode }) {
  const { requireAuth } = useAuth()
  const [newTicketOpen, setNewTicketOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const openNewTicket = useCallback(() => {
    if (requireAuth('Iniciá sesión para crear un nuevo ticket.')) {
      setNewTicketOpen(true)
    }
  }, [requireAuth])

  // ⌘K / Ctrl+K abre el command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const value = useMemo(
    () => ({
      openNewTicket,
      newTicketOpen,
      setNewTicketOpen,
      paletteOpen,
      setPaletteOpen,
    }),
    [openNewTicket, newTicketOpen, paletteOpen],
  )

  return (
    <UiContext value={value}>
      {children}
      <NewTicketDialog open={newTicketOpen} onClose={() => setNewTicketOpen(false)} />
      {paletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette open onOpenChange={setPaletteOpen} />
        </Suspense>
      )}
    </UiContext>
  )
}
