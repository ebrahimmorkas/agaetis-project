import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

type PaginationProps = {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

type PageItem = number | 'gap'

// e.g. [1, gap, 4, 5, 6, gap, 10]
function getPages(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: PageItem[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) pages.push('gap')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('gap')

  pages.push(total)
  return pages
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  if (total === 0) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{from}</span> to{' '}
        <span className="font-medium text-slate-700">{to}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span> results
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronLeft size={16} />}
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />

        {getPages(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} className="px-1.5 text-sm text-slate-400">
              &hellip;
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'h-8 min-w-8 rounded-lg px-2 text-sm font-medium transition-colors',
                item === page ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {item}
            </button>
          ),
        )}

        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronRight size={16} />}
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        />
      </div>
    </div>
  )
}
