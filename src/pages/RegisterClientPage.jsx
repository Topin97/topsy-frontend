import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useState } from 'react'

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
    <div style={{ minHeight: '100dvh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(184,131,58,0.1)', border: '2px solid rgba(184,131,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', margin: '0 auto 28px' }}>✉️</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 300, marginBottom: 12, color: '#1A1612' }}>
          Revisa tu <em style={{ color: '#B8833A' }}>email</em>
        </h1>
        <p style={{ color: 'rgba(26,22,18,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 6, fontFamily: 'Outfit, sans-serif' }}>Hemos enviado un enlace a</p>
        <p style={{ color: '#B8833A', fontSize: 15, fontWeight: 700, marginBottom: 28, fontFamily: 'Outfit, sans-serif' }}>{sentTo}</p>
        <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 18, padding: '20px 24px', marginBottom: 24, textAlign: 'left', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          {['Abre tu bandeja de entrada', 'Busca un email de citas@topsy.es', 'Pulsa "Confirmar mi cuenta"', 'Vuelve e inicia sesión'].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(184,131,58,0.1)', border: '1.5px solid rgba(184,131,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#B8833A', fontWeight: 700, flexShrink: 0, fontFamily: 'Outfit, sans-serif' }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: 'rgba(26,22,18,0.6)', fontFamily: 'Outfit, sans-serif' }}>{step}</span>
            </div>
          ))}
        </div>
        <Link to="/login" style={{ display: 'block', background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', textDecoration: 'none', padding: '16px', borderRadius: 14, fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 16px rgba(184,131,58,0.25)' }}>
          Ir al inicio de sesión
        </Link>
        <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.3)', marginTop: 14, fontFamily: 'Outfit, sans-serif' }}>¿No lo ves? Revisa la carpeta de spam.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#F7F5F2', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px 40px', maxWidth: 480, margin: '0 auto', width: '100%' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 0' }}>
          <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(26,22,18,0.4)', fontSize: 13, textDecoration: 'none', fontFamily: 'Outfit, sans-serif' }}>
            ← Volver
          </Link>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#1A1612' }}>
            TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
          </Link>
          <div style={{ width: 60 }} />
        </div>

        {/* Header */}
        <div style={{ paddingTop: 28, paddingBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 100, padding: '5px 14px', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.5)', fontFamily: 'Outfit, sans-serif' }}>👤 Cuenta de cliente</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 9vw, 2.8rem)', fontWeight: 300, lineHeight: 1.1, color: '#1A1612', margin: 0 }}>
            Crea tu<br /><em style={{ color: '#B8833A' }}>cuenta gratis</em>
          </h1>
          <p style={{ color: 'rgba(26,22,18,0.35)', fontSize: 14, marginTop: 10, fontFamily: 'Outfit, sans-serif' }}>Sin tarjeta de crédito · Sin compromisos</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(d => mutate(d))} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          <Field label="Nombre completo" error={errors.full_name?.message} focused={focused === 'name'}>
            <input {...register('full_name', { required: 'Nombre requerido' })} placeholder="Lucía García"
              onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
              style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }} />
          </Field>

          <Field label="Email" error={errors.email?.message} focused={focused === 'email'}>
            <input {...register('email', { required: 'Email requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })}
              type="email" placeholder="tu@email.com"
              onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
              style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }} />
          </Field>

          <Field label="Contraseña" error={errors.password?.message} focused={focused === 'password'}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input {...register('password', { required: 'Contraseña requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
                type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
                onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,22,18,0.3)', fontSize: 16, padding: 0, lineHeight: 1 }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </Field>

          <div style={{ flex: 1 }} />

          <button type="submit" disabled={isPending} style={{
            width: '100%', padding: '16px', fontSize: 15, fontWeight: 700,
            background: isPending ? 'rgba(184,131,58,0.4)' : 'linear-gradient(135deg,#B8833A,#D4A055)',
            color: '#FFFFFF', border: 'none', borderRadius: 14, cursor: isPending ? 'not-allowed' : 'pointer',
            fontFamily: 'Outfit, sans-serif', letterSpacing: '0.03em',
            boxShadow: isPending ? 'none' : '0 6px 24px rgba(184,131,58,0.3)',
            transition: 'all 0.25s', marginBottom: 14,
          }}>
            {isPending ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Creando cuenta...
              </span>
            ) : 'Crear cuenta gratis →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.6 }}>
            Al registrarte aceptas nuestros <span style={{ color: '#B8833A' }}>Términos de uso</span>
          </p>
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(26,22,18,0.35)', fontSize: 14, marginTop: 24, fontFamily: 'Outfit, sans-serif' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#B8833A', textDecoration: 'none', fontWeight: 600 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}