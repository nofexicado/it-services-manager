import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as Accordion from '@radix-ui/react-accordion'
import { ArrowLeft, ListChecks, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import {
  useCambiarEstadoTicket,
  useTecnicos,
  useTicket,
} from '@/hooks/queries'
import type { EstadoTicket } from '@/lib/types'
import { buttonVariants } from '@/components/ui/button'
import { Card, EmptyState, Skeleton } from '@/components/ui/misc'
import { EstadoBadge } from '@/components/ui/badge'
import { TicketHero } from './TicketHero'
import { ProgressChart } from './ProgressChart'
import { SubtaskCard } from './SubtaskCard'

export function TicketPage() {
  const { id = '' } = useParams()
  const ticketId = Number(id)
  const { data: ticket, isLoading, isError } = useTicket(id)
  const { data: tecnicos = [] } = useTecnicos()
  const estadoMutation = useCambiarEstadoTicket(ticketId)

  const allIds = useMemo(
    () => (ticket?.subtareas ?? []).map((s) => String(s.id)),
    [ticket],
  )
  const [openItems, setOpenItems] = useState<string[]>([])
  useEffect(() => setOpenItems(allIds), [allIds])

  const cambiarEstado = (estado: EstadoTicket) =>
    estadoMutation.mutate(estado, {
      onError: (e: Error) =>
        toast.error(e.message || 'Error al actualizar el estado'),
    })

  const completadas =
    ticket?.subtareas.filter((s) => s.estado === 'Completada').length ?? 0
  const totalSub = ticket?.subtareas.length ?? 0
  const allOpen = openItems.length === allIds.length && allIds.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <ArrowLeft />
          Volver al panel
        </Link>
        {ticket && <EstadoBadge estado={ticket.estado} />}
      </div>

      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-52 w-full" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      )}

      {isError && (
        <Card>
          <EmptyState
            title="Ticket no encontrado"
            hint="El ticket no existe o no se pudo cargar."
          />
        </Card>
      )}

      {ticket && (
        <>
          <TicketHero
            ticket={ticket}
            onEstadoChange={cambiarEstado}
            saving={estadoMutation.isPending}
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card className="space-y-4 p-6">
                <div>
                  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Requerimiento del usuario
                  </h3>
                  <p className="rounded-lg border border-border bg-subtle p-3.5 text-sm leading-relaxed text-foreground">
                    {ticket.descripcion_original || 'Sin especificación.'}
                  </p>
                </div>
                <div>
                  <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
                    <Sparkles className="size-4" />
                    Análisis táctico IA
                  </h3>
                  <p className="rounded-lg border border-primary/20 bg-primary/[0.06] p-3.5 text-sm leading-relaxed text-foreground">
                    {ticket.descripcion_gemini || 'Análisis no disponible.'}
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-[-0.02em] text-foreground">
                    <ListChecks className="size-4 text-primary" />
                    Desglose de subtareas técnicas
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="tnum text-xs text-muted-foreground">
                      {completadas}/{totalSub} completadas
                    </span>
                    {totalSub > 1 && (
                      <button
                        onClick={() => setOpenItems(allOpen ? [] : allIds)}
                        className="text-xs font-medium text-primary transition-opacity hover:opacity-80"
                      >
                        {allOpen ? 'Colapsar todo' : 'Expandir todo'}
                      </button>
                    )}
                  </div>
                </div>

                {totalSub === 0 ? (
                  <p className="pt-4 text-xs italic text-muted-foreground">
                    No hay subtareas registradas para este ticket.
                  </p>
                ) : (
                  <Accordion.Root
                    type="multiple"
                    value={openItems}
                    onValueChange={setOpenItems}
                    className="space-y-4 pt-4"
                  >
                    {ticket.subtareas.map((s, i) => (
                      <SubtaskCard
                        key={s.id}
                        index={i}
                        ticketId={ticketId}
                        subtarea={s}
                        tecnicos={tecnicos}
                      />
                    ))}
                  </Accordion.Root>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <ProgressChart subtareas={ticket.subtareas} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
