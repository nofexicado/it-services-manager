import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useUi } from '@/ui/ui-context'
import { useKpis, useTecnicos, useTickets } from '@/hooks/queries'
import { Button } from '@/components/ui/button'
import { KpiCards, type KpiKey } from './KpiCards'
import { KpiDialog } from './KpiDialog'
import { TicketsTable } from './TicketsTable'

export function DashboardPage() {
  const { openNewTicket } = useUi()
  const tickets = useTickets()
  const tecnicos = useTecnicos()
  const kpis = useKpis()

  const [kpiOpen, setKpiOpen] = useState<KpiKey | null>(null)

  const ticketList = tickets.data ?? []
  const tecnicoList = tecnicos.data ?? []

  const kpiValues = kpis.data
    ? {
        total: kpis.data.total_tickets,
        pendientes: kpis.data.pendientes,
        progreso: kpis.data.en_progreso,
        tecnicos: tecnicoList.length || kpis.data.tecnicos_activos,
      }
    : undefined

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-foreground">
            Panel de control
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Métricas y seguimiento de tickets de operaciones IT
          </p>
        </div>
        <Button onClick={openNewTicket}>
          <Plus />
          <span className="hidden sm:inline">Nuevo ticket</span>
        </Button>
      </div>

      <KpiCards values={kpiValues} loading={kpis.isLoading} onSelect={setKpiOpen} />

      <TicketsTable
        tickets={ticketList}
        tecnicos={tecnicoList}
        loading={tickets.isLoading}
      />

      <KpiDialog
        which={kpiOpen}
        onClose={() => setKpiOpen(null)}
        tickets={ticketList}
        tecnicos={tecnicoList}
      />
    </div>
  )
}
