import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ShieldCheck, Users, UserCog } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Input, PasswordInput } from '@/components/ui'
import { getErrorMessage } from '@/lib/api'
import { useLogin } from './hooks'
import { getHomePath } from './routing'

const schema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

const currentYear = new Date().getFullYear()

const highlights = [
  { icon: ShieldCheck, text: 'Role based access for every team member' },
  { icon: UserCog, text: 'Fine grained permissions for admins' },
  { icon: Users, text: 'Managers stay on top of their own team' },
]

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await login.mutateAsync(values)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? getHomePath(user), { replace: true })
    } catch {
      // error is shown from login.error below
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-primary-700 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-500/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-indigo-400/30 blur-3xl" />

        <div className="relative flex items-center gap-2.5 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 font-bold">A</div>
          <span className="text-xl font-semibold">Agaetis</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-white">Manage your people, the simple way.</h2>
          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-primary-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Icon size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-primary-100/80">&copy; {currentYear} Agaetis</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 font-bold text-white">A</div>
            <span className="text-xl font-semibold text-slate-900">Agaetis</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-500">Sign in to your account to continue.</p>

          {login.isError && (
            <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
              {getErrorMessage(login.error)}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <PasswordInput
              label="Password"
              autoComplete="current-password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" fullWidth size="lg" loading={login.isPending}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Forgot your password? Ask your super admin to reset it.
          </p>
        </div>
      </main>
    </div>
  )
}
