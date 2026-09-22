import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Solo mayúscula la primera letra (Title-Case en español capitaliza mal
 *  las preposiciones: "De", "La", etc.). */
export function capitalizarPrimera(text?: string | null): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function iniciales(nombre?: string | null): string {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .map((p) => p.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

export function fechaLarga(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function fechaCorta(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
