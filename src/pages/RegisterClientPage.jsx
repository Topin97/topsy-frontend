import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import toast from 'react-hot-toast'
import { useState } from 'react'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.5-.2-3-.4-4.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 16.3 5 9.7 8.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c4.9 0 9.3-1.9 12.7-4.9l-5.9-5c-1.9 1.4-4.2 2.2-6.8 2.2-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.5 41 16.3 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4.1 5.3l5.9 5C37 38.8 44 33 44 25c0-1.5-.2-3-.4-4.5z"/>
    </svg>
  )
}

function Field({ icon, label, error, focused, children, delay = 0 }) {
  return (
    <div className="anim-fadeup" style={{ animationDelay: `${delay}s`, marginBottom: 12 }}>
      <div className={`field-wrap ${error ? 'has-error' : ''}`} style={{
        background: focused ? 'rgba(184,131,58,0.04)' : '#FFFFFF',
        border: `1.5px solid ${error ? '#f87171' : focused ? '#B8833A' : 'rgba(26,22,18,0.1)'}`,
        borderRadius: 16,
        padding: '14px 18px',
        boxShadow: focused ? '0 0 0 4px rgba(184,131,58,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease',
      }}>
        {icon && (
          <span className="field-icon" style={{
            fontSize: 18,
            opacity: focused ? 1 : 0.4,
            transition: 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            transform: focused ? 'scale(1.15)' : 'scale(1)',
          }}>{icon}</span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={{
            display: 'block', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: focused ? '#B8833A' : 'rgba(26,22,18,0.4)',
            marginBottom: 4, fontFamily: 'Outfit, sans-serif', fontWeight: 600,
            transition: 'color 0.2s ease',
          }}>{label}</label>
          {children}
        </div>
      </div>
      {error && (
        <p className="error-msg" style={{ color: '#f87171', fontSize: 12, marginTop: 5, paddingLeft: 16, fontFamily: 'Outfit, sans-serif' }}>
          {error}
        </p>
      )}
    </div>
  )
}

const inputStyle = { width: '100%', background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 15, fontFamily: 'Outfit, sans-serif', padding: 0 }

const sharedStyles = `
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes fadeInScale { from { opacity: 0; transform: scale(0.85) } to { opacity: 1; transform: scale(1) } }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }
  @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
  @keyframes shake { 0%,100% { transform: translateX(0) } 20%,60% { transform: translateX(-6px) } 40%,80% { transform: translateX(6px) } }
  @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
  @keyframes glow { 0%,100% { box-shadow: 0 12px 32px rgba(184,131,58,0.3) } 50% { box-shadow: 0 16px 48px rgba(184,131,58,0.5) } }
  @keyframes loadingPulse { 0%,100% { opacity: 0.85 } 50% { opacity: 1 } }

  .anim-fadeup { animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both }
  .anim-scale { animation: fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both }
  .anim-slide-right { animation: slideInRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both }

  .field-wrap.has-error { animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) }
  .error-msg { animation: fadeInUp 0.3s ease both }

  .google-btn { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, border-color 0.25s ease, background 0.2s ease; }
  .google-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08) !important; border-color: #B8833A !important; }
  .google-btn:not(:disabled):active { transform: translateY(-1px) scale(0.98); }

  .primary-btn { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, opacity 0.25s ease; }
  .primary-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(184,131,58,0.4) !important; }
  .primary-btn:not(:disabled):active { transform: translateY(-1px) scale(0.99); }
  .primary-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent); transition: left 0.6s ease; pointer-events: none; }
  .primary-btn:not(:disabled):hover::before { left: 100%; }
  .primary-btn.loading { animation: loadingPulse 1.4s ease-in-out infinite; }

  .header-logo { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); display: inline-block; }
  .header-logo:hover { transform: scale(1.05); }
  .back-link { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease; display: inline-block; }
  .back-link:hover { transform: translateX(-3px); color: #1A1612 !important; }

  .pwd-toggle { transition: transform 0.2s ease, color 0.2s ease; }
  .pwd-toggle:hover { transform: scale(1.15); color: #1A1612 !important; }
  .pwd-toggle:active { transform: scale(0.9); }

  .gold-link { position: relative; transition: color 0.2s ease; }
  .gold-link::after { content: ''; position: absolute; left: 0; right: 0; bottom: -2px; height: 1.5px; background: #B8833A; transform: scaleX(0); transform-origin: center; transition: transform 0.25s ease; }
  .gold-link:hover::after { transform: scaleX(1); }

  .dark-link { position: relative; transition: color 0.2s ease; }
  .dark-link::after { content: ''; position: absolute; left: 0; right: 0; bottom: -2px; height: 1.5px; background: #B8833A; transform: scaleX(0); transform-origin: center; transition: transform 0.25s ease; }
  .dark-link:hover { color: #B8833A !important; }
  .dark-link:hover::after { transform: scaleX(1); }

  .email-icon { animation: float 3.5s ease-in-out infinite, glow 3.5s ease-in-out infinite; }
  .step-card { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease; }
  .step-card:hover { transform: translateX(4px); background: rgba(184,131,58,0.04); }
  .step-card:hover .step-num { transform: scale(1.08); box-shadow: 0 6px 18px rgba(184,131,58,0.35); }
  .step-num { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
  .cta-dark-btn { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease; }
  .cta-dark-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(26,22,18,0.3) !important; }
  .cta-dark-btn:active { transform: translateY(-1px) scale(0.99); }

  @media (prefers-reduced-motion: reduce) {
    .anim-fadeup, .anim-scale, .anim-slide-right, .field-wrap.has-error, .error-msg,
    .email-icon, .primary-btn.loading {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
    .google-btn, .primary-btn, .header-logo, .back-link, .pwd-toggle,
    .step-card, .step-num, .cta-dark-btn, .field-wrap, .field-icon {
      transition: none !important;
    }
  }
`

export default function RegisterClientPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { loginWithGoogle, loading: googleLoading } = useGoogleAuth()
  const { executeRecaptcha } = useGoogleReCaptcha()

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => authApi.register({ ...data, role: 'client' }),
    onSuccess: ({ data }) => {
      if (data.access_token) {
        setAuth(data.user, data.access_token, data.refresh_token)
        toast.success('¡Bienvenido a TopSy! ✨')
        navigate('/')
      } else {
        setSentTo(data.user?.email ?? '')
        setEmailSent(true)
      }
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al registrarse'),
  })

  const onSubmit = async (data) => {
    let token = null
    try {
      if (executeRecaptcha) token = await executeRecaptcha('register')
    } catch { /* captcha no disponible */ }
    mutate({ ...data, recaptcha_token: token ?? 'bypass' })
  }

  // ═══════════════════ PANTALLA EMAIL ENVIADO ═══════════════════
  if (emailSent) {
    return (
      <div style={{ minHeight: '100dvh', background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF7F2 100%)', display: 'flex', flexDirection: 'column' }}>
        <style>{sharedStyles}</style>

        <header className="anim-fadeup" style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(26,22,18,0.06)' }}>
          <Link to="/" className="header-logo" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '3px', textDecoration: 'none', color: '#1A1612' }}>
            TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
          </Link>
        </header>

        <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '36px 24px' }}>
          <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
            <div className="email-icon anim-scale" style={{
              animationDelay: '0.05s',
              width: 96, height: 96, borderRadius: '50%',
              background: 'linear-gradient(135deg, #B8833A 0%, #D4A055 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.4rem', margin: '0 auto 28px',
            }}>
              ✨
            </div>

            <h1 className="anim-fadeup" style={{
              animationDelay: '0.18s',
              margin: 0, fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(2rem, 7vw, 2.8rem)', fontWeight: 400,
              lineHeight: 1.08, color: '#1A1612',
            }}>
              Revisa tu <em style={{ color: '#B8833A' }}>email</em>
            </h1>

            <p className="anim-fadeup" style={{ animationDelay: '0.26s', margin: '14px 0 4px', color: 'rgba(26,22,18,0.5)', fontSize: 15, fontFamily: 'Outfit, sans-serif' }}>
              Enlace de confirmación enviado a
            </p>
            <p className="anim-fadeup" style={{ animationDelay: '0.32s', margin: '0 0 32px', color: '#B8833A', fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              {sentTo}
            </p>

            <div className="anim-fadeup" style={{
              animationDelay: '0.4s',
              background: '#FFFFFF', border: '1px solid rgba(26,22,18,0.06)',
              borderRadius: 20, padding: '22px 24px', marginBottom: 24,
              textAlign: 'left', boxShadow: '0 4px 20px rgba(26,22,18,0.04)',
            }}>
              {['Revisa tu bandeja de entrada', 'Pulsa en el enlace de confirmación', 'Vuelve aquí e inicia sesión'].map((step, i) => (
                <div key={i} className="step-card anim-fadeup" style={{
                  animationDelay: `${0.5 + i * 0.08}s`,
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 8px', borderRadius: 10,
                  borderBottom: i < 2 ? '1px solid rgba(26,22,18,0.06)' : 'none',
                  cursor: 'default',
                }}>
                  <div className="step-num" style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #B8833A, #D4A055)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: '#FFFFFF', fontWeight: 700, flexShrink: 0,
                    fontFamily: 'Outfit, sans-serif',
                    boxShadow: '0 4px 12px rgba(184,131,58,0.25)',
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 14, color: 'rgba(26,22,18,0.7)', fontFamily: 'Outfit, sans-serif' }}>{step}</span>
                </div>
              ))}
            </div>

            <Link to="/login" className="cta-dark-btn anim-fadeup" style={{
              animationDelay: '0.75s',
              display: 'block',
              background: 'linear-gradient(135deg, #1A1612, #2C2620)',
              color: '#FFFFFF', textDecoration: 'none',
              padding: '16px', borderRadius: 16,
              fontWeight: 700, fontSize: 15,
              fontFamily: 'Outfit, sans-serif',
              boxShadow: '0 6px 20px rgba(26,22,18,0.2)',
            }}>
              Ir al inicio de sesión →
            </Link>

            <p className="anim-fadeup" style={{ animationDelay: '0.82s', fontSize: 12, color: 'rgba(26,22,18,0.32)', marginTop: 14, fontFamily: 'Outfit, sans-serif' }}>
              ¿No lo ves? Revisa también la carpeta de spam.
            </p>
          </div>
        </main>
      </div>
    )
  }

  // ═══════════════════ FORMULARIO DE REGISTRO ═══════════════════
  return (
    <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <style>{sharedStyles}</style>

      {/* Header */}
      <header className="anim-fadeup" style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid rgba(26,22,18,0.06)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link to="/register" className="back-link" style={{ color: 'rgba(26,22,18,0.45)', fontSize: 14, fontFamily: 'Outfit, sans-serif', textDecoration: 'none' }}>
          ← Atrás
        </Link>
        <Link to="/" className="header-logo" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#1A1612' }}>
          TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
        </Link>
        <div style={{ width: 60 }} />
      </header>

      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '32px 24px 56px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className="anim-scale" style={{
              animationDelay: '0.05s',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(184,131,58,0.08)', border: '1px solid rgba(184,131,58,0.18)',
              borderRadius: 999, padding: '7px 14px', marginBottom: 20,
            }}>
              <span style={{ fontSize: 14 }}>✨</span>
              <span style={{ fontSize: 11, color: '#B8833A', fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cuenta cliente</span>
            </div>
            <h1 className="anim-fadeup" style={{ animationDelay: '0.12s', margin: 0, color: '#1A1612', fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: 'clamp(2.2rem, 7vw, 3rem)', lineHeight: 1.04 }}>
              Reserva con <em style={{ color: '#B8833A' }}>elegancia</em>
            </h1>
            <p className="anim-fadeup" style={{ animationDelay: '0.18s', margin: '14px 0 0', color: 'rgba(26,22,18,0.5)', fontSize: 15, lineHeight: 1.6, fontFamily: 'Outfit, sans-serif' }}>
              Crea tu cuenta en menos de un minuto y empieza a reservar las mejores citas.
            </p>
          </div>

          {/* Google */}
          <button type="button" onClick={() => loginWithGoogle('client')} disabled={googleLoading} className="google-btn anim-fadeup"
            style={{
              animationDelay: '0.26s',
              width: '100%', height: 56,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: '#FFFFFF', border: '1.5px solid rgba(26,22,18,0.1)',
              borderRadius: 16, cursor: googleLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600, color: '#1A1612',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 18,
              opacity: googleLoading ? 0.7 : 1,
            }}>
            {googleLoading
              ? <span style={{ width: 18, height: 18, border: '2px solid rgba(26,22,18,0.12)', borderTopColor: '#B8833A', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              : <GoogleIcon />
            }
            {googleLoading ? 'Conectando...' : 'Continuar con Google'}
          </button>

          <div className="anim-fadeup" style={{ animationDelay: '0.32s', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(26,22,18,0.08)' }} />
            <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>O con email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(26,22,18,0.08)' }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Field icon="👤" label="Nombre completo" error={errors.full_name?.message} focused={focused === 'name'} delay={0.38}>
              <input {...register('full_name', { required: 'Nombre requerido' })} placeholder="Nombre y apellidos" onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} style={inputStyle} autoComplete="name" />
            </Field>

            <Field icon="📧" label="Email" error={errors.email?.message} focused={focused === 'email'} delay={0.46}>
              <input {...register('email', { required: 'Email requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })} type="email" placeholder="tu@email.com" onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} style={inputStyle} autoComplete="email" />
            </Field>

            <Field icon="📱" label="Teléfono" error={errors.phone?.message} focused={focused === 'phone'} delay={0.54}>
              <input {...register('phone', { pattern: { value: /^[+0-9()\-\s]{6,20}$/, message: 'Teléfono inválido' } })} type="tel" placeholder="+34 600 000 000" onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} style={inputStyle} autoComplete="tel" />
            </Field>

            <Field icon="🔒" label="Contraseña" error={errors.password?.message} focused={focused === 'password'} delay={0.62}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <input {...register('password', { required: 'Contraseña requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })} type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} style={{ ...inputStyle, flex: 1 }} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="pwd-toggle"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,22,18,0.3)', fontSize: 16, padding: 0, lineHeight: 1 }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </Field>

            <button type="submit" disabled={isPending} className={`primary-btn anim-fadeup ${isPending ? 'loading' : ''}`}
              style={{
                animationDelay: '0.7s',
                position: 'relative', overflow: 'hidden',
                width: '100%', height: 58, marginTop: 12,
                fontSize: 15, fontWeight: 700,
                background: isPending ? 'rgba(184,131,58,0.4)' : 'linear-gradient(135deg, #B8833A 0%, #D4A055 100%)',
                color: '#FFFFFF', border: 'none', borderRadius: 16,
                cursor: isPending ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit, sans-serif', letterSpacing: '0.02em',
                boxShadow: isPending ? 'none' : '0 8px 24px rgba(184,131,58,0.3)',
              }}>
              {isPending ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Creando cuenta...
                </span>
              ) : 'Crear cuenta gratis →'}
            </button>

            <p className="anim-fadeup" style={{ animationDelay: '0.78s', textAlign: 'center', fontSize: 11, color: 'rgba(26,22,18,0.32)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.65, marginTop: 14 }}>
              Al registrarte aceptas nuestros{' '}
              <Link to="/privacy" className="gold-link" style={{ color: '#B8833A', fontWeight: 600, textDecoration: 'none' }}>Términos</Link>
              {' y la '}
              <Link to="/privacy" className="gold-link" style={{ color: '#B8833A', fontWeight: 600, textDecoration: 'none' }}>Política de Privacidad</Link>
            </p>
          </form>

          <p className="anim-fadeup" style={{ animationDelay: '0.84s', textAlign: 'center', color: 'rgba(26,22,18,0.45)', fontSize: 14, marginTop: 28, fontFamily: 'Outfit, sans-serif' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="dark-link" style={{ color: '#1A1612', textDecoration: 'none', fontWeight: 700 }}>Iniciar sesión</Link>
          </p>

        </div>
      </main>
    </div>
  )
}
