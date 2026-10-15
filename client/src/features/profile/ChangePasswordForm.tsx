import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button, Card, PasswordInput } from '@/components/ui'
import { getErrorMessage } from '@/lib/api'
import { applyServerErrors } from '@/lib/forms'
import { profileApi } from './api'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').max(72),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

const emptyValues: FormValues = { currentPassword: '', newPassword: '', confirmPassword: '' }

export function ChangePasswordForm() {
  const changePassword = useMutation({ mutationFn: profileApi.changePassword })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues })

  const onSubmit = async ({ currentPassword, newPassword }: FormValues) => {
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword })
      toast.success('Password changed')
      reset(emptyValues)
    } catch (error) {
      if (!applyServerErrors(error, setError)) toast.error(getErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card
        title="Change password"
        description="Use at least 8 characters. You'll stay signed in on this device."
        footer={
          <Button type="submit" loading={isSubmitting}>
            Update password
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">
            <PasswordInput
              label="Current password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
          </div>
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
      </Card>
    </form>
  )
}
