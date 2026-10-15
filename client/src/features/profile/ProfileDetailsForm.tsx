import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Mail, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Card, Input } from '@/components/ui'
import { currentUserKey } from '@/features/auth/hooks'
import type { AuthUser } from '@/features/auth/types'
import { getErrorMessage } from '@/lib/api'
import { applyServerErrors } from '@/lib/forms'
import { profileApi } from './api'

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
})

type FormValues = z.infer<typeof schema>

export function ProfileDetailsForm({ user }: { user: AuthUser }) {
  const queryClient = useQueryClient()
  const updateProfile = useMutation({
    mutationFn: profileApi.update,
    onSuccess: (updated) => queryClient.setQueryData(currentUserKey, updated),
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name, email: user.email },
  })

  useEffect(() => {
    reset({ name: user.name, email: user.email })
  }, [user.name, user.email, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      await updateProfile.mutateAsync(values)
      toast.success('Profile updated')
    } catch (error) {
      if (!applyServerErrors(error, setError, 'email')) toast.error(getErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card
        title="Personal details"
        description="Update your name and email address."
        footer={
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Save changes
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" icon={<User size={16} />} error={errors.name?.message} {...register('name')} />
          <Input
            label="Email address"
            type="email"
            icon={<Mail size={16} />}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
      </Card>
    </form>
  )
}
