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
  const [focused, setFocused] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  useEffect(() => {
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
    <div style={{ minHeight: '100dvh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo + header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#1A1612' }}>
            TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
          </Link>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', fontWeight: 300, marginTop: 20, marginBottom: 8, color: '#1A1612' }}>
            Nueva <em style={{ color: '#B8833A' }}>contraseña</em>
          </h1>
          <p style={{ color: 'rgba(26,22,18,0.4)', fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>Elige una contraseña segura</p>
        </div>

        {/* Card */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 22, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Nueva contraseña */}
            <div>
              <div style={{
                background: focused === 'pass' ? 'rgba(184,131,58,0.04)' : '#FAFAF9',
                border: `1.5px solid ${errors.password ? '#f87171' : focused === 'pass' ? '#B8833A' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 14, padding: '13px 16px', transition: 'all 0.2s',
                boxShadow: focused === 'pass' ? '0 0 0 3px rgba(184,131,58,0.1)' : 'none',
              }}>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: focused === 'pass' ? '#B8833A' : 'rgba(26,22,18,0.4)', marginBottom: 5, fontFamily: 'Outfit, sans-serif', fontWeight: 600, transition: 'color 0.2s' }}>Nueva contraseña</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    {...register('password', { required: 'Contraseña requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
                    type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
                    onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,22,18,0.3)', fontSize: 16, padding: 0 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5, paddingLeft: 4, fontFamily: 'Outfit, sans-serif' }}>{errors.password.message}</p>}
            </div>

            {/* Confirmar */}
            <div>
              <div style={{
                background: focused === 'confirm' ? 'rgba(184,131,58,0.04)' : '#FAFAF9',
                border: `1.5px solid ${errors.confirm ? '#f87171' : focused === 'confirm' ? '#B8833A' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 14, padding: '13px 16px', transition: 'all 0.2s',
                boxShadow: focused === 'confirm' ? '0 0 0 3px rgba(184,131,58,0.1)' : 'none',
              }}>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: focused === 'confirm' ? '#B8833A' : 'rgba(26,22,18,0.4)', marginBottom: 5, fontFamily: 'Outfit, sans-serif', fontWeight: 600, transition: 'color 0.2s' }}>Confirmar contraseña</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    {...register('confirm', { required: 'Confirma tu contraseña', validate: v => v === watch('password') || 'Las contraseñas no coinciden' })}
                    type={showConfirm ? 'text' : 'password'} placeholder="Repite tu contraseña"
                    onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 16, fontFamily: 'Outfit, sans-serif', padding: 0 }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,22,18,0.3)', fontSize: 16, padding: 0 }}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              {errors.confirm && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5, paddingLeft: 4, fontFamily: 'Outfit, sans-serif' }}>{errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={isPending || !ready} style={{
              width: '100%', padding: '15px', fontSize: 15, fontWeight: 700, marginTop: 4,
              background: (isPending || !ready) ? 'rgba(184,131,58,0.4)' : 'linear-gradient(135deg,#B8833A,#D4A055)',
              color: '#FFFFFF', border: 'none', borderRadius: 14,
              cursor: (isPending || !ready) ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif',
              boxShadow: (isPending || !ready) ? 'none' : '0 6px 20px rgba(184,131,58,0.3)', transition: 'all 0.25s',
            }}>
              {isPending ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Guardando...
                </span>
              ) : 'Guardar nueva contraseña'}
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
