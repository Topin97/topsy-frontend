import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useState } from 'react'

const CATEGORIES = [
  { value: 'hair',        label: 'Peluquería',       icon: '💇' },
  { value: 'nails',       label: 'Uñas',             icon: '💅' },
  { value: 'spa',         label: 'Spa',              icon: '🧖' },
  { value: 'barber',      label: 'Barbería',         icon: '🪒' },
  { value: 'aesthetic',   label: 'Estética',         icon: '✨' },
  { value: 'brows',       label: 'Cejas',            icon: '👁️' },
  { value: 'massage',     label: 'Masajes',          icon: '💆' },
  { value: 'dental',      label: 'Dental',           icon: '🦷' },
  { value: 'fitness',     label: 'Personal trainer', icon: '🏋️' },
  { value: 'skincare',    label: 'Skincare',         icon: '🧴' },
  { value: 'makeup',      label: 'Maquillaje',       icon: '💋' },
  { value: 'yoga',        label: 'Yoga',             icon: '🧘' },
  { value: 'photography', label: 'Fotografía',       icon: '📸' },
]

const InputField = ({ label, error, focused, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{
      background: focused ? 'rgba(201,150,90,0.05)' : 'rgba(255,255,255,0.025)',
      border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : focused ? 'rgba(201,150,90,0.4)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 16, padding: '13px 18px', transition: 'all 0.2s',
    }}>
      <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.3)', marginBottom: 5, fontFamily: 'Outfit, sans-serif' }}>{label}</label>
      {children}
    </div>
    {error && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5, paddingLeft: 4, fontFamily: 'Outfit, sans-serif' }}>{error}</p>}
  </div>
)

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

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => authApi.register({
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: 'professional',
    }),
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

  const onSubmit = (data) => {
    if (!selectedCategory) { toast.error('Selecciona una categoría'); return }
    mutate({ ...data, category: selectedCategory })
  }

  if (emailSent) return (
    <div style={{ minHeight: '100dvh', background: '#0A0806', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(201,150,90,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center', position: 'relative' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(201,150,90,0.1)', border: '1px solid rgba(201,150,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', margin: '0 auto 28px' }}>✉️</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 300, marginBottom: 12, color: '#F7F2EA' }}>
          Confirma tu <em style={{ color: '#C9965A' }}>email</em>
        </h1>
        <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: 14, lineHeight: 1.7, marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>Enlace enviado a</p>
        <p style={{ color: '#C9965A', fontSize: 15, fontWeight: 600, marginBottom: 32, fontFamily: 'Outfit, sans-serif' }}>{sentTo}</p>
        <div style={{ background: 'rgba(201,150,90,0.05)', border: '1px solid rgba(201,150,90,0.15)', borderRadius: 18, padding: '20px 24px', marginBottom: 28, textAlign: 'left' }}>
          {['Confirma tu email', 'Inicia sesión', 'Completa dirección y fotos', 'Espera verificación (24-48h)'].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(201,150,90,0.08)' : 'none' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(201,150,90,0.1)', border: '1px solid rgba(201,150,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#C9965A', fontWeight: 700, flexShrink: 0, fontFamily: 'Outfit, sans-serif' }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: 'rgba(247,242,234,0.5)', fontFamily: 'Outfit, sans-serif' }}>{step}</span>
            </div>
          ))}
        </div>
        <Link to="/login" style={{ display: 'block', background: 'linear-gradient(135deg,#C9965A,#E8B97A)', color: '#0A0806', textDecoration: 'none', padding: '16px', borderRadius: 14, fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>
          Ir al inicio de sesión
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#0A0806', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(201,150,90,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: -100, width: 350, height: 350, background: 'radial-gradient(ellipse, rgba(201,150,90,0.05) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px 40px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 0' }}>
          <button onClick={() => step === 1 ? null : setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(247,242,234,0.35)', fontSize: 13, fontFamily: 'Outfit, sans-serif', padding: 0 }}>
            {step === 2 ? '← Atrás' : <Link to="/register" style={{ color: 'rgba(247,242,234,0.35)', textDecoration: 'none', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>← Volver</Link>}
          </button>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#F7F2EA' }}>
            TOP<span style={{ color: '#C9965A', fontStyle: 'italic' }}>sy</span>
          </Link>
          <div style={{ width: 60 }} />
        </div>

        {/* Header */}
        <div style={{ paddingTop: 28, paddingBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,150,90,0.08)', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 100, padding: '5px 14px', marginBottom: 14, fontSize: 12, color: '#C9965A', fontFamily: 'Outfit, sans-serif' }}>
            ✂️ Cuenta profesional
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 8vw, 2.6rem)', fontWeight: 300, lineHeight: 1.1, color: '#F7F2EA', margin: 0 }}>
            {step === 1 ? <>Tus <em style={{ color: '#C9965A' }}>datos</em></> : <>Tu <em style={{ color: '#C9965A' }}>negocio</em></>}
          </h1>

          {/* Step pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
            {[{ n: 1, label: 'Cuenta' }, { n: 2, label: 'Negocio' }].map(({ n, label }, i) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: step >= n ? 'rgba(201,150,90,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${step >= n ? 'rgba(201,150,90,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 100, padding: '5px 12px', transition: 'all 0.3s',
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: step >= n ? 'linear-gradient(135deg,#C9965A,#E8B97A)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: step >= n ? '#0A0806' : 'rgba(247,242,234,0.3)', fontFamily: 'Outfit, sans-serif' }}>{n}</div>
                  <span style={{ fontSize: 11, color: step >= n ? '#C9965A' : 'rgba(247,242,234,0.3)', fontFamily: 'Outfit, sans-serif', fontWeight: step >= n ? 600 : 400 }}>{label}</span>
                </div>
                {i < 1 && <div style={{ width: 20, height: 1, background: step > n ? 'rgba(201,150,90,0.4)' : 'rgba(255,255,255,0.08)' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              <InputField label="Nombre completo" error={errors.full_name?.message} focused={focused === 'name'}>
                <input {...register('full_name', { required: 'Requerido' })} placeholder="Ana Martínez" onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#F7F2EA', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }} />
              </InputField>

              <InputField label="Email" error={errors.email?.message} focused={focused === 'email'}>
                <input {...register('email', { required: 'Requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })} type="email" placeholder="tu@email.com" onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#F7F2EA', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }} />
              </InputField>

              <InputField label="Teléfono" error={errors.phone?.message} focused={focused === 'phone'}>
                <input {...register('phone', { required: 'Requerido', pattern: { value: /^[0-9+\s\-()]{9,15}$/, message: 'Teléfono inválido' } })} type="tel" placeholder="+34 600 000 000" onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#F7F2EA', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }} />
              </InputField>

              <InputField label="Contraseña" error={errors.password?.message} focused={focused === 'password'}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input {...register('password', { required: 'Requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })} type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#F7F2EA', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,242,234,0.3)', fontSize: 16, padding: 0 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </InputField>

              <div style={{ flex: 1 }} />

              <button type="button" onClick={goToStep2} style={{
                width: '100%', padding: '18px', fontSize: 15, fontWeight: 700,
                background: 'linear-gradient(135deg,#C9965A,#E8B97A)', color: '#0A0806',
                border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                letterSpacing: '0.03em', boxShadow: '0 8px 32px rgba(201,150,90,0.25)', marginTop: 8,
              }}>
                Siguiente → Datos del negocio
              </button>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              <InputField label="Nombre del negocio" error={errors.business_name?.message} focused={focused === 'bname'}>
                <input {...register('business_name', { required: 'Requerido' })} placeholder="Salón Ana" onFocus={() => setFocused('bname')} onBlur={() => setFocused(null)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#F7F2EA', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }} />
              </InputField>

              <InputField label="Ciudad" error={errors.city?.message} focused={focused === 'city'}>
                <input {...register('city', { required: 'Requerido' })} placeholder="Madrid" onFocus={() => setFocused('city')} onBlur={() => setFocused(null)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#F7F2EA', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }} />
              </InputField>

              {/* Category grid */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.3)', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Categoría</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} type="button" onClick={() => setSelectedCategory(cat.value)} style={{
                      padding: '10px 4px 8px',
                      borderRadius: 14,
                      border: `1px solid ${selectedCategory === cat.value ? 'rgba(201,150,90,0.5)' : 'rgba(255,255,255,0.06)'}`,
                      background: selectedCategory === cat.value ? 'rgba(201,150,90,0.12)' : 'rgba(255,255,255,0.025)',
                      color: selectedCategory === cat.value ? '#C9965A' : 'rgba(247,242,234,0.4)',
                      cursor: 'pointer', fontSize: 10, textAlign: 'center', transition: 'all 0.2s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      fontFamily: 'Outfit, sans-serif',
                      transform: selectedCategory === cat.value ? 'scale(1.05)' : 'scale(1)',
                    }}>
                      <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{cat.icon}</span>
                      <span style={{ fontSize: 9.5, lineHeight: 1.2 }}>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isPending} style={{
                width: '100%', padding: '18px', fontSize: 15, fontWeight: 700,
                background: isPending ? 'rgba(201,150,90,0.4)' : 'linear-gradient(135deg,#C9965A,#E8B97A)',
                color: '#0A0806', border: 'none', borderRadius: 16, cursor: isPending ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit, sans-serif', letterSpacing: '0.03em',
                boxShadow: isPending ? 'none' : '0 8px 32px rgba(201,150,90,0.25)',
              }}>
                {isPending ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span style={{ width: 18, height: 18, border: '2px solid rgba(10,8,6,0.3)', borderTopColor: '#0A0806', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Creando cuenta...
                  </span>
                ) : 'Crear mi cuenta →'}
              </button>

              <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.2)', textAlign: 'center', marginTop: 14, lineHeight: 1.6, fontFamily: 'Outfit, sans-serif' }}>
                Después añade dirección y fotos desde tu panel.
              </p>
            </>
          )}
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(247,242,234,0.25)', fontSize: 14, marginTop: 20, fontFamily: 'Outfit, sans-serif' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#C9965A', textDecoration: 'none', fontWeight: 500 }}>Inicia sesión</Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
