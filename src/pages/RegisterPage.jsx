import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'client' } })
  const role = watch('role')

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ data }) => {
      if (data.access_token) {
        setAuth(data.user, data.access_token, data.refresh_token)
        toast.success('¡Cuenta creada! Bienvenida ✨')
        navigate(data.user.role === 'professional' ? '/dashboard' : '/')
      } else {
        toast.success('Cuenta creada. Revisa tu email.')
        navigate('/login')
      }
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al registrarse'),
  })

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(201,150,90,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#F7F2EA' }}>
            Top<span style={{ color: '#C9965A', fontStyle: 'italic' }}>Sy</span>
          </Link>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 300, marginTop: 24, marginBottom: 8 }}>
            Crea tu <em style={{ color: '#C9965A' }}>cuenta</em>
          </h1>
          <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: 14 }}>Gratis, sin tarjeta de crédito</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit((d) => mutate(d))}>

            {/* Role selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { value: 'client',       label: '👤 Soy cliente',       desc: 'Busco y reservo citas' },
                { value: 'professional', label: '✂️ Soy profesional',   desc: 'Ofrezco servicios' },
              ].map((opt) => (
                <label key={opt.value} style={{
                  cursor: 'pointer', borderRadius: 12, border: `1px solid ${role === opt.value ? '#C9965A' : 'rgba(255,255,255,0.1)'}`,
                  padding: '16px 12px', background: role === opt.value ? 'rgba(201,150,90,0.1)' : 'transparent',
                  transition: 'all 0.2s',
                }}>
                  <input {...register('role')} type="radio" value={opt.value} style={{ display: 'none' }} />
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(247,242,234,0.4)' }}>{opt.desc}</div>
                </label>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Nombre completo</label>
              <input {...register('full_name', { required: 'Nombre requerido' })} placeholder="Lucía García" className="input" />
              {errors.full_name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.full_name.message}</p>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Email</label>
              <input
                {...register('email', {
                  required: 'Email requerido',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' },
                })}
                type="email" placeholder="tu@email.com" className="input"
              />
              {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Contraseña</label>
              <input
                {...register('password', {
                  required: 'Contraseña requerida',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                })}
                type="password" placeholder="Mínimo 8 caracteres" className="input"
              />
              {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isPending} className="btn-primary" style={{ width: '100%', padding: '14px' }}>
              {isPending ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(247,242,234,0.35)', fontSize: 14, marginTop: 24 }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#C9965A', textDecoration: 'none' }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}