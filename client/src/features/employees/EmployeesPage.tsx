import { useState } from 'react'
import { AlertCircle, Plus, Search, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button, ConfirmDialog, EmptyState, Input, Pagination, Select } from '@/components/ui'
import { useDebounce } from '@/hooks/useDebounce'
import { getErrorMessage } from '@/lib/api'
import { EmployeeFormModal } from './EmployeeFormModal'
import { EmployeeList } from './EmployeeList'
import { useDeleteEmployee, useEmployees } from './hooks'
import { roleOptions, type Employee, type Role, type SortField } from './types'

const PAGE_SIZE = 10

export function EmployeesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [sortBy, setSortBy] = useState<SortField>('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState<Employee | null>(null)

  const debouncedSearch = useDebounce(search)
  const { data, isLoading, isError, error, refetch } = useEmployees({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    role: role || undefined,
    sortBy,
    order,
  })
  const deleteEmployee = useDeleteEmployee()

  const employees = data?.items ?? []
  const meta = data?.meta
  const hasFilters = !!debouncedSearch || !!role

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

  const openEdit = (employee: Employee) => {
    setEditing(employee)
    setFormOpen(true)
  }

  const clearFilters = () => {
    setSearch('')
    setRole('')
    setPage(1)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await deleteEmployee.mutateAsync(deleting.id)
      toast.success(`${deleting.name} has been removed`)
      // step back a page if we just deleted the last row on it
      if (employees.length === 1 && page > 1) setPage(page - 1)
      setDeleting(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const renderContent = () => {
    if (isError) {
      return (
        <EmptyState
          icon={<AlertCircle size={22} />}
          title="Couldn't load employees"
          description={getErrorMessage(error)}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      )
    }

    if (!isLoading && employees.length === 0) {
      return hasFilters ? (
        <EmptyState
          icon={<Search size={22} />}
          title="No matching employees"
          description="Try a different name or email, or clear the filters."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={<Users size={22} />}
          title="No employees yet"
          description="Get started by adding your first team member."
          action={
            <Button icon={<Plus size={16} />} onClick={openCreate}>
              Add employee
            </Button>
          }
        />
      )
    }

    return (
      <EmployeeList
        employees={employees}
        loading={isLoading}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        onEdit={openEdit}
        onDelete={setDeleting}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your team members and their roles.
            {meta && <span className="ml-1 font-medium text-slate-700">{meta.total} total</span>}
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate} className="w-full sm:w-auto">
          Add employee
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex-1 sm:max-w-sm">
            <Input
              type="search"
              placeholder="Search by name or email"
              aria-label="Search employees"
              icon={<Search size={16} />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="sm:w-44">
            <Select
              aria-label="Filter by role"
              placeholder="All roles"
              options={roleOptions}
              value={role}
              onChange={(e) => {
                setRole(e.target.value as Role | '')
                setPage(1)
              }}
            />
          </div>
        </div>

        {renderContent()}

        {meta && employees.length > 0 && (
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

      <EmployeeFormModal open={formOpen} onClose={() => setFormOpen(false)} employee={editing} />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteEmployee.isPending}
        title="Delete employee"
        message={
          <>
            Are you sure you want to delete <span className="font-medium text-slate-700">{deleting?.name}</span>?
            This can&apos;t be undone.
          </>
        }
      />
    </div>
  )
}
