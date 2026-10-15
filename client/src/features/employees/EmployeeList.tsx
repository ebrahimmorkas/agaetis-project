import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from 'lucide-react'
import { Avatar, Badge, Button, Skeleton } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import { roleColors, roleLabels, type Employee, type SortField } from './types'

type EmployeeListProps = {
  employees: Employee[]
  loading: boolean
  sortBy: SortField
  order: 'asc' | 'desc'
  onSort: (field: SortField) => void
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
}

type SortHeaderProps = {
  field: SortField
  label: string
  sortBy: SortField
  order: 'asc' | 'desc'
  onSort: (field: SortField) => void
}

function SortHeader({ field, label, sortBy, order, onSort }: SortHeaderProps) {
  const active = sortBy === field
  const Icon = !active ? ArrowUpDown : order === 'asc' ? ArrowUp : ArrowDown

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium transition-colors hover:text-slate-900',
        active && 'text-slate-900',
      )}
    >
      {label}
      <Icon size={14} className={active ? 'text-primary-600' : 'text-slate-400'} />
    </button>
  )
}

function RowActions({ employee, onEdit, onDelete }: Pick<EmployeeListProps, 'onEdit' | 'onDelete'> & { employee: Employee }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        icon={<Pencil size={16} />}
        aria-label={`Edit ${employee.name}`}
        onClick={() => onEdit(employee)}
      />
      <Button
        variant="ghost"
        size="sm"
        icon={<Trash2 size={16} />}
        aria-label={`Delete ${employee.name}`}
        onClick={() => onDelete(employee)}
        className="text-slate-500 hover:bg-red-50 hover:text-red-600"
      />
    </div>
  )
}

function LoadingRows() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 sm:px-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="hidden h-6 w-20 rounded-full md:block" />
          <Skeleton className="hidden h-4 w-24 md:block" />
        </div>
      ))}
    </div>
  )
}

export function EmployeeList({ employees, loading, sortBy, order, onSort, onEdit, onDelete }: EmployeeListProps) {
  if (loading) return <LoadingRows />

  const sortProps = { sortBy, order, onSort }

  return (
    <>
      {/* Desktop */}
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-500">
          <tr>
            <th className="px-6 py-3">
              <SortHeader field="name" label="Employee" {...sortProps} />
            </th>
            <th className="px-6 py-3">
              <SortHeader field="role" label="Role" {...sortProps} />
            </th>
            <th className="px-6 py-3">
              <SortHeader field="createdAt" label="Joined" {...sortProps} />
            </th>
            <th className="px-6 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.map((employee) => (
            <tr key={employee.id} className="transition-colors hover:bg-slate-50/60">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={employee.name} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{employee.name}</p>
                    <p className="truncate text-slate-500">{employee.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge color={roleColors[employee.role]} dot>
                  {roleLabels[employee.role]}
                </Badge>
              </td>
              <td className="px-6 py-4 text-slate-500">{formatDate(employee.createdAt)}</td>
              <td className="px-6 py-4">
                <RowActions employee={employee} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {employees.map((employee) => (
          <li key={employee.id} className="flex items-start gap-3 px-4 py-4">
            <Avatar name={employee.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900">{employee.name}</p>
              <p className="truncate text-sm text-slate-500">{employee.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge color={roleColors[employee.role]} dot>
                  {roleLabels[employee.role]}
                </Badge>
                <span className="text-xs text-slate-400">Joined {formatDate(employee.createdAt)}</span>
              </div>
            </div>
            <RowActions employee={employee} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </>
  )
}
