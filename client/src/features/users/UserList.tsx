import { ArrowDown, ArrowUp, ArrowUpDown, KeyRound, Pencil, UserCheck, UserX } from 'lucide-react'
import { Avatar, Badge, Button, Skeleton } from '@/components/ui'
import { roleColors, roleLabels } from '@/features/auth/types'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import type { SortField, User } from './types'

export type UserActions = {
  canEdit: (user: User) => boolean
  canToggleStatus: (user: User) => boolean
  canResetPassword: (user: User) => boolean
  onEdit: (user: User) => void
  onToggleStatus: (user: User) => void
  onResetPassword: (user: User) => void
}

type UserListProps = {
  users: User[]
  loading: boolean
  showManager: boolean
  sortBy: SortField
  order: 'asc' | 'desc'
  onSort: (field: SortField) => void
  actions: UserActions
}

type SortHeaderProps = Pick<UserListProps, 'sortBy' | 'order' | 'onSort'> & {
  field: SortField
  label: string
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

function StatusBadge({ status }: { status: User['status'] }) {
  return status === 'active' ? (
    <Badge color="green" dot>
      Active
    </Badge>
  ) : (
    <Badge color="gray" dot>
      Inactive
    </Badge>
  )
}

function RowActions({ user, actions }: { user: User; actions: UserActions }) {
  const active = user.status === 'active'

  return (
    <div className="flex items-center justify-end gap-1">
      {actions.canEdit(user) && (
        <Button
          variant="ghost"
          size="sm"
          icon={<Pencil size={16} />}
          aria-label={`Edit ${user.name}`}
          title="Edit"
          onClick={() => actions.onEdit(user)}
        />
      )}
      {actions.canResetPassword(user) && (
        <Button
          variant="ghost"
          size="sm"
          icon={<KeyRound size={16} />}
          aria-label={`Change password for ${user.name}`}
          title="Change password"
          onClick={() => actions.onResetPassword(user)}
        />
      )}
      {actions.canToggleStatus(user) && (
        <Button
          variant="ghost"
          size="sm"
          icon={active ? <UserX size={16} /> : <UserCheck size={16} />}
          aria-label={`${active ? 'Deactivate' : 'Activate'} ${user.name}`}
          title={active ? 'Deactivate' : 'Activate'}
          onClick={() => actions.onToggleStatus(user)}
          className={active ? 'text-slate-500 hover:bg-red-50 hover:text-red-600' : 'text-emerald-600 hover:bg-emerald-50'}
        />
      )}
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

export function UserList({ users, loading, showManager, sortBy, order, onSort, actions }: UserListProps) {
  if (loading) return <LoadingRows />

  const sortProps = { sortBy, order, onSort }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-500">
            <tr>
              <th className="px-6 py-3">
                <SortHeader field="name" label="User" {...sortProps} />
              </th>
              <th className="px-6 py-3">
                <SortHeader field="role" label="Role" {...sortProps} />
              </th>
              {showManager && <th className="px-6 py-3 font-medium">Reports to</th>}
              <th className="px-6 py-3">
                <SortHeader field="status" label="Status" {...sortProps} />
              </th>
              <th className="px-6 py-3">
                <SortHeader field="createdAt" label="Joined" {...sortProps} />
              </th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr
                key={user.id}
                className={cn('transition-colors hover:bg-slate-50/60', user.status === 'inactive' && 'bg-slate-50/40')}
              >
                <td className="px-6 py-4">
                  <div className={cn('flex items-center gap-3', user.status === 'inactive' && 'opacity-60')}>
                    <Avatar name={user.name} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{user.name}</p>
                      <p className="truncate text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge color={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                </td>
                {showManager && (
                  <td className="px-6 py-4 text-slate-600">
                    {user.manager?.name ?? <span className="text-slate-400">&mdash;</span>}
                  </td>
                )}
                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-500">{formatDate(user.createdAt)}</td>
                <td className="px-6 py-4">
                  <RowActions user={user} actions={actions} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {users.map((user) => (
          <li key={user.id} className="flex items-start gap-3 px-4 py-4">
            <Avatar name={user.name} className={user.status === 'inactive' ? 'opacity-60' : undefined} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900">{user.name}</p>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge color={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                <StatusBadge status={user.status} />
              </div>
              {showManager && user.manager && (
                <p className="mt-1.5 text-xs text-slate-500">Reports to {user.manager.name}</p>
              )}
            </div>
            <RowActions user={user} actions={actions} />
          </li>
        ))}
      </ul>
    </>
  )
}
