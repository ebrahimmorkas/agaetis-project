import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type CardProps = {
  title?: string
  description?: string
  footer?: ReactNode
  className?: string
  children: ReactNode
}

export function Card({ title, description, footer, className, children }: CardProps) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      {title && (
        <header className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </header>
      )}
      <div className="px-5 py-5 sm:px-6">{children}</div>
      {footer && (
        <footer className="flex justify-end gap-2 rounded-b-xl border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
          {footer}
        </footer>
      )}
    </section>
  )
}
