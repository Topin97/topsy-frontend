import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
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

export default function LoginPage() {
  const navigate    = useNavigate()
  const { setAuth } = useAuthStore()
  const [focused, setFocused]           = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { loginWithGoogle, loading: googleLoading } = useGoogleAuth()

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      setAuth(data.user, data.access_token, data.refresh_token)
      toast.success(`Bienvenido, ${data.user.full_name?.split(' ')[0]} ✨`)
      navigate(data.user.role === 'professional' ? '/pro/dashboard' : '/')
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al iniciar sesión'),
  })

  return (
    <div style={{ minHeight: '100dvh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }
        .login-card { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards; }
        .google-btn:hover  { border-color: rgba(0,0,0,0.25) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important; transform: translateY(-1px); }
        .google-btn:active { transform: translateY(0) !important; }
        .google-btn { transition: all 0.18s ease !important; }
        .login-btn:hover  { box-shadow: 0 10px 28px rgba(184,131,58,0.45) !important; transform: translateY(-1px); }
        .login-btn:active { transform: translateY(0) !important; }
        .login-btn { transition: all 0.18s ease !important; }
        .forgot-link:hover { color: #B8833A !important; }
        .register-link:hover { border-color: rgba(184,131,58,0.4) !important; color: #B8833A !important; }
      `}</style>

      {/* Fondo decorativo */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(184,131,58,0.07) 0%, transparent 60%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-8%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(184,131,58,0.05) 0%, transparent 60%)', borderRadius: '50%' }} />
      </div>

      <div className="login-card" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo + header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-block', textDecoration: 'none', marginBottom: 20 }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 700, letterSpacing: '4px', color: '#1A1612' }}>TOP</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 400, fontStyle: 'italic', color: '#B8833A' }}>sy</span>
          </Link>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.9rem,7vw,2.6rem)', fontWeight: 300, lineHeight: 1.1, color: '#1A1612', margin: '0 0 8px' }}>
            Bienvenido <em style={{ color: '#B8833A' }}>de vuelta</em>
          </h1>
          <p style={{ color: 'rgba(26,22,18,0.4)', fontSize: 14, fontFamily: 'Outfit, sans-serif', margin: 0 }}>
            Gestiona tus citas desde un solo lugar
          </p>
        </div>

        {/* Card principal */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 24, padding: '28px 24px', boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }}>

          {/* ── BOTÓN GOOGLE (destacado) ── */}
          <button
            type="button"
            className="google-btn"
            onClick={() => loginWithGoogle('client')}
            disabled={googleLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              padding: '14px 16px', background: googleLoading ? '#F7F5F2' : '#FFFFFF',
              border: '1.5px solid rgba(0,0,0,0.14)', borderRadius: 14,
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600, color: '#1A1612',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 6,
            }}
          >
            {googleLoading
              ? <span style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#B8833A', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              : <GoogleIcon />
            }
            {googleLoading ? 'Conectando...' : 'Continuar con Google'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif', marginBottom: 18 }}>
            La forma más rápida de entrar
          </p>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.07)' }} />
            <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.28)', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>o con email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.07)' }} />
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(d => mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Email */}
            <div>
              <div style={{ background: focused === 'email' ? 'rgba(184,131,58,0.03)' : '#FAFAF9', border: `1.5px solid ${errors.email ? '#f87171' : focused === 'email' ? '#B8833A' : 'rgba(0,0,0,0.09)'}`, borderRadius: 14, padding: '12px 16px', transition: 'all 0.2s', boxShadow: focused === 'email' ? '0 0 0 3px rgba(184,131,58,0.1)' : 'none' }}>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: focused === 'email' ? '#B8833A' : 'rgba(26,22,18,0.38)', marginBottom: 4, fontFamily: 'Outfit, sans-serif', fontWeight: 700, transition: 'color 0.2s' }}>
                  Email
                </label>
                <input
                  {...register('email', { required: 'Email requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })}
                  type="email" placeholder="tu@email.com" autoComplete="email"
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 15, fontFamily: 'Outfit, sans-serif', padding: 0 }}
                />
              </div>
              {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4, paddingLeft: 4, fontFamily: 'Outfit, sans-serif' }}>{errors.email.message}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <div style={{ background: focused === 'password' ? 'rgba(184,131,58,0.03)' : '#FAFAF9', border: `1.5px solid ${errors.password ? '#f87171' : focused === 'password' ? '#B8833A' : 'rgba(0,0,0,0.09)'}`, borderRadius: 14, padding: '12px 16px', transition: 'all 0.2s', boxShadow: focused === 'password' ? '0 0 0 3px rgba(184,131,58,0.1)' : 'none' }}>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: focused === 'password' ? '#B8833A' : 'rgba(26,22,18,0.38)', marginBottom: 4, fontFamily: 'Outfit, sans-serif', fontWeight: 700, transition: 'color 0.2s' }}>
                  Contraseña
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    {...register('password', { required: 'Contraseña requerida' })}
                    type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
                    onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 15, fontFamily: 'Outfit, sans-serif', padding: 0 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,22,18,0.25)', fontSize: 15, padding: 0, lineHeight: 1, flexShrink: 0 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4, paddingLeft: 4, fontFamily: 'Outfit, sans-serif' }}>{errors.password.message}</p>}
            </div>

            {/* Olvidé contraseña */}
            <div style={{ textAlign: 'right', marginTop: -4 }}>
              <Link to="/forgot-password" className="forgot-link" style={{ fontSize: 13, color: 'rgba(26,22,18,0.4)', textDecoration: 'none', fontFamily: 'Outfit, sans-serif', transition: 'color 0.15s' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="login-btn"
              style={{
                width: '100%', padding: '15px', fontSize: 15, fontWeight: 700,
                background: isPending ? 'rgba(184,131,58,0.45)' : 'linear-gradient(135deg,#B8833A,#D4A055)',
                color: '#FFFFFF', border: 'none', borderRadius: 14,
                cursor: isPending ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit, sans-serif', letterSpacing: '0.03em',
                boxShadow: isPending ? 'none' : '0 6px 20px rgba(184,131,58,0.32)',
                marginTop: 4,
              }}
            >
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

        {/* Registro */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.4)', fontFamily: 'Outfit, sans-serif', marginBottom: 10 }}>
            ¿Nuevo en TopSy?
          </p>
          <Link
            to="/register"
            className="register-link"
            style={{
              display: 'block', textAlign: 'center', textDecoration: 'none',
              background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.1)',
              borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 600,
              color: '#1A1612', fontFamily: 'Outfit, sans-serif',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.18s',
            }}
          >
            Crear cuenta gratis →
          </Link>
        </div>

      </div>
    </div>
  )
}