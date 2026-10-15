import { CalendarDays, Mail } from 'lucide-react'
import { Avatar, Badge } from '@/components/ui'
import { useAuthUser } from '@/features/auth/hooks'
import { roleColors, roleLabels } from '@/features/auth/types'
import { formatDate } from '@/lib/format'
import { ChangePasswordForm } from './ChangePasswordForm'
import { ProfileDetailsForm } from './ProfileDetailsForm'

export function ProfilePage() {
  const user = useAuthUser()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">My profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your personal details and password.</p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:flex-row sm:text-left">
        <Avatar name={user.name} size="lg" className="h-16 w-16 text-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <h2 className="truncate text-lg font-semibold text-slate-900">{user.name}</h2>
            <Badge color={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
          </div>
          <div className="mt-1.5 flex flex-col items-center gap-x-4 gap-y-1 text-sm text-slate-500 sm:flex-row">
            <span className="flex items-center gap-1.5">
              <Mail size={14} /> {user.email}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} /> Joined {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <ProfileDetailsForm user={user} />
      <ChangePasswordForm />
    </div>
  )
}
