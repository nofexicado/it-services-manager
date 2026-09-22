import { motion } from 'motion/react'
import {
  ClipboardList,
  Loader2,
  Ticket,
  UserCog,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CountUp, Skeleton } from '@/components/ui/misc'

export type KpiKey = 'total' | 'pendientes' | 'tecnicos' | 'progreso'

interface KpiDef {
  key: KpiKey
  label: string
  hint: string
  icon: LucideIcon
  chip: string
}

const DEFS: KpiDef[] = [
  {
    key: 'total',
    label: 'Tickets totales',
    hint: 'Historial completo',
    icon: Ticket,
    chip: 'bg-primary/12 text-primary',
  },
  {
    key: 'pendientes',
    label: 'Pendientes',
    hint: 'Requieren intervención',
    icon: ClipboardList,
    chip: 'bg-warning-bg text-warning',
  },
  {
    key: 'progreso',
    label: 'En progreso',
    hint: 'Trabajos actuales',
    icon: Loader2,
    chip: 'bg-info-bg text-info',
  },
  {
    key: 'tecnicos',
    label: 'Técnicos activos',
    hint: 'Personal en red',
    icon: UserCog,
    chip: 'bg-success-bg text-success',
  },
]

interface Props {
  values: Record<KpiKey, number> | undefined
  loading: boolean
  onSelect: (key: KpiKey) => void
}

export function KpiCards({ values, loading, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {DEFS.map((d, i) => {
        const Icon = d.icon
        return (
          <motion.button
            key={d.key}
            type="button"
            data-lift
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => onSelect(d.key)}
            className={cn(
              'group relative overflow-hidden rounded-xl border border-border bg-card p-4 text-left shadow-xs',
              'transition-[transform,box-shadow,border-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
              'hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md',
              'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
            )}
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {d.label}
              </span>
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-lg [&_svg]:size-4',
                  d.chip,
                )}
              >
                <Icon />
              </span>
            </div>
            {loading || !values ? (
              <Skeleton className="mt-2.5 h-8 w-12" />
            ) : (
              <p className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.02em] text-foreground">
                <CountUp value={values[d.key]} />
              </p>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">{d.hint}</p>
          </motion.button>
        )
      })}
    </div>
  )
}
