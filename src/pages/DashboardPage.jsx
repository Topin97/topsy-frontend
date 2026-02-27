import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const STATUS = {
  pending:   { label: 'Pendiente',  color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  confirmed: { label: 'Confirmada', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  completed: { label: 'Completada', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  cancelled: { label: 'Cancelada',  color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  no_show:   { label: 'No asistió', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
}

function KpiCard({ label, value, delta }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 300, color: '#C9965A', lineHeight: 1 }}>{value}</p>
      {delta && <p style={{ fontSize: 12, color: '#4ade80', marginTop: 6 }}>{delta}</p>}
    </div>
  )
}

function BookingRow({ booking, onCancel }) {
  const st = STATUS[booking.status] ?? STATUS.pending
  const isPast = new Date(booking.starts_at) < new Date()
  const canCancel = ['pending', 'confirmed'].includes(booking.status) && !isPast
  const name = booking.professional_profiles?.business_name ?? booking.profiles?.full_name ?? '—'

  return (
    <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h3 style={{ fontWeight: 600, fontSize: 15 }}>{booking.services?.name}</h3>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, color: st.color, background: st.bg, fontWeight: 500 }}>
            {st.label}
          </span>
        </div>
        <p style={{ color: 'rgba(247,242,234,0.45)', fontSize: 13, marginBottom: 2 }}>{name}</p>
        <p style={{ color: 'rgba(247,242,234,0.3)', fontSize: 12 }}>
          📅 {format(new Date(booking.starts_at), "EEEE d MMM · HH:mm", { locale: es })}
          {' '}· ⏱ {booking.services?.duration_minutes} min
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#C9965A', fontStyle: 'italic' }}>
          {booking.total_price}€
        </span>
        {canCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            style={{ fontSize: 12, color: 'rgba(248,113,113,0.7)', background: 'transparent', border: '1px solid rgba(248,113,113,0.2)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, isProfessional } = useAuthStore()
  const qc = useQueryClient()

  const { data: myBookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.getMine().then((r) => r.data.data),
    enabled: !isProfessional(),
  })

  const { data: proBookings } = useQuery({
    queryKey: ['pro-bookings'],
    queryFn: () => bookingsApi.getProfessional().then((r) => r.data.data),
    enabled: isProfessional(),
  })

  const { data: stats } = useQuery({
    queryKey: ['pro-stats'],
    queryFn: () => profApi.getStats().then((r) => r.data.data),
    enabled: isProfessional(),
  })

  const { mutate: cancel } = useMutation({
    mutationFn: (id) => bookingsApi.cancel(id),
    onSuccess: () => {
      toast.success('Reserva cancelada')
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      qc.invalidateQueries({ queryKey: ['pro-bookings'] })
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al cancelar'),
  })

  const bookings = isProfessional() ? (proBookings ?? []) : (myBookings ?? [])

  return (
    <div className="container-app" style={{ padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <p className="section-tag" style={{ marginBottom: 8 }}>Panel de control</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 300 }}>
            Hola, <em style={{ color: '#C9965A' }}>{user?.full_name?.split(' ')[0]}</em>
          </h1>
        </div>
        {!isProfessional() && (
          <Link to="/search" className="btn-primary">+ Nueva cita</Link>
        )}
      </div>

      {/* KPIs */}
      {isProfessional() && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          <KpiCard label="Ingresos este mes" value={`${stats.revenue_this_month}€`} delta="↑ vs. mes anterior" />
          <KpiCard label="Citas totales"     value={stats.total_bookings} />
          <KpiCard label="Próximas citas"    value={stats.upcoming_bookings} />
          <KpiCard label="Valoración media"  value={stats.avg_rating || '—'} delta={`${stats.total_reviews} reseñas`} />
        </div>
      )}

      {/* Bookings */}
      <p className="section-tag" style={{ marginBottom: 24 }}>
        {isProfessional() ? 'Citas recibidas' : 'Mis reservas'}
      </p>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 20 }} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ padding: '80px 24px', textAlign: 'center', color: 'rgba(247,242,234,0.25)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📅</div>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontStyle: 'italic' }}>Sin citas</p>
          {!isProfessional() && (
            <Link to="/search" className="btn-primary" style={{ display: 'inline-block', marginTop: 24 }}>
              Buscar profesionales
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} onCancel={cancel} />
          ))}
        </div>
      )}
    </div>
  )
}