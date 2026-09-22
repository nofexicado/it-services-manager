import { createContext, useContext } from 'react'
import type { Usuario } from '@/lib/types'

export interface AuthState {
  user: Usuario | null
  login: (user: Usuario) => void
  logout: () => void
  /** Abre el modal de login. */
  promptLogin: () => void
  /** Devuelve el usuario o null; si es null, abre el modal y avisa. */
  requireAuth: (mensaje?: string) => Usuario | null
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
