import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../services/api'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import toast from 'react-hot-toast'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const called = useRef(false)
  const [transitioning, setTransitioning] = useState(false)
  const [welcomeName, setWelcomeName] = useState('')

  const runTransition = (name, target) => {
    setWelcomeName(name)
    setTransitioning(true)
    setTimeout(() => navigate(target), 1100)
  }

  const processSession = async (session) => {
    if (Capacitor.isNativePlatform()) {
      try { await Browser.close() } catch {}
    }

    const role = sessionStorage.getItem('oauth_role') ?? 'client'
    sessionStorage.removeItem('oauth_role')

    if (!session?.access_token) {
      toast.error('No se pudo obtener la sesión')
      navigate('/login')
      return
    }

    try {
      const { data } = await authApi.oauthGoogle(
        session.access_token,
        session.refresh_token,
        role
      )

      if (data.needs_complete_profile || data.needs_phone_verification) {
        sessionStorage.setItem('pending_access_token', data.access_token)
        sessionStorage.setItem('pending_refresh_token', data.refresh_token)
        sessionStorage.setItem('pending_user', JSON.stringify(data.user))
        navigate('/complete-profile')
        return
      }

      setAuth(data.user, data.access_token, data.refresh_token)
      const name = data.user.full_name?.split(' ')[0] || 'Usuario'

      let target = '/'
      const redirect = sessionStorage.getItem('login_redirect')
      if (redirect) {
        sessionStorage.removeItem('login_redirect')
        target = redirect
      } else if (data.user.role === 'professional') {
        target = data.user.professional_profiles ? '/pro/dashboard' : '/pro/onboarding'
      }

      runTransition(name, target)
    } catch (err) {
      console.error('[OAuth callback] error:', err.response?.data ?? err.message)
      toast.error('Error al completar el inicio de sesión')
      navigate('/login')
    }
  }

  useEffect(() => {
    if (called.current) return
    called.current = true

    let subscription = null
    let timeout = null

    const setup = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')

      if (error) {
        navigate('/login')
        return
      }

      // Apple PKCE flow
      if (code) {
        try {
          const { data, error: exchErr } = await supabase.auth.exchangeCodeForSession(code)
          if (data?.session) {
            processSession(data.session)
            return
          }
          if (exchErr) {
            navigate('/login')
            return
          }
        } catch {
          navigate('/login')
          return
        }
      }

      // Sesión ya existente (Google hash)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          processSession(session)
          return
        }
      } catch (_) {}

      // Esperar evento
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          clearTimeout(timeout)
          data.subscription.unsubscribe()
          processSession(session)
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
      }, 20000)
    }

    setup()
    return () => { clearTimeout(timeout); subscription?.unsubscribe() }
  }, []) // eslint-disable-line

  if (transitioning) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
        <style>{`
          @keyframes flashIn{0%{opacity:0}30%{opacity:1}100%{opacity:1}}
          @keyframes logoReveal{
            0%{transform:translate(-50%,-50%) scale(0.5);opacity:0;filter:blur(20px)}
            40%{transform:translate(-50%,-50%) scale(1);opacity:1;filter:blur(0px)}
            70%{transform:translate(-50%,-50%) scale(1.05);opacity:1}
            100%{transform:translate(-50%,-50%) scale(1.3);opacity:0;filter:blur(8px)}
          }
          @keyframes welcomeFade{
            0%{opacity:0;transform:translateX(-50%) translateY(20px)}
            30%{opacity:1;transform:translateX(-50%) translateY(0)}
            80%{opacity:1;transform:translateX(-50%) translateY(0)}
            100%{opacity:0;transform:translateX(-50%) translateY(-10px)}
          }
          @keyframes sparkleUp{
            0%{transform:translateY(100vh) scale(0);opacity:0}
            50%{opacity:1}
            100%{transform:translateY(-20vh) scale(1.2);opacity:0}
          }
        `}</style>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#1A1612 0%,#2C1810 100%)', animation: 'flashIn 0.4s ease forwards' }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 700, letterSpacing: '4px',
          fontSize: 'clamp(60px, 12vw, 100px)',
          whiteSpace: 'nowrap', color: '#FFFFFF',
          filter: 'drop-shadow(0 0 40px rgba(212,160,85,0.9))',
          animation: 'logoReveal 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}>
          TOP<span style={{ color: '#D4A055', fontStyle: 'italic' }}>sy</span>
        </div>
        {welcomeName && (
          <div style={{
            position: 'absolute',
            top: 'calc(50% + 80px)',
            left: '50%',
            fontFamily: 'Outfit, sans-serif',
            fontSize: 18, fontWeight: 500,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.05em',
            animation: 'welcomeFade 1.1s ease 0.2s forwards',
            opacity: 0,
          }}>
            Bienvenido, <span style={{ color: '#D4A055', fontWeight: 700 }}>{welcomeName}</span> ✨
          </div>
        )}
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i}
            style={{
              position: 'absolute',
              width: 6, height: 6,
              background: 'radial-gradient(circle, #D4A055 0%, transparent 70%)',
              borderRadius: '50%',
              boxShadow: '0 0 10px #D4A055',
              left: `${Math.random() * 100}%`,
              top: `${50 + Math.random() * 40}%`,
              animation: `sparkleUp ${0.8 + Math.random() * 0.4}s ease ${Math.random() * 0.4}s forwards`,
            }}
          />
        ))}
      </div>
    )
  }

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
