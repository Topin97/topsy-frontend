import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useQuery } from '@tanstack/react-query'
import { authApi, profApi } from './services/api'

import Layout              from './components/layout/Layout'
import HomePage            from './pages/HomePage'
import LoginPage           from './pages/LoginPage'
import RegisterPage        from './pages/RegisterPage'
import RegisterClientPage  from './pages/RegisterClientPage'
import RegisterProPage     from './pages/RegisterProPage'
import SearchPage          from './pages/SearchPage'
import ProfessionalPage    from './pages/ProfessionalPage'
import BookingPage         from './pages/BookingPage'
import DashboardPage       from './pages/DashboardPage'
import ProfilePage         from './pages/ProfilePage'
import AdminPage           from './pages/admin/AdminPage'
import WelcomePage         from './pages/WelcomePage'
import NotFoundPage        from './pages/NotFoundPage'
import ForgotPasswordPage  from './pages/ForgotPasswordPage'
import ResetPasswordPage   from './pages/ResetPasswordPage'
import ProOnboardingPage   from './pages/ProOnboardingPage'

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
  return !token ? children : <Navigate to="/" replace />
}

// Redirige al onboarding si el profesional aún no tiene perfil
const ProRoute = ({ children }) => {
  const { token, isProfessional } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (!isProfessional()) return <Navigate to="/dashboard" replace />
  return <ProRouteInner>{children}</ProRouteInner>
}

const ProRouteInner = ({ children }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['myProfile'],
    queryFn: () => profApi.getMyProfile(),
    retry: false,
  })

  if (isLoading) return null

  // 404 or no data → no profile yet → send to onboarding
  if (isError || !data?.data?.data) return <Navigate to="/pro/onboarding" replace />

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
              background: '#FFFFFF',
              color: '#1A1612',
              border: '1px solid rgba(184,131,58,0.25)',
              fontFamily: 'Outfit, sans-serif',
            },
            success: { iconTheme: { primary: '#B8833A', secondary: '#FFFFFF' } },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Públicas */}
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="professional/:id" element={<ProfessionalPage />} />
            <Route path="login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="register"        element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="register/client" element={<PublicRoute><RegisterClientPage /></PublicRoute>} />
            <Route path="register/pro"    element={<PublicRoute><RegisterProPage /></PublicRoute>} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password"  element={<ResetPasswordPage />} />
            <Route path="welcome"         element={<WelcomePage />} />

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

            {/* Onboarding profesional */}
            <Route path="pro/onboarding" element={
              <PrivateRoute><ProOnboardingPage /></PrivateRoute>
            } />

            {/* Panel profesional — redirige a onboarding si no tiene perfil */}
            <Route path="pro/dashboard"    element={<ProRoute><ProDashboardPage /></ProRoute>} />
            <Route path="pro/services"     element={<ProRoute><ProServicesPage /></ProRoute>} />
            <Route path="pro/availability" element={<ProRoute><ProAvailabilityPage /></ProRoute>} />
            <Route path="pro/profile"      element={<ProRoute><ProProfilePage /></ProRoute>} />

            {/* Admin */}
            <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
