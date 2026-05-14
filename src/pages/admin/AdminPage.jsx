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
  getLeadsEmails:     () => api.get('/admin/leads/emails').then(r => r.data),
  getLeadsPros:       () => api.get('/admin/leads/pros').then(r => r.data),
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
  confirmed: { color: '#16a34a', bg: 'rgba(22,163,74,0.1)',   label: 'Confirmada' },
  pending:   { color: '#d97706', bg: 'rgba(217,119,6,0.1)',   label: 'Pendiente'  },
  cancelled: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  label: 'Cancelada'  },
  completed: { color: '#B8833A', bg: 'rgba(184,131,58,0.1)',  label: 'Completada' },
}

const TABS = ['stats', 'professionals', 'users', 'bookings', 'leads']
const TAB_LABEL = { stats: '📊 Stats', professionals: '💼 Profesionales', users: '👥 Usuarios', bookings: '📅 Reservas', leads: '📋 Leads' }

function CategoryModal({ prof, onConfirm, onCancel }) {
  const [selected, setSelected] = useState(prof.category)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(184,131,58,0.2)', borderRadius: 20, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 300, marginBottom: 6, color: '#1A1612' }}>Cambiar categoría</h3>
        <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.45)', marginBottom: 20, fontFamily: 'Outfit, sans-serif' }}>{prof.business_name}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.value} type="button" onClick={() => setSelected(cat.value)} style={{
              padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontSize: 12,
              border: `1.5px solid ${selected === cat.value ? '#B8833A' : 'rgba(0,0,0,0.09)'}`,
              background: selected === cat.value ? 'rgba(184,131,58,0.1)' : '#F7F5F2',
              color: selected === cat.value ? '#B8833A' : 'rgba(26,22,18,0.55)',
              fontFamily: 'Outfit, sans-serif', fontWeight: selected === cat.value ? 700 : 400,
              transition: 'all 0.15s',
            }}>{cat.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, background: 'transparent', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 10, padding: '11px', color: 'rgba(26,22,18,0.45)', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Cancelar</button>
          <button onClick={() => onConfirm(selected)} style={{ flex: 2, background: 'linear-gradient(135deg,#B8833A,#D4A055)', border: 'none', borderRadius: 10, padding: '11px', color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 14px rgba(184,131,58,0.25)' }}>Guardar cambio</button>
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

  // Queries para leads (solo si tab activo)
  // Se activan solo cuando entras al tab leads
  const { data: leadsPros } = useQuery({
    queryKey: ['admin', 'leads', 'pros'],
    queryFn: adminApi.getLeadsPros,
    enabled: false,
  })
  const { data: leadsEmails } = useQuery({
    queryKey: ['admin', 'leads', 'emails'],
    queryFn: adminApi.getLeadsEmails,
    enabled: false,
  })
  const [categoryModal, setCategoryModal] = useState(null)
  const [leadSubTab, setLeadSubTab] = useState('pros')  // 'pros' | 'emails'
  const [leadSearch, setLeadSearch] = useState('')

  if (user?.role !== 'admin') { navigate('/'); return null }

  const { data: stats }        = useQuery({ queryKey: ['admin-stats'],              queryFn: adminApi.getStats })
  const { data: profsData }    = useQuery({ queryKey: ['admin-profs', profFilter],  queryFn: () => adminApi.getProfessionals({ verified: profFilter, limit: 50 }) })
  const { data: usersData }    = useQuery({ queryKey: ['admin-users'],              queryFn: () => adminApi.getUsers({ limit: 50 }) })
  const { data: bookingsData } = useQuery({ queryKey: ['admin-bookings', bookingFilter], queryFn: () => adminApi.getBookings({ status: bookingFilter, limit: 50 }) })
  const { data: pendingData }  = useQuery({ queryKey: ['admin-pending'],            queryFn: () => adminApi.getProfessionals({ verified: 'false', limit: 100 }) })

  const pendingCount = pendingData?.data?.length ?? 0

  const { mutate: verify } = useMutation({
    mutationFn: ({ id, verified }) => adminApi.verifyProfessional(id, verified),
    onSuccess: (_, { verified }) => {
      toast.success(verified ? '✓ Negocio verificado' : 'Verificación retirada')
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
    onError: () => toast.error('Error'),
  })

  const profs    = profsData?.data ?? []
  const users    = usersData?.data ?? []
  const bookings = bookingsData?.data ?? []

  return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh', paddingBottom: 80 }}>
      <style>{`
        .admin-tab:hover { border-color: rgba(184,131,58,0.3) !important; color: #B8833A !important; }
        .filter-pill:hover { border-color: rgba(184,131,58,0.3) !important; color: #B8833A !important; }
        .admin-row:hover { border-color: rgba(184,131,58,0.18) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.06) !important; }
        .admin-row { transition: all 0.18s; }
      `}</style>

      {categoryModal && (
        <CategoryModal prof={categoryModal} onConfirm={(cat) => changeCategory({ id: categoryModal.id, category: cat })} onCancel={() => setCategoryModal(null)} />
      )}

      {/* Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '28px 0 22px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 28 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Panel de administración</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: '#1A1612' }}>
            Admin <em style={{ color: '#B8833A' }}>Topsy</em>
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className="admin-tab" style={{
              flexShrink: 0, padding: '10px 20px', borderRadius: 100, cursor: 'pointer',
              fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: 600, transition: 'all 0.2s',
              background: tab === t ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#FFFFFF',
              color: tab === t ? '#FFFFFF' : 'rgba(26,22,18,0.55)',
              border: tab === t ? 'none' : '1.5px solid rgba(0,0,0,0.1)',
              boxShadow: tab === t ? '0 4px 14px rgba(184,131,58,0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
              position: 'relative',
            }}>
              {TAB_LABEL[t]}
              {t === 'professionals' && pendingCount > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 100, background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── STATS ── */}
        {tab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'Usuarios',       value: stats?.total_users ?? '—',                                    icon: '👥' },
              { label: 'Profesionales',  value: stats?.total_professionals ?? '—',                            icon: '💼' },
              { label: 'Reservas',       value: stats?.total_bookings ?? '—',                                 icon: '📅' },
              { label: 'Ingresos totales', value: stats?.total_revenue ? `${stats.total_revenue.toFixed(2)}€` : '—', icon: '💰' },
            ].map(s => (
              <div key={s.label} style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 18, padding: '24px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '2rem', marginBottom: 12 }}>{s.icon}</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#B8833A', lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Outfit, sans-serif' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── PROFESSIONALS ── */}
        {tab === 'professionals' && (
          <div>
            {pendingCount > 0 && profFilter === 'false' && (
              <div style={{ background: 'rgba(220,38,38,0.05)', border: '1.5px solid rgba(220,38,38,0.15)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>⏳</span>
                <span style={{ fontSize: 13, color: '#dc2626', fontFamily: 'Outfit, sans-serif' }}>
                  <strong>{pendingCount}</strong> negocio{pendingCount > 1 ? 's' : ''} esperando verificación
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              {[['false', `⏳ Pendientes${pendingCount > 0 ? ` (${pendingCount})` : ''}`], ['', 'Todos'], ['true', '✓ Verificados']].map(([val, label]) => (
                <button key={val} onClick={() => setProfFilter(val)} className="filter-pill" style={{
                  padding: '7px 16px', borderRadius: 100, cursor: 'pointer', fontSize: 12,
                  fontFamily: 'Outfit, sans-serif', fontWeight: profFilter === val ? 700 : 400, transition: 'all 0.2s',
                  background: profFilter === val ? 'rgba(184,131,58,0.1)' : '#FFFFFF',
                  color: profFilter === val ? '#B8833A' : 'rgba(26,22,18,0.5)',
                  border: `1.5px solid ${profFilter === val ? 'rgba(184,131,58,0.3)' : 'rgba(0,0,0,0.1)'}`,
                }}>{label}</button>
              ))}
              <span style={{ fontSize: 13, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>{profs.length} resultados</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {profs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(26,22,18,0.3)' }}>
                  <p style={{ fontSize: 32, marginBottom: 12 }}>✅</p>
                  <p style={{ fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>No hay negocios pendientes</p>
                </div>
              )}
              {profs.map(p => (
                <div key={p.id} className="admin-row" style={{ background: '#FFFFFF', border: `1.5px solid ${!p.is_verified ? 'rgba(220,38,38,0.12)' : 'rgba(0,0,0,0.07)'}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: 'rgba(184,131,58,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(184,131,58,0.15)' }}>
                    {p.profiles?.avatar_url
                      ? <img src={p.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '1.2rem' }}>👤</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: '#1A1612', fontFamily: 'Outfit, sans-serif' }}>{p.business_name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.45)', fontFamily: 'Outfit, sans-serif' }}>{p.profiles?.full_name} · {p.city}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                        {CATEGORIES.find(c => c.value === p.category)?.label ?? p.category}
                      </span>
                      <button onClick={() => setCategoryModal(p)} style={{ fontSize: 10, color: '#B8833A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Outfit, sans-serif', textDecoration: 'underline' }}>
                        cambiar
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: p.is_verified ? 'rgba(184,131,58,0.1)' : 'rgba(220,38,38,0.08)', color: p.is_verified ? '#B8833A' : '#dc2626', border: `1.5px solid ${p.is_verified ? 'rgba(184,131,58,0.2)' : 'rgba(220,38,38,0.2)'}`, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                      {p.is_verified ? '✓ Verificado' : '⏳ Pendiente'}
                    </span>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: p.is_active ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)', color: p.is_active ? '#16a34a' : '#dc2626', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                      {p.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    <button onClick={() => verify({ id: p.id, verified: !p.is_verified })} style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${p.is_verified ? 'rgba(220,38,38,0.25)' : 'rgba(22,163,74,0.3)'}`, background: p.is_verified ? 'rgba(220,38,38,0.06)' : 'rgba(22,163,74,0.08)', color: p.is_verified ? '#dc2626' : '#16a34a', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                      {p.is_verified ? 'Quitar' : '✓ Verificar'}
                    </button>
                    <button onClick={() => toggle({ id: p.id, active: !p.is_active })} style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${p.is_active ? 'rgba(220,38,38,0.25)' : 'rgba(22,163,74,0.3)'}`, background: p.is_active ? 'rgba(220,38,38,0.06)' : 'rgba(22,163,74,0.08)', color: p.is_active ? '#dc2626' : '#16a34a', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                      {p.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div>
            <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.4)', marginBottom: 20, fontFamily: 'Outfit, sans-serif' }}>{users.length} usuarios</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {users.map(u => (
                <div key={u.id} className="admin-row" style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: 'rgba(184,131,58,0.08)', border: '1.5px solid rgba(184,131,58,0.15)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#B8833A' }}>{u.full_name?.slice(0,2).toUpperCase()}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: '#1A1612', fontFamily: 'Outfit, sans-serif' }}>{u.full_name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.4)', fontFamily: 'Outfit, sans-serif' }}>{u.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                      background: u.role === 'admin' ? 'rgba(184,131,58,0.1)' : u.role === 'professional' ? 'rgba(22,163,74,0.08)' : 'rgba(26,22,18,0.06)',
                      color: u.role === 'admin' ? '#B8833A' : u.role === 'professional' ? '#16a34a' : 'rgba(26,22,18,0.5)',
                    }}>{u.role}</span>
                    {u.city && <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>📍 {u.city}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {tab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              {[['', 'Todas'], ['confirmed', 'Confirmadas'], ['completed', 'Completadas'], ['cancelled', 'Canceladas']].map(([val, label]) => (
                <button key={val} onClick={() => setBookingFilter(val)} className="filter-pill" style={{
                  padding: '7px 16px', borderRadius: 100, cursor: 'pointer', fontSize: 12,
                  fontFamily: 'Outfit, sans-serif', fontWeight: bookingFilter === val ? 700 : 400, transition: 'all 0.2s',
                  background: bookingFilter === val ? 'rgba(184,131,58,0.1)' : '#FFFFFF',
                  color: bookingFilter === val ? '#B8833A' : 'rgba(26,22,18,0.5)',
                  border: `1.5px solid ${bookingFilter === val ? 'rgba(184,131,58,0.3)' : 'rgba(0,0,0,0.1)'}`,
                }}>{label}</button>
              ))}
              <span style={{ fontSize: 13, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>{bookings.length} reservas</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bookings.map(b => {
                const st = STATUS_COLOR[b.status] ?? STATUS_COLOR.pending
                const date = new Date(b.starts_at)
                return (
                  <div key={b.id} className="admin-row" style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: '#1A1612', fontFamily: 'Outfit, sans-serif' }}>{b.services?.name}</p>
                      <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.45)', fontFamily: 'Outfit, sans-serif' }}>{b.profiles?.full_name} → {b.professional_profiles?.business_name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', marginTop: 2, fontFamily: 'Outfit, sans-serif' }}>
                        {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} · {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#B8833A' }}>{b.total_price}€</span>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: st.bg, color: st.color, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{st.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── LEADS ── */}
        {tab === 'leads' && (
          <LeadsSection
            subTab={leadSubTab}
            setSubTab={setLeadSubTab}
            search={leadSearch}
            setSearch={setLeadSearch}
          />
        )}

      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// LeadsSection — muestra waitlist coming-soon + pros interesados
// ════════════════════════════════════════════════════════════════
function LeadsSection({ subTab, setSubTab, search, setSearch }) {
  const queryClient = useQueryClient()

  // Cargar datos al montar
  const { data: pros, isLoading: loadingPros } = useQuery({
    queryKey: ['admin', 'leads', 'pros'],
    queryFn: adminApi.getLeadsPros,
  })
  const { data: emails, isLoading: loadingEmails } = useQuery({
    queryKey: ['admin', 'leads', 'emails'],
    queryFn: adminApi.getLeadsEmails,
  })

  const prosList   = pros?.data ?? []
  const emailsList = emails?.data ?? []

  const filterPros = prosList.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return [p.full_name, p.business, p.city, p.phone, p.email, p.category, p.team_size, p.notes]
      .filter(Boolean).some(v => v.toString().toLowerCase().includes(q))
  })
  const filterEmails = emailsList.filter(e => {
    if (!search) return true
    return e.email?.toLowerCase().includes(search.toLowerCase())
  })

  // Export CSV
  const exportCSV = () => {
    const rows = subTab === 'pros' ? filterPros : filterEmails
    if (rows.length === 0) {
      toast.error('Nada que exportar')
      return
    }
    const headers = subTab === 'pros'
      ? ['Fecha', 'Nombre', 'Negocio', 'Ciudad', 'Teléfono', 'Categoría', 'Equipo', 'Email', 'Notas']
      : ['Fecha', 'Email']
    const escape = (v) => v == null ? '' : `"${String(v).replace(/"/g, '""')}"`
    const rowsCsv = rows.map(r => subTab === 'pros'
      ? [r.created_at, r.full_name, r.business, r.city, r.phone, r.category, r.team_size, r.email, r.notes].map(escape).join(',')
      : [r.created_at, r.email].map(escape).join(',')
    )
    const csv = [headers.join(','), ...rowsCsv].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `topsy-leads-${subTab}-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`${rows.length} leads exportados`)
  }

  const fmt = (iso) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  const CAT_LABEL = {
    peluqueria: '✂️ Peluquería', barberia: '💈 Barbería',
    estetica: '💆 Estética', masaje: '🌿 Masaje',
    unas: '💅 Uñas', cejas_pestanas: '👁️ Cejas/Pestañas',
    spa: '🧖 Spa', maquillaje: '💄 Maquillaje', otros: '✨ Otros',
  }

  return (
    <div>
      {/* Cabecera con contadores */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'Pros interesados', value: prosList.length, color: '#B8833A' },
            { label: 'Emails waitlist',  value: emailsList.length, color: '#7B5E2E' },
          ].map(s => (
            <div key={s.label} style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '14px 22px', minWidth: 160, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: s.color, lineHeight: 1, margin: 0, fontWeight: 700 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Outfit, sans-serif', margin: '4px 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <button onClick={exportCSV} style={{
          background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF',
          border: 'none', borderRadius: 10, padding: '11px 20px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'Outfit, sans-serif',
          boxShadow: '0 4px 14px rgba(184,131,58,0.3)',
        }}>📥 Exportar CSV</button>
      </div>

      {/* Sub-tabs Pros / Emails */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[['pros', `💼 Profesionales (${prosList.length})`], ['emails', `📧 Emails (${emailsList.length})`]].map(([val, label]) => (
          <button key={val} onClick={() => setSubTab(val)} style={{
            padding: '8px 18px', borderRadius: 100, cursor: 'pointer', fontSize: 12.5,
            fontFamily: 'Outfit, sans-serif', fontWeight: subTab === val ? 700 : 500, transition: 'all 0.2s',
            background: subTab === val ? 'rgba(184,131,58,0.12)' : '#FFFFFF',
            color: subTab === val ? '#B8833A' : 'rgba(26,22,18,0.55)',
            border: `1.5px solid ${subTab === val ? 'rgba(184,131,58,0.35)' : 'rgba(0,0,0,0.1)'}`,
          }}>{label}</button>
        ))}
      </div>

      {/* Buscador */}
      <input type="text" placeholder={subTab === 'pros' ? 'Buscar por nombre, negocio, ciudad, teléfono...' : 'Buscar por email...'}
        value={search} onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '13px 18px', borderRadius: 12,
          border: '1.5px solid rgba(0,0,0,0.1)', background: '#FFFFFF',
          fontSize: 13.5, marginBottom: 16, fontFamily: 'Outfit, sans-serif',
          color: '#1A1612', outline: 'none', boxSizing: 'border-box',
        }} />

      {/* ── Tabla PROS ── */}
      {subTab === 'pros' && (
        <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1.5px solid rgba(0,0,0,0.06)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          {loadingPros && <p style={{ padding: 30, textAlign: 'center', color: 'rgba(26,22,18,0.4)' }}>Cargando...</p>}
          {!loadingPros && filterPros.length === 0 && (
            <p style={{ padding: 40, textAlign: 'center', color: 'rgba(26,22,18,0.4)', fontFamily: 'Outfit, sans-serif' }}>
              {search ? `Ningún resultado para "${search}"` : 'Aún no hay profesionales apuntados'}
            </p>
          )}
          {!loadingPros && filterPros.map((p) => (
            <div key={p.id} style={{
              padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)',
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#1A1612', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{p.full_name}</p>
                  <span style={{ fontSize: 11, color: '#B8833A', background: 'rgba(184,131,58,0.1)', padding: '3px 8px', borderRadius: 100, fontWeight: 600 }}>
                    {CAT_LABEL[p.category] ?? p.category}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.7)', margin: '0 0 4px', fontFamily: 'Outfit, sans-serif' }}>
                  <strong>{p.business}</strong> · {p.city}{p.team_size ? ` · ${p.team_size}` : ''}
                </p>
                <p style={{ fontSize: 12.5, color: 'rgba(26,22,18,0.55)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                  📱 <a href={`tel:${p.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{p.phone}</a>
                  {p.email && <> · ✉️ <a href={`mailto:${p.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{p.email}</a></>}
                </p>
                {p.notes && (
                  <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.5)', margin: '8px 0 0', fontStyle: 'italic', fontFamily: 'Outfit, sans-serif', lineHeight: 1.5 }}>
                    "{p.notes}"
                  </p>
                )}
              </div>
              <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.35)', margin: 0, whiteSpace: 'nowrap', fontFamily: 'Outfit, sans-serif' }}>
                {fmt(p.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabla EMAILS ── */}
      {subTab === 'emails' && (
        <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1.5px solid rgba(0,0,0,0.06)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          {loadingEmails && <p style={{ padding: 30, textAlign: 'center', color: 'rgba(26,22,18,0.4)' }}>Cargando...</p>}
          {!loadingEmails && filterEmails.length === 0 && (
            <p style={{ padding: 40, textAlign: 'center', color: 'rgba(26,22,18,0.4)', fontFamily: 'Outfit, sans-serif' }}>
              {search ? `Ningún resultado para "${search}"` : 'Aún no hay emails apuntados'}
            </p>
          )}
          {!loadingEmails && filterEmails.map((e) => (
            <div key={e.id} style={{
              padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            }}>
              <a href={`mailto:${e.email}`} style={{ fontSize: 14, color: '#1A1612', textDecoration: 'none', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                {e.email}
              </a>
              <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.35)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                {fmt(e.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

