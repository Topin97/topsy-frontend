import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate  = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      setAuth(data.user, data.access_token, data.refresh_token)
      toast.success(`Bienvenida, ${data.user.full_name?.split(' ')[0]} ✨`)
      navigate(data.user.role === 'professional' ? '/dashboard' : '/')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error ?? 'Error al iniciar sesión')
    },
  })

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(201,150,90,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#F7F2EA' }}>
            Top<span style={{ color: '#C9965A', fontStyle: 'italic' }}>Sy</span>
          </Link>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 300, marginTop: 24, marginBottom: 8 }}>
            Bienvenida <em style={{ color: '#C9965A' }}>de vuelta</em>
          </h1>
          <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: 14 }}>Inicia sesión para gestionar tus citas</p>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit((d) => mutate(d))}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Email</label>
              <input
                {...register('email', {
                  required: 'Email requerido',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' },
                })}
                type="email"
                placeholder="tu@email.com"
                className="input"
              />
              {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Contraseña</label>
              <input
                {...register('password', { required: 'Contraseña requerida' })}
                type="password"
                placeholder="••••••••"
                className="input"
              />
              {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isPending} className="btn-primary" style={{ width: '100%', padding: '14px' }}>
              {isPending ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(247,242,234,0.35)', fontSize: 14, marginTop: 24 }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: '#C9965A', textDecoration: 'none' }}>Regístrate gratis</Link>
        </p>
      </div>
    </div>
  )
}