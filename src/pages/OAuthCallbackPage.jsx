import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { useGoogleAuth } from '../hooks/useGoogleAuth'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { handleCallback } = useGoogleAuth()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    let subscription = null
    let timeout = null

    const setup = async () => {
      // Manejar el código en la URL (Apple usa query params, Google usa hash)
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')

      // Si hay código de Apple en la URL, dejar que Supabase lo procese
      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (data?.session) {
            handleCallback(data.session)
            return
          }
          if (error) {
            console.error('[OAuthCallback] exchangeCodeForSession error:', error)
            navigate('/login')
            return
          }
        } catch (err) {
          console.error('[OAuthCallback] exchange error:', err)
          navigate('/login')
          return
        }
      }

      // Si hay access_token en el hash (Google)
      if (accessToken) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            handleCallback(session)
            return
          }
        } catch (_) {}
      }

      // Intentar obtener sesión existente
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          handleCallback(session)
          return
        }
      } catch (_) {}

      // Esperar evento de auth state change
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          clearTimeout(timeout)
          data.subscription.unsubscribe()
          handleCallback(session)
        } else if (event === 'SIGNED_OUT') {
          clearTimeout(timeout)
          data.subscription.unsubscribe()
          navigate('/login')
        }
      })

      subscription = data.subscription

      // 20 segundos para Apple que tarda más
      timeout = setTimeout(() => {
        subscription?.unsubscribe()
        navigate('/login')
      }, 20000)
    }

    setup()
    return () => { clearTimeout(timeout); subscription?.unsubscribe() }
  }, []) // eslint-disable-line

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '3px', color: '#1A1612' }}>
        TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
      </p>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(26,22,18,0.08)', borderTopColor: '#1A1612', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, color: 'rgba(26,22,18,0.4)' }}>Conectando...</p>
    </div>
  )
}
