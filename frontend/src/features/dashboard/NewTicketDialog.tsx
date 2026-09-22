import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ActionButton } from '@/components/ui/action-button'
import { Input, Label, Textarea } from '@/components/ui/field'
import { Select } from '@/components/ui/select'
import { useCrearTicketIA, useTecnicos } from '@/hooks/queries'
import type { Prioridad } from '@/lib/types'
import { TecnicoMultiSelect } from './TecnicoMultiSelect'

const INVALID = '__invalid__'

const schema = z.object({
  titulo: z.string().trim().min(3, 'Mínimo 3 caracteres'),
  solicitante: z.string().trim().min(2, 'Indicá el solicitante'),
  descripcion: z.string().trim().min(10, 'Describí el requerimiento (mín. 10)'),
  prioridad: z.enum(['Alta', 'Media', 'Baja']),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
}

export function NewTicketDialog({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { data: tecnicos = [] } = useTecnicos()
  const [tecnicosIds, setTecnicosIds] = useState<number[]>([])
  const mutation = useCrearTicketIA()

  const {
    register,
    control,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { prioridad: 'Media' as Prioridad },
  })

  const createdId = useRef<number | null>(null)

  useEffect(() => {
    if (open) {
      reset({ prioridad: 'Media' })
      setTecnicosIds([])
      createdId.current = null
    }
  }, [open, reset])

  const crear = async () => {
    const ok = await trigger()
    if (!ok) throw new Error(INVALID)
    const res = await mutation.mutateAsync({
      ...getValues(),
      tecnicos_ids: tecnicosIds,
    })
    createdId.current = res.ticket_id
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Sparkles />}
      title="Nuevo ticket con desglose IA"
      description="Genera automáticamente subtareas estructuradas"
      className="max-w-2xl"
    >
      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label htmlFor="nt-titulo">Título del requerimiento</Label>
            <Input
              id="nt-titulo"
              placeholder="Ej: Migración de servidor de dominio"
              {...register('titulo')}
            />
            {errors.titulo && (
              <p className="mt-1 text-xs text-danger">{errors.titulo.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="nt-solicitante">Solicitante</Label>
            <Input
              id="nt-solicitante"
              placeholder="Ej: Juan Pérez"
              {...register('solicitante')}
            />
            {errors.solicitante && (
              <p className="mt-1 text-xs text-danger">{errors.solicitante.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="nt-desc">Descripción general</Label>
          <Textarea
            id="nt-desc"
            rows={3}
            placeholder="Describí los requerimientos del proyecto…"
            {...register('descripcion')}
          />
          {errors.descripcion && (
            <p className="mt-1 text-xs text-danger">{errors.descripcion.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Técnicos asignados</Label>
            <TecnicoMultiSelect
              tecnicos={tecnicos}
              value={tecnicosIds}
              onChange={setTecnicosIds}
            />
          </div>
          <div>
            <Label>Prioridad</Label>
            <Controller
              control={control}
              name="prioridad"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  ariaLabel="Prioridad"
                  options={[
                    { value: 'Alta', label: 'Alta' },
                    { value: 'Media', label: 'Media' },
                    { value: 'Baja', label: 'Baja' },
                  ]}
                />
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <ActionButton
            onAction={crear}
            onSuccess={() => {
              onClose()
              navigate(`/ticket/${createdId.current}`)
            }}
            onError={(e) => {
              const msg = (e as Error)?.message
              if (msg && msg !== INVALID)
                toast.error(msg || 'Error al procesar el ticket.')
            }}
            pendingLabel="Procesando…"
            successLabel="Ticket creado"
          >
            <Sparkles />
            Crear y procesar con IA
          </ActionButton>
        </div>
      </form>
    </Modal>
  )
}
