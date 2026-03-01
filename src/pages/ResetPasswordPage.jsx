import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    // Supabase manda el token en el hash de la URL
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace('#', ''))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      if (accessToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(() => setReady(true))
      }
    } else {
      setReady(true)
    }
  }, [])

  const onSubmit = async ({ password }) => {
    setIsPending(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Contraseña actualizada ✓')
      navigate('/login')
    } catch (err) {
      toast.error(err.message ?? 'Error al actualizar contraseña')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(201,150,90,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#F7F2EA' }}>
            TOP<span style={{ color: '#C9965A', fontStyle: 'italic' }}>sy</span>
          </Link>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.6rem', fontWeight: 300, marginTop: 20, marginBottom: 8 }}>
            Nueva <em style={{ color: '#C9965A' }}>contraseña</em>
          </h1>
          <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 14 }}>Elige una contraseña segura</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px 28px' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Nueva contraseña</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.4 }}>🔒</span>
                <input
                  {...register('password', {
                    required: 'Contraseña requerida',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  className="input"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,242,234,0.3)', fontSize: 13, padding: 0 }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Confirmar contraseña</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.4 }}>🔒</span>
                <input
                  {...register('confirm', {
                    required: 'Confirma tu contraseña',
                    validate: v => v === watch('password') || 'Las contraseñas no coinciden',
                  })}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  className="input"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(247,242,234,0.3)', fontSize: 13, padding: 0 }}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirm && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={isPending || !ready} className="btn-primary" style={{ width: '100%', padding: '14px' }}>
              {isPending ? 'Guardando...' : 'Guardar nueva contraseña'}
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