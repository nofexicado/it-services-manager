import * as RS from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
  size?: 'sm' | 'md'
}

/** Select temado (Radix). Reemplaza al <select> nativo, cuyo popup el
 *  navegador pinta en blanco ignorando el modo oscuro. El panel escala
 *  desde el trigger (origin-aware), 150ms, curva fuerte. */
export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Seleccionar…',
  disabled,
  className,
  ariaLabel,
  size = 'md',
}: Props) {
  return (
    <RS.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RS.Trigger
        aria-label={ariaLabel}
        className={cn(
          'inline-flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-card text-foreground shadow-xs outline-none',
          'transition-[border-color,box-shadow] duration-150',
          'hover:border-ring/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35',
          'data-[placeholder]:text-muted-foreground disabled:opacity-55',
          size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-sm',
          className,
        )}
      >
        <RS.Value placeholder={placeholder} />
        <RS.Icon>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </RS.Icon>
      </RS.Trigger>

      <RS.Portal>
        <RS.Content
          position="popper"
          sideOffset={6}
          className={cn(
            'z-[80] max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg',
            'origin-[var(--radix-select-content-transform-origin)]',
            'data-[state=open]:animate-selectin',
          )}
        >
          <RS.Viewport className="p-1">
            {options.map((opt) => (
              <RS.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  'relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-2.5 pr-8 text-sm text-foreground outline-none',
                  'transition-colors data-[highlighted]:bg-muted data-[state=checked]:font-medium',
                )}
              >
                <RS.ItemText>{opt.label}</RS.ItemText>
                <RS.ItemIndicator className="absolute right-2.5">
                  <Check className="size-4 text-primary" />
                </RS.ItemIndicator>
              </RS.Item>
            ))}
          </RS.Viewport>
        </RS.Content>
      </RS.Portal>
    </RS.Root>
  )
}
