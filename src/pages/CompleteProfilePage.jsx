import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi, storageApi } from '../services/api'
import { useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import toast from 'react-hot-toast'

function OtpInput({ value, onChange, length = 6 }) {
  const inputs = Array.from({ length })
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !e.target.value && i > 0)
      document.getElementById(`otp-cp-${i - 1}`)?.focus()
  }
  const handleChange = (i, v) => {
    const digits = value.split('')
    digits[i] = v.slice(-1)
    onChange(digits.join(''))
    if (v && i < length - 1) document.getElementById(`otp-cp-${i + 1}`)?.focus()
  }
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {inputs.map((_, i) => (
        <input key={i} id={`otp-cp-${i}`} type="number" inputMode="numeric" maxLength={1}
          value={value[i] ?? ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          style={{ width: 44, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 700, fontFamily: 'Outfit, sans-serif', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: 10, outline: 'none', background: '#FAFAF9', color: '#1A1612' }}
          onFocus={e => e.target.style.borderColor = '#1A1612'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.15)'}
        />
      ))}
    </div>
  )
}

export default function CompleteProfilePage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const qc = useQueryClient()
  const fileRef = useRef(null)

  const pendingUser = JSON.parse(sessionStorage.getItem('pending_user') ?? '{}')
  const pendingAccessToken = sessionStorage.getItem('pending_access_token')
  const pendingRefreshToken = sessionStorage.getItem('pending_refresh_token')

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    full_name: pendingUser?.full_name || '',
    phone: '',
    city: '',
  })
  const [avatarPreview, setAvatarPreview] = useState(pendingUser?.avatar_url || null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [otp, setOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const normalizePhone = (phone) => {
    const cleaned = phone.replace(/\s/g, '')
    return cleaned.startsWith('+') ? cleaned : `+34${cleaned}`
  }

  const startTimer = () => {
    setResendTimer(60)
    const t = setInterval(() => {
      setResendTimer(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 })
    }, 1000)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = ev => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleDataContinue = async () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Nombre requerido'
    if (!form.phone.trim()) errs.phone = 'Teléfono requerido'
    else if (!/^[0-9+\s\-()]{9,15}$/.test(form.phone)) errs.phone = 'Teléfono inválido'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await api.post('/auth/phone/send-any', { phone: normalizePhone(form.phone) })
      startTimer()
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Error al enviar SMS')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerify = async () => {
    if (otp.length < 6) { toast.error('Introduce el código completo'); return }
    setLoading(true)
    try {
      // Verificar SMS
      await api.post('/auth/phone/verify', { phone: normalizePhone(form.phone), code: otp })

      // Subir avatar si hay uno
      let avatarUrl = pendingUser?.avatar_url ?? null
      if (avatarFile) {
        try {
          avatarUrl = await storageApi.uploadAvatar(avatarFile, pendingUser?.id, pendingAccessToken)
        } catch (e) {
          console.error('[CompleteProfile] avatar upload error:', e)
        }
      }

      // Actualizar perfil
      await api.put('/auth/profile', {
        full_name: form.full_name.trim(),
        phone: normalizePhone(form.phone),
        city: form.city.trim() || null,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      }, { headers: { Authorization: `Bearer ${pendingAccessToken}` } })

      sessionStorage.removeItem('pending_user')
      sessionStorage.removeItem('pending_access_token')
      sessionStorage.removeItem('pending_refresh_token')

      const updatedUser = {
        ...pendingUser,
        full_name: form.full_name.trim(),
        phone: normalizePhone(form.phone),
        city: form.city.trim() || null,
        avatar_url: avatarUrl,
      }

      setAuth(updatedUser, pendingAccessToken, pendingRefreshToken)
      qc.invalidateQueries({ queryKey: ['me'] })

      toast.success(`¡Bienvenido, ${form.full_name.split(' ')[0]}! ✨`)
      navigate(updatedUser?.role === 'professional' ? '/pro/onboarding' : '/profile')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Error al verificar')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setLoading(true)
    try {
      await api.post('/auth/phone/send-any', { phone: normalizePhone(form.phone) })
      startTimer()
      toast.success('Código reenviado')
    } catch (err) {
      toast.error('Error al reenviar')
    } finally {
      setLoading(false)
    }
  }

  const initials = form.full_name?.slice(0, 2).toUpperCase() || '?'

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .fade-up{animation:fadeUp 0.3s ease forwards}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
      `}</style>

      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '3px', color: '#1A1612' }}>
            TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
          </p>
        </div>

        {/* Progress */}
        <div style={{ height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 2, marginBottom: 32 }}>
          <div style={{ height: '100%', background: '#1A1612', width: step === 1 ? '50%' : '100%', transition: 'width 0.3s ease', borderRadius: 2 }} />
        </div>

        {/* Step 1: Datos + foto */}
        {step === 1 && (
          <div className="fade-up">
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#1A1612', marginBottom: 8 }}>
              Completa tu perfil
            </h1>
            <p style={{ color: 'rgba(26,22,18,0.45)', fontSize: 14, fontFamily: 'Outfit, sans-serif', marginBottom: 28, lineHeight: 1.6 }}>
              Solo necesitamos unos datos más para configurar tu cuenta.
            </p>

            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <div style={{ position: 'relative' }}>
                <div onClick={() => fileRef.current?.click()} style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', background: avatarPreview ? 'transparent' : 'linear-gradient(135deg,#1A0F05,#2C1810)', border: '2px solid rgba(197,138,61,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#D4A055', fontWeight: 700 }}>{initials}</span>
                  }
                </div>
                <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#1A1612', border: '2px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13 }}>
                  📷
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif', marginBottom: 24 }}>Foto de perfil (opcional)</p>

            {/* Nombre */}
            <div style={{ marginBottom: 12 }}>
              <input type="text" placeholder="Nombre y apellidos *" value={form.full_name}
                onChange={e => { set('full_name', e.target.value); setErrors(p => ({ ...p, full_name: null })) }}
                style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${errors.full_name ? '#f87171' : 'rgba(0,0,0,0.15)'}`, borderRadius: 10, fontSize: 15, fontFamily: 'Outfit, sans-serif', color: '#1A1612', background: '#FAFAF9', outline: 'none', boxSizing: 'border-box' }}
              />
              {errors.full_name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4, fontFamily: 'Outfit, sans-serif' }}>{errors.full_name}</p>}
            </div>

            {/* Teléfono */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${errors.phone ? '#f87171' : 'rgba(0,0,0,0.15)'}`, borderRadius: 10, background: '#FAFAF9', overflow: 'hidden' }}>
                <div style={{ padding: '14px 12px', borderRight: '1px solid rgba(0,0,0,0.1)', fontSize: 15, color: '#1A1612', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  🇪🇸 +34
                </div>
                <input type="tel" placeholder="Número de teléfono *" value={form.phone}
                  onChange={e => { set('phone', e.target.value); setErrors(p => ({ ...p, phone: null })) }}
                  style={{ flex: 1, padding: '14px 12px', border: 'none', fontSize: 15, fontFamily: 'Outfit, sans-serif', color: '#1A1612', background: 'transparent', outline: 'none' }}
                />
              </div>
              <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', marginTop: 5, fontFamily: 'Outfit, sans-serif' }}>Verificaremos tu número por SMS</p>
              {errors.phone && <p style={{ color: '#f87171', fontSize: 12, marginTop: 2, fontFamily: 'Outfit, sans-serif' }}>{errors.phone}</p>}
            </div>

            {/* Ciudad */}
            <div style={{ marginBottom: 28 }}>
              <input type="text" placeholder="Ciudad (opcional)" value={form.city}
                onChange={e => set('city', e.target.value)}
                style={{ width: '100%', padding: '14px 16px', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: 10, fontSize: 15, fontFamily: 'Outfit, sans-serif', color: '#1A1612', background: '#FAFAF9', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button onClick={handleDataContinue} disabled={loading}
              style={{ width: '100%', padding: '15px', background: '#1A1612', color: '#FFFFFF', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Enviando código...</span>
                : 'Continuar →'}
            </button>
          </div>
        )}

        {/* Step 2: SMS */}
        {step === 2 && (
          <div className="fade-up">
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#1A1612', marginBottom: 8, textAlign: 'center' }}>
              Confirma tu número
            </h1>
            <p style={{ color: 'rgba(26,22,18,0.45)', fontSize: 14, fontFamily: 'Outfit, sans-serif', marginBottom: 32, textAlign: 'center', lineHeight: 1.6 }}>
              Te hemos enviado un código al<br />
              <strong style={{ color: '#1A1612' }}>{form.phone.startsWith('+') ? form.phone : `+34 ${form.phone}`}</strong>
            </p>

            <div style={{ marginBottom: 32 }}>
              <OtpInput value={otp} onChange={setOtp} length={6} />
            </div>

            <button onClick={handleOtpVerify} disabled={loading || otp.length < 6}
              style={{ width: '100%', padding: '15px', background: otp.length < 6 ? 'rgba(26,22,18,0.12)' : '#1A1612', color: otp.length < 6 ? 'rgba(26,22,18,0.3)' : '#FFFFFF', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: otp.length < 6 ? 'not-allowed' : 'pointer', marginBottom: 16 }}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Verificando...</span>
                : 'Confirmar →'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button onClick={handleResend} disabled={resendTimer > 0}
                style={{ background: 'none', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontFamily: 'Outfit, sans-serif', color: resendTimer > 0 ? 'rgba(26,22,18,0.3)' : 'rgba(26,22,18,0.6)', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer' }}>
                {resendTimer > 0 ? `Reenviar (${resendTimer}s)` : 'Reenviar código'}
              </button>
              <button onClick={() => { setStep(1); setOtp('') }}
                style={{ background: 'none', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'rgba(26,22,18,0.6)', cursor: 'pointer' }}>
                Cambiar número
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
