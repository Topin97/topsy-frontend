import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { authApi, storageApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const ROLE_LABEL = { client: 'Cliente', professional: 'Profesional', admin: 'Admin' }

function Field({ label, error, focused, children }) {
  return (
    <div>
      <div style={{
        background: focused ? 'rgba(184,131,58,0.04)' : '#F7F5F2',
        border: `1.5px solid ${error ? '#dc2626' : focused ? '#B8833A' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: 14, padding: '12px 16px', transition: 'all 0.2s',
        boxShadow: focused ? '0 0 0 3px rgba(184,131,58,0.1)' : 'none',
      }}>
        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: focused ? '#B8833A' : 'rgba(26,22,18,0.4)', marginBottom: 5, fontFamily: 'Outfit, sans-serif', fontWeight: 600, transition: 'color 0.2s' }}>{label}</label>
        {children}
      </div>
      {error && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4, paddingLeft: 4, fontFamily: 'Outfit, sans-serif' }}>{error}</p>}
    </div>
  )
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const qc = useQueryClient()
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [focused, setFocused] = useState(null)

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.user),
  })

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    values: {
      full_name: me?.full_name ?? '',
      phone:     me?.phone ?? '',
      city:      me?.city ?? '',
      bio:       me?.bio ?? '',
    },
  })

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: ({ data }) => {
      toast.success('Perfil actualizado ✓')
      if (data?.user) setUser(data.user)
      qc.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al guardar'),
  })

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
    setUploading(true)
    try {
      const url = await storageApi.uploadAvatar(file, user.id)
      setUser({ ...user, avatar_url: url })
      toast.success('Foto actualizada ✨')
      qc.invalidateQueries({ queryKey: ['me'] })
    } catch {
      toast.error('Error al subir la imagen')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px' }}>
      <div className="skeleton" style={{ height: 120, borderRadius: 20, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 320, borderRadius: 20 }} />
    </div>
  )

  const avatarSrc = preview ?? me?.avatar_url
  const initials  = me?.full_name?.slice(0, 2).toUpperCase() ?? 'US'

  return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh', paddingBottom: 80 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '28px 0 22px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 28 }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Cuenta</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 300, color: '#1A1612' }}>
            Mi <em style={{ color: '#B8833A' }}>perfil</em>
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Avatar card */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: '24px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', background: 'rgba(184,131,58,0.08)', border: '2px solid rgba(184,131,58,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#B8833A' }}>{initials}</span>
              }
            </div>
            {uploading && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(247,245,242,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ width: 20, height: 20, border: '2px solid rgba(184,131,58,0.3)', borderTopColor: '#B8833A', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 500, color: '#1A1612', marginBottom: 3 }}>{me?.full_name}</h2>
            <p style={{ fontSize: 12, color: '#B8833A', fontFamily: 'Outfit, sans-serif', fontWeight: 600, marginBottom: 10, background: 'rgba(184,131,58,0.08)', display: 'inline-block', padding: '2px 10px', borderRadius: 100 }}>
              {ROLE_LABEL[me?.role] ?? me?.role}
            </p>
            <br />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 9, padding: '7px 16px', fontSize: 12, color: 'rgba(26,22,18,0.6)', cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}
            >
              {uploading ? 'Subiendo...' : 'Cambiar foto'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', marginTop: 6, fontFamily: 'Outfit, sans-serif' }}>JPG, PNG o WebP · Máx 5MB</p>
          </div>
        </div>

        {/* Form card */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: '24px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 20, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Información personal</p>

          <form onSubmit={handleSubmit(d => saveProfile(d))} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Nombre completo" focused={focused === 'name'}>
                <input {...register('full_name')} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 15, fontFamily: 'Outfit, sans-serif', padding: 0 }} />
              </Field>
              <Field label="Teléfono" focused={focused === 'phone'}>
                <input {...register('phone')} placeholder="+34 600 000 000" onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 15, fontFamily: 'Outfit, sans-serif', padding: 0 }} />
              </Field>
            </div>

            <Field label="Ciudad" focused={focused === 'city'}>
              <input {...register('city')} placeholder="Madrid" onFocus={() => setFocused('city')} onBlur={() => setFocused(null)}
                style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 15, fontFamily: 'Outfit, sans-serif', padding: 0 }} />
            </Field>

            <Field label="Bio" focused={focused === 'bio'}>
              <textarea {...register('bio')} placeholder="Cuéntanos algo sobre ti..." rows={3} onFocus={() => setFocused('bio')} onBlur={() => setFocused(null)}
                style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 15, fontFamily: 'Outfit, sans-serif', padding: 0, resize: 'none' }} />
            </Field>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                {me?.email}
              </p>
              <button type="submit" disabled={!isDirty || saving} style={{
                background: (!isDirty || saving) ? 'rgba(184,131,58,0.35)' : 'linear-gradient(135deg,#B8833A,#D4A055)',
                border: 'none', borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700,
                color: '#FFFFFF', cursor: (!isDirty || saving) ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit, sans-serif', boxShadow: (!isDirty || saving) ? 'none' : '0 4px 14px rgba(184,131,58,0.3)',
                transition: 'all 0.2s',
              }}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>

        {/* Pro panel link — solo si es profesional */}
        {me?.role === 'professional' && (
          <div style={{ background: 'rgba(184,131,58,0.06)', border: '1.5px solid rgba(184,131,58,0.2)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#1A1612', fontFamily: 'Outfit, sans-serif', marginBottom: 2 }}>Panel profesional</p>
              <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.45)', fontFamily: 'Outfit, sans-serif' }}>Gestiona servicios, horarios y tu perfil público</p>
            </div>
            <Link to="/pro/dashboard" style={{ background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', textDecoration: 'none', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(184,131,58,0.25)' }}>
              Ir al panel →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
