import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

import Layout           from './components/layout/Layout'
import HomePage         from './pages/HomePage'
import LoginPage        from './pages/LoginPage'
import RegisterPage     from './pages/RegisterPage'
import SearchPage       from './pages/SearchPage'
import ProfessionalPage from './pages/ProfessionalPage'
import BookingPage      from './pages/BookingPage'
import DashboardPage    from './pages/DashboardPage'
import ProfilePage      from './pages/ProfilePage'
import AdminPage        from './pages/admin/AdminPage'
import WelcomePage      from './pages/WelcomePage'
import NotFoundPage from './pages/NotFoundPage'

// Panel profesional
import ProDashboardPage    from './pages/professional/ProDashboardPage'
import ProServicesPage     from './pages/professional/ProServicesPage'
import ProAvailabilityPage from './pages/professional/ProAvailabilityPage'
import ProProfilePage      from './pages/professional/ProProfilePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token)
  return !token ? children : <Navigate to="/dashboard" replace />
}

const ProRoute = ({ children }) => {
  const { token, isProfessional } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (!isProfessional()) return <Navigate to="/dashboard" replace />
  return children
}

const AdminRoute = ({ children }) => {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1C1812',
              color: '#F7F2EA',
              border: '1px solid rgba(201,150,90,0.3)',
              fontFamily: 'Outfit, sans-serif',
            },
            success: { iconTheme: { primary: '#C9965A', secondary: '#0A0806' } },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Públicas */}
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="professional/:id" element={<ProfessionalPage />} />
            <Route path="login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* Cliente */}
            <Route path="booking/:professionalId/:serviceId" element={
              <PrivateRoute><BookingPage /></PrivateRoute>
            } />
            <Route path="dashboard" element={
              <PrivateRoute><DashboardPage /></PrivateRoute>
            } />
            <Route path="profile" element={
              <PrivateRoute><ProfilePage /></PrivateRoute>
            } />

            {/* Panel profesional */}
            <Route path="pro/dashboard"    element={<ProRoute><ProDashboardPage /></ProRoute>} />
            <Route path="pro/services"     element={<ProRoute><ProServicesPage /></ProRoute>} />
            <Route path="pro/availability" element={<ProRoute><ProAvailabilityPage /></ProRoute>} />
            <Route path="pro/profile"      element={<ProRoute><ProProfilePage /></ProRoute>} />

            {/* Admin */}
            redirectTo: `${process.env.FRONTEND_URL ?? 'https://topsy-frontend.vercel.app'}/welcome`,
          </Route>
          <Route path="welcome" element={<WelcomePage />} />
```

Finalmente en Supabase → **Authentication** → **URL Configuration** → **Redirect URLs**, cambia la URL de redirección a:
```
https://topsy-frontend.vercel.app/welcome
        </Routes>
        <Route path="*" element={<NotFoundPage />} />
      </BrowserRouter>
    </QueryClientProvider>
  )
}