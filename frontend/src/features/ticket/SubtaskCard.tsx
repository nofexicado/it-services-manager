import { useState } from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import {
  Check,
  ChevronRight,
  Clock,
  MessageSquarePlus,
  Pencil,
  UserRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@/auth/auth-context'
import { useEditarSubtarea, useActualizarSubtarea } from '@/hooks/queries'
import type { EstadoSubtarea, Subtarea, Tecnico } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ActionButton } from '@/components/ui/action-button'
import { Input, Textarea } from '@/components/ui/field'
import { Select } from '@/components/ui/select'
import { EvidenceDrawer } from './EvidenceDrawer'

const INVALID = '__invalid__'

const ESTADO_OPTS = (['Pendiente', 'En Progreso', 'Completada'] as const).map(
  (e) => ({ value: e, label: e }),
)

const STRIPE: Record<EstadoSubtarea, string> = {
  Pendiente: 'bg-warning',
  'En Progreso': 'bg-info',
  Completada: 'bg-success',
}
const DOT: Record<EstadoSubtarea, string> = {
  Pendiente: 'bg-warning',
  'En Progreso': 'bg-info',
  Completada: 'bg-success',
}

const SIN_ASIGNAR = '__none__'

interface Props {
  ticketId: number
  subtarea: Subtarea
  tecnicos: Tecnico[]
  index: number
}

export function SubtaskCard({ ticketId, subtarea, tecnicos, index }: Props) {
  const { requireAuth } = useAuth()
  const editar = useEditarSubtarea(ticketId)
  const actualizar = useActualizarSubtarea(ticketId)

  const [editing, setEditing] = useState(false)
  const [titulo, setTitulo] = useState(subtarea.titulo)
  const [descripcion, setDescripcion] = useState(subtarea.descripcion)
  const [sheetOpen, setSheetOpen] = useState(false)

  const tecnicoActual = String(subtarea.tecnicos[0]?.id ?? SIN_ASIGNAR)
  const evidencias = subtarea.comentarios.length + subtarea.adjuntos.length

  const guardarEdicion = async () => {
    if (!requireAuth('Iniciá sesión para registrar cambios.'))
      throw new Error(INVALID)
    if (!titulo.trim()) {
      toast.error('El título no puede quedar vacío.')
      throw new Error(INVALID)
    }
    await editar.mutateAsync({
      id: subtarea.id,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
    })
  }

  const cambiarEstado = (estado: string) =>
    actualizar.mutate({ subtarea_id: subtarea.id, estado })

  const asignar = (tecnicoId: string) =>
    actualizar.mutate({
      subtarea_id: subtarea.id,
      tecnico_id:
        tecnicoId && tecnicoId !== SIN_ASIGNAR ? Number(tecnicoId) : null,
    })

  return (
    <Accordion.Item
      value={String(subtarea.id)}
      className="animate-rise relative overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-[border-color,box-shadow] duration-150 data-[state=open]:shadow-sm"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <span
        className={cn('absolute inset-y-0 left-0 w-[3px]', STRIPE[subtarea.estado])}
      />

      <Accordion.Header className="flex items-center gap-3 py-3.5 pl-5 pr-4">
        <Accordion.Trigger className="group/trg flex min-w-0 flex-1 items-center gap-3 text-left outline-none">
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/trg:rotate-90" />
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs font-semibold text-muted-foreground">
            {index + 1}
          </span>
          <h4 className="truncate text-sm font-semibold tracking-[-0.01em] text-foreground">
            {subtarea.titulo}
          </h4>
        </Accordion.Trigger>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              'hidden size-1.5 rounded-full sm:block',
              DOT[subtarea.estado],
            )}
          />
          <Select
            value={subtarea.estado}
            onValueChange={cambiarEstado}
            ariaLabel="Estado de la subtarea"
            size="sm"
            className="w-[8.5rem]"
            options={ESTADO_OPTS}
          />
        </div>
      </Accordion.Header>

      <Accordion.Content className="accordion-content overflow-hidden">
        <div className="space-y-4 px-5 pb-5 pl-[4.25rem] pt-1">
          {editing ? (
            <div className="space-y-2">
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="h-8"
                autoFocus
              />
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  <X />
                  Cancelar
                </Button>
                <ActionButton
                  size="sm"
                  onAction={guardarEdicion}
                  onSuccess={() => setEditing(false)}
                  onError={(e) => {
                    const m = (e as Error)?.message
                    if (m && m !== INVALID) toast.error(m)
                  }}
                  successLabel="Guardado"
                >
                  <Check />
                  Guardar cambios
                </ActionButton>
              </div>
            </div>
          ) : (
            <div className="group/desc flex items-start gap-2">
              <p className="flex-1 text-[13px] leading-relaxed text-muted-foreground">
                {subtarea.descripcion}
              </p>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 transition-opacity group-hover/desc:opacity-100"
                onClick={() => {
                  setTitulo(subtarea.titulo)
                  setDescripcion(subtarea.descripcion)
                  setEditing(true)
                }}
                title="Editar subtarea"
              >
                <Pencil />
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-border pt-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 shrink-0 text-muted-foreground" />
              <Select
                value={tecnicoActual}
                onValueChange={asignar}
                ariaLabel="Técnico asignado"
                size="sm"
                className="w-60"
                options={[
                  { value: SIN_ASIGNAR, label: '— Sin asignar —' },
                  ...tecnicos.map((t) => ({
                    value: String(t.id),
                    label: `${t.nombre} · ${t.rol}`,
                  })),
                ]}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {subtarea.tiempo_estimado_minutos}m est.
              </span>
              <button
                onClick={() => setSheetOpen(true)}
                data-lift
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-xs transition-[transform,border-color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-px hover:border-ring/50 hover:bg-muted active:scale-[0.97] active:duration-100"
              >
                <MessageSquarePlus className="size-3.5 text-primary" />
                Evidencias
                {evidencias > 0 && (
                  <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/12 px-1 text-[10px] font-semibold text-primary">
                    {evidencias}
                  </span>
                )}
              </button>
            </div>
          </div>

        </div>
      </Accordion.Content>

      <EvidenceDrawer
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        ticketId={ticketId}
        subtarea={subtarea}
      />
    </Accordion.Item>
  )
}
