import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGoogleAuth } from '../hooks/useGoogleAuth'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') ?? 'client'
  const { handleCallback } = useGoogleAuth()

  useEffect(() => {
    handleCallback(role)
  }, []) // eslint-disable-line

  return (
    <div style={{ minHeight: '100dvh', background: '#F7F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Logo */}
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '3px', color: '#1A1612' }}>
        TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
      </p>

      {/* Spinner */}
      <div style={{ width: 40, height: 40, border: '3px solid rgba(184,131,58,0.15)', borderTopColor: '#B8833A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />

      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, color: 'rgba(26,22,18,0.4)' }}>
        Iniciando sesión...
      </p>
    </div>
  )
}
