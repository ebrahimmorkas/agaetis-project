import { NavLink } from 'react-router-dom'
import { LogOut, UserCircle, Users, UsersRound, X, type LucideIcon } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { useAuthUser, useLogout } from '@/features/auth/hooks'
import { hasAnyUserAccess } from '@/features/auth/permissions'
import { roleLabels, type AuthUser } from '@/features/auth/types'
import { cn } from '@/lib/cn'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  visible: (user: AuthUser) => boolean
}

const navItems: NavItem[] = [
  { to: '/users', label: 'Users', icon: Users, visible: hasAnyUserAccess },
  { to: '/team', label: 'My team', icon: UsersRound, visible: (user) => user.role === 'manager' },
  { to: '/profile', label: 'My profile', icon: UserCircle, visible: () => true },
]

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const user = useAuthUser()
  const logout = useLogout()

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 animate-fade-in bg-slate-900/40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              A
            </div>
            <span className="text-lg font-semibold text-slate-900">Agaetis</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Menu</p>
          {navItems
            .filter((item) => item.visible(user))
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{roleLabels[user.role]}</p>
            </div>
            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              aria-label="Log out"
              title="Log out"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
