import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import toast from 'react-hot-toast'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.5-.2-3-.4-4.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 16.3 5 9.7 8.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c4.9 0 9.3-1.9 12.7-4.9l-5.9-5c-1.9 1.4-4.2 2.2-6.8 2.2-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.5 41 16.3 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4.1 5.3l5.9 5C37 38.8 44 33 44 25c0-1.5-.2-3-.4-4.5z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 814 1000">
      <path fill="currentColor" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.8 0 663.1 0 541.8c0-194.3 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
    </svg>
  )
}

export default function LoginPage() {
  const navigate       = useNavigate()
  const location       = useLocation()
  const [searchParams] = useSearchParams()
  const { setAuth }    = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [emailStep, setEmailStep] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { loginWithGoogle, loginWithApple, loading: oauthLoading } = useGoogleAuth()

  const getRedirect = (role) => {
    const next = searchParams.get('next') || location.state?.from
    if (next && next !== '/login' && !next.startsWith('/login')) return next
    return role === 'professional' ? '/pro/dashboard' : '/'
  }

  const nextParam = searchParams.get('next')
  if (nextParam) sessionStorage.setItem('login_redirect', nextParam)

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      // Si falta completar perfil (sin teléfono verificado)
      if (data.needs_complete_profile) {
        sessionStorage.setItem('pending_access_token', data.access_token)
        sessionStorage.setItem('pending_refresh_token', data.refresh_token)
        sessionStorage.setItem('pending_user', JSON.stringify(data.user))
        navigate('/complete-profile')
        return
      }
      setAuth(data.user, data.access_token, data.refresh_token)
      const name = data.user.full_name?.split(' ')[0] || 'Usuario'
      toast.success(`Bienvenido, ${name} ✨`)
      navigate(getRedirect(data.user.role))
    },
    onError: (err) => {
      const data = err.response?.data
      if (data?.email_not_confirmed) {
        toast.error('Verifica tu email antes de entrar. Revisa tu bandeja de entrada.', { duration: 6000 })
      } else if (data?.banned) {
        toast.error(data.error ?? 'Tu cuenta ha sido suspendida.', { duration: 8000 })
      } else {
        toast.error(data?.error ?? 'Email o contraseña incorrectos')
      }
    },
  })

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .fade-up{animation:fadeUp 0.3s ease forwards}
        .social-btn:hover{background:#F5F5F4 !important}
        .login-btn:hover{opacity:0.88}
        input:focus{border-color:#1A1612 !important}
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={() => emailStep ? setEmailStep(false) : navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,22,18,0.5)', fontSize: 20, padding: 4 }}>
          ←
        </button>
        <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#1A1612' }}>
          TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
        </Link>
        <div style={{ width: 32 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', width: '100%', padding: '0 24px 40px' }}>

        {!emailStep ? (
          <div className="fade-up">
            <div style={{ paddingTop: 40, paddingBottom: 32, textAlign: 'center' }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: '#1A1612', marginBottom: 8 }}>Iniciar sesión</h1>
              <p style={{ color: 'rgba(26,22,18,0.45)', fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>Accede a tu cuenta de TopSy</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <input
                type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && email && setEmailStep(true)}
                style={{ width: '100%', padding: '14px 16px', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: 10, fontSize: 15, fontFamily: 'Outfit, sans-serif', color: '#1A1612', background: '#FAFAF9', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              />
            </div>

            <button onClick={() => email && setEmailStep(true)} disabled={!email}
              style={{ width: '100%', padding: '15px', background: !email ? 'rgba(26,22,18,0.12)' : '#1A1612', color: !email ? 'rgba(26,22,18,0.3)' : '#FFFFFF', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: !email ? 'not-allowed' : 'pointer', marginBottom: 24, transition: 'all 0.15s' }}>
              Continuar
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
              <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>o</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => loginWithGoogle('client')} disabled={oauthLoading} className="social-btn"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: 10, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600, color: '#1A1612', transition: 'background 0.15s' }}>
                {oauthLoading ? <span style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#1A1612', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> : <GoogleIcon />}
                Continuar con Google
              </button>
              <button onClick={() => loginWithApple('client')} disabled={oauthLoading} className="social-btn"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px', background: '#1A1612', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', transition: 'opacity 0.15s' }}>
                <AppleIcon />
                Continuar con Apple
              </button>
            </div>

            <p style={{ textAlign: 'center', color: 'rgba(26,22,18,0.4)', fontSize: 13, marginTop: 28, fontFamily: 'Outfit, sans-serif' }}>
              ¿Nuevo en TopSy?{' '}
              <Link to="/register" style={{ color: '#1A1612', fontWeight: 700, textDecoration: 'none' }}>Crear cuenta</Link>
            </p>
          </div>
        ) : (
          <div className="fade-up">
            <div style={{ paddingTop: 32, paddingBottom: 24 }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#1A1612', marginBottom: 6 }}>Introduce tu contraseña</h1>
              <p style={{ color: 'rgba(26,22,18,0.45)', fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>{email}</p>
            </div>

            <form onSubmit={handleSubmit(d => mutate({ email, password: d.password }))} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${errors.password ? '#f87171' : 'rgba(0,0,0,0.15)'}`, borderRadius: 10, background: '#FAFAF9', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  <input
                    {...register('password', { required: 'Contraseña requerida' })}
                    type={showPassword ? 'text' : 'password'} placeholder="Contraseña" autoComplete="current-password"
                    style={{ flex: 1, padding: '14px 16px', border: 'none', fontSize: 15, fontFamily: 'Outfit, sans-serif', color: '#1A1612', background: 'transparent', outline: 'none' }}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    style={{ background: 'none', border: 'none', padding: '14px 12px', cursor: 'pointer', color: 'rgba(26,22,18,0.35)', fontSize: 16 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4, fontFamily: 'Outfit, sans-serif' }}>{errors.password.message}</p>}
              </div>

              <div style={{ textAlign: 'right' }}>
                <Link to="/forgot-password" style={{ fontSize: 13, color: 'rgba(26,22,18,0.45)', textDecoration: 'none', fontFamily: 'Outfit, sans-serif' }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button type="submit" disabled={isPending} className="login-btn"
                style={{ width: '100%', padding: '15px', background: '#1A1612', color: '#FFFFFF', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1, transition: 'opacity 0.15s', marginTop: 4 }}>
                {isPending
                  ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                      Entrando...
                    </span>
                  : 'Iniciar sesión →'
                }
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
