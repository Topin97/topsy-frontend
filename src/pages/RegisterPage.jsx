import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import api from '../services/api'
import toast from 'react-hot-toast'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.5-.2-3-.4-4.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 16.3 5 9.7 8.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c4.9 0 9.3-1.9 12.7-4.9l-5.9-5c-1.9 1.4-4.2 2.2-6.8 2.2-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.5 41 16.3 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4.1 5.3l5.9 5C37 38.8 44 33 44 25c0-1.5-.2-3-.4-4.5z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 814 1000">
      <path fill="currentColor" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.8 0 663.1 0 541.8c0-194.3 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
    </svg>
  )
}

function OtpInput({ value, onChange, length = 6 }) {
  const inputs = Array.from({ length })
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !e.target.value && i > 0)
      document.getElementById(`otp-reg-${i - 1}`)?.focus()
  }
  const handleChange = (i, v) => {
    const digits = value.split('')
    digits[i] = v.slice(-1)
    onChange(digits.join(''))
    if (v && i < length - 1) document.getElementById(`otp-reg-${i + 1}`)?.focus()
  }
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {inputs.map((_, i) => (
        <input key={i} id={`otp-reg-${i}`} type="number" inputMode="numeric" maxLength={1}
          value={value[i] ?? ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          style={{ width: 44, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 700, fontFamily: 'Outfit, sans-serif', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: 10, outline: 'none', background: '#FAFAF9', color: '#1A1612', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = '#1A1612'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.15)'}
        />
      ))}
    </div>
  )
}

function Checkbox({ checked, onChange, children }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
      <div onClick={onChange} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? '#1A1612' : 'rgba(0,0,0,0.2)'}`, background: checked ? '#1A1612' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, cursor: 'pointer', transition: 'all 0.15s' }}>
        {checked && <span style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 700 }}>✓</span>}
      </div>
      <span style={{ fontSize: 14, color: 'rgba(26,22,18,0.7)', lineHeight: 1.5 }}>{children}</span>
    </label>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { loginWithGoogle, loading: googleLoading } = useGoogleAuth()
  const { executeRecaptcha } = useGoogleReCaptcha()

  const [step, setStep] = useState(1)
  const [role, setRole] = useState('client')
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [consents, setConsents] = useState({ terms: false, marketing: false })
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

  // ── Step 1: Email ──
  const handleEmailContinue = () => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setErrors({ email: 'Email inválido' }); return
    }
    setErrors({})
    setStep(2)
  }

  // ── Step 2: Datos → enviar SMS ──
  const handleDataContinue = async () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Nombre requerido'
    if (!form.phone.trim()) errs.phone = 'Teléfono requerido'
    else if (!/^[0-9+\s\-()]{9,15}$/.test(form.phone)) errs.phone = 'Teléfono inválido'
    if (!form.password || form.password.length < 8) errs.password = 'Mínimo 8 caracteres'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await api.post('/auth/phone/send', { phone: normalizePhone(form.phone) })
      startTimer()
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Error al enviar SMS')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: Verificar SMS ──
  const handleOtpVerify = async () => {
    if (otp.length < 6) { toast.error('Introduce el código completo'); return }
    setLoading(true)
    try {
      await api.post('/auth/phone/verify', { phone: normalizePhone(form.phone), code: otp })
      setStep(4)
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Código incorrecto')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setLoading(true)
    try {
      await api.post('/auth/phone/send', { phone: normalizePhone(form.phone) })
      startTimer()
      toast.success('Código reenviado')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Error al reenviar')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 4: Consentimientos → Registrar + Login automático ──
  const handleRegister = async () => {
    if (!consents.terms) { toast.error('Debes aceptar los términos'); return }
    setLoading(true)
    try {
      const token = await executeRecaptcha('register')
      await authApi.register({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        phone: normalizePhone(form.phone),
        role,
        recaptcha_token: token,
        marketing_consent: consents.marketing,
      })
      // Login automático
      const loginRes = await authApi.login({ email: form.email, password: form.password })
      setAuth(loginRes.data.user, loginRes.data.access_token, loginRes.data.refresh_token)
      toast.success('¡Bienvenido a TopSy! ✨')
      navigate(role === 'professional' ? '/pro/onboarding' : '/')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  // ── Apple OAuth ──
  const handleApple = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
      sessionStorage.setItem('oauth_role', role)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: `${window.location.origin}/oauth/callback`, queryParams: { access_type: 'offline' } },
      })
      if (error) toast.error('Error al conectar con Apple')
    } catch {
      toast.error('Error inesperado con Apple')
    }
  }

  const TOTAL_STEPS = 4

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .step-content{animation:fadeUp 0.3s ease forwards}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
        .social-btn:hover{background:#F5F5F4 !important}
        .continue-btn:hover{opacity:0.88}
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,22,18,0.5)', fontSize: 20, padding: 4 }}>
          ←
        </button>
        <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#1A1612' }}>
          TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
        </Link>
        <div style={{ width: 32 }} />
      </div>

      {/* Progress bar */}
      {step > 1 && (
        <div style={{ height: 3, background: 'rgba(0,0,0,0.06)' }}>
          <div style={{ height: '100%', background: '#1A1612', width: `${(step / TOTAL_STEPS) * 100}%`, transition: 'width 0.3s ease', borderRadius: 2 }} />
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', width: '100%', padding: '0 24px 40px' }}>

        {/* ── STEP 1: Email + Sociales ── */}
        {step === 1 && (
          <div className="step-content">
            <div style={{ paddingTop: 40, paddingBottom: 32, textAlign: 'center' }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: '#1A1612', marginBottom: 8 }}>Empezar</h1>
              <p style={{ color: 'rgba(26,22,18,0.45)', fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>Crea una cuenta para reservar y gestionar tus citas.</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <input type="email" placeholder="Email" value={form.email}
                onChange={e => { set('email', e.target.value); setErrors({}) }}
                onKeyDown={e => e.key === 'Enter' && handleEmailContinue()}
                style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${errors.email ? '#f87171' : 'rgba(0,0,0,0.15)'}`, borderRadius: 10, fontSize: 15, fontFamily: 'Outfit, sans-serif', color: '#1A1612', background: '#FAFAF9', outline: 'none', boxSizing: 'border-box' }}
              />
              {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4, fontFamily: 'Outfit, sans-serif' }}>{errors.email}</p>}
            </div>
            <button onClick={handleEmailContinue} className="continue-btn"
              style={{ width: '100%', padding: '15px', background: '#1A1612', color: '#FFFFFF', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', marginBottom: 24, transition: 'opacity 0.15s' }}>
              Continuar
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
              <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>o</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => loginWithGoogle(role)} disabled={googleLoading} className="social-btn"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: 10, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600, color: '#1A1612', transition: 'background 0.15s' }}>
                {googleLoading ? <span style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#1A1612', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> : <GoogleIcon />}
                Continuar con Google
              </button>
              <button onClick={handleApple} className="social-btn"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px', background: '#1A1612', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', transition: 'opacity 0.15s' }}>
                <AppleIcon />
                Continuar con Apple
              </button>
            </div>
            <p style={{ textAlign: 'center', color: 'rgba(26,22,18,0.4)', fontSize: 13, marginTop: 28, fontFamily: 'Outfit, sans-serif' }}>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" style={{ color: '#1A1612', fontWeight: 700, textDecoration: 'none' }}>Inicia sesión</Link>
            </p>
          </div>
        )}

        {/* ── STEP 2: Datos ── */}
        {step === 2 && (
          <div className="step-content">
            <div style={{ paddingTop: 32, paddingBottom: 24 }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#1A1612', marginBottom: 6 }}>Crear una cuenta</h1>
              <p style={{ color: 'rgba(26,22,18,0.45)', fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>Rellena tus datos para empezar a usar TopSy</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {[{ value: 'client', label: 'Soy cliente', icon: '👤' }, { value: 'professional', label: 'Soy profesional', icon: '✂️' }].map(r => (
                <button key={r.value} onClick={() => setRole(r.value)}
                  style={{ padding: '12px', border: `2px solid ${role === r.value ? '#1A1612' : 'rgba(0,0,0,0.12)'}`, borderRadius: 10, background: role === r.value ? '#1A1612' : '#FFFFFF', color: role === r.value ? '#FFFFFF' : 'rgba(26,22,18,0.6)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span>{r.icon}</span>{r.label}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 12 }}>
              <input type="text" placeholder="Nombre y apellidos" value={form.full_name}
                onChange={e => { set('full_name', e.target.value); setErrors(p => ({ ...p, full_name: null })) }}
                style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${errors.full_name ? '#f87171' : 'rgba(0,0,0,0.15)'}`, borderRadius: 10, fontSize: 15, fontFamily: 'Outfit, sans-serif', color: '#1A1612', background: '#FAFAF9', outline: 'none', boxSizing: 'border-box' }}
              />
              {errors.full_name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4, fontFamily: 'Outfit, sans-serif' }}>{errors.full_name}</p>}
            </div>
            <div style={{ marginBottom: 12 }}>
              <input type="email" placeholder="Email" value={form.email}
                onChange={e => { set('email', e.target.value); setErrors(p => ({ ...p, email: null })) }}
                style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${errors.email ? '#f87171' : 'rgba(0,0,0,0.15)'}`, borderRadius: 10, fontSize: 15, fontFamily: 'Outfit, sans-serif', color: '#1A1612', background: '#FAFAF9', outline: 'none', boxSizing: 'border-box' }}
              />
              {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4, fontFamily: 'Outfit, sans-serif' }}>{errors.email}</p>}
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${errors.phone ? '#f87171' : 'rgba(0,0,0,0.15)'}`, borderRadius: 10, background: '#FAFAF9', overflow: 'hidden' }}>
                <div style={{ padding: '14px 12px', borderRight: '1px solid rgba(0,0,0,0.1)', fontSize: 15, color: '#1A1612', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  🇪🇸 +34
                </div>
                <input type="tel" placeholder="Número de teléfono" value={form.phone}
                  onChange={e => { set('phone', e.target.value); setErrors(p => ({ ...p, phone: null })) }}
                  style={{ flex: 1, padding: '14px 12px', border: 'none', fontSize: 15, fontFamily: 'Outfit, sans-serif', color: '#1A1612', background: 'transparent', outline: 'none' }}
                />
              </div>
              <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', marginTop: 5, fontFamily: 'Outfit, sans-serif' }}>Enviaremos un código de verificación a este número</p>
              {errors.phone && <p style={{ color: '#f87171', fontSize: 12, marginTop: 2, fontFamily: 'Outfit, sans-serif' }}>{errors.phone}</p>}
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${errors.password ? '#f87171' : 'rgba(0,0,0,0.15)'}`, borderRadius: 10, background: '#FAFAF9', overflow: 'hidden' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Establecer contraseña" value={form.password}
                  onChange={e => { set('password', e.target.value); setErrors(p => ({ ...p, password: null })) }}
                  style={{ flex: 1, padding: '14px 16px', border: 'none', fontSize: 15, fontFamily: 'Outfit, sans-serif', color: '#1A1612', background: 'transparent', outline: 'none' }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ background: 'none', border: 'none', padding: '14px 12px', cursor: 'pointer', color: 'rgba(26,22,18,0.35)', fontSize: 16 }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', marginTop: 5, fontFamily: 'Outfit, sans-serif' }}>Mínimo 8 caracteres</p>
              {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 2, fontFamily: 'Outfit, sans-serif' }}>{errors.password}</p>}
            </div>
            <button onClick={handleDataContinue} disabled={loading} className="continue-btn"
              style={{ width: '100%', padding: '15px', background: '#1A1612', color: '#FFFFFF', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s' }}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Enviando código...</span>
                : 'Continuar'}
            </button>
          </div>
        )}

        {/* ── STEP 3: Verificar SMS ── */}
        {step === 3 && (
          <div className="step-content">
            <div style={{ paddingTop: 40, paddingBottom: 32, textAlign: 'center' }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#1A1612', marginBottom: 8 }}>Confirma tu número</h1>
              <p style={{ color: 'rgba(26,22,18,0.45)', fontSize: 14, fontFamily: 'Outfit, sans-serif', lineHeight: 1.6 }}>
                Te hemos enviado un código de 6 cifras al<br />
                <strong style={{ color: '#1A1612' }}>{form.phone.startsWith('+') ? form.phone : `+34 ${form.phone}`}</strong>
              </p>
            </div>
            <div style={{ marginBottom: 32 }}>
              <OtpInput value={otp} onChange={setOtp} length={6} />
            </div>
            <button onClick={handleOtpVerify} disabled={loading || otp.length < 6} className="continue-btn"
              style={{ width: '100%', padding: '15px', background: otp.length < 6 ? 'rgba(26,22,18,0.12)' : '#1A1612', color: otp.length < 6 ? 'rgba(26,22,18,0.3)' : '#FFFFFF', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: otp.length < 6 ? 'not-allowed' : 'pointer', marginBottom: 16, transition: 'all 0.15s' }}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Verificando...</span>
                : 'Continuar'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button onClick={handleResend} disabled={resendTimer > 0}
                style={{ background: 'none', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontFamily: 'Outfit, sans-serif', color: resendTimer > 0 ? 'rgba(26,22,18,0.3)' : 'rgba(26,22,18,0.6)', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer' }}>
                {resendTimer > 0 ? `Reenviar (${resendTimer}s)` : 'Reenviar código'}
              </button>
              <button onClick={() => { setStep(2); setOtp('') }}
                style={{ background: 'none', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'rgba(26,22,18,0.6)', cursor: 'pointer' }}>
                Cambiar número
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Consentimientos ── */}
        {step === 4 && (
          <div className="step-content">
            <div style={{ paddingTop: 40, paddingBottom: 32, textAlign: 'center' }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#1A1612', marginBottom: 8 }}>Consentimientos</h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', background: '#F9F9F8', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', marginBottom: 28 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <Checkbox checked={consents.terms && consents.marketing} onChange={() => {
                  const all = consents.terms && consents.marketing
                  setConsents({ terms: !all, marketing: !all })
                }}>
                  <span style={{ fontWeight: 600, color: '#1A1612' }}>Seleccionar todo</span>
                </Checkbox>
              </div>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <Checkbox checked={consents.terms} onChange={() => setConsents(p => ({ ...p, terms: !p.terms }))}>
                  <span>
                    Acepto los <Link to="/privacy" target="_blank" style={{ color: '#B8833A', textDecoration: 'none', fontWeight: 600 }}>Términos y condiciones</Link> y confirmo que he leído la <Link to="/privacy" target="_blank" style={{ color: '#B8833A', textDecoration: 'none', fontWeight: 600 }}>Política de privacidad</Link>.
                    <br /><span style={{ color: '#dc2626', fontSize: 12, fontWeight: 600 }}>Obligatorio</span>
                  </span>
                </Checkbox>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <Checkbox checked={consents.marketing} onChange={() => setConsents(p => ({ ...p, marketing: !p.marketing }))}>
                  Quiero recibir información sobre promociones y ofertas de TopSy.
                </Checkbox>
              </div>
            </div>
            <button onClick={handleRegister} disabled={loading || !consents.terms} className="continue-btn"
              style={{ width: '100%', padding: '15px', background: !consents.terms ? 'rgba(26,22,18,0.15)' : '#1A1612', color: !consents.terms ? 'rgba(26,22,18,0.3)' : '#FFFFFF', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: !consents.terms ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Creando cuenta...
                  </span>
                : 'Continuar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}