import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

import Layout        from './components/layout/Layout'
import HomePage      from './pages/HomePage'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import SearchPage    from './pages/SearchPage'
import ProfessionalPage from './pages/ProfessionalPage'
import BookingPage   from './pages/BookingPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage        from './pages/ProfilePage'
import ProOnboardingPage  from './pages/ProOnboardingPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

// Route guards
const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token)
  return !token ? children : <Navigate to="/dashboard" replace />
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
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="professional/:id" element={<ProfessionalPage />} />

            <Route path="login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            <Route path="booking/:professionalId/:serviceId" element={
              <PrivateRoute><BookingPage /></PrivateRoute>
            } />
            <Route path="dashboard" element={
              <PrivateRoute><DashboardPage /></PrivateRoute>
            } />
            <Route path="profile" element={
              <PrivateRoute><ProfilePage /></PrivateRoute>
            } />
            <Route path="pro/onboarding" element={
              <PrivateRoute><ProOnboardingPage /></PrivateRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}