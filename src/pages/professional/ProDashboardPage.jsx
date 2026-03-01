import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profApi, bookingsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Link, useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../services/api'

const STATUS = {
  pending:   { label: 'Pendiente',  color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  confirmed: { label: 'Confirmada', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  completed: { label: 'Completada', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  cancelled: { label: 'Cancelada',  color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
}

const BOTTOM_NAV = [
  { to: '/pro/dashboard',    icon: '📊', label: 'Dashboard' },
  { to: '/pro/services',     icon: '✂️', label: 'Servicios' },
  { to: '/pro/availability', icon: '🕐', label: 'Horarios' },
  { to: '/pro/profile',      icon: '⚙️', label: 'Perfil' },
]

export default function ProDashboardPage() {
  const { user } = useAuthStore()
  const location = useLocation()
  const queryClient = useQueryClient()

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['pro-stats'],
    queryFn: () => profApi.getStats().then(r => r.data.data),
  })

  const { data: bookingsToday, isLoading: loadingToday } = useQuery({
    queryKey: ['pro-bookings-today'],
    queryFn: () => bookingsApi.getProfessional({ date: format(new Date(), 'yyyy-MM-dd') }).then(r => r.data.data),
  })

  const { data: upcoming } = useQuery({
    queryKey: ['pro-bookings-upcoming'],
    queryFn: () => bookingsApi.getProfessional({ status: 'confirmed' }).then(r => r.data.data),
  })

  const { mutate: cancelBooking } = useMutation({
    mutationFn: (id) => bookingsApi.cancel(id),
    onSuccess: () => {
      toast.success('Cita cancelada')
      queryClient.invalidateQueries({ queryKey: ['pro-bookings-today'] })
      queryClient.invalidateQueries({ queryKey: ['pro-bookings-upcoming'] })
      queryClient.invalidateQueries({ queryKey: ['pro-stats'] })
    },
    onError: () => toast.error('Error al cancelar'),
  })

  const { mutate: completeBooking } = useMutation({
    mutationFn: (id) => api.patch(`/bookings/${id}/complete`),
    onSuccess: () => {
      toast.success('Cita marcada como completada ✓')
      queryClient.invalidateQueries({ queryKey: ['pro-bookings-today'] })
      queryClient.invalidateQueries({ queryKey: ['pro-stats'] })
    },
    onError: () => toast.error('Error al completar'),
  })

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  // Mini bar chart data from stats
  const weekData = stats?.bookings_by_day
    ? Object.entries(stats.bookings_by_day).slice(-7).map(([date, count]) => ({
        day: format(new Date(date), 'EEE', { locale: es }),
        count,
      }))
    : []
  const maxCount = Math.max(...weekData.map(d => d.count), 1)

  return (
    <div style={{ background: '#0A0806', minHeight: '100vh', paddingBottom: 90 }}>
      <style>{`
        .nav-btn:hover { background: rgba(201,150,90,0.1) !important; border-color: rgba(201,150,90,0.3) !important; color: #C9965A !important; }
        .booking-card:hover { border-color: rgba(201,150,90,0.15) !important; }
        .booking-card { transition: border-color 0.2s; }
        .kpi-card { transition: transform 0.2s, box-shadow 0.2s; }
        .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.3) !important; }
        .complete-btn:hover { background: rgba(96,165,250,0.15) !important; border-color: rgba(96,165,250,0.3) !important; }
        .cancel-btn:hover { background: rgba(248,113,113,0.15) !important; }
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .main-grid { grid-template-columns: 1fr !important; }
          .quick-nav { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, #0F0D0A 0%, #0A0806 100%)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '32px 0 24px' }}>
        <div className="container-app">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 20, height: 1, background: '#C9965A' }} /> Panel profesional
              </p>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 300, lineHeight: 1.1 }}>
                {greeting()},<br /><em style={{ color: '#C9965A' }}>{user?.full_name?.split(' ')[0]}</em>
              </h1>
              <p style={{ color: 'rgba(247,242,234,0.3)', fontSize: 12, marginTop: 6 }}>
                {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
            <div className="quick-nav" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { to: '/pro/profile',      icon: '⚙️', label: 'Perfil' },
                { to: '/pro/services',     icon: '✂️', label: 'Servicios' },
                { to: '/pro/availability', icon: '🕐', label: 'Horarios' },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to} className="nav-btn" style={{
                  textDecoration: 'none', fontSize: 12, padding: '9px 16px', borderRadius: 10,
                  display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(247,242,234,0.55)', fontFamily: 'Outfit, sans-serif',
                }}>{icon} {label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-app" style={{ padding: '24px 16px' }}>

        {/* KPIs */}
        {loadingStats ? (
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 18 }} />)}
          </div>
        ) : stats && (
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Ingresos mes',   value: `${stats.revenue_this_month ?? 0}€`, icon: '💶', accent: true, delta: 'este mes' },
              { label: 'Próximas citas', value: stats.upcoming_bookings ?? 0,        icon: '📅', delta: 'confirmadas' },
              { label: 'Completadas',    value: stats.completed ?? 0,                icon: '✅', delta: 'total' },
              { label: 'Valoración',     value: stats.avg_rating || '—',             icon: '⭐', delta: `${stats.total_reviews ?? 0} reseñas` },
            ].map((kpi, i) => (
              <div key={i} className="kpi-card" style={{
                background: kpi.accent ? 'linear-gradient(135deg, rgba(201,150,90,0.1), rgba(201,150,90,0.03))' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${kpi.accent ? 'rgba(201,150,90,0.2)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 18, padding: '18px 16px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 14, right: 14, fontSize: '1.4rem', opacity: 0.12 }}>{kpi.icon}</div>
                <p style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.3)', marginBottom: 8 }}>{kpi.label}</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 300, color: kpi.accent ? '#C9965A' : '#F7F2EA', lineHeight: 1, marginBottom: 4 }}>{kpi.value}</p>
                <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.25)' }}>{kpi.delta}</p>
              </div>
            ))}
          </div>
        )}

        {/* Mini chart */}
        {weekData.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, padding: '20px 20px 16px', marginBottom: 24 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 16, height: 1, background: '#C9965A' }} /> Citas últimos 7 días
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 60 }}>
              {weekData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', background: d.count > 0 ? 'linear-gradient(180deg, #C9965A, rgba(201,150,90,0.3))' : 'rgba(255,255,255,0.04)', borderRadius: '4px 4px 0 0', height: `${Math.max((d.count / maxCount) * 48, d.count > 0 ? 8 : 4)}px`, transition: 'height 0.3s' }} />
                  <span style={{ fontSize: 9, color: 'rgba(247,242,234,0.25)', textTransform: 'capitalize' }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Citas hoy */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.7)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 16, height: 1, background: '#C9965A' }} /> Citas hoy
              </p>
              <span style={{ fontSize: 11, color: 'rgba(247,242,234,0.25)' }}>{format(new Date(), "d MMM", { locale: es })}</span>
            </div>

            {loadingToday ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
              </div>
            ) : !bookingsToday?.length ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '36px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', marginBottom: 8 }}>☀️</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(247,242,234,0.25)' }}>Sin citas hoy</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bookingsToday.map(b => {
                  const st = STATUS[b.status] ?? STATUS.pending
                  const isPast = new Date(b.ends_at) < new Date()
                  return (
                    <div key={b.id} className="booking-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Avatar cliente */}
                        <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'rgba(201,150,90,0.1)', border: '1px solid rgba(201,150,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {b.profiles?.avatar_url
                            ? <img src={b.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#C9965A' }}>{b.profiles?.full_name?.[0]?.toUpperCase()}</span>
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.services?.name}</p>
                          <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.35)' }}>
                            {b.profiles?.full_name} · {format(new Date(b.starts_at), 'HH:mm')}–{format(new Date(b.ends_at), 'HH:mm')}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 100, color: st.color, background: st.bg }}>{st.label}</span>
                          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#C9965A' }}>{b.total_price}€</span>
                        </div>
                      </div>
                      {b.status === 'confirmed' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          {isPast && (
                            <button className="complete-btn" onClick={() => completeBooking(b.id)} style={{ flex: 1, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 8, padding: '7px', fontSize: 12, color: '#60a5fa', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}>
                              ✓ Completar
                            </button>
                          )}
                          <button className="cancel-btn" onClick={() => { if (confirm('¿Cancelar esta cita?')) cancelBooking(b.id) }} style={{ flex: 1, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '7px', fontSize: 12, color: '#f87171', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}>
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Próximas */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.7)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 16, height: 1, background: '#C9965A' }} /> Próximas
              </p>
              <span style={{ fontSize: 11, color: 'rgba(247,242,234,0.25)' }}>{upcoming?.length ?? 0} confirmadas</span>
            </div>

            {!upcoming?.length ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '36px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', marginBottom: 8 }}>📭</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(247,242,234,0.25)' }}>Sin próximas citas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcoming.slice(0, 8).map(b => (
                  <div key={b.id} className="booking-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Avatar */}
                    <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: 'rgba(201,150,90,0.1)', border: '1px solid rgba(201,150,90,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {b.profiles?.avatar_url
                        ? <img src={b.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.85rem', color: '#C9965A' }}>{b.profiles?.full_name?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.services?.name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.35)' }}>
                        {b.profiles?.full_name} · {format(new Date(b.starts_at), "d MMM · HH:mm", { locale: es })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#C9965A' }}>{b.total_price}€</span>
                      <button className="cancel-btn" onClick={() => { if (confirm('¿Cancelar esta cita?')) cancelBooking(b.id) }} style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#f87171', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(8,6,4,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 0 16px', zIndex: 50, display: 'flex', justifyContent: 'space-around' }}>
        {BOTTOM_NAV.map(({ to, icon, label }) => {
          const active = location.pathname === to
          return (
            <Link key={to} to={to} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 16px', position: 'relative' }}>
              {active && <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, background: '#C9965A', borderRadius: 2 }} />}
              <span style={{ fontSize: '1.3rem' }}>{icon}</span>
              <span style={{ fontSize: 10, color: active ? '#C9965A' : 'rgba(247,242,234,0.3)', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.05em', transition: 'color 0.2s' }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}