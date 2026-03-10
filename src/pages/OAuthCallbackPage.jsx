import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { useGoogleAuth } from '../hooks/useGoogleAuth'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { handleCallback } = useGoogleAuth()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const role = searchParams.get('role') ?? 'client'

    // Supabase pone los tokens en el hash de la URL tras el redirect
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        // Intentar parsear hash manualmente (algunos navegadores)
        navigate('/login')
        return
      }
      handleCallback(session, role)
    })
  }, []) // eslint-disable-line

  return (
    <div style={{ minHeight: '100dvh', background: '#F7F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Logo */}
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '3px', color: '#1A1612' }}>
        TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
      </div>

      {/* Spinner */}
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(184,131,58,0.15)', borderTopColor: '#B8833A', animation: 'spin 0.8s linear infinite' }} />

      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, color: 'rgba(26,22,18,0.4)' }}>
        Conectando con Google...
      </p>
    </div>
  )
}
