import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { authApi, bookingsApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { createClient } from '@supabase/supabase-js'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
)

const STATUS_LABEL = {
  confirmed: { label: 'Confirmada', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  pending:   { label: 'Pendiente',  color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  cancelled: { label: 'Cancelada',  color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  completed: { label: 'Completada', color: '#C9965A', bg: 'rgba(201,150,90,0.1)' },
}

export default function ProfilePage() {
  const { user, token, setUser } = useAuthStore()
  const qc = useQueryClient()
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [bookingTab, setBookingTab] = useState('upcoming')

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.user),
  })

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.getMine().then(r => r.data),
  })

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    values: {
      full_name: me?.full_name ?? '',
      phone:     me?.phone ?? '',
      city:      me?.city ?? '',
      bio:       me?.bio ?? '',
    },
  })

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Perfil actualizado ✓')
      qc.invalidateQueries({ queryKey: ['me'] })
    },
    onError: () => toast.error('Error al guardar'),
  })

  const { mutate: cancelBooking } = useMutation({
    mutationFn: (id) => bookingsApi.cancel(id),
    onSuccess: () => {
      toast.success('Cita cancelada')
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
    },
    onError: () => toast.error('Error al cancelar'),
  })

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(file)
    setUploading(true)
    try {
      await supabase.auth.setSession({ access_token: token, refresh_token: token })
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await authApi.updateProfile({ avatar_url: publicUrl })
      setUser({ ...user, avatar: publicUrl })
      toast.success('Foto actualizada ✓')
      qc.invalidateQueries({ queryKey: ['me'] })
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) return (
    <div className="container-app" style={{ padding: '40px 24px', maxWidth: 700 }}>
      <div className="skeleton" style={{ height: 120, borderRadius: 20, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 320, borderRadius: 20 }} />
    </div>
  )

  const avatarSrc = preview ?? me?.avatar_url
  const initials = me?.full_name?.slice(0, 2).toUpperCase() ?? 'US'
  const allBookings = bookingsData?.data ?? []
  const now = new Date()
  const upcoming = allBookings.filter(b => b.status !== 'cancelled' && new Date(b.starts_at) >= now)
  const past = allBookings.filter(b => b.status === 'completed' || new Date(b.starts_at) < now)
  const displayed = bookingTab === 'upcoming' ? upcoming : past

  return (
    <div style={{ background: '#0A0806', minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container-app" style={{ padding: '32px 16px', maxWidth: 700 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 20, height: 1, background: '#C9965A' }} /> Cuenta
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, marginBottom: 28 }}>
          Mi <em style={{ color: '#C9965A' }}>perfil</em>
        </h1>

        {/* Avatar */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', flexShrink: 0 }} onClick={() => fileRef.current?.click()}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', border: '2px solid rgba(201,150,90,0.4)', overflow: 'hidden', background: 'rgba(201,150,90,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#C9965A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '2px solid #0A0806', cursor: 'pointer' }}>✏️</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 2 }}>{me?.full_name}</h2>
            <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: 13, textTransform: 'capitalize', marginBottom: 8 }}>{me?.role === 'professional' ? 'Profesional' : 'Cliente'}</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#C9965A' }}>{allBookings.length}</p>
                <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Citas</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#C9965A' }}>{upcoming.length}</p>
                <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Próximas</p>
              </div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
        </div>

        {/* Mis citas */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, marginBottom: 16 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 16, height: 1, background: '#C9965A' }} /> Mis citas
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[{ key: 'upcoming', label: `Próximas (${upcoming.length})` }, { key: 'past', label: `Historial (${past.length})` }].map(t => (
              <button key={t.key} onClick={() => setBookingTab(t.key)} style={{
                padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 12,
                fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
                background: bookingTab === t.key ? 'rgba(201,150,90,0.15)' : 'rgba(255,255,255,0.04)',
                color: bookingTab === t.key ? '#C9965A' : 'rgba(247,242,234,0.4)',
                border: bookingTab === t.key ? '1px solid rgba(201,150,90,0.3)' : '1px solid transparent',
              }}>{t.label}</button>
            ))}
          </div>

          {bookingsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)}
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ fontSize: '2rem', marginBottom: 8 }}>📅</p>
              <p style={{ color: 'rgba(247,242,234,0.25)', fontSize: 13, fontStyle: 'italic' }}>
                {bookingTab === 'upcoming' ? 'No tienes citas próximas' : 'Sin historial aún'}
              </p>
              {bookingTab === 'upcoming' && (
                <Link to="/search" style={{ display: 'inline-block', marginTop: 16, fontSize: 13, color: '#C9965A', textDecoration: 'none', border: '1px solid rgba(201,150,90,0.3)', borderRadius: 100, padding: '8px 20px' }}>
                  Reservar cita →
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {displayed.map(b => {
                const status = STATUS_LABEL[b.status] ?? STATUS_LABEL.pending
                const date = new Date(b.starts_at)
                const canCancel = b.status === 'confirmed' && date > now
                return (
                  <div key={b.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{b.services?.name ?? 'Servicio'}</p>
                        <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)', marginBottom: 3 }}>
                          {b.professional_profiles?.business_name ?? 'Profesional'}
                        </p>
                        <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.35)' }}>
                          📅 {date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} · {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <span style={{ fontSize: 11, color: status.color, background: status.bg, padding: '3px 10px', borderRadius: 100 }}>{status.label}</span>
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#C9965A' }}>{b.total_price} €</span>
                      </div>
                    </div>
                    {canCancel && (
                      <button onClick={() => { if (confirm('¿Cancelar esta cita?')) cancelBooking(b.id) }} style={{ marginTop: 12, background: 'transparent', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '6px 14px', color: 'rgba(248,113,113,0.6)', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                        Cancelar cita
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info personal */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 16, height: 1, background: '#C9965A' }} /> Información personal
          </p>
          <form onSubmit={handleSubmit(d => saveProfile(d))}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Nombre completo</label>
                <input {...register('full_name')} className="input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Teléfono</label>
                <input {...register('phone')} placeholder="+34 600 000 000" className="input" />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Ciudad</label>
              <input {...register('city')} placeholder="Madrid" className="input" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>Bio</label>
              <textarea {...register('bio')} placeholder="Cuéntanos algo sobre ti..." className="input" style={{ height: 96, resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={isPending || !isDirty} className="btn-primary" style={{ padding: '10px 32px' }}>
                {isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}