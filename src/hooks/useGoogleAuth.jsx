import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../services/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const loginWithGoogle = async (role = 'client') => {
    setLoading(true)
    try {
      sessionStorage.setItem('oauth_role', role)

      const isNative = Capacitor.isNativePlatform()
      const redirectTo = isNative
        ? 'es.topsy.app://oauth/callback'
        : `${window.location.origin}/oauth/callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { access_type: 'offline', prompt: 'select_account' },
          skipBrowserRedirect: isNative,
        },
      })

      if (error) {
        toast.error('Error al conectar con Google')
        setLoading(false)
        return
      }

      // En nativo abrimos con el in-app browser
      if (isNative && data?.url) {
        await Browser.open({ url: data.url, windowName: '_self' })
      }

    } catch (err) {
      console.error('[Google OAuth]', err)
      toast.error('Error inesperado con Google')
      setLoading(false)
    }
  }

  const handleCallback = async (session) => {
    // Cerrar el in-app browser si estamos en nativo
    if (Capacitor.isNativePlatform()) {
      await Browser.close()
    }

    const role = sessionStorage.getItem('oauth_role') ?? 'client'
    sessionStorage.removeItem('oauth_role')

    if (!session?.access_token) {
      toast.error('No se pudo obtener la sesión')
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      const { data } = await authApi.oauthGoogle(
        session.access_token,
        session.refresh_token,
        role
      )

      if (data.needs_phone_verification) {
        sessionStorage.setItem('pending_access_token', data.access_token)
        sessionStorage.setItem('pending_refresh_token', data.refresh_token)
        sessionStorage.setItem('pending_user', JSON.stringify(data.user))
        navigate('/complete-profile')
        return
      }

      setAuth(data.user, data.access_token, data.refresh_token)
      const name = data.user.full_name?.split(' ')[0] || 'Usuario'
      toast.success(`¡Bienvenido, ${name}! ✨`)

      const redirect = sessionStorage.getItem('login_redirect')
      if (redirect) {
        sessionStorage.removeItem('login_redirect')
        navigate(redirect)
        return
      }

      if (data.user.role === 'professional') {
        navigate(data.user.professional_profiles ? '/pro/dashboard' : '/pro/onboarding')
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error('[OAuth callback] error:', err.response?.data ?? err.message)
      toast.error('Error al completar el inicio de sesión')
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  return { loginWithGoogle, handleCallback, loading }
}