import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

function current(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function setTheme(next: Theme) {
  document.documentElement.classList.toggle('dark', next === 'dark')
  try {
    localStorage.setItem('tc_theme', next)
  } catch {
    /* almacenamiento no disponible */
  }
  listeners.forEach((l) => l())
}

/** Estado de tema compartido entre todos los consumidores (toggle del header,
 *  command palette, etc.) vía un store externo. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, current, () => 'light' as Theme)
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  return { theme, toggle }
}
