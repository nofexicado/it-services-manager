import { LogIn, LogOut } from 'lucide-react'
import { useAuth } from '@/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/misc'

export function AuthArea() {
  const { user, logout, promptLogin } = useAuth()

  if (!user) {
    return (
      <Button variant="soft" size="sm" onClick={promptLogin}>
        <LogIn />
        <span className="hidden sm:inline">Iniciar sesión</span>
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2 pl-1 pr-1">
      <Avatar nombre={user.nombre} className="size-7" />
      <div className="hidden leading-tight md:block">
        <p className="text-xs font-semibold text-foreground">{user.nombre}</p>
        <p className="text-[10px] text-muted-foreground">{user.rol}</p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={logout}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
      >
        <LogOut />
      </Button>
    </div>
  )
}
