import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, id, className, ...rest }, ref) => {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <label htmlFor={inputId} className={cn('inline-flex cursor-pointer items-center gap-2', className)}>
      <span className="relative flex h-4.5 w-4.5 shrink-0">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(
            'peer h-4.5 w-4.5 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-colors',
            'checked:border-primary-600 checked:bg-primary-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          {...rest}
        />
        <Check
          size={12}
          strokeWidth={3}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
        />
      </span>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  )
})

Checkbox.displayName = 'Checkbox'
