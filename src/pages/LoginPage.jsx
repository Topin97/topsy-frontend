import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [showPassword, setShowPassword] = useState(false)

  // Si viene del email de confirmación
  const justConfirmed = searchParams.get('type') === 'signup' || window.location.hash.includes('type=signup')

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      setAuth(data.user, data.access_token, data.refresh_token)
      toast.success(`Bienvenido, ${data.user.full_name?.split(' ')[0]} ✨`)
      navigate(data.user.role === 'professional' ? '/pro/dashboard' : '/')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error ?? 'Error al iniciar sesión')
    },
  })

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(201,150,90,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,150,90,0.15), transparent)' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

        {/* Mensaje de cuenta confirmada */}
        {justConfirmed && (
          <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.5rem' }}>🎉</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#4ade80', marginBottom: 2 }}>¡Cuenta confirmada!</p>
              <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)' }}>Ya puedes iniciar sesión con tu cuenta.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#F7F2EA' }}>
            TOP<span style={{ color: '#C9965A', fontStyle: 'italic' }}>sy</span>
          </Link>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.6rem', fontWeight: 300, marginTop: 20, marginBottom: 8 }}>
            Bienvenido <em style={{ color: '#C9965A' }}>de vuelta</em>
          </h1>
          <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 14 }}>Gestiona tus citas desde cualquier lugar</p>
        </div>

        {/* Form */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(10px)' }}>
          <form onSubmit={handleSubmit(d => mutate(d))}>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.4 }}>✉️</span>
                <input
                  {...register('email', {
                    required: 'Email requerido',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' },
                  })}
                  type="email"
                  placeholder="tu@email.com"
                  className="input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
              {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.4 }}>🔒</span>
                <input
                  {...register('password', { required: 'Contraseña requerida' })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,242,234,0.3)', fontSize: 13, padding: 0 }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'rgba(201,150,90,0.6)', textDecoration: 'none' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" disabled={isPending} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 14, letterSpacing: '0.05em' }}>
              {isPending ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(10,8,6,0.3)', borderTopColor: '#0A0806', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Entrando...
                </span>
              ) : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(247,242,234,0.3)', fontSize: 14, marginTop: 24 }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: '#C9965A', textDecoration: 'none', fontWeight: 500 }}>Regístrate gratis</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}