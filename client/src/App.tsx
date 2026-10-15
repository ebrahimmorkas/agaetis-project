import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomeRedirect } from '@/features/auth/HomeRedirect'
import { LoginPage } from '@/features/auth/LoginPage'
import { GuestOnly, RequireAuth } from '@/features/auth/RequireAuth'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { UsersPage } from '@/features/users/UsersPage'

function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<RequireAuth roles={['super_admin', 'admin']} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
          <Route element={<RequireAuth roles={['manager']} />}>
            <Route path="/team" element={<UsersPage />} />
          </Route>
        </Route>
        <Route path="/" element={<HomeRedirect />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
