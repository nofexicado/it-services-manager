import type {
  Kpis,
  LoginResponse,
  NuevoTicketPayload,
  Tecnico,
  TicketDetalle,
  TicketListItem,
} from './types'

/** En dev, Vite proxea /api y /uploads a localhost:3000.
 *  En prod, el mismo Express sirve el build => rutas relativas. */
const BASE = ''

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers:
      init?.body instanceof FormData
        ? undefined
        : { 'Content-Type': 'application/json' },
    ...init,
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && 'error' in data && (data as { error: string }).error) ||
      `Error ${res.status}`
    throw new ApiError(msg, res.status)
  }
  return data as T
}

export const api = {
  login: (username: string, password: string) =>
    request<LoginResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getKpis: () => request<Kpis>('/api/kpis'),
  getTecnicos: () => request<Tecnico[]>('/api/tecnicos'),
  getTickets: () => request<TicketListItem[]>('/api/tickets'),
  getTicket: (id: number | string) => request<TicketDetalle>(`/api/tickets/${id}`),

  crearTicketIA: (payload: NuevoTicketPayload) =>
    request<{ success: boolean; ticket_id: number }>('/api/tickets/ia-sugerencia', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cambiarEstadoTicket: (id: number, estado: string) =>
    request<{ success: boolean }>(`/api/tickets/${id}/estado`, {
      method: 'POST',
      body: JSON.stringify({ estado }),
    }),

  reasignarTecnicos: (id: number, tecnicos_ids: number[]) =>
    request<{ success: boolean }>(`/api/tickets/${id}/tecnicos`, {
      method: 'POST',
      body: JSON.stringify({ tecnicos_ids }),
    }),

  editarSubtarea: (
    id: number,
    body: { titulo?: string; descripcion?: string; tiempo_estimado_minutos?: number },
  ) =>
    request<{ success: boolean }>(`/api/subtareas/${id}/editar`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  actualizarSubtarea: (body: {
    subtarea_id: number
    estado?: string
    minutos?: number
    tecnico_id?: number | null
  }) =>
    request<{ success: boolean }>('/api/subtareas/actualizar', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  agregarComentario: (ticketId: number, form: FormData) =>
    request<{ success: boolean; url_archivo: string | null }>(
      `/api/tickets/${ticketId}/comentarios`,
      { method: 'POST', body: form },
    ),
}
