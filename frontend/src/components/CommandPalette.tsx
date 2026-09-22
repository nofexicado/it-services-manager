import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { FileText, MoonStar, Plus, Search, Ticket } from 'lucide-react'
import { useTickets } from '@/hooks/queries'
import { useUi } from '@/ui/ui-context'
import { useTheme } from '@/lib/use-theme'
import { capitalizarPrimera } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

/** Command palette (⌘K). Sin animación de apertura: es una acción de teclado
 *  que se repite muchas veces al día (criterio emil-design-eng / Raycast). */
export function CommandPalette({ open, onOpenChange }: Props) {
  const navigate = useNavigate()
  const { toggle: toggleTheme } = useTheme()
  const { openNewTicket } = useUi()
  const { data: tickets = [] } = useTickets()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onOpenChange(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (!open) return null

  const run = (fn: () => void) => {
    onOpenChange(false)
    fn()
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[12vh]">
      <div className="fixed inset-0 bg-black/45" onClick={() => onOpenChange(false)} />
      <Command
        label="Buscador de comandos"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
      >
        <div className="flex items-center gap-2.5 border-b border-border px-3.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Command.Input
            autoFocus
            placeholder="Buscar tickets o ejecutar una acción…"
            className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border-strong bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[min(60vh,380px)] overflow-y-auto p-1.5">
          <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
            Sin resultados.
          </Command.Empty>

          <Command.Group
            heading="Acciones"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
          >
            <PaletteItem
              onSelect={() => run(openNewTicket)}
              icon={<Plus />}
              label="Nuevo ticket con IA"
            />
            <PaletteItem
              onSelect={() => run(toggleTheme)}
              icon={<MoonStar />}
              label="Cambiar tema (claro / oscuro)"
            />
            <PaletteItem
              onSelect={() => run(() => navigate('/'))}
              icon={<Ticket />}
              label="Ir al panel de control"
            />
          </Command.Group>

          {tickets.length > 0 && (
            <Command.Group
              heading="Tickets"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {tickets.map((t) => (
                <PaletteItem
                  key={t.id}
                  value={`${t.codigo_ticket} ${t.titulo} ${t.solicitante}`}
                  onSelect={() => run(() => navigate(`/ticket/${t.id}`))}
                  icon={<FileText />}
                  label={
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">
                        {t.codigo_ticket}
                      </span>
                      <span className="truncate">{capitalizarPrimera(t.titulo)}</span>
                    </span>
                  }
                />
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>,
    document.body,
  )
}

function PaletteItem({
  icon,
  label,
  onSelect,
  value,
}: {
  icon: React.ReactNode
  label: React.ReactNode
  onSelect: () => void
  value?: string
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground outline-none data-[selected=true]:bg-muted [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"
    >
      {icon}
      {typeof label === 'string' ? <span className="truncate">{label}</span> : label}
    </Command.Item>
  )
}
