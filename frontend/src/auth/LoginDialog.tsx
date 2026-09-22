import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Fingerprint, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { LoginResponse, Usuario } from '@/lib/types'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ActionButton } from '@/components/ui/action-button'
import { Input, Label } from '@/components/ui/field'

const INVALID = '__invalid__'

const schema = z.object({
  username: z.string().trim().min(1, 'Ingresá tu usuario'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: (u: Usuario) => void
}

export function LoginDialog({ open, onClose, onSuccess }: Props) {
  const {
    register,
    trigger,
    getValues,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const result = useRef<LoginResponse | null>(null)

  useEffect(() => {
    if (open) {
      reset()
      result.current = null
    }
  }, [open, reset])

  const mutation = useMutation({
    mutationFn: (v: FormValues) => api.login(v.username, v.password),
  })

  const ingresar = async () => {
    const ok = await trigger()
    if (!ok) throw new Error(INVALID)
    const v = getValues()
    result.current = await mutation.mutateAsync(v)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Fingerprint />}
      title="Acceso técnico"
      description="Identificate para operar el sistema"
      className="max-w-sm"
    >
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <Label htmlFor="login-username">Usuario</Label>
          <Input
            id="login-username"
            autoComplete="username"
            placeholder="ej: jperez"
            className="lowercase"
            {...register('username')}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-danger">{errors.username.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="login-password">Contraseña</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          )}
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Si es tu primer ingreso, la contraseña que escribas ahora queda
            guardada para la próxima vez.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <ActionButton
            onAction={ingresar}
            pendingLabel="Verificando…"
            successLabel="Listo"
            onSuccess={() => {
              const data = result.current
              if (!data) return
              onSuccess(data.usuario)
              onClose()
              toast.success(
                data.primera_vez
                  ? `Bienvenido ${data.usuario.nombre}. Tu contraseña quedó guardada para los próximos ingresos.`
                  : `Sesión iniciada como ${data.usuario.nombre}`,
              )
            }}
            onError={(e) => {
              const m = (e as Error)?.message
              if (m && m !== INVALID)
                setError('password', {
                  message: m || 'No se pudo iniciar sesión.',
                })
            }}
          >
            <LogIn />
            Ingresar
          </ActionButton>
        </div>
      </form>
    </Modal>
  )
}
