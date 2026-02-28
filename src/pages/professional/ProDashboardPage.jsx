import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profApi, bookingsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const STATUS = {
  pending:   { label: 'Pendiente',  color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  confirmed: { label: 'Confirmada', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  completed: { label: 'Completada', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  cancelled: { label: 'Cancelada',  color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
}

export default function ProDashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
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
    mutationFn: (id) => bookingsApi.cancel(id, { reason: 'Cancelado por el profesional' }),
    onSuccess: () => {
      toast.success('Cita cancelada')
      queryClient.invalidateQueries(['pro-bookings-today'])
      queryClient.invalidateQueries(['pro-bookings-upcoming'])
      queryClient.invalidateQueries(['pro-stats'])
    },
    onError: () => toast.error('Error al cancelar'),
  })

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <div style={{ background: '#0A0806', minHeight: '100vh', paddingBottom: 80 }}>
      <style>{`
        .nav-btn:hover { background: rgba(201,150,90,0.1) !important; border-color: rgba(201,150,90,0.3) !important; }
        .booking-card:hover { border-color: rgba(201,150,90,0.15) !important; }
        .booking-card { transition: border-color 0.2s; }
        .kpi-card { transition: transform 0.2s; }
        .kpi-card:hover { transform: translateY(-2px); }
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .main-grid { grid-template-columns: 1fr !important; }
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

            {/* Quick nav - desktop */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { to: '/pro/profile',      icon: '⚙️', label: 'Perfil' },
                { to: '/pro/services',     icon: '✂️', label: 'Servicios' },
                { to: '/pro/availability', icon: '🕐', label: 'Horarios' },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to} className="nav-btn" style={{
                  textDecoration: 'none', fontSize: 12, letterSpacing: '0.06em',
                  padding: '9px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(247,242,234,0.55)', fontFamily: 'Outfit, sans-serif',
                }}>
                  {icon} {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-app" style={{ padding: '24px 16px' }}>

        {/* KPIs */}
        {loadingStats ? (
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 18 }} />)}
          </div>
        ) : stats && (
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Ingresos mes',    value: `${stats.revenue_this_month ?? 0}€`, icon: '💶', accent: true, delta: 'este mes' },
              { label: 'Próximas citas',  value: stats.upcoming_bookings ?? 0,        icon: '📅', delta: 'confirmadas' },
              { label: 'Completadas',     value: stats.completed ?? 0,                icon: '✅', delta: 'total' },
              { label: 'Valoración',      value: stats.avg_rating || '—',             icon: '⭐', delta: `${stats.total_reviews} reseñas` },
            ].map((kpi, i) => (
              <div key={i} className="kpi-card" style={{
                background: kpi.accent ? 'linear-gradient(135deg, rgba(201,150,90,0.1), rgba(201,150,90,0.03))' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${kpi.accent ? 'rgba(201,150,90,0.2)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 18, padding: '18px 16px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 14, right: 14, fontSize: '1.3rem', opacity: 0.15 }}>{kpi.icon}</div>
                <p style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.3)', marginBottom: 8 }}>{kpi.label}</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 300, color: kpi.accent ? '#C9965A' : '#F7F2EA', lineHeight: 1, marginBottom: 4 }}>{kpi.value}</p>
                <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.25)' }}>{kpi.delta}</p>
              </div>
            ))}
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
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />)}
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
                  return (
                    <div key={b.id} className="booking-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'center', minWidth: 40, flexShrink: 0 }}>
                          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#C9965A', lineHeight: 1 }}>{format(new Date(b.starts_at), 'HH:mm')}</div>
                          <div style={{ fontSize: 9, color: 'rgba(247,242,234,0.2)', marginTop: 1 }}>{format(new Date(b.ends_at), 'HH:mm')}</div>
                        </div>
                        <div style={{ width: 2, height: 30, background: 'rgba(201,150,90,0.2)', borderRadius: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.services?.name}</p>
                          <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.35)' }}>{b.profiles?.full_name}</p>
                        </div>
                        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 100, color: st.color, background: st.bg, flexShrink: 0 }}>{st.label}</span>
                      </div>
                      {b.status === 'confirmed' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          <button onClick={() => cancelBooking(b.id)} style={{ flex: 1, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '7px', fontSize: 12, color: '#f87171', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
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
                {upcoming.slice(0, 7).map(b => (
                  <div key={b.id} className="booking-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.services?.name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.35)' }}>
                        {b.profiles?.full_name} · {format(new Date(b.starts_at), "d MMM · HH:mm", { locale: es })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#C9965A', fontStyle: 'italic' }}>{b.total_price}€</span>
                      <button onClick={() => cancelBooking(b.id)} style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#f87171', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
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
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10,8,6,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 0 14px', zIndex: 50, display: 'flex', justifyContent: 'space-around' }}>
        {[
          { to: '/dashboard',        icon: '🏠', label: 'Inicio' },
          { to: '/pro/services',     icon: '✂️', label: 'Servicios' },
          { to: '/pro/availability', icon: '🕐', label: 'Horarios' },
          { to: '/pro/profile',      icon: '⚙️', label: 'Perfil' },
        ].map(({ to, icon, label }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 16px' }}>
            <span style={{ fontSize: '1.3rem' }}>{icon}</span>
            <span style={{ fontSize: 10, color: 'rgba(247,242,234,0.35)', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.05em' }}>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}