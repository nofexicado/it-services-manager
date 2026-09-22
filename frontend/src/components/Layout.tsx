import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Moon, Search, Sun, Ticket } from 'lucide-react'
import { useTheme } from '@/lib/use-theme'
import { useUi } from '@/ui/ui-context'
import { Button } from '@/components/ui/button'
import { AuthArea } from './AuthArea'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Cambiar tema"
      title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}

function Brand() {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="ITSM — inicio">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-accent">
        <Ticket className="size-4" />
      </span>
      <span className="h-8 w-px bg-gradient-to-b from-transparent via-border-strong to-transparent" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-bold tracking-[-0.02em] text-gradient-brand">
          ITSM
        </span>
        <span className="mt-1 text-[9.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          IT Services Manager
        </span>
      </span>
    </Link>
  )
}

function CommandHint() {
  const { setPaletteOpen } = useUi()
  return (
    <button
      onClick={() => setPaletteOpen(true)}
      data-lift
      className="hidden items-center gap-2 rounded-lg border border-border-strong bg-card px-2.5 py-1.5 text-xs text-muted-foreground shadow-xs transition-[transform,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-px hover:border-ring/50 hover:text-foreground sm:flex"
      aria-label="Abrir buscador de comandos"
    >
      <Search className="size-3.5" />
      <span>Buscar…</span>
      <kbd className="rounded border border-border-strong bg-muted px-1 font-mono text-[10px] leading-4">
        ⌘K
      </kbd>
    </button>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header
        data-scrolled={scrolled}
        className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl transition-shadow duration-200 data-[scrolled=true]:shadow-[0_10px_30px_-16px_rgba(0,0,0,0.35)] dark:data-[scrolled=true]:shadow-[0_12px_34px_-14px_rgba(0,0,0,0.7)]"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="hdr-l">
            <Brand />
          </div>
          <div className="hdr-r flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/40 p-1 shadow-xs backdrop-blur-sm">
            <CommandHint />
            <ThemeToggle />
            <span className="mx-0.5 hidden h-6 w-px bg-border sm:block" />
            <AuthArea />
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div key={pathname} className="animate-in">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-border py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span>IT Services Manager — Panel de operaciones IT</span>
          <span>Diseñado y desarrollado por Mauricio Figueroa</span>
        </div>
      </footer>
    </div>
  )
}
