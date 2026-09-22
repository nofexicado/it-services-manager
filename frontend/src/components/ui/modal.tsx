import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px] [animation:fadein_0.15s_ease]"
        onClick={onClose}
      />
      {/* modales: origen centrado (no anclados a un trigger) */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'animate-in relative z-10 my-8 w-full max-w-lg origin-center rounded-xl border border-border bg-card text-card-foreground shadow-lg',
          className,
        )}
      >
        {(title || icon) && (
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div className="flex items-start gap-3">
              {icon && (
                <div className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary [&_svg]:size-4">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="text-sm font-semibold tracking-[-0.01em] text-foreground">
                  {title}
                </h2>
                {description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <X />
            </Button>
          </div>
        )}
        <div className="p-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border p-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
