import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronRight, Inbox, Search } from 'lucide-react'
import { capitalizarPrimera } from '@/lib/utils'
import type { Tecnico, TicketListItem } from '@/lib/types'
import { Card, EmptyState, Avatar } from '@/components/ui/misc'
import { EstadoBadge, PrioridadBadge } from '@/components/ui/badge'
import { Input } from '@/components/ui/field'
import { Select } from '@/components/ui/select'

function progreso(t: TicketListItem) {
  const total = Number(t.total_subtareas || 0)
  const comp = Number(t.subtareas_completadas || 0)
  return total > 0 ? Math.round((comp / total) * 100) : 0
}

const col = createColumnHelper<TicketListItem>()

interface Props {
  tickets: TicketListItem[]
  tecnicos: Tecnico[]
  loading: boolean
}

export function TicketsTable({ tickets, tecnicos, loading }: Props) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([])
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState('TODOS')
  const [prioridad, setPrioridad] = useState('TODOS')
  const [tecnico, setTecnico] = useState('TODOS')
  const searchRef = useRef<HTMLInputElement>(null)

  // "/" enfoca el buscador (si no estás escribiendo en otro campo)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey) return
      const el = document.activeElement
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el as HTMLElement | null)?.isContentEditable
      if (typing) return
      e.preventDefault()
      searchRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim()
    return tickets.filter((t) => {
      const mQ =
        !query ||
        t.codigo_ticket.toLowerCase().includes(query) ||
        t.titulo.toLowerCase().includes(query) ||
        t.solicitante.toLowerCase().includes(query)
      const mE =
        estado === 'ABIERTOS'
          ? t.estado !== 'Resuelto'
          : estado === 'TODOS' || t.estado === estado
      const mP = prioridad === 'TODOS' || t.prioridad === prioridad
      const mT =
        tecnico === 'TODOS' ||
        (Array.isArray(t.tecnicos_asignados) &&
          t.tecnicos_asignados.some((x) => x.id === Number(tecnico)))
      return mQ && mE && mP && mT
    })
  }, [tickets, q, estado, prioridad, tecnico])

  const columns = useMemo(
    () => [
      col.accessor('codigo_ticket', {
        header: 'ID',
        cell: (c) => (
          <span className="font-mono text-xs font-semibold text-primary">
            {c.getValue()}
          </span>
        ),
      }),
      col.accessor('titulo', {
        header: 'Requerimiento',
        cell: (c) => (
          <div className="max-w-xs">
            <p className="truncate text-sm font-medium text-foreground">
              {capitalizarPrimera(c.getValue())}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              Solicita: {c.row.original.solicitante}
            </p>
          </div>
        ),
      }),
      col.accessor('estado', {
        header: 'Estado',
        cell: (c) => (
          <div className="flex flex-col items-start gap-1">
            <EstadoBadge estado={c.getValue()} />
            <PrioridadBadge prioridad={c.row.original.prioridad} />
          </div>
        ),
      }),
      col.accessor((t) => progreso(t), {
        id: 'progreso',
        header: 'Progreso',
        cell: (c) => {
          const pct = c.getValue() as number
          return (
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
              <span className="tnum text-xs text-muted-foreground">{pct}%</span>
            </div>
          )
        },
      }),
      col.accessor((t) => t.tecnicos_asignados, {
        id: 'personal',
        header: 'Personal',
        enableSorting: false,
        cell: (c) => {
          const tecs = c.getValue() as TicketListItem['tecnicos_asignados']
          if (!tecs?.length)
            return <span className="text-xs text-muted-foreground">Sin asignar</span>
          return (
            <div className="flex -space-x-1.5">
              {tecs.slice(0, 4).map((x) => (
                <Avatar
                  key={x.id}
                  nombre={x.nombre}
                  className="size-6 ring-2 ring-card"
                />
              ))}
              {tecs.length > 4 && (
                <span className="flex size-6 items-center justify-center rounded-lg bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-card">
                  +{tecs.length - 4}
                </span>
              )}
            </div>
          )
        },
      }),
      col.display({
        id: 'chevron',
        header: '',
        cell: () => (
          <ChevronRight className="size-4 text-muted-foreground/60 transition-transform group-hover/row:translate-x-0.5 group-hover/row:text-muted-foreground" />
        ),
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar ID, título o solicitante…"
            className="pl-8 pr-9"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border-strong bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
            /
          </kbd>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:flex sm:w-auto">
          <Select
            value={estado}
            onValueChange={setEstado}
            ariaLabel="Filtrar por estado"
            className="sm:w-40"
            options={[
              { value: 'TODOS', label: 'Estado: todos' },
              { value: 'ABIERTOS', label: 'Solo abiertos' },
              { value: 'Pendiente', label: 'Pendiente' },
              { value: 'En Progreso', label: 'En progreso' },
              { value: 'En Espera', label: 'En espera' },
              { value: 'Resuelto', label: 'Resuelto' },
            ]}
          />
          <Select
            value={prioridad}
            onValueChange={setPrioridad}
            ariaLabel="Filtrar por prioridad"
            className="sm:w-40"
            options={[
              { value: 'TODOS', label: 'Prioridad: todas' },
              { value: 'Alta', label: 'Alta' },
              { value: 'Media', label: 'Media' },
              { value: 'Baja', label: 'Baja' },
            ]}
          />
          <Select
            value={tecnico}
            onValueChange={setTecnico}
            ariaLabel="Filtrar por técnico"
            className="sm:w-44"
            options={[
              { value: 'TODOS', label: 'Técnico: todos' },
              ...tecnicos.map((t) => ({ value: String(t.id), label: t.nombre })),
            ]}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {h.isPlaceholder ? null : h.column.getCanSort() ? (
                      <button
                        className="flex items-center gap-1 transition-colors hover:text-foreground"
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        <ArrowUpDown className="size-3 opacity-50" />
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-8 animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))}
            {!loading &&
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/ticket/${row.original.id}`)}
                  className="group/row cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-subtle"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>

        {!loading && table.getRowModel().rows.length === 0 && (
          <EmptyState
            icon={<Inbox />}
            title="Sin resultados"
            hint="No hay tickets que coincidan con los filtros actuales."
          />
        )}
      </div>
    </Card>
  )
}
