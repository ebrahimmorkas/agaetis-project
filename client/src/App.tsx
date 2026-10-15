import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { EmployeesPage } from '@/features/employees/EmployeesPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/employees" replace />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="*" element={<Navigate to="/employees" replace />} />
      </Route>
    </Routes>
  )
}

export default App
