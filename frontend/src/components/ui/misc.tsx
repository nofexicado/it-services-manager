import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-xs',
        className,
      )}
      {...props}
    />
  )
}

export function Avatar({
  nombre,
  className,
}: {
  nombre: string
  className?: string
}) {
  const ini = nombre
    .split(' ')
    .map((p) => p.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
  return (
    <div
      className={cn(
        'flex select-none items-center justify-center rounded-lg bg-primary/12 text-[11px] font-semibold text-primary',
        className,
      )}
      title={nombre}
    >
      {ini}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: React.ReactNode
  title: string
  hint?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      {icon && (
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint && <p className="max-w-xs text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Cuenta ascendente con easing cúbico. Respeta prefers-reduced-motion. */
export function useCountUp(target: number, duration = 850) {
  const [value, setValue] = useState(target)
  const prev = useRef(target)

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || prev.current === target) {
      prev.current = target
      setValue(target)
      return
    }
    const from = prev.current
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = Math.round(from + (target - from) * eased)
      setValue(next)
      if (t < 1) raf = requestAnimationFrame(tick)
      else prev.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}

export function CountUp({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const shown = useCountUp(value)
  return <span className={cn('tnum', className)}>{shown}</span>
}
