// Tipos del backend Express (ver server.js). Los campos agregados con
// COUNT()/SUM() de Postgres llegan como string; el resto ya viene tipado.

export type EstadoTicket = 'Pendiente' | 'En Progreso' | 'En Espera' | 'Resuelto'
export type EstadoSubtarea = 'Pendiente' | 'En Progreso' | 'Completada'
export type Prioridad = 'Alta' | 'Media' | 'Baja'

export interface Tecnico {
  id: number
  nombre: string
  rol: string
  activo?: boolean
}

/** Técnico embebido en agregaciones json_agg del backend. */
export interface TecnicoRef {
  id: number
  nombre: string
  rol: string
}

export interface Usuario {
  id: number
  username: string
  nombre: string
  rol: string
  tecnico_id: number
}

export interface LoginResponse {
  success: boolean
  primera_vez: boolean
  usuario: Usuario
}

export interface Kpis {
  total_tickets: number
  pendientes: number
  en_progreso: number
  resueltos: number
  tecnicos_activos: number
}

/** Fila de la tabla del dashboard (GET /api/tickets). */
export interface TicketListItem {
  id: number
  codigo_ticket: string
  titulo: string
  solicitante: string
  descripcion_original: string | null
  descripcion_gemini: string | null
  prioridad: Prioridad
  estado: EstadoTicket
  fecha_creacion: string
  total_subtareas: string
  subtareas_completadas: string | null
  tecnicos_asignados: TecnicoRef[]
}

export interface Comentario {
  id: number
  autor: string
  comentario: string
  fecha: string
}

export interface Adjunto {
  id: number
  nombre_archivo: string
  url_archivo: string
  tipo: 'Imagen' | 'Documento' | string
  fecha: string
}

export interface Subtarea {
  id: number
  ticket_id: number
  titulo: string
  descripcion: string
  tiempo_estimado_minutos: number
  tiempo_real_minutos: number
  estado: EstadoSubtarea
  tecnicos: TecnicoRef[]
  comentarios: Comentario[]
  adjuntos: Adjunto[]
}

/** Detalle completo (GET /api/tickets/:id). */
export interface TicketDetalle {
  id: number
  codigo_ticket: string
  titulo: string
  solicitante: string
  descripcion_original: string | null
  descripcion_gemini: string | null
  prioridad: Prioridad
  estado: EstadoTicket
  fecha_creacion: string
  tecnicos_asignados: TecnicoRef[]
  subtareas: Subtarea[]
}

export interface NuevoTicketPayload {
  titulo: string
  descripcion: string
  solicitante: string
  prioridad: Prioridad
  tecnicos_ids: number[]
}
