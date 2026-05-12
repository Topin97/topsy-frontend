import { useState, useRef, useEffect } from 'react'
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
  const [transitioning, setTransitioning] = useState(false)
  const [welcomeName, setWelcomeName] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const passwordRef = useRef(null)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { ref: registerPasswordRef, ...passwordRegister } = register('password', { required: 'Contraseña requerida' })
  const { loginWithGoogle, loginWithApple, loading: oauthLoading } = useGoogleAuth()

  // Auto-focus en el campo de contraseña cuando pasamos al paso 2
  useEffect(() => {
    if (emailStep && passwordRef.current) {
      setTimeout(() => passwordRef.current?.focus(), 350)
    }
  }, [emailStep])

  const getRedirect = (role) => {
    const next = searchParams.get('next') || location.state?.from
    if (next && next !== '/login' && !next.startsWith('/login')) return next
    return role === 'professional' ? '/pro/dashboard' : '/'
  }

  const nextParam = searchParams.get('next')
  if (nextParam) sessionStorage.setItem('login_redirect', nextParam)

  const triggerTransition = (name, redirectFn) => {
    setWelcomeName(name)
    setTransitioning(true)
    setTimeout(redirectFn, 1100)
  }

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      if (data.needs_complete_profile) {
        sessionStorage.setItem('pending_access_token', data.access_token)
        sessionStorage.setItem('pending_refresh_token', data.refresh_token)
        sessionStorage.setItem('pending_user', JSON.stringify(data.user))
        navigate('/complete-profile')
        return
      }
      setAuth(data.user, data.access_token, data.refresh_token)
      const name = data.user.full_name?.split(' ')[0] || 'Usuario'
      triggerTransition(name, () => navigate(getRedirect(data.user.role)))
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
    <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        /* ── KEYFRAMES (sistema unificado TopSy) ── */
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.9) } to { opacity: 1; transform: scale(1) } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px) } to { opacity: 1; transform: translateX(0) } }

        /* Animaciones de la transición cinemática (PRESERVADAS) */
        @keyframes flashIn { 0% { opacity: 0 } 30% { opacity: 1 } 100% { opacity: 1 } }
        @keyframes fadeOutContent { 0% { opacity: 1 } 100% { opacity: 0 } }
        @keyframes logoReveal {
          0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0; filter: blur(20px) }
          40% { transform: translate(-50%,-50%) scale(1); opacity: 1; filter: blur(0px) }
          70% { transform: translate(-50%,-50%) scale(1.05); opacity: 1 }
          100% { transform: translate(-50%,-50%) scale(1.3); opacity: 0; filter: blur(8px) }
        }
        @keyframes welcomeFade {
          0% { opacity: 0; transform: translateX(-50%) translateY(20px) }
          30% { opacity: 1; transform: translateX(-50%) translateY(0) }
          80% { opacity: 1; transform: translateX(-50%) translateY(0) }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px) }
        }
        @keyframes sparkle {
          0% { transform: translateY(100vh) scale(0); opacity: 0 }
          50% { opacity: 1 }
          100% { transform: translateY(-20vh) scale(1.2); opacity: 0 }
        }
        @keyframes errorPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(248,113,113,0.4) }
          50% { box-shadow: 0 0 0 4px rgba(248,113,113,0.15) }
        }

        /* Clases utilitarias */
        .anim-fadeup { animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both }
        .anim-scale { animation: fadeInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both }
        .anim-slide-right { animation: slideInRight 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both }
        .anim-slide-left { animation: slideInLeft 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both }

        /* Inputs — focus dorado premium */
        .topsy-input {
          width: 100%;
          padding: 14px 16px;
          border: 1.5px solid rgba(0,0,0,0.15);
          border-radius: 10px;
          font-size: 15px;
          font-family: Outfit, sans-serif;
          color: #1A1612;
          background: #FAFAF9;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
        }
        .topsy-input:focus {
          border-color: #B8833A !important;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(184,131,58,0.1);
        }
        .topsy-input-wrap {
          display: flex;
          align-items: center;
          border: 1.5px solid rgba(0,0,0,0.15);
          border-radius: 10px;
          background: #FAFAF9;
          overflow: hidden;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        }
        .topsy-input-wrap.focused {
          border-color: #B8833A;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(184,131,58,0.1);
        }
        .topsy-input-wrap.error {
          border-color: #f87171;
          animation: errorPulse 1.4s ease-in-out infinite;
        }

        /* Botones */
        .primary-btn {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          font-family: Outfit, sans-serif;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, box-shadow 0.25s ease;
        }
        .primary-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(26,22,18,0.25);
        }
        .primary-btn:not(:disabled):active {
          transform: translateY(0) scale(0.98);
        }

        .social-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px;
          border-radius: 10px;
          cursor: pointer;
          font-family: Outfit, sans-serif;
          font-size: 15px;
          font-weight: 600;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease, box-shadow 0.25s ease, border-color 0.2s ease;
        }
        .social-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }
        .social-btn:not(:disabled):active {
          transform: translateY(0) scale(0.98);
        }
        .social-btn-google { background: #FFFFFF; border: 1.5px solid rgba(0,0,0,0.15); color: #1A1612; }
        .social-btn-google:not(:disabled):hover { border-color: rgba(0,0,0,0.3); background: #FAFAF9; }
        .social-btn-apple { background: #1A1612; border: none; color: #FFFFFF; }
        .social-btn-apple:not(:disabled):hover { background: #2C1810; }

        /* Header — logo y back button con micro-interacciones */
        .header-logo { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); display: inline-block; }
        .header-logo:hover { transform: scale(1.05); }
        .back-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(26,22,18,0.5); font-size: 20px; padding: 4px;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease;
        }
        .back-btn:hover { transform: translateX(-3px); color: #1A1612; }

        /* Toggle de password */
        .pwd-toggle {
          background: none; border: none; padding: 14px 12px; cursor: pointer;
          color: rgba(26,22,18,0.35); font-size: 16px;
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .pwd-toggle:hover { color: #1A1612; transform: scale(1.1); }
        .pwd-toggle:active { transform: scale(0.92); }

        /* Forgot password link */
        .forgot-link {
          font-size: 13px;
          color: rgba(26,22,18,0.45);
          text-decoration: none;
          font-family: Outfit, sans-serif;
          transition: color 0.2s ease;
        }
        .forgot-link:hover { color: #B8833A; }

        /* Footer signup link */
        .signup-link {
          color: #1A1612;
          font-weight: 700;
          text-decoration: none;
          position: relative;
          transition: color 0.2s ease;
        }
        .signup-link::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -2px;
          height: 1.5px;
          background: #B8833A;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.25s ease;
        }
        .signup-link:hover { color: #B8833A; }
        .signup-link:hover::after { transform: scaleX(1); }

        /* ── TRANSICIÓN CINEMÁTICA (preservada intacta) ── */
        .transition-overlay { position: fixed; inset: 0; z-index: 1000; pointer-events: none }
        .transition-bg { position: absolute; inset: 0; background: linear-gradient(180deg,#1A1612 0%,#2C1810 100%); animation: flashIn 0.4s ease forwards }
        .transition-logo {
          position: absolute; top: 50%; left: 50%;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700; letter-spacing: 4px;
          font-size: clamp(60px, 12vw, 100px);
          white-space: nowrap; color: #FFFFFF;
          filter: drop-shadow(0 0 40px rgba(212,160,85,0.9));
          animation: logoReveal 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .transition-welcome {
          position: absolute;
          top: calc(50% + 80px);
          left: 50%;
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 500;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.05em;
          animation: welcomeFade 1.1s ease 0.2s forwards;
          opacity: 0;
        }
        .sparkle {
          position: absolute;
          width: 6px; height: 6px;
          background: radial-gradient(circle, #D4A055 0%, transparent 70%);
          border-radius: 50%;
          box-shadow: 0 0 10px #D4A055;
          animation: sparkle 1s ease forwards;
        }
        .content-fadeout { animation: fadeOutContent 0.3s ease forwards }

        /* ── REDUCED MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          .anim-fadeup, .anim-scale, .anim-slide-right, .anim-slide-left {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .topsy-input, .topsy-input-wrap, .primary-btn, .social-btn,
          .header-logo, .back-btn, .pwd-toggle, .signup-link::after {
            transition: none !important;
          }
          .topsy-input-wrap.error { animation: none !important; }
          /* La transición cinemática se mantiene porque es central a la UX del login;
             solo se reduce su duración percibida */
        }
      `}</style>

      {/* ═══════════════════ TRANSICIÓN CINEMÁTICA ═══════════════════ */}
      {transitioning && (
        <div className="transition-overlay">
          <div className="transition-bg" />
          <div className="transition-logo">
            TOP<span style={{ color: '#D4A055', fontStyle: 'italic' }}>sy</span>
          </div>
          {welcomeName && (
            <div className="transition-welcome">
              Bienvenido, <span style={{ color: '#D4A055', fontWeight: 700 }}>{welcomeName}</span> ✨
            </div>
          )}
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${50 + Math.random() * 40}%`,
                animationDelay: `${Math.random() * 0.4}s`,
                animationDuration: `${0.8 + Math.random() * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div className={transitioning ? 'content-fadeout' : 'anim-fadeup'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={() => emailStep ? setEmailStep(false) : navigate('/')} className="back-btn" aria-label="Volver">
          ←
        </button>
        <Link to="/" className="header-logo" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#1A1612' }}>
          TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
        </Link>
        <div style={{ width: 32 }} />
      </div>

      {/* ═══════════════════ CUERPO ═══════════════════ */}
      <div className={transitioning ? 'content-fadeout' : ''} style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', width: '100%', padding: '0 24px 40px' }}>

        {!emailStep ? (
          // ─── PASO 1: Email ───
          <div key="email-step">
            <div className="anim-fadeup" style={{ animationDelay: '0.05s', paddingTop: 40, paddingBottom: 32, textAlign: 'center' }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: '#1A1612', marginBottom: 8 }}>Iniciar sesión</h1>
              <p style={{ color: 'rgba(26,22,18,0.45)', fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>Accede a tu cuenta de TopSy</p>
            </div>

            <div className="anim-fadeup" style={{ animationDelay: '0.15s', marginBottom: 16 }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                onKeyDown={e => e.key === 'Enter' && email && setEmailStep(true)}
                className="topsy-input"
                autoComplete="email"
                style={{ transform: emailFocused ? 'translateY(-1px)' : 'translateY(0)' }}
              />
            </div>

            <button
              onClick={() => email && setEmailStep(true)}
              disabled={!email}
              className="primary-btn anim-fadeup"
              style={{
                animationDelay: '0.22s',
                background: !email ? 'rgba(26,22,18,0.12)' : '#1A1612',
                color: !email ? 'rgba(26,22,18,0.3)' : '#FFFFFF',
                marginBottom: 24,
                cursor: !email ? 'not-allowed' : 'pointer',
              }}
            >
              Continuar
            </button>

            <div className="anim-fadeup" style={{ animationDelay: '0.3s', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
              <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>o</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => loginWithGoogle('client')}
                disabled={oauthLoading}
                className="social-btn social-btn-google anim-fadeup"
                style={{ animationDelay: '0.38s' }}
              >
                {oauthLoading
                  ? <span style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#1A1612', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  : <GoogleIcon />
                }
                Continuar con Google
              </button>
              <button
                onClick={() => loginWithApple('client')}
                disabled={oauthLoading}
                className="social-btn social-btn-apple anim-fadeup"
                style={{ animationDelay: '0.46s' }}
              >
                <AppleIcon />
                Continuar con Apple
              </button>
            </div>

            <p className="anim-fadeup" style={{ animationDelay: '0.55s', textAlign: 'center', color: 'rgba(26,22,18,0.4)', fontSize: 13, marginTop: 28, fontFamily: 'Outfit, sans-serif' }}>
              ¿Nuevo en TopSy?{' '}
              <Link to="/register" className="signup-link">Crear cuenta</Link>
            </p>
          </div>
        ) : (
          // ─── PASO 2: Contraseña ───
          <div key="password-step">
            <div className="anim-slide-right" style={{ paddingTop: 32, paddingBottom: 24 }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#1A1612', marginBottom: 6 }}>Introduce tu contraseña</h1>
              <p style={{ color: 'rgba(26,22,18,0.45)', fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>{email}</p>
            </div>

            <form onSubmit={handleSubmit(d => mutate({ email, password: d.password }))} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="anim-slide-right" style={{ animationDelay: '0.08s' }}>
                <div className={`topsy-input-wrap ${passwordFocused ? 'focused' : ''} ${errors.password ? 'error' : ''}`}>
                  <input
                    {...passwordRegister}
                    ref={el => {
                      registerPasswordRef(el)
                      passwordRef.current = el
                    }}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    style={{ flex: 1, padding: '14px 16px', border: 'none', fontSize: 15, fontFamily: 'Outfit, sans-serif', color: '#1A1612', background: 'transparent', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="pwd-toggle"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && (
                  <p className="anim-fadeup" style={{ color: '#f87171', fontSize: 12, marginTop: 6, fontFamily: 'Outfit, sans-serif' }}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="anim-slide-right" style={{ animationDelay: '0.16s', textAlign: 'right' }}>
                <Link to="/forgot-password" className="forgot-link">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="primary-btn anim-slide-right"
                style={{
                  animationDelay: '0.24s',
                  background: '#1A1612',
                  color: '#FFFFFF',
                  marginTop: 4,
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.7 : 1,
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
        )}
      </div>
    </div>
  )
}
