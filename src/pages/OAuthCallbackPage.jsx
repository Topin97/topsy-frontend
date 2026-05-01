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
      // Primero intentamos obtener la sesión directamente — puede que Supabase
      // ya procesó el hash de la URL antes de que este componente se montara
      // (race condition con lazy loading + Suspense).
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          handleCallback(session)
          return
        }
      } catch (_) { /* continúa con el listener */ }

      // Si no hay sesión aún, esperamos el evento
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
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

      timeout = setTimeout(() => {
        subscription?.unsubscribe()
        navigate('/login')
      }, 10000)
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