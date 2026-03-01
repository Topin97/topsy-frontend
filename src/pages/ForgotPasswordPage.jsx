import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm()

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, vars) => {
      setSentTo(vars.email)
      setSent(true)
    },
    onError: () => toast.error('Error al enviar el email'),
  })

  if (sent) return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>📬</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', fontWeight: 300, marginBottom: 12 }}>
          Revisa tu <em style={{ color: '#C9965A' }}>email</em>
        </h1>
        <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
          Hemos enviado un enlace de recuperación a:
        </p>
        <p style={{ color: '#C9965A', fontSize: 15, fontWeight: 600, marginBottom: 32 }}>{sentTo}</p>
        <p style={{ color: 'rgba(247,242,234,0.2)', fontSize: 12, marginBottom: 28 }}>
          ¿No lo ves? Revisa la carpeta de spam.
        </p>
        <Link to="/login" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #C9965A, #E8B97A)', color: '#0A0806', textDecoration: 'none', padding: '14px 40px', borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>
          Volver al login
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(201,150,90,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#F7F2EA' }}>
            TOP<span style={{ color: '#C9965A', fontStyle: 'italic' }}>sy</span>
          </Link>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.6rem', fontWeight: 300, marginTop: 20, marginBottom: 8 }}>
            Recuperar <em style={{ color: '#C9965A' }}>contraseña</em>
          </h1>
          <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 14 }}>Te enviaremos un enlace para resetearla</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px 28px' }}>
          <form onSubmit={handleSubmit(d => mutate(d))}>
            <div style={{ marginBottom: 24 }}>
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

            <button type="submit" disabled={isPending} className="btn-primary" style={{ width: '100%', padding: '14px' }}>
              {isPending ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(247,242,234,0.3)', fontSize: 14, marginTop: 24 }}>
          <Link to="/login" style={{ color: '#C9965A', textDecoration: 'none' }}>← Volver al login</Link>
        </p>
      </div>
    </div>
  )
}