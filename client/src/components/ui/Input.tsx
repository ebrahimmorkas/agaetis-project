import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, id, className, ...rest }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm',
              'placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100',
              'disabled:bg-slate-100 disabled:text-slate-500',
              icon && 'pl-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
              className,
            )}
            {...rest}
          />
        </div>

        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : (
          hint && <p className="text-xs text-slate-500">{hint}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
