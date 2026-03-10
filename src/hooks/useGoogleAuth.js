import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../services/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

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
      // Guardamos el role antes de salir — los query params del redirectTo
      // pueden perderse dependiendo del proveedor OAuth
      sessionStorage.setItem('oauth_role', role)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/oauth/callback`,
          queryParams: { access_type: 'offline', prompt: 'select_account' },
        },
      })

      if (error) {
        console.error('[Google OAuth]', error)
        toast.error('Error al conectar con Google')
        setLoading(false)
      }
      // Si va bien Supabase redirige — continúa en OAuthCallbackPage
    } catch (err) {
      console.error('[Google OAuth]', err)
      toast.error('Error inesperado con Google')
      setLoading(false)
    }
  }

  // Llamado desde OAuthCallbackPage tras el redirect de Supabase
  const handleCallback = async (session) => {
    // Recuperar role guardado antes del redirect
    const role = sessionStorage.getItem('oauth_role') ?? 'client'
    sessionStorage.removeItem('oauth_role')

    if (!session?.access_token) {
      toast.error('No se pudo obtener la sesión de Google')
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

      setAuth(data.user, data.access_token, data.refresh_token)
      toast.success(`¡Bienvenido, ${data.user.full_name?.split(' ')[0]} ✨`)

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
