import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { Button, Input, Modal, Select } from '@/components/ui'
import { getErrorMessage } from '@/lib/api'
import { useCreateEmployee, useUpdateEmployee } from './hooks'
import { ROLES, roleOptions, type Employee } from './types'

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  role: z.enum(ROLES),
})

type FormValues = z.infer<typeof schema>

type EmployeeFormModalProps = {
  open: boolean
  onClose: () => void
  employee?: Employee | null
}

const emptyValues: FormValues = { name: '', email: '', role: 'employee' }

export function EmployeeFormModal({ open, onClose, employee }: EmployeeFormModalProps) {
  const isEdit = !!employee
  const createEmployee = useCreateEmployee()
  const updateEmployee = useUpdateEmployee()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    reset(employee ? { name: employee.name, email: employee.email, role: employee.role } : emptyValues)
  }, [open, employee, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (employee) {
        await updateEmployee.mutateAsync({ id: employee.id, payload: values })
        toast.success('Employee updated')
      } else {
        await createEmployee.mutateAsync(values)
        toast.success('Employee added')
      }
      onClose()
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setError('email', { message: getErrorMessage(error) })
        return
      }
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit employee' : 'Add employee'}
      description={isEdit ? 'Update the details for this employee.' : 'Fill in the details to add a new employee.'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="employee-form" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Add employee'}
          </Button>
        </>
      }
    >
      <form id="employee-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Full name" placeholder="e.g. Sarah Khan" autoFocus error={errors.name?.message} {...register('name')} />
        <Input
          label="Email address"
          type="email"
          placeholder="sarah@company.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Select label="Role" options={roleOptions} error={errors.role?.message} {...register('role')} />
      </form>
    </Modal>
  )
}
