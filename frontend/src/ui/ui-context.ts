import { createContext, useContext } from 'react'

export interface UiState {
  openNewTicket: () => void
  newTicketOpen: boolean
  setNewTicketOpen: (v: boolean) => void
  paletteOpen: boolean
  setPaletteOpen: (v: boolean) => void
}

export const UiContext = createContext<UiState | null>(null)

export function useUi() {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi debe usarse dentro de <UiProvider>')
  return ctx
}
