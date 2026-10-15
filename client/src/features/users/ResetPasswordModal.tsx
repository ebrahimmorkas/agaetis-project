import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button, Modal, PasswordInput } from '@/components/ui'
import { getErrorMessage } from '@/lib/api'
import { useResetPassword } from './hooks'
import type { User } from './types'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters').max(72),
    confirmPassword: z.string().min(1, 'Please confirm the password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

type ResetPasswordModalProps = {
  user: User | null
  onClose: () => void
}

export function ResetPasswordModal({ user, onClose }: ResetPasswordModalProps) {
  const resetPassword = useResetPassword()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (user) reset({ password: '', confirmPassword: '' })
  }, [user, reset])

  const onSubmit = async ({ password }: FormValues) => {
    if (!user) return
    try {
      await resetPassword.mutateAsync({ id: user.id, password })
      toast.success(`Password updated for ${user.name}`)
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      size="sm"
      title="Change password"
      description={user ? `Set a new password for ${user.name}.` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="reset-password-form" loading={isSubmitting}>
            Update password
          </Button>
        </>
      }
    >
      <form id="reset-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <PasswordInput
          label="New password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </form>
    </Modal>
  )
}
