import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { authApi, storageApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ROLE_LABEL = { client: 'Cliente', professional: 'Profesional', admin: 'Admin' }

// ─── Helpers de visualización del usuario ───────────────────────────────────
// Devuelve un nombre legible aunque falte full_name (típico en Apple OAuth)
function getDisplayName(me, userEmail) {
  const fullName = me?.full_name?.trim()
  if (fullName) return fullName
  // Fallback 1: parte antes de @ del email (ej "juan@gmail.com" → "juan")
  if (userEmail) {
    const localPart = userEmail.split('@')[0]
    // Limpiar si es un email de Apple relay (string aleatorio feo)
    if (!userEmail.includes('privaterelay.appleid.com')) {
      return localPart
    }
  }
  // Fallback 2
  return 'Mi cuenta'
}

// Devuelve 1-2 iniciales para el avatar
function getInitials(me, userEmail) {
  const fullName = me?.full_name?.trim()
  if (fullName) {
    const parts = fullName.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      // "Juan Pérez" → "JP"
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    // "Juan" → "JU"
    return parts[0].slice(0, 2).toUpperCase()
  }
  // Fallback al email
  if (userEmail) {
    const localPart = userEmail.split('@')[0]
    if (!userEmail.includes('privaterelay.appleid.com') && localPart) {
      return localPart.slice(0, 2).toUpperCase()
    }
  }
  return '?'
}

// Quita prefijo +34 / 0034 / 34 + 9 dígitos para mostrar SOLO los 9 dígitos en el input
function stripSpanishPrefix(phone) {
  if (!phone) return ''
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('34')) return digits.slice(2)
  if (digits.length === 13 && digits.startsWith('0034')) return digits.slice(4)
  return digits
}
// ────────────────────────────────────────────────────────────────────────────

function ResendVerificationButton({ email }) {
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)

  const handleResend = async () => {
    if (timer > 0 || !email) return
    setLoading(true)
    try {
      await authApi.resendVerification(email)
      setTimer(60)
      const t = setInterval(() => {
        setTimer(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 })
      }, 1000)
      toast.success('Email de verificación enviado ✓')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Error al reenviar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleResend} disabled={loading || timer > 0}
      style={{ background: timer > 0 ? 'rgba(146,64,14,0.1)' : '#92400E', color: timer > 0 ? '#B45309' : '#FFFFFF', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: timer > 0 ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
      {loading ? 'Enviando...' : timer > 0 ? `Reenviar en ${timer}s` : 'Reenviar email de verificación'}
    </button>
  )
}

function DatosPersonales({ me, userEmail, emailVerified, onBack, onSave, saving }) {
  const [focused, setFocused] = useState(null)
  const { register, handleSubmit, formState: { isDirty, errors } } = useForm({
    values: {
      full_name: me?.full_name ?? '',
      phone: stripSpanishPrefix(me?.phone),
      city: me?.city ?? '',
      bio: me?.bio ?? '',
    },
  })
  const inputStyle = { width: '100%', background: 'none', border: 'none', outline: 'none', color: '#181512', fontSize: 15, fontFamily: 'Outfit, sans-serif', padding: 0 }

  const submit = (data) => {
    // Solo añadimos el prefijo si el usuario escribió algo; si está vacío mandamos null para "quitar teléfono"
    const rawPhone = (data.phone ?? '').replace(/\s/g, '')
    const phone = rawPhone ? `+34${rawPhone}` : null
    onSave({
      full_name: data.full_name,
      city: data.city,
      bio: data.bio,
      phone,
    })
  }

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#181512', padding: 4 }}>←</button>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#181512', margin: 0 }}>Datos de la cuenta</h2>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{ padding: '16px 0' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(24,21,18,0.4)', letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase' }}>Datos personales</p>
          <form onSubmit={handleSubmit(submit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { key: 'full_name', label: 'Nombre y apellido', placeholder: 'Tu nombre completo' },
              { key: 'city', label: 'Ciudad', placeholder: 'Madrid' },
            ].map(f => (
              <div key={f.key} style={{ border: `1.5px solid ${focused === f.key ? '#181512' : 'rgba(0,0,0,0.12)'}`, borderRadius: 12, padding: '12px 16px', transition: 'border-color 0.2s', background: '#FAFAF9' }}>
                <label style={{ display: 'block', fontSize: 11, color: 'rgba(24,21,18,0.4)', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>{f.label}</label>
                <input {...register(f.key)} placeholder={f.placeholder} onFocus={() => setFocused(f.key)} onBlur={() => setFocused(null)} style={inputStyle} />
              </div>
            ))}

            {/* TELÉFONO con prefijo +34 fijo */}
            <div>
              <div style={{
                border: `1.5px solid ${errors.phone ? '#f87171' : focused === 'phone' ? '#181512' : 'rgba(0,0,0,0.12)'}`,
                borderRadius: 12,
                padding: '12px 16px',
                transition: 'border-color 0.2s',
                background: '#FAFAF9',
              }}>
                <label style={{ display: 'block', fontSize: 11, color: 'rgba(24,21,18,0.4)', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>Teléfono</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, color: '#181512', fontWeight: 500, fontFamily: 'Outfit, sans-serif', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>🇪🇸 +34</span>
                  <div style={{ width: 1, height: 18, background: 'rgba(0,0,0,0.1)', flexShrink: 0 }} />
                  <input
                    {...register('phone', {
                      validate: (v) => {
                        if (!v || !v.trim()) return true // Permitir vaciar el teléfono
                        const digits = v.replace(/\D/g, '')
                        if (digits.length !== 9) return 'Deben ser 9 dígitos'
                        if (!/^[67]/.test(digits)) return 'Debe empezar por 6 o 7'
                        return true
                      },
                    })}
                    type="tel"
                    inputMode="numeric"
                    placeholder="600 000 000"
                    onFocus={() => setFocused('phone')}
                    onBlur={() => setFocused(null)}
                    style={{ ...inputStyle, flex: 1 }}
                    autoComplete="tel-national"
                  />
                </div>
              </div>
              {errors.phone && (
                <p style={{ color: '#f87171', fontSize: 12, marginTop: 5, paddingLeft: 4, fontFamily: 'Outfit, sans-serif' }}>
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div style={{ border: `1.5px solid ${focused === 'bio' ? '#181512' : 'rgba(0,0,0,0.12)'}`, borderRadius: 12, padding: '12px 16px', transition: 'border-color 0.2s', background: '#FAFAF9' }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(24,21,18,0.4)', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>Bio</label>
              <textarea {...register('bio')} placeholder="Cuéntanos algo sobre ti..." rows={3} onFocus={() => setFocused('bio')} onBlur={() => setFocused(null)} style={{ ...inputStyle, resize: 'none' }} />
            </div>

            <div style={{ padding: '14px 0', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 12, color: 'rgba(24,21,18,0.4)', margin: '0 0 2px' }}>Correo electrónico</p>
                <p style={{ fontSize: 14, color: '#181512', margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
              </div>
              {emailVerified
                ? <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: 999, padding: '3px 10px', flexShrink: 0 }}>✓ Verificado</span>
                : <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)', borderRadius: 999, padding: '3px 10px', flexShrink: 0 }}>⚠ Pendiente</span>
              }
            </div>

            <button type="submit" disabled={!isDirty || saving}
              style={{ width: '100%', padding: '15px', background: !isDirty || saving ? 'rgba(24,21,18,0.1)' : '#181512', color: !isDirty || saving ? 'rgba(24,21,18,0.3)' : '#FFFFFF', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: !isDirty || saving ? 'not-allowed' : 'pointer', marginTop: 8, transition: 'all 0.15s' }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Notificaciones({ onBack }) {
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifApp, setNotifApp] = useState(true)
  const Toggle = ({ value, onChange }) => (
    <div onClick={onChange} style={{ width: 48, height: 28, borderRadius: 14, background: value ? '#B8833A' : 'rgba(0,0,0,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
    </div>
  )
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#181512', padding: 4 }}>←</button>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#181512', margin: 0 }}>Notificaciones</h2>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{ padding: '16px 0' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(24,21,18,0.4)', letterSpacing: '0.08em', marginBottom: 4, textTransform: 'uppercase' }}>Si se cambia el estado de la reserva, notifíqueme por</p>
        </div>
        {[
          { label: 'Email', value: notifEmail, onChange: () => setNotifEmail(p => !p), desc: 'Confirmaciones, recordatorios y cancelaciones' },
          { label: 'Notificación de la aplicación', value: notifApp, onChange: () => setNotifApp(p => !p), desc: 'Alertas en tiempo real' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div>
              <p style={{ fontSize: 15, color: '#181512', margin: '0 0 2px', fontWeight: 500 }}>{item.label}</p>
              <p style={{ fontSize: 12, color: 'rgba(24,21,18,0.4)', margin: 0 }}>{item.desc}</p>
            </div>
            <Toggle value={item.value} onChange={item.onChange} />
          </div>
        ))}
      </div>
    </div>
  )
}

function Privacidad({ onBack }) {
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#181512', padding: 4 }}>←</button>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#181512', margin: 0 }}>Tu privacidad</h2>
      </div>
      <div style={{ padding: '20px' }}>
        <p style={{ fontSize: 14, color: 'rgba(24,21,18,0.5)', lineHeight: 1.7 }}>
          Tus datos personales (nombre, email, teléfono) son utilizados únicamente para gestionar tus citas y enviarte notificaciones relacionadas con ellas. No compartimos tu información con terceros sin tu consentimiento.
        </p>
        <Link to="/privacy" style={{ display: 'block', marginTop: 16, color: '#B8833A', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
          Ver política de privacidad completa →
        </Link>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [section, setSection] = useState(null)

  const { data: meData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authApi.me()
      return res.data
    },
  })
  const me = meData?.user ?? user
  const userEmail = me?.email ?? user?.email
  const emailVerified = !!meData?.email_confirmed_at
  const isAppleRelay = userEmail?.includes('privaterelay.appleid.com')
  // No mostrar banner para usuarios de Google/Apple — su email ya está verificado por el proveedor
  const isOAuthUser = meData?.provider && meData.provider !== 'email'
  const showBanner = !emailVerified && !isAppleRelay && !isOAuthUser && !!userEmail

  // ── Detecta si al usuario le falta el nombre (caso típico de Apple OAuth) ──
  const hasName = !!me?.full_name?.trim()
  const showCompleteProfileBanner = !isLoading && !hasName && !!meData
  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: data => authApi.updateProfile(data),
    onSuccess: ({ data }) => {
      toast.success('Perfil actualizado ✓')
      if (data?.user) setUser(data.user)
      qc.invalidateQueries({ queryKey: ['me'] })
      setSection(null)
    },
    onError: err => toast.error(err.response?.data?.error ?? 'Error al guardar'),
  })

const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validaciones básicas antes de subir
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se aceptan imágenes')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5 MB')
      return
    }

    // Preview inmediato mientras se sube
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      // 1) Subir el fichero al bucket de Supabase Storage
      const url = await storageApi.uploadAvatar(file, user.id)

      // 2) PERSISTIR la nueva URL en BD vía backend
      await authApi.updateProfile({ avatar_url: url })

      // 3) Actualizar caché local (store + react-query)
      setUser({ ...user, avatar_url: url })
      qc.invalidateQueries({ queryKey: ['me'] })

      toast.success('Foto actualizada ✨')
    } catch (err) {
      console.error('[Avatar] upload error:', err)
      toast.error(err.response?.data?.error ?? 'Error al subir la imagen')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[80, 200, 300].map((h, i) => <div key={i} style={{ height: h, borderRadius: 12, background: 'linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite' }} />)}
    </div>
  )

  const avatarSrc = preview ?? me?.avatar_url
  const displayName = getDisplayName(me, userEmail)
  const initials = getInitials(me, userEmail)

  if (section === 'datos') return <DatosPersonales me={me} userEmail={userEmail} emailVerified={emailVerified} onBack={() => setSection(null)} onSave={d => saveProfile(d)} saving={saving} />
  if (section === 'notificaciones') return <Notificaciones onBack={() => setSection(null)} />
  if (section === 'privacidad') return <Privacidad onBack={() => setSection(null)} />

  const MenuRow = ({ icon, label, sublabel, onClick, danger = false }) => (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: '1.2rem', width: 24, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 500, color: danger ? '#dc2626' : '#181512', margin: 0 }}>{label}</p>
          {sublabel && <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'rgba(24,21,18,0.4)', margin: 0, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sublabel}</p>}
        </div>
      </div>
      {!danger && <span style={{ color: 'rgba(24,21,18,0.25)', fontSize: 16, flexShrink: 0 }}>›</span>}
    </button>
  )

  return (
    <div style={{ background: '#F8F5F0', minHeight: '100vh', paddingBottom: 60, fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
      `}</style>

      {/* Banner verificación email pendiente */}
      {showBanner && (
        <div style={{ background: '#FEF3C7', borderBottom: '1px solid #F59E0B', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
            <div>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 700, color: '#92400E', margin: 0 }}>No olvides confirmar tu correo electrónico</p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#B45309', margin: 0 }}>Revisa tu bandeja de entrada en <strong>{userEmail}</strong></p>
            </div>
          </div>
          <ResendVerificationButton email={userEmail} />
        </div>
      )}

      {/* Banner "completa tu perfil" — típico para Apple OAuth */}
      {showCompleteProfileBanner && (
        <div style={{ background: 'linear-gradient(135deg, rgba(184,131,58,0.10), rgba(212,160,85,0.05))', borderBottom: '1px solid rgba(184,131,58,0.25)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>✨</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 700, color: '#92400E', margin: 0 }}>Completa tu perfil</p>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#B45309', margin: '2px 0 0' }}>Añade tu nombre para que los profesionales puedan identificarte.</p>
          </div>
          <button onClick={() => setSection('datos')}
            style={{ background: '#B8833A', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
            Completar →
          </button>
        </div>
      )}

      {/* Cabecera con avatar y nombre */}
      <div style={{ background: '#FFFFFF', padding: '28px 20px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: avatarSrc ? 'transparent' : 'linear-gradient(135deg,#1A0F05,#2C1810)', border: '2px solid rgba(197,138,61,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(17,17,17,0.1)' }}>
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#D4A055', fontWeight: 700 }}>{initials}</span>
              }
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: '#181512', border: '2px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11 }}>
              📷
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: '#181512', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: hasName ? 'normal' : 'italic', opacity: hasName ? 1 : 0.7 }}>
              {displayName}
            </h1>
            {me?.phone && <p style={{ fontSize: 13, color: 'rgba(24,21,18,0.45)', margin: '0 0 4px' }}>{me.phone}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#B57932', fontWeight: 700, background: 'rgba(197,138,61,0.1)', padding: '2px 10px', borderRadius: 999, display: 'inline-block' }}>
                {ROLE_LABEL[me?.role] ?? me?.role}
              </span>
              {me?.role === 'client' && (me?.points ?? 0) >= 0 && (
                <span style={{ fontSize: 11, color: '#B57932', fontWeight: 700, background: 'rgba(197,138,61,0.08)', border: '1px solid rgba(197,138,61,0.2)', padding: '2px 10px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  ⭐ {me?.points ?? 0} puntos
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', marginTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <MenuRow icon="👤" label="Datos de la cuenta" sublabel={userEmail} onClick={() => setSection('datos')} />
        <MenuRow icon="🔔" label="Notificaciones" sublabel="Email y alertas de la app" onClick={() => setSection('notificaciones')} />
        <MenuRow icon="🔒" label="Tu privacidad" sublabel="Cómo usamos tus datos" onClick={() => setSection('privacidad')} />
        {me?.role === 'professional' && (
          <MenuRow icon="✂️" label="Panel profesional" sublabel="Servicios, horarios y perfil" onClick={() => navigate('/pro/dashboard')} />
        )}
      </div>

      <div style={{ background: '#FFFFFF', marginTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <MenuRow icon="🚪" label="Cerrar sesión" onClick={() => { logout(); navigate('/') }} danger />
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(24,21,18,0.25)', marginTop: 24, fontFamily: 'Outfit, sans-serif' }}>
        TopSy · v1.0
      </p>
    </div>
  )
}
