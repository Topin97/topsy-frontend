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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[OAuthCallback] event:', event, 'session:', !!session)

      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()
        handleCallback(session)
      } else if (event === 'SIGNED_OUT') {
        subscription.unsubscribe()
        navigate('/login')
      }
    })

    // Timeout de seguridad 10s
    const timeout = setTimeout(() => {
      console.warn('[OAuthCallback] timeout — redirigiendo a login')
      subscription.unsubscribe()
      navigate('/login')
    }, 10000)

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line

  return (
    <div style={{ minHeight: '100dvh', background: '#F7F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '3px', color: '#1A1612' }}>
        TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
      </div>

      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(184,131,58,0.15)', borderTopColor: '#B8833A', animation: 'spin 0.8s linear infinite' }} />

      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, color: 'rgba(26,22,18,0.4)' }}>
        Conectando con Google...
      </p>
    </div>
  )
}
