import { useRef, useState } from 'react'
import { Drawer } from 'vaul'
import { Download, FileText, Paperclip, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/auth/auth-context'
import { fechaLarga } from '@/lib/utils'
import { useAgregarComentario } from '@/hooks/queries'
import type { Subtarea } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ActionButton } from '@/components/ui/action-button'
import { Textarea } from '@/components/ui/field'
import { Avatar } from '@/components/ui/misc'

const INVALID = '__invalid__'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketId: number
  subtarea: Subtarea
}

type Evento =
  | { tipo: 'comentario'; fecha: string; data: Subtarea['comentarios'][number] }
  | { tipo: 'adjunto'; fecha: string; data: Subtarea['adjuntos'][number] }

export function EvidenceDrawer({ open, onOpenChange, ticketId, subtarea }: Props) {
  const { requireAuth } = useAuth()
  const mutation = useAgregarComentario(ticketId)
  const [texto, setTexto] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const eventos: Evento[] = [
    ...subtarea.comentarios.map(
      (c): Evento => ({ tipo: 'comentario', fecha: c.fecha, data: c }),
    ),
    ...subtarea.adjuntos.map(
      (a): Evento => ({ tipo: 'adjunto', fecha: a.fecha, data: a }),
    ),
  ].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  const publicar = async () => {
    const user = requireAuth('Iniciá sesión para registrar cambios.')
    if (!user) throw new Error(INVALID)
    if (!texto.trim()) {
      toast.error('Escribí un comentario o reporte de avance.')
      throw new Error(INVALID)
    }
    const form = new FormData()
    form.append('autor', user.nombre)
    form.append('comentario', texto.trim())
    form.append('subtarea_id', String(subtarea.id))
    if (archivo) form.append('archivo', archivo)
    await mutation.mutateAsync(form)
  }

  const limpiar = () => {
    setTexto('')
    setArchivo(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div className="min-w-0">
              <Drawer.Title className="text-sm font-semibold tracking-[-0.01em] text-foreground">
                Avances y evidencias
              </Drawer.Title>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                {subtarea.titulo}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              aria-label="Cerrar"
            >
              <X />
            </Button>
          </div>

          <div className="relative flex-1 overflow-y-auto p-5">
            {eventos.length === 0 ? (
              <p className="text-xs italic text-muted-foreground">
                Todavía no hay avances registrados en esta subtarea.
              </p>
            ) : (
              <div className="relative flex flex-col gap-4">
                <span className="absolute bottom-3 left-[13px] top-3 w-px bg-border" />
                {eventos.map((ev, i) => (
                  <div
                    key={`${ev.tipo}-${ev.data.id ?? i}`}
                    className="animate-rise relative grid grid-cols-[27px_1fr] gap-3.5"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    {ev.tipo === 'comentario' ? (
                      <Avatar
                        nombre={ev.data.autor}
                        className="z-10 size-[27px] ring-[3px] ring-card"
                      />
                    ) : (
                      <span className="z-10 flex size-[27px] items-center justify-center rounded-lg border border-border-strong bg-subtle ring-[3px] ring-card">
                        <FileText className="size-3.5 text-muted-foreground" />
                      </span>
                    )}

                    <div className="rounded-lg border border-border bg-subtle p-3">
                      <div className="mb-1 flex items-baseline justify-between gap-2">
                        <span className="text-xs font-semibold text-primary">
                          {ev.tipo === 'comentario' ? ev.data.autor : 'Adjunto'}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {fechaLarga(ev.fecha)}
                        </span>
                      </div>

                      {ev.tipo === 'comentario' ? (
                        <p className="text-[13px] leading-relaxed text-foreground">
                          {ev.data.comentario}
                        </p>
                      ) : (
                        <a
                          href={ev.data.url_archivo}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center gap-3"
                        >
                          {ev.data.tipo === 'Imagen' ? (
                            <img
                              src={ev.data.url_archivo}
                              alt={ev.data.nombre_archivo}
                              className="size-12 rounded-md border border-border object-cover"
                            />
                          ) : (
                            <span className="flex size-12 items-center justify-center rounded-md border border-border bg-card">
                              <FileText className="size-5 text-muted-foreground" />
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-mono text-xs text-foreground">
                              {ev.data.nombre_archivo}
                            </span>
                          </span>
                          <Download className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-border p-4">
            <Textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={3}
              placeholder="Escribí el reporte de avance o solución parcial…"
            />
            <div className="flex items-center justify-between gap-2">
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                <Paperclip className="size-3.5" />
                <span className="max-w-[10rem] truncate">
                  {archivo ? archivo.name : 'Adjuntar archivo'}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                />
              </label>
              <ActionButton
                size="sm"
                onAction={publicar}
                onSuccess={limpiar}
                onError={(e) => {
                  const m = (e as Error)?.message
                  if (m && m !== INVALID)
                    toast.error(m || 'No se pudo publicar la evidencia.')
                }}
                successLabel="Publicado"
              >
                <Send />
                Publicar
              </ActionButton>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
