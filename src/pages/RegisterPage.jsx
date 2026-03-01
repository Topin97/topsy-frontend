import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'client' } })
  const role = watch('role')

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ data }) => {
      if (data.access_token) {
        setAuth(data.user, data.access_token, data.refresh_token)
        toast.success('¡Cuenta creada! Bienvenido ✨')
        navigate(data.user.role === 'professional' ? '/pro/dashboard' : '/')
      } else {
        setSentTo(data.user?.email ?? '')
        setEmailSent(true)
      }
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al registrarse'),
  })

  // Pantalla de confirmación
  if (emailSent) return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>✉️</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', fontWeight: 300, marginBottom: 12 }}>
          Revisa tu <em style={{ color: '#C9965A' }}>email</em>
        </h1>
        <p style={{ color: 'rgba(247,242,234,0.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
          Hemos enviado un enlace de confirmación a:
        </p>
        <p style={{ color: '#C9965A', fontSize: 16, fontWeight: 600, marginBottom: 32 }}>{sentTo}</p>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px', marginBottom: 32, textAlign: 'left' }}>
          <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.5)', lineHeight: 1.8 }}>
            1. Abre tu bandeja de entrada<br/>
            2. Busca un email de <strong style={{ color: 'rgba(247,242,234,0.8)' }}>citas@topsy.es</strong><br/>
            3. Haz clic en <strong style={{ color: '#C9965A' }}>"Confirmar mi cuenta"</strong><br/>
            4. Vuelve aquí e inicia sesión
          </p>
        </div>
        <p style={{ color: 'rgba(247,242,234,0.25)', fontSize: 12, marginBottom: 24 }}>
          ¿No lo ves? Revisa la carpeta de spam.
        </p>
        <Link to="/login" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #C9965A, #E8B97A)', color: '#0A0806', textDecoration: 'none', padding: '14px 40px', borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>
          Ir al inicio de sesión
        </Link>
      </div>
    </div>
  )

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
          <form onSubmit={handleSubmit(d => mutate(d))}>

            {/* Role selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { value: 'client',       label: '👤 Soy cliente',     desc: 'Busco y reservo citas' },
                { value: 'professional', label: '✂️ Soy profesional', desc: 'Ofrezco servicios' },
              ].map(opt => (
                <label key={opt.value} style={{
                  cursor: 'pointer', borderRadius: 12,
                  border: `1px solid ${role === opt.value ? '#C9965A' : 'rgba(255,255,255,0.1)'}`,
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
              <input {...register('email', {
                required: 'Email requerido',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' },
              })} type="email" placeholder="tu@email.com" className="input" />
              {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Contraseña</label>
              <input {...register('password', {
                required: 'Contraseña requerida',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })} type="password" placeholder="Mínimo 8 caracteres" className="input" />
              {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isPending} className="btn-primary" style={{ width: '100%', padding: '14px' }}>
              {isPending ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>

            <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.2)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
              Al registrarte aceptas nuestros <span style={{ color: 'rgba(201,150,90,0.6)' }}>Términos de uso</span> y <span style={{ color: 'rgba(201,150,90,0.6)' }}>Política de privacidad</span>
            </p>
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