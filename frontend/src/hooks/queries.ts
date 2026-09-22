import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { NuevoTicketPayload } from '@/lib/types'

export const qk = {
  kpis: ['kpis'] as const,
  tecnicos: ['tecnicos'] as const,
  tickets: ['tickets'] as const,
  ticket: (id: number | string) => ['ticket', String(id)] as const,
}

export function useKpis() {
  return useQuery({ queryKey: qk.kpis, queryFn: api.getKpis })
}

export function useTecnicos() {
  return useQuery({ queryKey: qk.tecnicos, queryFn: api.getTecnicos, staleTime: 60_000 })
}

export function useTickets() {
  return useQuery({ queryKey: qk.tickets, queryFn: api.getTickets })
}

export function useTicket(id: number | string) {
  return useQuery({
    queryKey: qk.ticket(id),
    queryFn: () => api.getTicket(id),
    enabled: id != null && id !== '',
  })
}

export function useCrearTicketIA() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: NuevoTicketPayload) => api.crearTicketIA(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.tickets })
      qc.invalidateQueries({ queryKey: qk.kpis })
    },
  })
}

export function useCambiarEstadoTicket(ticketId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (estado: string) => api.cambiarEstadoTicket(ticketId, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.ticket(ticketId) })
      qc.invalidateQueries({ queryKey: qk.tickets })
      qc.invalidateQueries({ queryKey: qk.kpis })
    },
  })
}

export function useEditarSubtarea(ticketId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      id: number
      titulo?: string
      descripcion?: string
      tiempo_estimado_minutos?: number
    }) => api.editarSubtarea(vars.id, vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.ticket(ticketId) }),
  })
}

export function useActualizarSubtarea(ticketId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.actualizarSubtarea,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.ticket(ticketId) })
      qc.invalidateQueries({ queryKey: qk.tickets })
      qc.invalidateQueries({ queryKey: qk.kpis })
    },
  })
}

export function useAgregarComentario(ticketId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) => api.agregarComentario(ticketId, form),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.ticket(ticketId) }),
  })
}
