import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button, Input, Modal, PasswordInput, Select } from '@/components/ui'
import { useAuthUser } from '@/features/auth/hooks'
import { canManageRole, noPermissions, rolesWith } from '@/features/auth/permissions'
import { roleLabels, type PermissionMap } from '@/features/auth/types'
import { getErrorMessage } from '@/lib/api'
import { applyServerErrors } from '@/lib/forms'
import { useCreateUser, useManagerOptions, useUpdateUser, useUser } from './hooks'
import { PermissionsMatrix } from './PermissionsMatrix'
import type { AssignableRole, User } from './types'

const permissionSchema = z.object({ view: z.boolean(), add: z.boolean(), edit: z.boolean(), delete: z.boolean() })

const baseSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  role: z.enum(['admin', 'manager', 'employee']),
  managerId: z.string(),
  permissions: z.object({ manager: permissionSchema, employee: permissionSchema }),
})

const createSchema = baseSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
})

type FormValues = z.infer<typeof createSchema>

type UserFormModalProps = {
  open: boolean
  onClose: () => void
  user?: User | null
}

const toFormValues = (user: User | null | undefined, defaultRole: AssignableRole): FormValues => ({
  name: user?.name ?? '',
  email: user?.email ?? '',
  password: '',
  role: (user?.role as AssignableRole) ?? defaultRole,
  managerId: user?.managerId ? String(user.managerId) : '',
  permissions: user?.permissions ?? noPermissions(),
})

export function UserFormModal({ open, onClose, user }: UserFormModalProps) {
  const actor = useAuthUser()
  const isEdit = !!user
  const isManager = actor.role === 'manager'
  const isSuperAdmin = actor.role === 'super_admin'

  // the list doesn't include permissions, so load the full record for admins
  const { data: details, isLoading: loadingDetails } = useUser(open && user?.role === 'admin' ? user.id : undefined)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const roleOptions = rolesWith(actor, isEdit ? 'edit' : 'add').map((role) => ({ value: role, label: roleLabels[role] }))
  const defaultRole = (roleOptions.at(-1)?.value ?? 'employee') as AssignableRole
  const canAssignManager = canManageRole(actor, 'employee', isEdit ? 'edit' : 'add')
  const { data: managers = [] } = useManagerOptions(open && canAssignManager)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? baseSchema.extend({ password: z.string() }) : createSchema),
    defaultValues: toFormValues(user, 'employee'),
  })

  const role = useWatch({ control, name: 'role' })

  useEffect(() => {
    if (!open) return
    reset(toFormValues(details ?? user, defaultRole))
  }, [open, user, details, defaultRole, reset])

  const onSubmit = async (values: FormValues) => {
    const managerId = values.role === 'employee' && values.managerId ? Number(values.managerId) : null
    const permissions: PermissionMap | undefined =
      isSuperAdmin && values.role === 'admin' ? values.permissions : undefined

    try {
      if (user) {
        const payload = isManager
          ? { name: values.name, email: values.email }
          : {
              name: values.name,
              email: values.email,
              role: values.role,
              ...(canAssignManager && { managerId }),
              ...(permissions && { permissions }),
            }
        await updateUser.mutateAsync({ id: user.id, payload })
        toast.success('User updated')
      } else {
        await createUser.mutateAsync({ ...values, managerId, permissions })
        toast.success(`${roleLabels[values.role]} created`)
      }
      onClose()
    } catch (error) {
      if (!applyServerErrors(error, setError, 'email')) toast.error(getErrorMessage(error))
    }
  }

  const managerOptions = managers.map((m) => ({ value: String(m.id), label: m.name }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      size={role === 'admin' && isSuperAdmin ? 'lg' : 'md'}
      title={isEdit ? 'Edit user' : 'Add user'}
      description={isEdit ? `Update the details for ${user.name}.` : 'Create a new account and choose what they can do.'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" loading={isSubmitting} disabled={loadingDetails}>
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" placeholder="e.g. Sarah Khan" error={errors.name?.message} {...register('name')} />
          <Input
            label="Email address"
            type="email"
            placeholder="sarah@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        {!isEdit && (
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            hint="At least 8 characters. Share it with the user so they can sign in."
            error={errors.password?.message}
            {...register('password')}
          />
        )}

        {!isManager && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Role" options={roleOptions} error={errors.role?.message} {...register('role')} />
            {role === 'employee' && canAssignManager && (
              <Select
                label="Reports to"
                placeholder="No manager"
                options={managerOptions}
                error={errors.managerId?.message}
                {...register('managerId')}
              />
            )}
          </div>
        )}

        {isSuperAdmin && role === 'admin' && (
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Admin permissions</p>
              <p className="text-xs text-slate-500">Choose what this admin is allowed to do for each role.</p>
            </div>
            <Controller
              control={control}
              name="permissions"
              render={({ field }) => <PermissionsMatrix value={field.value} onChange={field.onChange} />}
            />
          </div>
        )}
      </form>
    </Modal>
  )
}
