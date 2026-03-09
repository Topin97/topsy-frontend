import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

const adminApi = {
  getStats:           () => api.get('/admin/stats').then(r => r.data.data),
  getUsers:           (p) => api.get('/admin/users', { params: p }).then(r => r.data),
  getProfessionals:   (p) => api.get('/admin/professionals', { params: p }).then(r => r.data),
  getBookings:        (p) => api.get('/admin/bookings', { params: p }).then(r => r.data),
  verifyProfessional: (id, verified) => api.patch(`/admin/professionals/${id}/verify`, { verified }),
  toggleProfessional: (id, active)   => api.patch(`/admin/professionals/${id}/toggle`, { active }),
  changeCategory:     (id, category) => api.patch(`/admin/professionals/${id}/category`, { category }),
}

const CATEGORIES = [
  { value: 'hair',      label: '💇 Peluquería' },
  { value: 'nails',     label: '💅 Uñas' },
  { value: 'spa',       label: '🧖 Spa' },
  { value: 'barber',    label: '🪒 Barbería' },
  { value: 'aesthetic', label: '✨ Estética' },
  { value: 'brows',     label: '👁️ Cejas' },
  { value: 'massage',   label: '💆 Masajes' },
  { value: 'dental',    label: '🦷 Dental' },
  { value: 'fitness',   label: '🏋️ Trainer' },
  { value: 'skincare',  label: '🧴 Skincare' },
  { value: 'makeup',    label: '💋 Maquillaje' },
  { value: 'yoga',      label: '🧘 Yoga' },
]

const STATUS_COLOR = {
  confirmed: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  label: 'Confirmada' },
  pending:   { color: '#facc15', bg: 'rgba(250,204,21,0.1)',  label: 'Pendiente'  },
  cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Cancelada'  },
  completed: { color: '#C9965A', bg: 'rgba(201,150,90,0.1)',  label: 'Completada' },
}

const TABS = ['stats', 'professionals', 'users', 'bookings']
const TAB_LABEL = { stats: '📊 Stats', professionals: '💼 Profesionales', users: '👥 Usuarios', bookings: '📅 Reservas' }

function CategoryModal({ prof, onConfirm, onCancel }) {
  const [selected, setSelected] = useState(prof.category)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#2A2A2E', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 20, padding: 28, maxWidth: 420, width: '100%' }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 300, marginBottom: 6 }}>Cambiar categoría</h3>
        <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.4)', marginBottom: 20 }}>{prof.business_name}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.value} type="button" onClick={() => setSelected(cat.value)} style={{
              padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontSize: 12,
              border: `1px solid ${selected === cat.value ? '#C9965A' : 'rgba(255,255,255,0.08)'}`,
              background: selected === cat.value ? 'rgba(201,150,90,0.15)' : 'rgba(255,255,255,0.02)',
              color: selected === cat.value ? '#C9965A' : 'rgba(247,242,234,0.5)',
              fontFamily: 'Outfit, sans-serif', fontWeight: selected === cat.value ? 600 : 400,
            }}>{cat.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px', color: 'rgba(247,242,234,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Cancelar</button>
          <button onClick={() => onConfirm(selected)} style={{ flex: 2, background: 'linear-gradient(135deg, #C9965A, #E8B97A)', border: 'none', borderRadius: 10, padding: '11px', color: '#0A0806', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Guardar cambio</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState('professionals')
  const [profFilter, setProfFilter] = useState('false')
  const [bookingFilter, setBookingFilter] = useState('')
  const [categoryModal, setCategoryModal] = useState(null)

  if (user?.role !== 'admin') { navigate('/'); return null }

  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.getStats })
  const { data: profsData } = useQuery({ queryKey: ['admin-profs', profFilter], queryFn: () => adminApi.getProfessionals({ verified: profFilter, limit: 50 }) })
  const { data: usersData } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.getUsers({ limit: 50 }) })
  const { data: bookingsData } = useQuery({ queryKey: ['admin-bookings', bookingFilter], queryFn: () => adminApi.getBookings({ status: bookingFilter, limit: 50 }) })
  const { data: pendingData } = useQuery({ queryKey: ['admin-pending'], queryFn: () => adminApi.getProfessionals({ verified: 'false', limit: 100 }) })

  const pendingCount = pendingData?.data?.length ?? 0

  const { mutate: verify } = useMutation({
    mutationFn: ({ id, verified }) => adminApi.verifyProfessional(id, verified),
    onSuccess: (_, { verified }) => {
      toast.success(verified ? '✓ Negocio verificado — ya visible para clientes' : 'Verificación retirada')
      qc.invalidateQueries({ queryKey: ['admin-profs'] })
      qc.invalidateQueries({ queryKey: ['admin-pending'] })
    },
    onError: () => toast.error('Error al actualizar'),
  })

  const { mutate: toggle } = useMutation({
    mutationFn: ({ id, active }) => adminApi.toggleProfessional(id, active),
    onSuccess: (_, { active }) => { toast.success(active ? 'Perfil activado' : 'Perfil desactivado'); qc.invalidateQueries({ queryKey: ['admin-profs'] }) },
    onError: () => toast.error('Error al actualizar'),
  })

  const { mutate: changeCategory } = useMutation({
    mutationFn: ({ id, category }) => adminApi.changeCategory(id, category),
    onSuccess: () => { toast.success('Categoría actualizada ✓'); qc.invalidateQueries({ queryKey: ['admin-profs'] }); setCategoryModal(null) },
    onError: () => toast.error('Error al cambiar categoría'),
  })

  const profs    = profsData?.data ?? []
  const users    = usersData?.data ?? []
  const bookings = bookingsData?.data ?? []

  return (
    <div style={{ background: '#1C1C1E', minHeight: '100vh', paddingBottom: 80 }}>
      {categoryModal && (
        <CategoryModal prof={categoryModal} onConfirm={(cat) => changeCategory({ id: categoryModal.id, category: cat })} onCancel={() => setCategoryModal(null)} />
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 20, height: 1, background: '#C9965A' }} /> Panel de administración
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, marginBottom: 28 }}>
          Admin <em style={{ color: '#C9965A' }}>Topsy</em>
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flexShrink: 0, padding: '10px 20px', borderRadius: 100, border: 'none', cursor: 'pointer',
              fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: 500, transition: 'all 0.2s',
              background: tab === t ? 'linear-gradient(135deg, #C9965A, #E8B97A)' : 'rgba(255,255,255,0.05)',
              color: tab === t ? '#0A0806' : 'rgba(247,242,234,0.6)', position: 'relative',
            }}>
              {TAB_LABEL[t]}
              {t === 'professionals' && pendingCount > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 100, background: '#f87171', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* STATS */}
        {tab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'Usuarios', value: stats?.total_users ?? '—', icon: '👥' },
              { label: 'Profesionales', value: stats?.total_professionals ?? '—', icon: '💼' },
              { label: 'Reservas', value: stats?.total_bookings ?? '—', icon: '📅' },
              { label: 'Ingresos totales', value: stats?.total_revenue ? `${stats.total_revenue.toFixed(2)}€` : '—', icon: '💰' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 20px' }}>
                <p style={{ fontSize: '2rem', marginBottom: 12 }}>{s.icon}</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#C9965A', lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* PROFESSIONALS */}
        {tab === 'professionals' && (
          <div>
            {pendingCount > 0 && profFilter === 'false' && (
              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>⏳</span>
                <span style={{ fontSize: 13, color: '#f87171' }}>
                  <strong>{pendingCount}</strong> negocio{pendingCount > 1 ? 's' : ''} esperando verificación — no visible{pendingCount > 1 ? 's' : ''} para los clientes
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                ['false', `⏳ Pendientes${pendingCount > 0 ? ` (${pendingCount})` : ''}`],
                ['', 'Todos'],
                ['true', '✓ Verificados'],
              ].map(([val, label]) => (
                <button key={val} onClick={() => setProfFilter(val)} style={{
                  padding: '7px 16px', borderRadius: 100, cursor: 'pointer', fontSize: 12,
                  fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
                  background: profFilter === val ? 'rgba(201,150,90,0.15)' : 'rgba(255,255,255,0.04)',
                  color: profFilter === val ? '#C9965A' : 'rgba(247,242,234,0.4)',
                  border: profFilter === val ? '1px solid rgba(201,150,90,0.3)' : '1px solid transparent',
                }}>{label}</button>
              ))}
              <span style={{ fontSize: 13, color: 'rgba(247,242,234,0.3)', alignSelf: 'center', marginLeft: 8 }}>{profs.length} resultados</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {profs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(247,242,234,0.3)' }}>
                  <p style={{ fontSize: 32, marginBottom: 12 }}>✅</p>
                  <p style={{ fontSize: 14 }}>No hay negocios pendientes</p>
                </div>
              )}
              {profs.map(p => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${!p.is_verified ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: 'rgba(201,150,90,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.profiles?.avatar_url
                      ? <img src={p.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '1.2rem' }}>👤</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.business_name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)' }}>{p.profiles?.full_name} · {p.city}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: 'rgba(247,242,234,0.3)' }}>
                        {CATEGORIES.find(c => c.value === p.category)?.label ?? p.category}
                      </span>
                      <button onClick={() => setCategoryModal(p)} style={{ fontSize: 10, color: 'rgba(201,150,90,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Outfit, sans-serif', textDecoration: 'underline' }}>
                        cambiar
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: p.is_verified ? 'rgba(201,150,90,0.1)' : 'rgba(248,113,113,0.1)', color: p.is_verified ? '#C9965A' : '#f87171', border: `1px solid ${p.is_verified ? 'rgba(201,150,90,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                      {p.is_verified ? '✓ Verificado' : '⏳ Pendiente'}
                    </span>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: p.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: p.is_active ? '#4ade80' : '#f87171' }}>
                      {p.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    <button onClick={() => verify({ id: p.id, verified: !p.is_verified })} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${p.is_verified ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)'}`, background: p.is_verified ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)', color: p.is_verified ? '#f87171' : '#4ade80', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                      {p.is_verified ? 'Quitar' : '✓ Verificar'}
                    </button>
                    <button onClick={() => toggle({ id: p.id, active: !p.is_active })} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${p.is_active ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)'}`, background: p.is_active ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)', color: p.is_active ? '#f87171' : '#4ade80', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                      {p.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.3)', marginBottom: 20 }}>{users.length} usuarios</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {users.map(u => (
                <div key={u.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: 'rgba(201,150,90,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#C9965A' }}>{u.full_name?.slice(0,2).toUpperCase()}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{u.full_name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.35)' }}>{u.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: u.role === 'admin' ? 'rgba(201,150,90,0.15)' : u.role === 'professional' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', color: u.role === 'admin' ? '#C9965A' : u.role === 'professional' ? '#4ade80' : 'rgba(247,242,234,0.4)' }}>{u.role}</span>
                    {u.city && <span style={{ fontSize: 11, color: 'rgba(247,242,234,0.3)' }}>📍 {u.city}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {tab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {[['', 'Todas'], ['confirmed', 'Confirmadas'], ['completed', 'Completadas'], ['cancelled', 'Canceladas']].map(([val, label]) => (
                <button key={val} onClick={() => setBookingFilter(val)} style={{
                  padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 12,
                  fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
                  background: bookingFilter === val ? 'rgba(201,150,90,0.15)' : 'rgba(255,255,255,0.04)',
                  color: bookingFilter === val ? '#C9965A' : 'rgba(247,242,234,0.4)',
                  border: bookingFilter === val ? '1px solid rgba(201,150,90,0.3)' : '1px solid transparent',
                }}>{label}</button>
              ))}
              <span style={{ fontSize: 13, color: 'rgba(247,242,234,0.3)', alignSelf: 'center', marginLeft: 8 }}>{bookings.length} reservas</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bookings.map(b => {
                const st = STATUS_COLOR[b.status] ?? STATUS_COLOR.pending
                const date = new Date(b.starts_at)
                return (
                  <div key={b.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{b.services?.name}</p>
                      <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)' }}>{b.profiles?.full_name} → {b.professional_profiles?.business_name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.25)', marginTop: 2 }}>
                        {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} · {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#C9965A' }}>{b.total_price}€</span>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}