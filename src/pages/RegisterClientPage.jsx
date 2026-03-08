import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function RegisterClientPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm()

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

  if (emailSent) return (
    <div style={{ minHeight: '100dvh', background: '#0A0806', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(201,150,90,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center', position: 'relative' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(201,150,90,0.1)', border: '1px solid rgba(201,150,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', margin: '0 auto 28px' }}>✉️</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 300, marginBottom: 12, color: '#F7F2EA' }}>
          Revisa tu <em style={{ color: '#C9965A' }}>email</em>
        </h1>
        <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: 14, lineHeight: 1.7, marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>Hemos enviado un enlace de confirmación a</p>
        <p style={{ color: '#C9965A', fontSize: 15, fontWeight: 600, marginBottom: 32, fontFamily: 'Outfit, sans-serif' }}>{sentTo}</p>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '20px 24px', marginBottom: 28, textAlign: 'left' }}>
          {['Abre tu bandeja de entrada', 'Busca un email de citas@topsy.es', 'Pulsa "Confirmar mi cuenta"', 'Vuelve e inicia sesión'].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(201,150,90,0.1)', border: '1px solid rgba(201,150,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#C9965A', fontWeight: 700, flexShrink: 0, fontFamily: 'Outfit, sans-serif' }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: 'rgba(247,242,234,0.5)', fontFamily: 'Outfit, sans-serif' }}>{step}</span>
            </div>
          ))}
        </div>
        <Link to="/login" style={{ display: 'block', background: 'linear-gradient(135deg,#C9965A,#E8B97A)', color: '#0A0806', textDecoration: 'none', padding: '16px', borderRadius: 14, fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', letterSpacing: '0.03em' }}>
          Ir al inicio de sesión
        </Link>
        <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.2)', marginTop: 16, fontFamily: 'Outfit, sans-serif' }}>¿No lo ves? Revisa la carpeta de spam.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#0A0806', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 350, background: 'radial-gradient(ellipse, rgba(201,150,90,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: 0, right: -80, width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(201,150,90,0.05) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px 40px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 0' }}>
          <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(247,242,234,0.35)', fontSize: 13, textDecoration: 'none', fontFamily: 'Outfit, sans-serif' }}>
            ← Volver
          </Link>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#F7F2EA' }}>
            TOP<span style={{ color: '#C9965A', fontStyle: 'italic' }}>sy</span>
          </Link>
          <div style={{ width: 60 }} />
        </div>

        {/* Header */}
        <div style={{ paddingTop: 32, paddingBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '5px 14px', marginBottom: 16, fontSize: 12, color: 'rgba(247,242,234,0.4)', fontFamily: 'Outfit, sans-serif' }}>
            👤 Cuenta de cliente
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 9vw, 2.8rem)', fontWeight: 300, lineHeight: 1.1, color: '#F7F2EA', margin: 0 }}>
            Crea tu<br /><em style={{ color: '#C9965A' }}>cuenta gratis</em>
          </h1>
          <p style={{ color: 'rgba(247,242,234,0.3)', fontSize: 14, marginTop: 10, fontFamily: 'Outfit, sans-serif' }}>Sin tarjeta de crédito · Sin compromisos</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(d => mutate(d))} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              background: focused === 'name' ? 'rgba(201,150,90,0.05)' : 'rgba(255,255,255,0.025)',
              border: `1px solid ${errors.full_name ? 'rgba(248,113,113,0.5)' : focused === 'name' ? 'rgba(201,150,90,0.4)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 16, padding: '14px 18px', transition: 'all 0.2s',
            }}>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.3)', marginBottom: 6, fontFamily: 'Outfit, sans-serif' }}>Nombre completo</label>
              <input
                {...register('full_name', { required: 'Nombre requerido' })}
                placeholder="Lucía García"
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#F7F2EA', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }}
              />
            </div>
            {errors.full_name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 6, paddingLeft: 4, fontFamily: 'Outfit, sans-serif' }}>{errors.full_name.message}</p>}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              background: focused === 'email' ? 'rgba(201,150,90,0.05)' : 'rgba(255,255,255,0.025)',
              border: `1px solid ${errors.email ? 'rgba(248,113,113,0.5)' : focused === 'email' ? 'rgba(201,150,90,0.4)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 16, padding: '14px 18px', transition: 'all 0.2s',
            }}>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.3)', marginBottom: 6, fontFamily: 'Outfit, sans-serif' }}>Email</label>
              <input
                {...register('email', { required: 'Email requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })}
                type="email"
                placeholder="tu@email.com"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#F7F2EA', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }}
              />
            </div>
            {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 6, paddingLeft: 4, fontFamily: 'Outfit, sans-serif' }}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              background: focused === 'password' ? 'rgba(201,150,90,0.05)' : 'rgba(255,255,255,0.025)',
              border: `1px solid ${errors.password ? 'rgba(248,113,113,0.5)' : focused === 'password' ? 'rgba(201,150,90,0.4)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 16, padding: '14px 18px', transition: 'all 0.2s', position: 'relative',
            }}>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.3)', marginBottom: 6, fontFamily: 'Outfit, sans-serif' }}>Contraseña</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  {...register('password', { required: 'Contraseña requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#F7F2EA', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,242,234,0.3)', fontSize: 16, padding: 0, lineHeight: 1 }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 6, paddingLeft: 4, fontFamily: 'Outfit, sans-serif' }}>{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={isPending} style={{
            width: '100%', padding: '18px', fontSize: 15, fontWeight: 700,
            background: isPending ? 'rgba(201,150,90,0.4)' : 'linear-gradient(135deg,#C9965A,#E8B97A)',
            color: '#0A0806', border: 'none', borderRadius: 16, cursor: isPending ? 'not-allowed' : 'pointer',
            fontFamily: 'Outfit, sans-serif', letterSpacing: '0.03em',
            boxShadow: isPending ? 'none' : '0 8px 32px rgba(201,150,90,0.25)',
            transition: 'all 0.3s', marginBottom: 16,
          }}>
            {isPending ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ width: 18, height: 18, border: '2px solid rgba(10,8,6,0.3)', borderTopColor: '#0A0806', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Creando cuenta...
              </span>
            ) : 'Crear cuenta gratis →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(247,242,234,0.2)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.6 }}>
            Al registrarte aceptas nuestros <span style={{ color: 'rgba(201,150,90,0.5)' }}>Términos de uso</span>
          </p>
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(247,242,234,0.25)', fontSize: 14, marginTop: 24, fontFamily: 'Outfit, sans-serif' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#C9965A', textDecoration: 'none', fontWeight: 500 }}>Inicia sesión</Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
