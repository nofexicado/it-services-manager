import { motion } from 'motion/react'
import { Activity, CalendarDays, UserRound } from 'lucide-react'
import { capitalizarPrimera, fechaLarga } from '@/lib/utils'
import type { EstadoTicket, TicketDetalle } from '@/lib/types'
import { Card, Avatar } from '@/components/ui/misc'
import { PrioridadBadge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'

const ESTADOS: EstadoTicket[] = [
  'Pendiente',
  'En Progreso',
  'En Espera',
  'Resuelto',
]
const ESTADO_OPTS = ESTADOS.map((e) => ({ value: e, label: e }))

const ESTADO_COLOR: Record<EstadoTicket, string> = {
  Pendiente: 'var(--warning)',
  'En Progreso': 'var(--info)',
  'En Espera': 'var(--muted-foreground)',
  Resuelto: 'var(--success)',
}

const EASE = [0.23, 1, 0.32, 1] as const

interface Props {
  ticket: TicketDetalle
  onEstadoChange: (estado: EstadoTicket) => void
  saving: boolean
}

export function TicketHero({ ticket, onEstadoChange, saving }: Props) {
  const color = ESTADO_COLOR[ticket.estado] ?? 'var(--primary)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: EASE }}
    >
      <Card className="relative overflow-hidden">
        {/* halo tintado por el estado del ticket */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, color-mix(in srgb, ${color} 45%, transparent), transparent 70%)`,
            opacity: 0.5,
          }}
        />
        {/* filo superior con luz de acento */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="relative flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3.5">
            <motion.div
              className="flex flex-wrap items-center gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06, ease: EASE }}
            >
              <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-primary ring-1 ring-inset ring-primary/20">
                {ticket.codigo_ticket}
              </span>
              <PrioridadBadge prioridad={ticket.prioridad} />
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium"
                style={{
                  color,
                  borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
                  background: `color-mix(in srgb, ${color} 12%, transparent)`,
                }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: color }}
                />
                {ticket.estado}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                <CalendarDays className="size-3.5" />
                {fechaLarga(ticket.fecha_creacion)}
              </span>
            </motion.div>

            <motion.h1
              className="font-display text-[26px] font-semibold leading-[1.12] tracking-[-0.03em] text-foreground sm:text-[32px]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, delay: 0.1, ease: EASE }}
            >
              {capitalizarPrimera(ticket.titulo)}
            </motion.h1>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <UserRound className="size-4" />
              Solicitante:{' '}
              <span className="text-foreground">
                {ticket.solicitante || 'Cliente interno'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Personal
              </span>
              {ticket.tecnicos_asignados.length ? (
                ticket.tecnicos_asignados.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-subtle py-0.5 pl-0.5 pr-2 text-xs font-medium text-foreground"
                    title={t.rol}
                  >
                    <Avatar nombre={t.nombre} className="size-5" />
                    {t.nombre}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Sin asignar</span>
              )}
            </div>
          </div>

          <motion.div
            className="w-full shrink-0 rounded-xl border bg-subtle p-4 lg:w-64"
            style={{
              borderColor: `color-mix(in srgb, ${color} 22%, var(--border))`,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.14, ease: EASE }}
          >
            <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <Activity className="size-3.5" style={{ color }} />
              Estado general
            </label>
            <Select
              className="mt-2"
              value={ticket.estado}
              disabled={saving}
              ariaLabel="Estado general del ticket"
              options={ESTADO_OPTS}
              onValueChange={(v) => onEstadoChange(v as EstadoTicket)}
            />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
