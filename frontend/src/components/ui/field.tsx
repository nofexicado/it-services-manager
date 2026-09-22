import { cn } from '@/lib/utils'

const base =
  'w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:opacity-55'

export function Input({
  className,
  ref,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>
}) {
  return <input ref={ref} className={cn(base, 'h-9', className)} {...props} />
}

export function Textarea({
  className,
  ref,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  ref?: React.Ref<HTMLTextAreaElement>
}) {
  return (
    <textarea
      ref={ref}
      className={cn(base, 'min-h-[80px] py-2 leading-relaxed', className)}
      {...props}
    />
  )
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'mb-1.5 block text-xs font-medium text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}
