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

const CATEGORIES = [
  { value: 'hair',      label: 'Peluquería',      icon: '💇' },
  { value: 'nails',     label: 'Uñas',            icon: '💅' },
  { value: 'spa',       label: 'Spa',             icon: '🧖' },
  { value: 'barber',    label: 'Barbería',        icon: '🪒' },
  { value: 'aesthetic', label: 'Estética',        icon: '✨' },
  { value: 'brows',     label: 'Cejas',           icon: '👁️' },
  { value: 'massage',   label: 'Masajes',         icon: '💆' },
  { value: 'dental',    label: 'Dental',          icon: '🦷' },
  { value: 'fitness',   label: 'Personal trainer',icon: '🏋️' },
  { value: 'skincare',  label: 'Skincare',        icon: '🧴' },
  { value: 'makeup',    label: 'Maquillaje',      icon: '💋' },
  { value: 'yoga',      label: 'Yoga',            icon: '🧘' },
]

function Field({ label, error, focused, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        background: focused ? 'rgba(184,131,58,0.04)' : '#FFFFFF',
        border: `1.5px solid ${error ? '#f87171' : focused ? '#B8833A' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: 14, padding: '13px 16px', transition: 'all 0.2s',
        boxShadow: focused ? '0 0 0 3px rgba(184,131,58,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: focused ? '#B8833A' : 'rgba(26,22,18,0.4)', marginBottom: 5, fontFamily: 'Outfit, sans-serif', fontWeight: 600, transition: 'color 0.2s' }}>{label}</label>
        {children}
      </div>
      {error && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5, paddingLeft: 4, fontFamily: 'Outfit, sans-serif' }}>{error}</p>}
    </div>
  )
}

const inputStyle = { width: '100%', background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }

export default function RegisterProPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [step, setStep] = useState(1)
  const [focused, setFocused] = useState(null)
  const { register, handleSubmit, trigger, formState: { errors } } = useForm()
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
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al registrarse'),
  })

  const goToStep2 = async () => {
    const valid = await trigger(['full_name', 'email', 'phone', 'password'])
    if (valid) setStep(2)
  }

  const onSubmit = async (data) => {
    if (!selectedCategory) { toast.error('Selecciona una categoría'); return }
    try {
      const token = await executeRecaptcha('register')
      mutate({ ...data, category: selectedCategory, recaptcha_token: token })
    } catch {
      toast.error('Error de verificación de seguridad. Inténtalo de nuevo.')
    }
  }

  if (emailSent) return (
    <div style={{ minHeight: '100dvh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(184,131,58,0.1)', border: '2px solid rgba(184,131,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', margin: '0 auto 28px' }}>✉️</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 300, marginBottom: 12, color: '#1A1612' }}>
          Confirma tu <em style={{ color: '#B8833A' }}>email</em>
        </h1>
        <p style={{ color: 'rgba(26,22,18,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 6, fontFamily: 'Outfit, sans-serif' }}>Enlace enviado a</p>
        <p style={{ color: '#B8833A', fontSize: 15, fontWeight: 700, marginBottom: 28, fontFamily: 'Outfit, sans-serif' }}>{sentTo}</p>
        <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(184,131,58,0.15)', borderRadius: 18, padding: '20px 24px', marginBottom: 24, textAlign: 'left', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          {['Confirma tu email', 'Inicia sesión', 'Completa dirección y fotos', 'Espera verificación (24-48h)'].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(184,131,58,0.1)', border: '1.5px solid rgba(184,131,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#B8833A', fontWeight: 700, flexShrink: 0, fontFamily: 'Outfit, sans-serif' }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: 'rgba(26,22,18,0.6)', fontFamily: 'Outfit, sans-serif' }}>{s}</span>
            </div>
          ))}
        </div>
        <Link to="/login" style={{ display: 'block', background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', textDecoration: 'none', padding: '16px', borderRadius: 14, fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 16px rgba(184,131,58,0.25)' }}>
          Ir al inicio de sesión
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#F7F5F2', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } .cat-btn:hover { border-color: rgba(184,131,58,0.4) !important; background: rgba(184,131,58,0.08) !important; }`}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px 40px', maxWidth: 480, margin: '0 auto', width: '100%' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 0' }}>
          <button onClick={() => step === 1 ? null : setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,22,18,0.4)', fontSize: 13, fontFamily: 'Outfit, sans-serif', padding: 0 }}>
            {step === 2 ? '← Atrás' : <Link to="/register" style={{ color: 'rgba(26,22,18,0.4)', textDecoration: 'none', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>← Volver</Link>}
          </button>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#1A1612' }}>
            TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
          </Link>
          <div style={{ width: 60 }} />
        </div>

        {/* Header */}
        <div style={{ paddingTop: 24, paddingBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(184,131,58,0.08)', border: '1px solid rgba(184,131,58,0.2)', borderRadius: 100, padding: '5px 14px', marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: '#B8833A', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>✂️ Cuenta profesional</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 8vw, 2.6rem)', fontWeight: 300, lineHeight: 1.1, color: '#1A1612', margin: '0 0 18px' }}>
            {step === 1 ? <>Tus <em style={{ color: '#B8833A' }}>datos</em></> : <>Tu <em style={{ color: '#B8833A' }}>negocio</em></>}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[{ n: 1, label: 'Cuenta' }, { n: 2, label: 'Negocio' }].map(({ n, label }, i) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: step >= n ? 'rgba(184,131,58,0.1)' : '#FFFFFF', border: `1.5px solid ${step >= n ? 'rgba(184,131,58,0.3)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 100, padding: '5px 12px', transition: 'all 0.3s' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: step >= n ? 'linear-gradient(135deg,#B8833A,#D4A055)' : 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: step >= n ? '#FFFFFF' : 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>{n}</div>
                  <span style={{ fontSize: 11, color: step >= n ? '#B8833A' : 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif', fontWeight: step >= n ? 600 : 400 }}>{label}</span>
                </div>
                {i < 1 && <div style={{ width: 20, height: 1.5, background: step > n ? '#B8833A' : 'rgba(0,0,0,0.1)', borderRadius: 1 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Beneficios — solo en paso 1 */}
        {step === 1 && (
          <div style={{ display: 'flex', gap: 7, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { icon: '🎁', text: 'Gratis para siempre' },
              { icon: '📅', text: 'Reservas automáticas' },
              { icon: '⭐', text: 'Más visibilidad' },
            ].map(b => (
              <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(184,131,58,0.07)', border: '1px solid rgba(184,131,58,0.18)', borderRadius: 999, padding: '5px 12px' }}>
                <span style={{ fontSize: 13 }}>{b.icon}</span>
                <span style={{ fontSize: 11, color: '#B8833A', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>{b.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Google OAuth — solo en paso 1 */}
        {step === 1 && (
          <>
            <button type="button" onClick={() => loginWithGoogle('professional')} disabled={googleLoading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 16px', background: googleLoading ? '#F7F5F2' : '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 14, cursor: googleLoading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600, color: '#1A1612', transition: 'all 0.2s', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: 16 }}>
              {googleLoading ? <span style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#B8833A', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> : <GoogleIcon />}
              {googleLoading ? 'Conectando...' : 'Continuar con Google'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.07)' }} />
              <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>o completa el formulario</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.07)' }} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {step === 1 && (
            <>
              <Field label="Nombre completo" error={errors.full_name?.message} focused={focused === 'name'}>
                <input {...register('full_name', { required: 'Requerido' })} placeholder="Ana Martínez" onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} style={inputStyle} />
              </Field>
              <Field label="Email" error={errors.email?.message} focused={focused === 'email'}>
                <input {...register('email', { required: 'Requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })} type="email" placeholder="tu@email.com" onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} style={inputStyle} />
              </Field>
              <Field label="Teléfono" error={errors.phone?.message} focused={focused === 'phone'}>
                <input {...register('phone', { required: 'Requerido', pattern: { value: /^[0-9+\s\-()]{9,15}$/, message: 'Teléfono inválido' } })} type="tel" placeholder="+34 600 000 000" onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} style={inputStyle} />
              </Field>
              <Field label="Contraseña" error={errors.password?.message} focused={focused === 'password'}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input {...register('password', { required: 'Requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })} type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,22,18,0.35)', fontSize: 16, padding: 0 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </Field>
              <div style={{ flex: 1 }} />
              <button type="button" onClick={goToStep2} style={{ width: '100%', padding: '16px', fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.03em', boxShadow: '0 6px 24px rgba(184,131,58,0.3)', marginTop: 8 }}>
                Siguiente → Datos del negocio
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Nombre del negocio" error={errors.business_name?.message} focused={focused === 'bname'}>
                <input {...register('business_name', { required: 'Requerido' })} placeholder="Salón Ana" onFocus={() => setFocused('bname')} onBlur={() => setFocused(null)} style={inputStyle} />
              </Field>
              <Field label="Ciudad" error={errors.city?.message} focused={focused === 'city'}>
                <input {...register('city', { required: 'Requerido' })} placeholder="Madrid" onFocus={() => setFocused('city')} onBlur={() => setFocused(null)} style={inputStyle} />
              </Field>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.4)', marginBottom: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Categoría</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {CATEGORIES.map(cat => {
                    const active = selectedCategory === cat.value
                    return (
                      <button key={cat.value} type="button" className="cat-btn" onClick={() => setSelectedCategory(cat.value)} style={{ padding: '10px 4px 8px', borderRadius: 14, cursor: 'pointer', textAlign: 'center', border: `1.5px solid ${active ? '#B8833A' : 'rgba(0,0,0,0.08)'}`, background: active ? 'rgba(184,131,58,0.1)' : '#FFFFFF', color: active ? '#B8833A' : 'rgba(26,22,18,0.5)', transition: 'all 0.18s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontFamily: 'Outfit, sans-serif', boxShadow: active ? '0 2px 10px rgba(184,131,58,0.15)' : '0 1px 3px rgba(0,0,0,0.04)', transform: active ? 'scale(1.04)' : 'scale(1)' }}>
                        <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{cat.icon}</span>
                        <span style={{ fontSize: 9.5, lineHeight: 1.2, fontWeight: active ? 600 : 400 }}>{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <button type="submit" disabled={isPending} style={{ width: '100%', padding: '16px', fontSize: 15, fontWeight: 700, background: isPending ? 'rgba(184,131,58,0.4)' : 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', border: 'none', borderRadius: 14, cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.03em', boxShadow: isPending ? 'none' : '0 6px 24px rgba(184,131,58,0.3)' }}>
                {isPending ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Creando cuenta...
                  </span>
                ) : 'Crear mi cuenta →'}
              </button>
              <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', textAlign: 'center', marginTop: 12, lineHeight: 1.6, fontFamily: 'Outfit, sans-serif' }}>
                Después añade dirección y fotos desde tu panel.
              </p>
            </>
          )}
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(26,22,18,0.35)', fontSize: 14, marginTop: 20, fontFamily: 'Outfit, sans-serif' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#B8833A', textDecoration: 'none', fontWeight: 600 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
