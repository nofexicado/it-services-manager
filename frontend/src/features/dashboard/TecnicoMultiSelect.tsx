import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Tecnico } from '@/lib/types'

interface Props {
  tecnicos: Tecnico[]
  value: number[]
  onChange: (ids: number[]) => void
}

export function TecnicoMultiSelect({ tecnicos, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id])

  const seleccionados = tecnicos.filter((t) => value.includes(t.id))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-card px-2 py-1.5 text-left text-sm shadow-xs outline-none transition-[border-color,box-shadow] duration-150 hover:border-ring/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35"
      >
        {seleccionados.length === 0 ? (
          <span className="px-1 text-muted-foreground">Seleccionar técnicos…</span>
        ) : (
          seleccionados.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
            >
              {t.nombre}
              <X
                className="size-3 cursor-pointer transition-opacity hover:opacity-70"
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(t.id)
                }}
              />
            </span>
          ))
        )}
        <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="animate-selectin absolute z-20 mt-1.5 max-h-56 w-full origin-top overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
          {tecnicos.map((t) => {
            const active = value.includes(t.id)
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted',
                  active && 'bg-muted',
                )}
              >
                <span className="flex flex-col">
                  <span className="font-medium text-foreground">{t.nombre}</span>
                  <span className="text-[11px] text-muted-foreground">{t.rol}</span>
                </span>
                {active && <Check className="size-4 text-primary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
