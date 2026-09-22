import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { Usuario } from '@/lib/types'
import { AuthContext } from './auth-context'
import { LoginDialog } from './LoginDialog'

const STORAGE_KEY = 'itsm_user'

function readStored(): Usuario | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Usuario) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(readStored)
  const [dialogOpen, setDialogOpen] = useState(false)

  const login = useCallback((u: Usuario) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const promptLogin = useCallback(() => setDialogOpen(true), [])

  const requireAuth = useCallback(
    (mensaje?: string) => {
      const current = readStored()
      if (!current) {
        if (mensaje) toast.info(mensaje)
        setDialogOpen(true)
        return null
      }
      return current
    },
    [],
  )

  const value = useMemo(
    () => ({ user, login, logout, promptLogin, requireAuth }),
    [user, login, logout, promptLogin, requireAuth],
  )

  return (
    <AuthContext value={value}>
      {children}
      <LoginDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={login}
      />
    </AuthContext>
  )
}
