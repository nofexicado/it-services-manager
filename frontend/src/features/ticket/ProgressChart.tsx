import { motion } from 'motion/react'
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts'
import { Card, useCountUp } from '@/components/ui/misc'
import type { Subtarea } from '@/lib/types'

const SEGMENTS = [
  { key: 'Completada', label: 'Completadas', color: 'var(--success)' },
  { key: 'En Progreso', label: 'En progreso', color: 'var(--info)' },
  { key: 'Pendiente', label: 'Pendientes', color: 'var(--warning)' },
] as const

export function ProgressChart({ subtareas }: { subtareas: Subtarea[] }) {
  const total = subtareas.length
  const counts = {
    Completada: subtareas.filter((s) => s.estado === 'Completada').length,
    'En Progreso': subtareas.filter((s) => s.estado === 'En Progreso').length,
    Pendiente: subtareas.filter((s) => s.estado === 'Pendiente').length,
  }
  const pct = total > 0 ? Math.round((counts.Completada / total) * 100) : 0
  const shown = useCountUp(pct)
  const activo = counts['En Progreso'] > 0

  return (
    <Card className="relative overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 size-52 -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--primary) 40%, transparent), transparent 70%)',
        }}
      />

      <div className="relative flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Progreso global de tareas
        </h3>
        {activo && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-info">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-info opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-info" />
            </span>
            En curso
          </span>
        )}
      </div>

      <div className="relative mx-auto mt-2 h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="76%"
            outerRadius="100%"
            data={[{ value: pct }]}
            startAngle={90}
            endAngle={-270}
          >
            <defs>
              <linearGradient id="tc-gauge" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="55%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: 'var(--muted)' }}
              dataKey="value"
              angleAxisId={0}
              cornerRadius={999}
              fill="url(#tc-gauge)"
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
              style={{
                filter:
                  'drop-shadow(0 0 6px color-mix(in srgb, var(--primary) 55%, transparent))',
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="tnum text-3xl font-semibold tracking-[-0.02em] text-foreground"
          >
            {shown}%
          </motion.span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Avance real
          </span>
        </div>
      </div>

      <div className="relative mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
        {total > 0 &&
          SEGMENTS.map((s) => {
            const n = counts[s.key as keyof typeof counts]
            if (!n) return null
            return (
              <motion.div
                key={s.key}
                initial={{ width: 0 }}
                animate={{ width: `${(n / total) * 100}%` }}
                transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                style={{ background: s.color }}
              />
            )
          })}
      </div>

      <div className="relative mt-3 grid grid-cols-3 gap-2">
        {SEGMENTS.map((s) => (
          <div
            key={s.key}
            className="rounded-lg border border-border bg-subtle px-2 py-2 text-center"
          >
            <div className="flex items-center justify-center gap-1.5">
              <span
                className="size-1.5 rounded-full"
                style={{ background: s.color }}
              />
              <span className="tnum text-base font-semibold text-foreground">
                {counts[s.key as keyof typeof counts]}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
