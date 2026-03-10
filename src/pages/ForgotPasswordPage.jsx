import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [focused, setFocused] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, vars) => { setSentTo(vars.email); setSent(true) },
    onError: () => toast.error('Error al enviar el email'),
  })

  if (sent) return (
    <div style={{ minHeight: '100dvh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(184,131,58,0.1)', border: '2px solid rgba(184,131,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', margin: '0 auto 24px' }}>📬</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', fontWeight: 300, marginBottom: 12, color: '#1A1612' }}>
          Revisa tu <em style={{ color: '#B8833A' }}>email</em>
        </h1>
        <p style={{ color: 'rgba(26,22,18,0.45)', fontSize: 14, lineHeight: 1.7, marginBottom: 6, fontFamily: 'Outfit, sans-serif' }}>
          Hemos enviado un enlace de recuperación a:
        </p>
        <p style={{ color: '#B8833A', fontSize: 15, fontWeight: 700, marginBottom: 28, fontFamily: 'Outfit, sans-serif' }}>{sentTo}</p>
        <p style={{ color: 'rgba(26,22,18,0.3)', fontSize: 12, marginBottom: 28, fontFamily: 'Outfit, sans-serif' }}>
          ¿No lo ves? Revisa la carpeta de spam.
        </p>
        <Link to="/login" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', textDecoration: 'none', padding: '14px 40px', borderRadius: 12, fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', boxShadow: '0 6px 20px rgba(184,131,58,0.3)' }}>
          Volver al login
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo + header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#1A1612' }}>
            TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
          </Link>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', fontWeight: 300, marginTop: 20, marginBottom: 8, color: '#1A1612' }}>
            Recuperar <em style={{ color: '#B8833A' }}>contraseña</em>
          </h1>
          <p style={{ color: 'rgba(26,22,18,0.4)', fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>Te enviaremos un enlace para resetearla</p>
        </div>

        {/* Card */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 22, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleSubmit(d => mutate(d))}>
            <div style={{ marginBottom: 20 }}>
              <div style={{
                background: focused ? 'rgba(184,131,58,0.04)' : '#FAFAF9',
                border: `1.5px solid ${errors.email ? '#f87171' : focused ? '#B8833A' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 14, padding: '13px 16px', transition: 'all 0.2s',
                boxShadow: focused ? '0 0 0 3px rgba(184,131,58,0.1)' : 'none',
              }}>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: focused ? '#B8833A' : 'rgba(26,22,18,0.4)', marginBottom: 5, fontFamily: 'Outfit, sans-serif', fontWeight: 600, transition: 'color 0.2s' }}>Email</label>
                <input
                  {...register('email', { required: 'Email requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })}
                  type="email" placeholder="tu@email.com"
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }}
                />
              </div>
              {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5, paddingLeft: 4, fontFamily: 'Outfit, sans-serif' }}>{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={isPending} style={{
              width: '100%', padding: '15px', fontSize: 15, fontWeight: 700,
              background: isPending ? 'rgba(184,131,58,0.4)' : 'linear-gradient(135deg,#B8833A,#D4A055)',
              color: '#FFFFFF', border: 'none', borderRadius: 14,
              cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif',
              boxShadow: isPending ? 'none' : '0 6px 20px rgba(184,131,58,0.3)', transition: 'all 0.25s',
            }}>
              {isPending ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Enviando...
                </span>
              ) : 'Enviar enlace de recuperación'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(26,22,18,0.4)', fontSize: 14, marginTop: 20, fontFamily: 'Outfit, sans-serif' }}>
          <Link to="/login" style={{ color: '#B8833A', textDecoration: 'none', fontWeight: 600 }}>← Volver al login</Link>
        </p>
      </div>
    </div>
  )
}
