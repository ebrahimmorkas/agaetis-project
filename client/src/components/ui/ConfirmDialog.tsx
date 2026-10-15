import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'
import { Modal } from './Modal'

type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: ReactNode
  confirmText?: string
  tone?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  tone = 'danger',
  loading,
}: ConfirmDialogProps) {
  const Icon = tone === 'danger' ? AlertTriangle : CheckCircle2

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <div
          className={cn(
            'mb-4 flex h-11 w-11 items-center justify-center rounded-full',
            tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600',
          )}
        >
          <Icon size={20} />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1.5 text-sm text-slate-500">{message}</p>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={tone} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
