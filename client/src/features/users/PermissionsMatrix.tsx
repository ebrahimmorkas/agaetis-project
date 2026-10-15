import { Checkbox } from '@/components/ui'
import { MANAGED_ROLES } from '@/features/auth/permissions'
import { roleLabels, type ManagedRole, type PermissionAction, type PermissionMap } from '@/features/auth/types'

const ACTIONS: { key: PermissionAction; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'add', label: 'Add' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Deactivate' },
]

type PermissionsMatrixProps = {
  value: PermissionMap
  onChange: (value: PermissionMap) => void
}

export function PermissionsMatrix({ value, onChange }: PermissionsMatrixProps) {
  const toggle = (role: ManagedRole, action: PermissionAction, checked: boolean) => {
    const next = { ...value[role], [action]: checked }

    // edit/deactivate need view, and removing view takes them away
    if (checked && (action === 'edit' || action === 'delete')) next.view = true
    if (!checked && action === 'view') {
      next.edit = false
      next.delete = false
    }

    onChange({ ...value, [role]: next })
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="hidden grid-cols-[1fr_repeat(4,5.5rem)] bg-slate-50 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500 sm:grid">
        <span>Can manage</span>
        {ACTIONS.map((action) => (
          <span key={action.key} className="text-center">
            {action.label}
          </span>
        ))}
      </div>

      <div className="divide-y divide-slate-100">
        {MANAGED_ROLES.map((role) => (
          <div key={role} className="px-4 py-3 sm:grid sm:grid-cols-[1fr_repeat(4,5.5rem)] sm:items-center">
            <p className="mb-2 text-sm font-medium text-slate-800 sm:mb-0">{roleLabels[role]}s</p>
            <div className="grid grid-cols-2 gap-2 sm:contents">
              {ACTIONS.map((action) => (
                <div key={action.key} className="sm:flex sm:justify-center">
                  <Checkbox
                    checked={value[role][action.key]}
                    onChange={(e) => toggle(role, action.key, e.target.checked)}
                    aria-label={`${action.label} ${roleLabels[role]}s`}
                    label={action.label}
                    className="sm:[&>span:last-child]:hidden"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
