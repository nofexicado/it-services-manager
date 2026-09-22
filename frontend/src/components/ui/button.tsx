import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium tracking-[-0.01em]',
    'outline-none transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]',
    'focus-visible:ring-[3px] focus-visible:ring-ring/40',
    'disabled:pointer-events-none disabled:opacity-55',
    // feedback de presión — instantáneo (100ms), scale sutil
    'active:scale-[0.97] active:duration-100',
    '[&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'text-primary-foreground shadow-accent [background:linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0)_42%),var(--primary)] [box-shadow:var(--shadow-accent),inset_0_1px_0_rgba(255,255,255,0.22)] hover:[background:linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0)_42%),var(--primary-hover)] data-[lift]:hover:-translate-y-px',
        soft: 'border border-primary/25 bg-primary/10 text-primary hover:bg-primary/[0.16] data-[lift]:hover:-translate-y-px',
        secondary:
          'border border-border-strong bg-muted text-foreground shadow-xs hover:bg-subtle data-[lift]:hover:-translate-y-px hover:shadow-sm',
        outline:
          'border border-border-strong bg-transparent text-foreground hover:bg-muted data-[lift]:hover:-translate-y-px',
        ghost:
          'text-muted-foreground hover:bg-muted hover:text-foreground',
        danger:
          'text-white [background:linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0)_42%),var(--danger)] [box-shadow:0_6px_18px_-6px_color-mix(in_srgb,var(--danger)_55%,transparent),inset_0_1px_0_rgba(255,255,255,0.2)] data-[lift]:hover:-translate-y-px hover:brightness-[1.06]',
      },
      size: {
        sm: 'h-8 px-3 text-xs [&_svg]:size-3.5',
        md: 'h-9 px-4 [&_svg]:size-4',
        lg: 'h-10 px-5 text-[15px] [&_svg]:size-4',
        icon: 'size-9 [&_svg]:size-4',
        'icon-sm': 'size-8 [&_svg]:size-3.5',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  /** activa el translateY(-1px) en hover (desactivado en touch vía CSS) */
  lift?: boolean
}

export function Button({
  className,
  variant,
  size,
  loading,
  lift = true,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      data-lift={lift ? '' : undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin [animation-duration:0.6s]" />}
      {children}
    </button>
  )
}

export { buttonVariants }
