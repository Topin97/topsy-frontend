import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const qc = useQueryClient()
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then((r) => r.data.user),
  })

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    values: {
      full_name: me?.full_name ?? '',
      phone:     me?.phone ?? '',
      city:      me?.city ?? '',
      bio:       me?.bio ?? '',
    },
  })

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      )
      const ext  = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error } = await supabase.storage
        .from('topsy-public')
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('topsy-public').getPublicUrl(path)
      setUser({ ...user, avatar: data.publicUrl })
      toast.success('Avatar actualizado ✨')
      qc.invalidateQueries({ queryKey: ['me'] })
    } catch (err) {
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) return (
    <div className="container-app" style={{ padding: '40px 24px', maxWidth: 640 }}>
      <div className="skeleton" style={{ height: 120, borderRadius: 20, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 320, borderRadius: 20 }} />
    </div>
  )

  const avatarSrc = preview ?? me?.avatar_url
  const initials  = me?.full_name?.slice(0, 2).toUpperCase() ?? 'US'

  return (
    <div className="container-app" style={{ padding: '40px 24px', maxWidth: 640 }}>
      <p className="section-tag" style={{ marginBottom: 8 }}>Cuenta</p>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, marginBottom: 32 }}>
        Mi <em style={{ color: '#C9965A' }}>perfil</em>
      </h1>

      {/* Avatar */}
      <div className="card" style={{ padding: 32, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', border: '2px solid rgba(201,150,90,0.4)', overflow: 'hidden', background: 'rgba(201,150,90,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatarSrc
              ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#C9965A' }}>{initials}</span>
            }
          </div>
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(10,8,6,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 20, height: 20, border: '2px solid #C9965A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}
        </div>
        <div>
          <h2 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 4 }}>{me?.full_name}</h2>
          <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: 13, textTransform: 'capitalize', marginBottom: 12 }}>{me?.role}</p>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-outline" style={{ padding: '6px 16px', fontSize: 12 }}>
            {uploading ? 'Subiendo...' : 'Cambiar foto'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          <p style={{ color: 'rgba(247,242,234,0.2)', fontSize: 11, marginTop: 6 }}>JPG, PNG · Máx 5MB</p>
        </div>
      </div>

      {/* Form */}
      <div className="card" style={{ padding: 32 }}>
        <p className="section-tag" style={{ marginBottom: 24 }}>Información personal</p>
        <form onSubmit={handleSubmit(() => toast.success('Guardado ✓'))}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Nombre completo</label>
              <input {...register('full_name')} className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Teléfono</label>
              <input {...register('phone')} placeholder="+34 600 000 000" className="input" />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Ciudad</label>
            <input {...register('city')} placeholder="Madrid" className="input" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Bio</label>
            <textarea {...register('bio')} placeholder="Cuéntanos algo sobre ti..." className="input" style={{ height: 96, resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={!isDirty} className="btn-primary" style={{ padding: '10px 32px' }}>
              Guardar cambios
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}