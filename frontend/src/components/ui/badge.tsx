import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { EstadoSubtarea, EstadoTicket, Prioridad } from '@/lib/types'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none tracking-[-0.005em] whitespace-nowrap ring-1 ring-inset',
  {
    variants: {
      tone: {
        neutral: 'bg-muted text-muted-foreground ring-border-strong/60',
        success: 'bg-success-bg text-success ring-success-border',
        warning: 'bg-warning-bg text-warning ring-warning-border',
        info: 'bg-info-bg text-info ring-info-border',
        danger: 'bg-danger-bg text-danger ring-danger-border',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

type Tone = NonNullable<VariantProps<typeof badgeVariants>['tone']>

/** Puntito de estado con halo — lee como un "led" de estado. */
function StatusDot({ pulse }: { pulse?: boolean }) {
  return (
    <span className="relative flex size-1.5">
      {pulse && (
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-70" />
      )}
      <span
        className="relative inline-flex size-1.5 rounded-full bg-current"
        style={{
          boxShadow: '0 0 0 3px color-mix(in srgb, currentColor 16%, transparent)',
        }}
      />
    </span>
  )
}

export function Badge({
  className,
  tone,
  dot,
  pulse,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & { dot?: boolean; pulse?: boolean }) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <StatusDot pulse={pulse} />}
      {children}
    </span>
  )
}

const ESTADO_TICKET: Record<EstadoTicket, Tone> = {
  Pendiente: 'warning',
  'En Progreso': 'info',
  'En Espera': 'neutral',
  Resuelto: 'success',
}

const ESTADO_SUBTAREA: Record<EstadoSubtarea, Tone> = {
  Pendiente: 'warning',
  'En Progreso': 'info',
  Completada: 'success',
}

const PRIORIDAD: Record<Prioridad, Tone> = {
  Alta: 'danger',
  Media: 'warning',
  Baja: 'success',
}

export function EstadoBadge({ estado }: { estado: EstadoTicket }) {
  return (
    <Badge tone={ESTADO_TICKET[estado] ?? 'neutral'} dot pulse={estado === 'En Progreso'}>
      {estado}
    </Badge>
  )
}

export function EstadoSubtareaBadge({ estado }: { estado: EstadoSubtarea }) {
  return (
    <Badge
      tone={ESTADO_SUBTAREA[estado] ?? 'neutral'}
      dot
      pulse={estado === 'En Progreso'}
    >
      {estado}
    </Badge>
  )
}

export function PrioridadBadge({ prioridad }: { prioridad: Prioridad }) {
  return <Badge tone={PRIORIDAD[prioridad] ?? 'neutral'}>{prioridad}</Badge>
}
