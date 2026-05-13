import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useQuery } from '@tanstack/react-query'
import { authApi, profApi } from './services/api'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { PushNotifications } from '@capacitor/push-notifications'
import { createClient } from '@supabase/supabase-js'

import Layout from './components/layout/Layout'
import ScrollToTop from './components/ScrollToTop'
import OnboardingScreen from './components/OnboardingScreen'

// ── Carga inmediata ──────────────────────────────────────────────────────────
import HomePage   from './pages/HomePage'
import LoginPage  from './pages/LoginPage'
import SearchPage from './pages/SearchPage'

// ── Carga diferida ───────────────────────────────────────────────────────────
const ProfessionalPage    = lazy(() => import('./pages/ProfessionalPage'))
const BookingPage         = lazy(() => import('./pages/BookingPage'))
const DashboardPage       = lazy(() => import('./pages/DashboardPage'))
const ProfilePage         = lazy(() => import('./pages/ProfilePage'))
const AdminPage           = lazy(() => import('./pages/admin/AdminPage'))
const WelcomePage         = lazy(() => import('./pages/WelcomePage'))
const NotFoundPage        = lazy(() => import('./pages/NotFoundPage'))
const PricingPage         = lazy(() => import('./pages/PricingPage'))
const ForgotPasswordPage  = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage   = lazy(() => import('./pages/ResetPasswordPage'))
const AuthCallbackPage    = lazy(() => import('./pages/AuthCallbackPage'))
const OAuthCallbackPage   = lazy(() => import('./pages/OAuthCallbackPage'))
const PrivacyPage         = lazy(() => import('./pages/PrivacyPage'))
const ProOnboardingPage   = lazy(() => import('./pages/ProOnboardingPage'))
const CompleteProfilePage = lazy(() => import('./pages/CompleteProfilePage'))
const RegisterPage        = lazy(() => import('./pages/RegisterPage'))
const RegisterClientPage  = lazy(() => import('./pages/RegisterClientPage'))
const RegisterProPage     = lazy(() => import('./pages/RegisterProPage'))
const ReviewPage          = lazy(() => import('./pages/ReviewPage'))
const ProWaitlistPage     = lazy(() => import('./pages/professional/ProWaitlistPage'))
const ProDashboardPage    = lazy(() => import('./pages/professional/ProDashboardPage'))
const ProServicesPage     = lazy(() => import('./pages/professional/ProServicesPage'))
const ProAvailabilityPage = lazy(() => import('./pages/professional/ProAvailabilityPage'))
const ProProfilePage      = lazy(() => import('./pages/professional/ProProfilePage'))

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(184,131,58,0.15)', borderTopColor: '#B8833A', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
})

const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()
  if (!token) {
    const dest = location.pathname + location.search
    return <Navigate to={`/login?next=${encodeURIComponent(dest)}`} state={{ from: dest }} replace />
  }
  return children
}

const PublicRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token)
  return !token ? children : <Navigate to="/" replace />
}

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
  if (isError) return <Navigate to="/pro/onboarding" replace />
  return children
}

const AdminRoute = ({ children }) => {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

// ── Deep link handler ────────────────────────────────────────
function CapacitorDeepLinkHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const handleUrl = async ({ url }) => {
      console.log('[DeepLink] URL recibida:', url)

      if (url.includes('oauth/callback') || url.includes('topsy://')) {
        const hashIndex = url.indexOf('#')
        const queryIndex = url.indexOf('?')

        let params = new URLSearchParams()
        if (hashIndex !== -1) {
          params = new URLSearchParams(url.substring(hashIndex + 1))
        } else if (queryIndex !== -1) {
          params = new URLSearchParams(url.substring(queryIndex + 1))
        }

        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (accessToken) {
          try {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken ?? '',
            })
            console.log('[DeepLink] Sesión establecida')
          } catch (err) {
            console.error('[DeepLink] Error setSession:', err)
          }
        }

        navigate('/oauth/callback')
      }
    }

    CapApp.addListener('appUrlOpen', handleUrl)
    return () => { CapApp.removeAllListeners() }
  }, [navigate])

  return null
}

// 🔥 PUSH HANDLER
function PushNotificationsHandler() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const initPush = async () => {
      const permStatus = await PushNotifications.requestPermissions()

      if (permStatus.receive === 'granted') {
        await PushNotifications.register()
      } else {
        console.log('[Push] Permiso denegado')
      }
    }

    PushNotifications.addListener('registration', (token) => {
      console.log('[Push] Token:', token.value)
    })

    PushNotifications.addListener('registrationError', (error) => {
      console.error('[Push] Error registro:', error)
    })

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Notificación recibida:', notification)
    })

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('[Push] Click notificación:', notification)
    })

    initPush()

    return () => {
      PushNotifications.removeAllListeners()
    }
  }, [])

  return null
}

// ── AppInner ─────────────────────────────────────
function AppInner() {
const [showOnboarding, setShowOnboarding] = useState(
  Capacitor.isNativePlatform() && !localStorage.getItem('topsy_onboarding_done')
)
  if (showOnboarding) {
    return <OnboardingScreen onFinish={() => setShowOnboarding(false)} />
  }

  return (
    <>
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

      <Suspense fallback={<PageLoader />}>
        <ScrollToTop />
        <CapacitorDeepLinkHandler />
        <PushNotificationsHandler />

        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="professional/:id" element={<ProfessionalPage />} />
            <Route path="register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="register/client" element={<PublicRoute><RegisterClientPage /></PublicRoute>} />
            <Route path="register/pro" element={<PublicRoute><RegisterProPage /></PublicRoute>} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="auth/callback" element={<AuthCallbackPage />} />
            <Route path="oauth/callback" element={<OAuthCallbackPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="welcome" element={<WelcomePage />} />
            <Route path="complete-profile" element={<CompleteProfilePage />} />
            <Route path="booking/:professionalId/:serviceId" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
            <Route path="dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="review/:bookingId" element={<ReviewPage />} />
            <Route path="pro/onboarding" element={<PrivateRoute><ProOnboardingPage /></PrivateRoute>} />
            <Route path="pro/dashboard" element={<ProRoute><ProDashboardPage /></ProRoute>} />
            <Route path="pro/services" element={<ProRoute><ProServicesPage /></ProRoute>} />
            <Route path="pro/availability" element={<ProRoute><ProAvailabilityPage /></ProRoute>} />
            <Route path="pro/profile" element={<ProRoute><ProProfilePage /></ProRoute>} />
            <Route path="pro/waitlist" element={<ProRoute><ProWaitlistPage /></ProRoute>} />
            <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
// ────────────────────────────────────────────────────────────────
// Bloquea el render hasta que Zustand termine de leer localStorage.
// Sin esto, las llamadas iniciales a /me salen sin token y devuelven 401.
// ────────────────────────────────────────────────────────────────
function AuthHydrationGate({ children }) {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated())

  useEffect(() => {
    const unsubFinish = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    // Comprobación de seguridad: si ya estaba hidratado al montar
    if (useAuthStore.persist.hasHydrated()) setHydrated(true)
    return unsubFinish
  }, [])

  if (!hydrated) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid rgba(184,131,58,0.15)',
          borderTopColor: '#B8833A',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return children
}
export default function App() {
  return (
    <AuthHydrationGate>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </QueryClientProvider>
    </AuthHydrationGate>
  )
}
