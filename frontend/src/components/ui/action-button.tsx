import { useEffect, useRef, useState } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { buttonVariants } from './button'

type State = 'idle' | 'loading' | 'success'

interface Props
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>,
    VariantProps<typeof buttonVariants> {
  /** Acción async. Si la promesa se rechaza, el botón vuelve a idle. */
  onAction: () => Promise<unknown>
  /** Se dispara ~0,55s después de resolver (para navegar / cerrar modal). */
  onSuccess?: () => void
  onError?: (e: unknown) => void
  pendingLabel?: React.ReactNode
  successLabel?: React.ReactNode
  successHoldMs?: number
  lift?: boolean
}

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path className="check-draw" d="M4 12.5 10 18 20 6" />
  </svg>
)

/** Botón que muestra una barra de progreso interna mientras corre la acción
 *  y morfea a un estado de éxito (verde + check). Patrón "morphing feedback
 *  button" — comunica el cambio de estado (emil-design-eng). */
export function ActionButton({
  onAction,
  onSuccess,
  onError,
  pendingLabel = 'Guardando…',
  successLabel = 'Guardado',
  successHoldMs = 1600,
  variant = 'primary',
  size = 'md',
  lift = true,
  className,
  children,
  disabled,
  ...rest
}: Props) {
  const [state, setState] = useState<State>('idle')
  const [fill, setFill] = useState(0)
  const mounted = useRef(true)
  useEffect(() => () => void (mounted.current = false), [])

  const run = async () => {
    if (state !== 'idle') return
    setState('loading')
    requestAnimationFrame(() => mounted.current && setFill(92))
    try {
      await onAction()
      if (!mounted.current) return
      setFill(100)
      setState('success')
      window.setTimeout(() => mounted.current && onSuccess?.(), 550)
      window.setTimeout(() => {
        if (!mounted.current) return
        setState('idle')
        setFill(0)
      }, successHoldMs)
    } catch (e) {
      onError?.(e)
      if (!mounted.current) return
      setState('idle')
      setFill(0)
    }
  }

  const busy = state !== 'idle'

  return (
    <button
      type="button"
      onClick={run}
      disabled={disabled || busy}
      data-lift={lift && !busy ? '' : undefined}
      className={cn(
        buttonVariants({ variant, size }),
        'relative isolate overflow-hidden',
        state === 'success' &&
          'bg-success! bg-none! text-white! shadow-sm! ring-0!',
        className,
      )}
      {...rest}
    >
      {/* barra de progreso interna */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-0 z-0 bg-white/25',
          state === 'loading'
            ? 'transition-[width] duration-[1200ms] ease-[cubic-bezier(0.16,0.84,0.3,1)]'
            : 'transition-[width] duration-150 ease-linear',
        )}
        style={{ width: `${fill}%` }}
      />
      <span
        key={state}
        className="label-morph relative z-10 inline-flex items-center gap-2"
      >
        {state === 'idle' && children}
        {state === 'loading' && pendingLabel}
        {state === 'success' && (
          <>
            <CheckIcon />
            {successLabel}
          </>
        )}
      </span>
    </button>
  )
}
