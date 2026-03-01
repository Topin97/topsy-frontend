import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { profApi, authApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { createClient } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import { useState, useRef } from 'react'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false }
  }
)

const CATEGORIES = [
  { value: 'hair',      label: '💇 Peluquería' },
  { value: 'nails',     label: '💅 Uñas' },
  { value: 'spa',       label: '🧖 Spa' },
  { value: 'barber',    label: '🪒 Barbería' },
  { value: 'aesthetic', label: '✨ Estética' },
  { value: 'brows',     label: '👁️ Cejas' },
]

function ImageUpload({ label, currentUrl, bucket, onUploaded, aspect = 'cover' }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('La imagen no puede superar 5MB'); return }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
      onUploaded(publicUrl)
      toast.success('Foto subida ✓')
    } catch (err) {
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const isCover = aspect === 'cover'

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>
        {label}
      </label>
      <div
        onClick={() => !uploading && inputRef.current.click()}
        style={{
          width: '100%', height: isCover ? 160 : 100,
          borderRadius: 14, border: '2px dashed rgba(201,150,90,0.25)',
          background: 'rgba(255,255,255,0.02)', cursor: 'pointer',
          overflow: 'hidden', position: 'relative', transition: 'border-color 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {currentUrl ? (
          <>
            <img src={currentUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="img-overlay">
              <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Cambiar foto</p>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>{uploading ? '⏳' : '📸'}</p>
            <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.35)' }}>{uploading ? 'Subiendo...' : 'Pulsa para subir foto'}</p>
            <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.2)', marginTop: 4 }}>JPG, PNG · máx 5MB</p>
          </div>
        )}
        {uploading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#C9965A', fontSize: 13 }}>Subiendo...</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <style>{`.img-overlay { opacity: 0 !important; } div:hover > .img-overlay { opacity: 1 !important; }`}</style>
    </div>
  )
}

export default function ProProfilePage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [coverUrl, setCoverUrl] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.user),
    onSuccess: (data) => {
      if (data?.professional_profiles?.cover_image_url && !coverUrl) setCoverUrl(data.professional_profiles.cover_image_url)
      if (data?.profiles?.avatar_url && !avatarUrl) setAvatarUrl(data.profiles.avatar_url)
    }
  })

  const hasProfile = !!me?.professional_profiles

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    values: {
      business_name: me?.professional_profiles?.business_name ?? '',
      description:   me?.professional_profiles?.description   ?? '',
      category:      me?.professional_profiles?.category      ?? 'hair',
      address:       me?.professional_profiles?.address       ?? '',
      city:          me?.professional_profiles?.city          ?? '',
    },
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: async (data) => {
      try {
        const city = data.city || data.address
        if (city) {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', España')}&format=json&limit=1`)
          const results = await res.json()
          if (results[0]) {
            data.latitude  = parseFloat(results[0].lat)
            data.longitude = parseFloat(results[0].lon)
          }
        }
      } catch {}
      if (coverUrl) data.cover_image_url = coverUrl
      return hasProfile ? profApi.update(data) : profApi.create(data)
    },
    onSuccess: () => {
      toast.success(hasProfile ? 'Perfil actualizado ✓' : 'Perfil profesional creado ✓')
      qc.invalidateQueries({ queryKey: ['me'] })
      setCreating(false)
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al guardar'),
  })

  if (isLoading) return (
    <div className="container-app" style={{ padding: '40px 24px', maxWidth: 700 }}>
      <div className="skeleton" style={{ height: 400, borderRadius: 20 }} />
    </div>
  )

  return (
    <div style={{ background: '#0A0806', minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container-app" style={{ padding: '32px 16px', maxWidth: 700 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 20, height: 1, background: '#C9965A' }} /> Panel profesional
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,5vw,2.8rem)', fontWeight: 300, marginBottom: 28 }}>
          Perfil del <em style={{ color: '#C9965A' }}>negocio</em>
        </h1>

        {!hasProfile && !creating && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 48, textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✂️</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 300, marginBottom: 8 }}>Crea tu perfil profesional</h2>
            <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: 14, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
              Los clientes verán tu perfil al buscar profesionales.
            </p>
            <button onClick={() => setCreating(true)} className="btn-primary" style={{ padding: '12px 32px' }}>Crear perfil ahora</button>
          </div>
        )}

        {(hasProfile || creating) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Fotos */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 16, height: 1, background: '#C9965A' }} /> Fotos
              </p>
              <ImageUpload
                label="Foto de portada del negocio"
                currentUrl={coverUrl ?? me?.professional_profiles?.cover_image_url}
                bucket="covers"
                onUploaded={(url) => { setCoverUrl(url); profApi.update({ cover_image_url: url }).then(() => qc.invalidateQueries(['me'])) }}
                aspect="cover"
              />
              <ImageUpload
                label="Foto de perfil / avatar"
                currentUrl={avatarUrl ?? me?.profiles?.avatar_url}
                bucket="avatars"
                onUploaded={(url) => { setAvatarUrl(url) }}
                aspect="avatar"
              />
            </div>

            {/* Datos */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 16, height: 1, background: '#C9965A' }} /> Información
              </p>
              <form onSubmit={handleSubmit(d => save(d))}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Nombre del negocio *</label>
                  <input {...register('business_name', { required: 'Campo requerido' })} placeholder="Ej: Salón Lucía García" className="input" />
                  {errors.business_name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.business_name.message}</p>}
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Categoría *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {CATEGORIES.map(cat => (
                      <label key={cat.value} style={{ cursor: 'pointer' }}>
                        <input {...register('category')} type="radio" value={cat.value} style={{ display: 'none' }} />
                        <div style={{ padding: '10px 12px', borderRadius: 10, fontSize: 13, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s', cursor: 'pointer' }} className="cat-option">
                          {cat.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Descripción</label>
                  <textarea {...register('description')} placeholder="Describe tu negocio, especialidades, experiencia..." className="input" style={{ height: 100, resize: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Dirección</label>
                    <input {...register('address')} placeholder="Calle Mayor 1" className="input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Ciudad *</label>
                    <input {...register('city', { required: 'Ciudad requerida' })} placeholder="Madrid" className="input" />
                    {errors.city && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.city.message}</p>}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  {creating && !hasProfile && (
                    <button type="button" onClick={() => setCreating(false)} className="btn-ghost">Cancelar</button>
                  )}
                  <button type="submit" disabled={isPending || (!isDirty && hasProfile && !coverUrl)} className="btn-primary" style={{ padding: '12px 32px' }}>
                    {isPending ? 'Guardando...' : hasProfile ? 'Guardar cambios' : 'Crear perfil'}
                  </button>
                </div>
              </form>
            </div>

            {/* Estado */}
            {hasProfile && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 20px' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 12 }}>Estado del perfil</p>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: me?.professional_profiles?.is_active ? '#4ade80' : '#f87171' }} />
                    <span style={{ fontSize: 13, color: 'rgba(247,242,234,0.6)' }}>{me?.professional_profiles?.is_active ? 'Perfil activo' : 'Perfil inactivo'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: me?.professional_profiles?.is_verified ? '#C9965A' : 'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontSize: 13, color: 'rgba(247,242,234,0.6)' }}>{me?.professional_profiles?.is_verified ? '✓ Verificado' : 'Pendiente de verificación'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}