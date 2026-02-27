import { useQuery } from '@tanstack/react-query'
import { profApi, bookingsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS = {
  pending:   { label: 'Pendiente',  color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  confirmed: { label: 'Confirmada', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  completed: { label: 'Completada', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  cancelled: { label: 'Cancelada',  color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
}

function KpiCard({ label, value, delta, icon, accent }) {
  return (
    <div style={{
      background: accent ? 'linear-gradient(135deg, rgba(201,150,90,0.12), rgba(201,150,90,0.04))' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${accent ? 'rgba(201,150,90,0.25)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 20, right: 20, fontSize: '1.6rem', opacity: 0.2 }}>{icon}</div>
      <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 10 }}>{label}</p>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 300, color: accent ? '#C9965A' : '#F7F2EA', lineHeight: 1, marginBottom: 6 }}>{value}</p>
      {delta && <p style={{ fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}>↑ {delta}</p>}
    </div>
  )
}

export default function ProDashboardPage() {
  const { user } = useAuthStore()

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['pro-stats'],
    queryFn: () => profApi.getStats().then((r) => r.data.data),
  })

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['pro-bookings-today'],
    queryFn: () => bookingsApi.getProfessional({
      date: format(new Date(), 'yyyy-MM-dd'),
    }).then((r) => r.data.data),
  })

  const { data: upcoming } = useQuery({
    queryKey: ['pro-bookings-upcoming'],
    queryFn: () => bookingsApi.getProfessional({ status: 'confirmed' }).then((r) => r.data.data),
  })

  return (
    <div style={{ background: '#0A0806', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, #0D0B08 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '40px 0 32px' }}>
        <div className="container-app">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <p className="section-tag" style={{ marginBottom: 10 }}>Panel profesional</p>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300, lineHeight: 1.1 }}>
                Buenos días,<br /><em style={{ color: '#C9965A' }}>{user?.full_name?.split(' ')[0]}</em>
              </h1>
              <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 13, marginTop: 6 }}>
                {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { to: '/pro/profile',      label: '⚙️ Perfil' },
                { to: '/pro/services',     label: '✂️ Servicios' },
                { to: '/pro/availability', label: '🕐 Horarios' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} style={{
                  textDecoration: 'none', fontSize: 12, letterSpacing: '0.08em',
                  padding: '9px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(247,242,234,0.6)', transition: 'all 0.2s', fontFamily: 'Outfit, sans-serif',
                }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-app" style={{ padding: '32px 24px' }}>
        {/* KPIs */}
        {loadingStats ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 20 }} />)}
          </div>
        ) : stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
            <KpiCard accent icon="💶" label="Ingresos este mes"  value={`${stats.revenue_this_month ?? 0}€`} delta="vs. mes anterior" />
            <KpiCard icon="📅" label="Próximas citas"     value={stats.upcoming_bookings ?? 0} />
            <KpiCard icon="✅" label="Completadas"        value={stats.completed ?? 0} />
            <KpiCard icon="⭐" label="Valoración"         value={stats.avg_rating || '—'} delta={`${stats.total_reviews} reseñas`} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 20 }}>
          {/* Today */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p className="section-tag">Citas hoy</p>
              <span style={{ fontSize: 12, color: 'rgba(247,242,234,0.3)' }}>
                {format(new Date(), "d MMM", { locale: es })}
              </span>
            </div>

            {loadingBookings ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 16 }} />)}
              </div>
            ) : bookings?.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', marginBottom: 8 }}>☀️</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontStyle: 'italic', color: 'rgba(247,242,234,0.3)' }}>Sin citas hoy</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bookings?.map((b) => {
                  const st = STATUS[b.status] ?? STATUS.pending
                  return (
                    <div key={b.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'center', minWidth: 44, flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#C9965A', fontWeight: 600, lineHeight: 1 }}>
                          {format(new Date(b.starts_at), 'HH:mm')}
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(247,242,234,0.25)', marginTop: 2 }}>
                          {format(new Date(b.ends_at), 'HH:mm')}
                        </div>
                      </div>
                      <div style={{ width: 2, height: 36, background: 'rgba(201,150,90,0.25)', borderRadius: 2, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.services?.name}</p>
                        <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)' }}>{b.profiles?.full_name}</p>
                      </div>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, color: st.color, background: st.bg, flexShrink: 0 }}>
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p className="section-tag">Próximas</p>
              <span style={{ fontSize: 12, color: 'rgba(247,242,234,0.3)' }}>{upcoming?.length ?? 0} confirmadas</span>
            </div>

            {!upcoming || upcoming.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', marginBottom: 8 }}>📭</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontStyle: 'italic', color: 'rgba(247,242,234,0.3)' }}>Sin próximas citas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcoming.slice(0, 6).map((b) => (
                  <div key={b.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.services?.name}</p>
                      <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)' }}>
                        {b.profiles?.full_name} · {format(new Date(b.starts_at), "d MMM · HH:mm", { locale: es })}
                      </p>
                    </div>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#C9965A', fontStyle: 'italic', flexShrink: 0 }}>
                      {b.total_price}€
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}