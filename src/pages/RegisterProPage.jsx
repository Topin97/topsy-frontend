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

export default function RegisterProPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [step, setStep] = useState(1) // 1=account, 2=business
  const { register, handleSubmit, watch, trigger, getValues, formState: { errors } } = useForm()

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
        toast.success('¡Cuenta creada! Ahora completa tu negocio ✨')
        navigate('/pro/onboarding')
      } else {
        setSentTo(data.user?.email ?? '')
        setEmailSent(true)
      }
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al registrarse'),
  })

  const goToStep2 = async () => {
    const valid = await trigger(['full_name', 'email', 'password'])
    if (valid) setStep(2)
  }

  const onSubmit = (data) => {
    if (!selectedCategory) { toast.error('Selecciona una categoría'); return }
    mutate({ ...data, category: selectedCategory })
  }

  if (emailSent) return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>✉️</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', fontWeight: 300, marginBottom: 12 }}>
          Revisa tu <em style={{ color: '#C9965A' }}>email</em>
        </h1>
        <p style={{ color: 'rgba(247,242,234,0.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>Hemos enviado un enlace de confirmación a:</p>
        <p style={{ color: '#C9965A', fontSize: 16, fontWeight: 600, marginBottom: 32 }}>{sentTo}</p>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 32, textAlign: 'left' }}>
          <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.5)', lineHeight: 1.8 }}>
            1. Confirma tu email<br/>
            2. Inicia sesión<br/>
            3. Completa la información de tu negocio<br/>
            4. Espera la verificación del equipo TopSy
          </p>
        </div>
        <Link to="/login" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#C9965A,#E8B97A)', color: '#0A0806', textDecoration: 'none', padding: '14px 40px', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
          Ir al inicio de sesión
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(201,150,90,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
        {/* Back */}
        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(247,242,234,0.35)', fontSize: 13, textDecoration: 'none', marginBottom: 32 }}>
          ← Volver
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#F7F2EA' }}>
            TOP<span style={{ color: '#C9965A', fontStyle: 'italic' }}>sy</span>
          </Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,150,90,0.08)', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 100, padding: '6px 16px', margin: '16px auto 0', fontSize: 12, color: '#C9965A' }}>
            ✂️ Cuenta de profesional
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.6rem', fontWeight: 300, marginTop: 20, marginBottom: 8 }}>
            {step === 1 ? <>Tu <em style={{ color: '#C9965A' }}>cuenta</em></> : <>Tu <em style={{ color: '#C9965A' }}>negocio</em></>}
          </h1>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: step >= s ? 'linear-gradient(135deg,#C9965A,#E8B97A)' : 'rgba(255,255,255,0.06)',
                  border: step >= s ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: step >= s ? '#0A0806' : 'rgba(247,242,234,0.3)',
                  transition: 'all 0.3s',
                }}>{s}</div>
                {s < 2 && <div style={{ width: 32, height: 1, background: step > s ? 'rgba(201,150,90,0.5)' : 'rgba(255,255,255,0.08)' }} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(10px)' }}>
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* ── STEP 1: Account info ── */}
            {step === 1 && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Nombre completo</label>
                  <input {...register('full_name', { required: 'Nombre requerido' })} placeholder="Ana Martínez" className="input" />
                  {errors.full_name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.full_name.message}</p>}
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Email</label>
                  <input {...register('email', { required: 'Email requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })} type="email" placeholder="tu@email.com" className="input" />
                  {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Teléfono</label>
                  <input {...register('phone', { required: 'Teléfono requerido', pattern: { value: /^[0-9+\s\-()]{9,15}$/, message: 'Teléfono inválido' } })} type="tel" placeholder="+34 600 000 000" className="input" />
                  {errors.phone && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.phone.message}</p>}
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input {...register('password', { required: 'Contraseña requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })} type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" className="input" style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,242,234,0.3)', fontSize: 13, padding: 0 }}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
                </div>

                <button type="button" onClick={goToStep2} className="btn-primary" style={{ width: '100%', padding: 14, fontSize: 14 }}>
                  Siguiente → Datos del negocio
                </button>
              </>
            )}

            {/* ── STEP 2: Business info ── */}
            {step === 2 && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Nombre del negocio</label>
                  <input {...register('business_name', { required: 'Nombre del negocio requerido' })} placeholder="Salón Lucía" className="input" />
                  {errors.business_name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.business_name.message}</p>}
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Ciudad</label>
                  <input {...register('city', { required: 'Ciudad requerida' })} placeholder="Madrid" className="input" />
                  {errors.city && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.city.message}</p>}
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 12 }}>Categoría</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setSelectedCategory(cat.value)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 10,
                          border: selectedCategory === cat.value ? '1px solid rgba(201,150,90,0.5)' : '1px solid rgba(255,255,255,0.07)',
                          background: selectedCategory === cat.value ? 'rgba(201,150,90,0.12)' : 'rgba(255,255,255,0.03)',
                          color: selectedCategory === cat.value ? '#C9965A' : 'rgba(247,242,234,0.45)',
                          cursor: 'pointer',
                          fontSize: 11,
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button type="button" onClick={() => setStep(1)} style={{ padding: 14, fontSize: 14, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(247,242,234,0.5)', cursor: 'pointer' }}>
                    ← Atrás
                  </button>
                  <button type="submit" disabled={isPending} className="btn-primary" style={{ padding: 14, fontSize: 14 }}>
                    {isPending ? 'Creando...' : 'Crear cuenta'}
                  </button>
                </div>

                <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.2)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
                  Después de confirmar tu email podrás añadir tu dirección,<br/>fotos y servicios desde tu panel.
                </p>
              </>
            )}
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(247,242,234,0.3)', fontSize: 14, marginTop: 24 }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#C9965A', textDecoration: 'none' }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
