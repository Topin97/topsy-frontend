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
  const { register, handleSubmit, formState: { errors } } = useForm()

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => authApi.register({ ...data, role: 'client' }),
    onSuccess: ({ data }) => {
      if (data.access_token) {
        setAuth(data.user, data.access_token, data.refresh_token)
        toast.success('¡Cuenta creada! Bienvenido ✨')
        navigate('/')
      } else {
        setSentTo(data.user?.email ?? '')
        setEmailSent(true)
      }
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al registrarse'),
  })

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
            1. Abre tu bandeja de entrada<br/>
            2. Busca un email de <strong style={{ color: 'rgba(247,242,234,0.8)' }}>citas@topsy.es</strong><br/>
            3. Haz clic en <strong style={{ color: '#C9965A' }}>"Confirmar mi cuenta"</strong><br/>
            4. Vuelve aquí e inicia sesión
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
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(201,150,90,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Back */}
        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(247,242,234,0.35)', fontSize: 13, textDecoration: 'none', marginBottom: 32 }}>
          ← Volver
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#F7F2EA' }}>
            TOP<span style={{ color: '#C9965A', fontStyle: 'italic' }}>sy</span>
          </Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '6px 16px', margin: '16px auto 0', fontSize: 12, color: 'rgba(247,242,234,0.5)' }}>
            👤 Cuenta de cliente
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.6rem', fontWeight: 300, marginTop: 20, marginBottom: 8 }}>
            Crea tu <em style={{ color: '#C9965A' }}>cuenta</em>
          </h1>
          <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 14 }}>Gratis, sin tarjeta de crédito</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(10px)' }}>
          <form onSubmit={handleSubmit(d => mutate(d))}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Nombre completo</label>
              <input {...register('full_name', { required: 'Nombre requerido' })} placeholder="Lucía García" className="input" />
              {errors.full_name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.full_name.message}</p>}
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Email</label>
              <input {...register('email', { required: 'Email requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })} type="email" placeholder="tu@email.com" className="input" />
              {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
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

            <button type="submit" disabled={isPending} className="btn-primary" style={{ width: '100%', padding: 14, fontSize: 14 }}>
              {isPending ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
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
