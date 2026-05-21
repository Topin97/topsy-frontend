import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import toast from 'react-hot-toast'

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

const CATEGORIES = [
  { value: 'hair', label: 'Peluquería', icon: '💇' },
  { value: 'nails', label: 'Uñas', icon: '💅' },
  { value: 'spa', label: 'Spa', icon: '🧖' },
  { value: 'barber', label: 'Barbería', icon: '🪒' },
  { value: 'aesthetic', label: 'Estética', icon: '✨' },
  { value: 'brows', label: 'Cejas', icon: '👁️' },
  { value: 'massage', label: 'Masajes', icon: '💆' },
  { value: 'makeup', label: 'Maquillaje', icon: '💋' },
  { value: 'skincare', label: 'Skincare', icon: '🧴' },
  { value: 'fitness', label: 'Fitness', icon: '🏋️' },
  { value: 'yoga', label: 'Yoga', icon: '🧘' },
  { value: 'dental', label: 'Dental', icon: '🦷' },
]

// Componente de partículas doradas flotantes
function GoldParticles() {
  const particles = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 8,
    opacity: 0.3 + Math.random() * 0.5,
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div key={p.id}
          className="gold-particle"
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            bottom: -20,
            width: p.size,
            height: p.size,
            background: 'radial-gradient(circle, #D4A055 0%, transparent 70%)',
            borderRadius: '50%',
            opacity: p.opacity,
            animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
            boxShadow: '0 0 6px #D4A055',
          }}
        />
      ))}
    </div>
  )
}

function Field({ icon, label, error, focused, children, delay = 0 }) {
  return (
    <div className="anim-fadeup" style={{ animationDelay: `${delay}s`, marginBottom: 12 }}>
      <div className={`field-wrap ${error ? 'has-error' : ''}`} style={{
        background: '#FFFFFF',
        border: `1.5px solid ${error ? '#f87171' : focused ? '#B8833A' : 'rgba(26,22,18,0.1)'}`,
        borderRadius: 16, padding: '14px 18px',
        boxShadow: focused ? '0 0 0 4px rgba(184,131,58,0.08), 0 8px 24px rgba(184,131,58,0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex', alignItems: 'center', gap: 14,
        transform: focused ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
      }}>
        {icon && (
          <span className="field-icon" style={{
            fontSize: 18, opacity: focused ? 1 : 0.4,
            transform: focused ? 'scale(1.15)' : 'scale(1)',
            transition: 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
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

// ════════════════════════════════════════════════════════════════
// ESTILOS COMPARTIDOS
// ════════════════════════════════════════════════════════════════
const sharedStyles = `
  input::placeholder { color: rgba(26,22,18,0.35) !important; }

  /* Keyframes sistema TopSy */
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes fadeInScale { from { opacity: 0; transform: scale(0.85) } to { opacity: 1; transform: scale(1) } }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(30px) } to { opacity: 1; transform: translateX(0) } }
  @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px) } to { opacity: 1; transform: translateX(0) } }
  @keyframes shake { 0%,100% { transform: translateX(0) } 20%,60% { transform: translateX(-6px) } 40%,80% { transform: translateX(6px) } }

  /* Keyframes específicos de esta página */
  @keyframes glow { 0%,100% { opacity: 0.3 } 50% { opacity: 0.6 } }
  @keyframes shimmer { 0% { background-position: -200% center } 100% { background-position: 200% center } }
  @keyframes floatUp { 0% { transform: translateY(0); opacity: 0 } 10% { opacity: 1 } 90% { opacity: 1 } 100% { transform: translateY(-110vh); opacity: 0 } }
  @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(212,160,85,0.4) } 50% { box-shadow: 0 0 0 12px rgba(212,160,85,0) } }
  @keyframes successPop { 0% { transform: scale(0.5); opacity: 0 } 50% { transform: scale(1.1) } 100% { transform: scale(1); opacity: 1 } }
  @keyframes catSelect { 0% { transform: translateY(-2px) scale(1) } 40% { transform: translateY(-4px) scale(1.05) } 100% { transform: translateY(-2px) scale(1) } }
  @keyframes loadingPulse { 0%,100% { opacity: 0.85 } 50% { opacity: 1 } }

  /* Clases utilitarias */
  .anim-fadeup { animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both }
  .anim-scale { animation: fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both }
  .anim-slide-right { animation: slideInRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both }
  .anim-slide-left { animation: slideInLeft 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both }

  .field-wrap.has-error { animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) }
  .error-msg { animation: fadeInUp 0.3s ease both }

  /* Success icon (email enviado) */
  .success-icon { animation: successPop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both }

  /* Shimmer text en títulos */
  .shimmer-text {
    background: linear-gradient(90deg, #B8833A 0%, #D4A055 25%, #FFE4B5 50%, #D4A055 75%, #B8833A 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
    animation: shimmer 4s linear infinite;
    font-style: italic;
    display: inline-block;
  }

  /* Botón "Atrás" header */
  .back-btn { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease; }
  .back-btn:hover { transform: translateX(-3px); color: rgba(255,255,255,0.9) !important; }

  /* Logo header */
  .header-logo { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); display: inline-block; }
  .header-logo:hover { transform: scale(1.05); }

  /* Categorías 3D */
  .cat-btn { position: relative; transform-style: preserve-3d; perspective: 1000px; transition: border-color 0.25s ease, background 0.25s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, color 0.25s ease; }
  .cat-btn:hover { border-color: #D4A055 !important; transform: translateY(-3px) rotateX(-3deg) !important; box-shadow: 0 16px 32px rgba(184,131,58,0.25) !important; }
  .cat-btn:hover .cat-icon { transform: scale(1.2) rotate(-5deg); }
  .cat-btn:active { transform: translateY(-1px) scale(0.97) !important; }
  .cat-btn.selected { animation: catSelect 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .cat-icon { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); display: inline-block; }

  /* Google button */
  .google-btn { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; }
  .google-btn:not(:disabled):hover { background: rgba(255,255,255,0.06) !important; transform: translateY(-2px); border-color: rgba(212,160,85,0.4) !important; box-shadow: 0 8px 20px rgba(0,0,0,0.18); }
  .google-btn:not(:disabled):active { transform: translateY(-1px) scale(0.98); }

  /* Primary button con shimmer */
  .primary-btn { position: relative; overflow: hidden; transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, opacity 0.25s ease; }
  .primary-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transition: left 0.6s ease; pointer-events: none; }
  .primary-btn:not(:disabled):hover::before { left: 100%; }
  .primary-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(184,131,58,0.5) !important; }
  .primary-btn:not(:disabled):active { transform: translateY(-1px) scale(0.99); }
  .primary-btn.loading { animation: loadingPulse 1.4s ease-in-out infinite; }

  /* CTA dorado (email sent) */
  .cta-gold-btn { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease; position: relative; overflow: hidden; }
  .cta-gold-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transition: left 0.6s ease; pointer-events: none; }
  .cta-gold-btn:hover::before { left: 100%; }
  .cta-gold-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(184,131,58,0.5) !important; }
  .cta-gold-btn:active { transform: translateY(-1px) scale(0.99); }

  /* Glow orbs decorativos */
  .glow-orb { position: absolute; border-radius: 50%; background: radial-gradient(circle, rgba(184,131,58,0.15) 0%, transparent 70%); animation: glow 4s ease-in-out infinite; pointer-events: none }

  /* Pulse dot del badge */
  .pulse-dot { animation: pulseGlow 2s ease-in-out infinite }

  /* Stat cards */
  .stat-card { transition: background 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.25s ease; }
  .stat-card:hover { background: rgba(255,255,255,0.06) !important; transform: translateY(-3px); border-color: rgba(212,160,85,0.3) !important; }

  /* Toggle password */
  .pwd-toggle { transition: transform 0.2s ease, color 0.2s ease; }
  .pwd-toggle:hover { transform: scale(1.15); color: #1A1612 !important; }
  .pwd-toggle:active { transform: scale(0.9); }

  /* Step circle (clickable) */
  .step-circle { cursor: pointer; transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
  .step-circle.clickable:hover { transform: scale(1.08); }
  .step-circle.not-clickable { cursor: default; }

  /* Step bar progress */
  .step-bar { transition: background 0.5s ease; }

  /* Login link */
  .login-link { position: relative; transition: color 0.2s ease; }
  .login-link::after { content: ''; position: absolute; left: 0; right: 0; bottom: -2px; height: 1.5px; background: #D4A055; transform: scaleX(0); transform-origin: center; transition: transform 0.25s ease; }
  .login-link:hover::after { transform: scaleX(1); }

  /* Step content */
  .step-content { animation: slideInRight 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .anim-fadeup, .anim-scale, .anim-slide-right, .anim-slide-left,
    .field-wrap.has-error, .error-msg, .success-icon, .step-content,
    .primary-btn.loading, .cat-btn.selected, .shimmer-text,
    .gold-particle, .glow-orb, .pulse-dot {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
    .shimmer-text { color: #D4A055 !important; -webkit-text-fill-color: #D4A055 !important; background: none !important; }
    .back-btn, .header-logo, .cat-btn, .google-btn, .primary-btn, .cta-gold-btn,
    .stat-card, .pwd-toggle, .step-circle, .step-bar, .field-wrap, .field-icon, .login-link::after {
      transition: none !important;
    }
    .gold-particle { opacity: 0.4 !important; }
  }
`

// ────────────────────────────────────────────────────────────────
// Helper para aplicar errores del backend a los campos del form.
// Maneja A) { error, field } y B) { error, fields: [{field,message}] }
// Devuelve { applied, step1Affected } para que el caller decida si
// volver al step 1 cuando el error es de email/teléfono/password/nombre.
// ────────────────────────────────────────────────────────────────
const STEP_1_FIELDS = new Set(['email', 'password', 'full_name', 'phone'])
const VALID_FIELDS = new Set([...STEP_1_FIELDS, 'role', 'business_name', 'city', 'category'])

function applyBackendErrors(setError, data) {
  if (!data) return { applied: false, step1Affected: false }
  let applied = false
  let step1Affected = false

  const apply = (field, message) => {
    if (field && VALID_FIELDS.has(field) && message) {
      setError(field, { type: 'server', message })
      applied = true
      if (STEP_1_FIELDS.has(field)) step1Affected = true
    }
  }

  // Formato A
  if (data.field && data.error) apply(data.field, data.error)

  // Formato B
  if (Array.isArray(data.fields)) {
    for (const f of data.fields) apply(f.field, f.message)
  }

  return { applied, step1Affected }
}

export default function RegisterProPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [step, setStep] = useState(1)
  const [focused, setFocused] = useState(null)
  const { register, handleSubmit, trigger, setError, clearErrors, formState: { errors } } = useForm()
  const { loginWithGoogle, loading: googleLoading } = useGoogleAuth()
  const { executeRecaptcha } = useGoogleReCaptcha()

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => authApi.register({ full_name: data.full_name, email: data.email, password: data.password, phone: data.phone, role: 'professional', recaptcha_token: data.recaptcha_token }),
    onSuccess: ({ data }) => {
      if (data.access_token) {
        setAuth(data.user, data.access_token, data.refresh_token)
        toast.success('¡Cuenta creada! Completa tu negocio ✨')
        navigate('/pro/onboarding')
      } else {
        setSentTo(data.user?.email ?? '')
        setEmailSent(true)
      }
    },
    onError: (err) => {
      const data = err.response?.data
      const status = err.response?.status

      if (status === 429) {
        toast.error(data?.error ?? 'Demasiados intentos. Espera unos minutos.')
        return
      }

      const { applied, step1Affected } = applyBackendErrors(setError, data)

      // Si el error es de un campo del paso 1 y estamos en el 2, volver al 1
      if (step1Affected && step === 2) {
        setStep(1)
      }

      if (applied) {
        toast.error(data?.error ?? 'Revisa el formulario')
      } else {
        toast.error(data?.error ?? 'Error al registrarse')
      }
    },
  })

  const goToStep2 = async () => {
    const valid = await trigger(['full_name', 'email', 'phone', 'password'])
    if (valid) setStep(2)
  }

  const onSubmit = async (data) => {
    if (!selectedCategory) { toast.error('Selecciona una categoría'); return }
    let token = null
    try {
      if (executeRecaptcha) token = await executeRecaptcha('register')
    } catch { /* captcha no disponible */ }
    const phone = data.phone?.replace(/\s/g, '') || ''
    const fullPhone = phone.startsWith('+') ? phone : `+34${phone}`
    mutate({ ...data, phone: fullPhone, category: selectedCategory, recaptcha_token: token ?? 'bypass' })
  }

  // Limpia el error del servidor cuando el usuario edita el campo
  const handleFieldChange = (fieldName) => () => {
    if (errors[fieldName]?.type === 'server') {
      clearErrors(fieldName)
    }
  }

  // ═══════════════════ PANTALLA EMAIL ENVIADO ═══════════════════
  if (emailSent) {
    return (
      <div style={{ minHeight: '100dvh', background: 'linear-gradient(180deg, #1A1612 0%, #2C1810 100%)', display: 'flex', flexDirection: 'column', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
        <style>{sharedStyles}</style>
        <GoldParticles />

        <header className="anim-fadeup" style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1 }}>
          <Link to="/" className="header-logo" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '3px', textDecoration: 'none', color: '#FFFFFF' }}>
            TOP<span style={{ color: '#D4A055', fontStyle: 'italic' }}>sy</span>
          </Link>
        </header>

        <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '36px 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
            <div className="success-icon" style={{ animationDelay: '0.05s', width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(135deg, #B8833A 0%, #D4A055 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', margin: '0 auto 32px', boxShadow: '0 20px 60px rgba(184,131,58,0.5)' }}>
              ✂️
            </div>

            <h1 className="anim-fadeup" style={{ animationDelay: '0.2s', margin: 0, fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 8vw, 3rem)', fontWeight: 300, lineHeight: 1.08 }}>
              Confirma tu <em style={{ color: '#D4A055' }}>email</em>
            </h1>

            <p className="anim-fadeup" style={{ animationDelay: '0.28s', margin: '14px 0 4px', color: 'rgba(255,255,255,0.5)', fontSize: 15, fontFamily: 'Outfit, sans-serif' }}>Enlace enviado a</p>
            <p className="anim-fadeup" style={{ animationDelay: '0.34s', margin: '0 0 36px', color: '#D4A055', fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{sentTo}</p>

            <div className="anim-fadeup" style={{ animationDelay: '0.42s', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(184,131,58,0.18)', borderRadius: 22, padding: '24px 28px', marginBottom: 24, textAlign: 'left', backdropFilter: 'blur(20px)' }}>
              {['Confirma tu email', 'Inicia sesión en TopSy', 'Completa los datos de tu negocio', 'Recibe verificación en 24-48h'].map((s, i) => (
                <div key={i} className="anim-fadeup" style={{
                  animationDelay: `${0.52 + i * 0.08}s`,
                  display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0',
                  borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #B8833A, #D4A055)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#1A1612', fontWeight: 700, flexShrink: 0, fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 12px rgba(184,131,58,0.3)' }}>{i + 1}</div>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontFamily: 'Outfit, sans-serif' }}>{s}</span>
                </div>
              ))}
            </div>

            <Link to="/login" className="cta-gold-btn anim-fadeup" style={{
              animationDelay: '0.92s',
              display: 'block', background: 'linear-gradient(135deg, #B8833A 0%, #D4A055 100%)',
              color: '#1A1612', textDecoration: 'none', padding: '17px', borderRadius: 16,
              fontWeight: 700, fontSize: 15, fontFamily: 'Outfit, sans-serif',
              boxShadow: '0 10px 30px rgba(184,131,58,0.4)',
            }}>
              Ir al inicio de sesión →
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // ═══════════════════ FORMULARIO DE REGISTRO PROFESIONAL ═══════════════════
  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(180deg, #1A1612 0%, #0F0A06 100%)', display: 'flex', flexDirection: 'column', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
      <style>{sharedStyles}</style>

      {/* Decorative orbs */}
      <div className="glow-orb" style={{ width: 500, height: 500, top: -150, right: -150 }} />
      <div className="glow-orb" style={{ width: 350, height: 350, bottom: -100, left: -100, animationDelay: '2s' }} />

      {/* Partículas doradas */}
      <GoldParticles />

      {/* Header */}
      <header className="anim-fadeup" style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(26,22,18,0.6)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => step === 1 ? navigate('/register') : setStep(1)} className="back-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>
          ← Atrás
        </button>
        <Link to="/" className="header-logo" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#FFFFFF' }}>
          TOP<span style={{ color: '#D4A055', fontStyle: 'italic' }}>sy</span>
        </Link>
        <div style={{ width: 60 }} />
      </header>

      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '32px 24px 56px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div className="anim-scale" style={{ animationDelay: '0.05s', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, rgba(184,131,58,0.15), rgba(212,160,85,0.15))', border: '1px solid rgba(212,160,85,0.3)', borderRadius: 999, padding: '7px 16px', marginBottom: 22 }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4A055' }} />
              <span style={{ fontSize: 11, color: '#D4A055', fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cuenta profesional</span>
            </div>
            <h1 className="anim-fadeup" style={{ animationDelay: '0.12s', margin: 0, fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(2.4rem, 8vw, 3.2rem)', lineHeight: 1.04, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              {step === 1 ? <>Haz crecer <span className="shimmer-text">tu negocio</span></> : <>Cuéntanos de <span className="shimmer-text">tu negocio</span></>}
            </h1>
            <p className="anim-fadeup" style={{ animationDelay: '0.2s', margin: '14px 0 0', color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.6, fontFamily: 'Outfit, sans-serif' }}>
              {step === 1 ? 'Únete a la red de profesionales más elegante de España.' : 'Estos detalles ayudan a los clientes a encontrarte.'}
            </p>
          </div>

          {/* Stepper */}
          <div className="anim-fadeup" style={{ animationDelay: '0.28s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
            {[
              { n: 1, label: 'Cuenta' },
              { n: 2, label: 'Negocio' },
            ].map(({ n, label }, i) => {
              const clickable = step > n
              return (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      onClick={() => clickable && setStep(n)}
                      className={`step-circle ${clickable ? 'clickable' : 'not-clickable'}`}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: step >= n ? 'linear-gradient(135deg, #B8833A, #D4A055)' : 'rgba(255,255,255,0.08)',
                        border: step === n ? '2px solid rgba(212,160,85,0.4)' : '2px solid transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        color: step >= n ? '#1A1612' : 'rgba(255,255,255,0.4)',
                        fontFamily: 'Outfit, sans-serif',
                        boxShadow: step === n ? '0 4px 14px rgba(184,131,58,0.4)' : 'none',
                      }}>
                      {step > n ? '✓' : n}
                    </div>
                    <span style={{ fontSize: 12, color: step >= n ? '#D4A055' : 'rgba(255,255,255,0.35)', fontWeight: step >= n ? 600 : 400, fontFamily: 'Outfit, sans-serif', transition: 'color 0.3s ease' }}>{label}</span>
                  </div>
                  {i < 1 && (
                    <div className="step-bar" style={{
                      width: 32, height: 2,
                      background: step > 1 ? 'linear-gradient(90deg, #B8833A, #D4A055)' : 'rgba(255,255,255,0.08)',
                      borderRadius: 2,
                    }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* ═══════════════════ STEP 1 ═══════════════════ */}
          {step === 1 && (
            <div className="step-content" key="step-1">
              {/* Features */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
                {[
                  { icon: '📅', label: 'Reservas 24/7' },
                  { icon: '🔔', label: 'Recordatorios automáticos' },
                  { icon: '📊', label: 'Estadísticas en vivo' },
                ].map((s, i) => (
                  <div key={i} className="stat-card anim-fadeup" style={{
                    animationDelay: `${0.36 + i * 0.07}s`,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(184,131,58,0.12)',
                    borderRadius: 14, padding: '14px 8px', textAlign: 'center', backdropFilter: 'blur(10px)',
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                    <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.75)', fontFamily: 'Outfit, sans-serif', fontWeight: 600, lineHeight: 1.3 }}>{s.label}</p>
                  </div>
                ))}
              </div>


              {/* Form fields */}
              <form onSubmit={(e) => e.preventDefault()}>
                <Field icon="👤" label="Nombre completo" error={errors.full_name?.message} focused={focused === 'name'} delay={0.66}>
                  <input
                    {...register('full_name', { required: 'Requerido', onChange: handleFieldChange('full_name') })}
                    placeholder="Nombre y apellidos"
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    style={inputStyle}
                    autoComplete="name"
                  />
                </Field>

                <Field icon="📧" label="Email" error={errors.email?.message} focused={focused === 'email'} delay={0.74}>
                  <input
                    {...register('email', {
                      required: 'Requerido',
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' },
                      onChange: handleFieldChange('email'),
                    })}
                    type="email"
                    placeholder="tu@email.com"
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    style={inputStyle}
                    autoComplete="email"
                  />
                </Field>

                <Field icon="📱" label="Teléfono" error={errors.phone?.message} focused={focused === 'phone'} delay={0.82}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 8 }}>
                    <span style={{ fontSize: 15, color: '#1A1612', fontFamily: 'Outfit, sans-serif', fontWeight: 500, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>🇪🇸 +34</span>
                    <div style={{ width: 1, height: 18, background: 'rgba(0,0,0,0.1)', flexShrink: 0 }} />
                    <input
                      {...register('phone', {
                        required: 'Requerido',
                        pattern: { value: /^[0-9\s]{9,12}$/, message: 'Teléfono inválido' },
                        onChange: handleFieldChange('phone'),
                      })}
                      type="tel"
                      placeholder="600 000 000"
                      onFocus={() => setFocused('phone')}
                      onBlur={() => setFocused(null)}
                      style={{ ...inputStyle, flex: 1 }}
                      autoComplete="tel"
                    />
                  </div>
                </Field>

                <Field icon="🔒" label="Contraseña" error={errors.password?.message} focused={focused === 'password'} delay={0.9}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      {...register('password', {
                        required: 'Requerido',
                        minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                        onChange: handleFieldChange('password'),
                      })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      style={{ ...inputStyle, flex: 1 }}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="pwd-toggle"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,22,18,0.35)', fontSize: 16, padding: 0 }}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </Field>

                <button type="button" onClick={goToStep2} className="primary-btn anim-fadeup"
                  style={{
                    animationDelay: '0.98s',
                    width: '100%', height: 58, marginTop: 12,
                    fontSize: 15, fontWeight: 700,
                    background: 'linear-gradient(135deg, #B8833A 0%, #D4A055 100%)',
                    color: '#1A1612', border: 'none', borderRadius: 16,
                    cursor: 'pointer', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.02em',
                    boxShadow: '0 10px 30px rgba(184,131,58,0.35)',
                  }}>
                  Siguiente → Datos del negocio
                </button>
              </form>
            </div>
          )}

          {/* ═══════════════════ STEP 2 ═══════════════════ */}
          {step === 2 && (
            <div className="step-content" key="step-2">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Field icon="🏪" label="Nombre del negocio" error={errors.business_name?.message} focused={focused === 'bname'} delay={0.05}>
                  <input {...register('business_name', { required: 'Requerido' })} placeholder="Nombre de tu negocio" onFocus={() => setFocused('bname')} onBlur={() => setFocused(null)} style={inputStyle} autoComplete="organization" />
                </Field>

                <Field icon="📍" label="Ciudad" error={errors.city?.message} focused={focused === 'city'} delay={0.13}>
                  <input {...register('city', { required: 'Requerido' })} placeholder="Madrid" onFocus={() => setFocused('city')} onBlur={() => setFocused(null)} style={inputStyle} autoComplete="address-level2" />
                </Field>

                {/* Categorías */}
                <div style={{ marginTop: 18, marginBottom: 22 }}>
                  <p className="anim-fadeup" style={{ animationDelay: '0.21s', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 14, fontFamily: 'Outfit, sans-serif', fontWeight: 600, paddingLeft: 2 }}>
                    Categoría
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {CATEGORIES.map((cat, i) => {
                      const active = selectedCategory === cat.value
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          className={`cat-btn anim-fadeup ${active ? 'selected' : ''}`}
                          onClick={() => setSelectedCategory(cat.value)}
                          style={{
                            animationDelay: `${0.28 + i * 0.04}s`,
                            padding: '12px 4px 10px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                            border: `1.5px solid ${active ? '#D4A055' : 'rgba(255,255,255,0.1)'}`,
                            background: active ? 'linear-gradient(135deg, rgba(184,131,58,0.25), rgba(212,160,85,0.15))' : 'rgba(255,255,255,0.03)',
                            color: active ? '#D4A055' : 'rgba(255,255,255,0.6)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                            fontFamily: 'Outfit, sans-serif',
                            boxShadow: active ? '0 10px 28px rgba(184,131,58,0.3)' : 'none',
                            backdropFilter: 'blur(10px)',
                            transform: active ? 'translateY(-2px)' : 'translateY(0)',
                          }}>
                          <span className="cat-icon" style={{ fontSize: '1.4rem', lineHeight: 1 }}>{cat.icon}</span>
                          <span style={{ fontSize: 10, lineHeight: 1.2, fontWeight: active ? 700 : 500 }}>{cat.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button type="submit" disabled={isPending} className={`primary-btn anim-fadeup ${isPending ? 'loading' : ''}`}
                  style={{
                    animationDelay: '0.82s',
                    width: '100%', height: 58, fontSize: 15, fontWeight: 700,
                    background: isPending ? 'rgba(184,131,58,0.3)' : 'linear-gradient(135deg, #B8833A 0%, #D4A055 100%)',
                    color: '#1A1612', border: 'none', borderRadius: 16,
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    fontFamily: 'Outfit, sans-serif', letterSpacing: '0.02em',
                    boxShadow: isPending ? 'none' : '0 10px 30px rgba(184,131,58,0.35)',
                  }}>
                  {isPending ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <span style={{ width: 18, height: 18, border: '2px solid rgba(26,22,18,0.3)', borderTopColor: '#1A1612', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                      Creando cuenta...
                    </span>
                  ) : 'Crear mi negocio →'}
                </button>

                <p className="anim-fadeup" style={{ animationDelay: '0.9s', fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 14, lineHeight: 1.6, fontFamily: 'Outfit, sans-serif' }}>
                  Añadirás dirección y fotos desde tu panel después.
                </p>
              </form>
            </div>
          )}

          <p className="anim-fadeup" style={{ animationDelay: '1.1s', textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 28, fontFamily: 'Outfit, sans-serif' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="login-link" style={{ color: '#D4A055', textDecoration: 'none', fontWeight: 700 }}>Iniciar sesión</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
