import { useState } from 'react'
import { AlertCircle, EyeOff, Plus, Search, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui'
import { useAuthUser } from '@/features/auth/hooks'
import { canManageRole, rolesWith } from '@/features/auth/permissions'
import { roleLabels, type UserStatus } from '@/features/auth/types'
import { useDebounce } from '@/hooks/useDebounce'
import { getErrorMessage } from '@/lib/api'
import { useSetUserStatus, useUsers } from './hooks'
import { ResetPasswordModal } from './ResetPasswordModal'
import type { AssignableRole, SortField, User } from './types'
import { UserFormModal } from './UserFormModal'
import { UserList, type UserActions } from './UserList'

const PAGE_SIZE = 10

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function UsersPage() {
  const actor = useAuthUser()
  const isTeamView = actor.role === 'manager'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<AssignableRole | ''>('')
  const [status, setStatus] = useState<UserStatus | ''>('')
  const [sortBy, setSortBy] = useState<SortField>('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [statusTarget, setStatusTarget] = useState<User | null>(null)
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null)

  const debouncedSearch = useDebounce(search)
  const { data, isLoading, isError, error, refetch } = useUsers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    role: role || undefined,
    status: status || undefined,
    sortBy,
    order,
  })
  const setUserStatus = useSetUserStatus()

  const users = data?.items ?? []
  const meta = data?.meta
  const hasFilters = !!debouncedSearch || !!role || !!status

  const viewableRoles = rolesWith(actor, 'view') as AssignableRole[]
  const canView = isTeamView || viewableRoles.length > 0
  const canAdd = !isTeamView && rolesWith(actor, 'add').length > 0

  const actions: UserActions = {
    canEdit: (user) => isTeamView || canManageRole(actor, user.role, 'edit'),
    canToggleStatus: (user) => canManageRole(actor, user.role, 'delete'),
    canResetPassword: () => actor.role === 'super_admin',
    onEdit: (user) => {
      setEditing(user)
      setFormOpen(true)
    },
    onToggleStatus: setStatusTarget,
    onResetPassword: setPasswordTarget,
  }

  const resetToFirstPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setPage(1)
  }

  const handleSort = (field: SortField) => {
    if (field === sortBy) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setOrder('asc')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const clearFilters = () => {
    setSearch('')
    setRole('')
    setStatus('')
    setPage(1)
  }

  const confirmStatusChange = async () => {
    if (!statusTarget) return
    const next: UserStatus = statusTarget.status === 'active' ? 'inactive' : 'active'
    try {
      await setUserStatus.mutateAsync({ id: statusTarget.id, status: next })
      toast.success(`${statusTarget.name} has been ${next === 'active' ? 'activated' : 'deactivated'}`)
      setStatusTarget(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const addButton = canAdd && (
    <Button icon={<Plus size={16} />} onClick={openCreate}>
      Add user
    </Button>
  )

  const renderContent = () => {
    if (!canView) {
      return (
        <EmptyState
          icon={<EyeOff size={22} />}
          title="You can't view users"
          description="Your account can add new users, but you don't have permission to see the list."
          action={addButton}
        />
      )
    }

    if (isError) {
      return (
        <EmptyState
          icon={<AlertCircle size={22} />}
          title="Couldn't load users"
          description={getErrorMessage(error)}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      )
    }

    if (!isLoading && users.length === 0) {
      if (hasFilters) {
        return (
          <EmptyState
            icon={<Search size={22} />}
            title="No matching users"
            description="Try a different name or email, or clear the filters."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        )
      }
      return (
        <EmptyState
          icon={<Users size={22} />}
          title={isTeamView ? 'No one on your team yet' : 'No users yet'}
          description={
            isTeamView
              ? 'Employees assigned to you by an admin will show up here.'
              : 'Get started by adding your first team member.'
          }
          action={addButton}
        />
      )
    }

    return (
      <UserList
        users={users}
        loading={isLoading}
        showManager={!isTeamView}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        actions={actions}
      />
    )
  }

  const nextStatus = statusTarget?.status === 'active' ? 'Deactivate' : 'Activate'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{isTeamView ? 'My team' : 'Users'}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isTeamView ? 'Employees who report to you.' : 'Manage accounts, roles and access.'}
            {meta && canView && <span className="ml-1 font-medium text-slate-700">{meta.total} total</span>}
          </p>
        </div>
        {canAdd && (
          <Button icon={<Plus size={16} />} onClick={openCreate} className="w-full sm:w-auto">
            Add user
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {canView && (
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:px-6">
            <div className="flex-1 sm:max-w-sm">
              <Input
                type="search"
                placeholder="Search by name or email"
                aria-label="Search users"
                icon={<Search size={16} />}
                value={search}
                onChange={(e) => resetToFirstPage(setSearch)(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              {!isTeamView && viewableRoles.length > 1 && (
                <div className="sm:w-40">
                  <Select
                    aria-label="Filter by role"
                    placeholder="All roles"
                    options={viewableRoles.map((r) => ({ value: r, label: roleLabels[r] }))}
                    value={role}
                    onChange={(e) => resetToFirstPage(setRole)(e.target.value as AssignableRole | '')}
                  />
                </div>
              )}
              <div className="sm:w-40">
                <Select
                  aria-label="Filter by status"
                  placeholder="All statuses"
                  options={statusOptions}
                  value={status}
                  onChange={(e) => resetToFirstPage(setStatus)(e.target.value as UserStatus | '')}
                />
              </div>
            </div>
          </div>
        )}

        {renderContent()}

        {canView && meta && users.length > 0 && (
          <div className="border-t border-slate-200 px-4 py-3 sm:px-6">
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={meta.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <UserFormModal open={formOpen} onClose={() => setFormOpen(false)} user={editing} />
      <ResetPasswordModal user={passwordTarget} onClose={() => setPasswordTarget(null)} />

      <ConfirmDialog
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={confirmStatusChange}
        loading={setUserStatus.isPending}
        tone={statusTarget?.status === 'active' ? 'danger' : 'primary'}
        confirmText={nextStatus}
        title={`${nextStatus} user`}
        message={
          statusTarget?.status === 'active' ? (
            <>
              <span className="font-medium text-slate-700">{statusTarget.name}</span> will be signed out and won&apos;t
              be able to log in until they are activated again.
            </>
          ) : (
            <>
              <span className="font-medium text-slate-700">{statusTarget?.name}</span> will be able to log in again.
            </>
          )
        }
      />
    </div>
  )
}
