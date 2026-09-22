import { BarChart3 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { capitalizarPrimera } from '@/lib/utils'
import type { Tecnico, TicketListItem } from '@/lib/types'
import type { KpiKey } from './KpiCards'

const TITULOS: Record<KpiKey, string> = {
  total: 'Resumen de tickets',
  pendientes: 'Estado de subtareas',
  progreso: 'Control de trabajos',
  tecnicos: 'Técnicos en sistema',
}

interface Props {
  which: KpiKey | null
  onClose: () => void
  tickets: TicketListItem[]
  tecnicos: Tecnico[]
}

export function KpiDialog({ which, onClose, tickets, tecnicos }: Props) {
  return (
    <Modal
      open={which !== null}
      onClose={onClose}
      icon={<BarChart3 />}
      title={which ? TITULOS[which] : ''}
    >
      <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
        {which === 'total' &&
          tickets.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-subtle px-3 py-2"
            >
              <div className="min-w-0">
                <span className="font-mono text-xs font-semibold text-primary">
                  {t.codigo_ticket}
                </span>
                <span className="ml-2 truncate text-sm text-foreground">
                  {capitalizarPrimera(t.titulo)}
                </span>
              </div>
              <Badge>{t.estado}</Badge>
            </div>
          ))}

        {which === 'pendientes' &&
          (() => {
            let total = 0
            let comp = 0
            tickets.forEach((t) => {
              total += Number(t.total_subtareas || 0)
              comp += Number(t.subtareas_completadas || 0)
            })
            return (
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg border border-border bg-subtle p-4">
                  <p className="text-xl font-semibold text-warning">
                    {total - comp}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Pendientes</p>
                </div>
                <div className="rounded-lg border border-border bg-subtle p-4">
                  <p className="text-xl font-semibold text-success">{comp}</p>
                  <p className="text-[11px] text-muted-foreground">Completadas</p>
                </div>
              </div>
            )
          })()}

        {which === 'progreso' && (
          <div className="rounded-lg border border-border bg-subtle p-6 text-center">
            <p className="text-2xl font-semibold text-info">
              {tickets.filter((t) => t.estado === 'En Progreso').length}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Tickets siendo atendidos actualmente
            </p>
          </div>
        )}

        {which === 'tecnicos' &&
          tecnicos.map((tec) => (
            <div
              key={tec.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-subtle px-3 py-2"
            >
              <span className="text-sm font-medium text-foreground">
                {tec.nombre}
              </span>
              <Badge tone="info">{tec.rol}</Badge>
            </div>
          ))}
      </div>
    </Modal>
  )
}
