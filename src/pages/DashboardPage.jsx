import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const STATUS_LABELS = {
  pending:   { label: 'Pendiente',  color: 'text-yellow-400 bg-yellow-400/10' },
  confirmed: { label: 'Confirmada', color: 'text-green-400 bg-green-400/10' },
  completed: { label: 'Completada', color: 'text-blue-400 bg-blue-400/10' },
  cancelled: { label: 'Cancelada',  color: 'text-red-400 bg-red-400/10' },
  no_show:   { label: 'No asistió', color: 'text-gray-400 bg-gray-400/10' },
}

function KpiCard({ label, value, delta }) {
  return (
    <div className="card p-6">
      <p className="text-xs uppercase tracking-widest text-cream/40 mb-2">{label}</p>
      <p className="font-display text-4xl font-light text-gold">{value}</p>
      {delta && <p className="text-green-400 text-xs mt-1">{delta}</p>}
    </div>
  )
}

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 34, padding: 0, lineHeight: 1,
            color: star <= (hover || value) ? '#C9965A' : 'rgba(247,242,234,0.12)',
            transition: 'color 0.12s, transform 0.1s',
            transform: star <= (hover || value) ? 'scale(1.18)' : 'scale(1)',
          }}
        >★</button>
      ))}
    </div>
  )
}

function ReviewModal({ booking, onClose, onSubmit, isLoading }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const proName = booking.professional_profiles?.business_name ?? '—'
  const LABELS = ['', '😕 Malo', '😐 Regular', '😊 Bien', '😄 Muy bien', '🤩 Excelente']

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:200,
        background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)',
        display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:'#1C1C1E', border:'1px solid rgba(201,150,90,0.2)',
          borderRadius:20, padding:32, width:'100%', maxWidth:420,
        }}
      >
        <p style={{ fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(201,150,90,0.6)', marginBottom:8 }}>
          Valorar visita
        </p>
        <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.6rem', fontWeight:400, color:'#F7F2EA', margin:'0 0 4px' }}>
          {proName}
        </h3>
        <p style={{ fontSize:13, color:'rgba(247,242,234,0.35)', marginBottom:24 }}>
          {booking.services?.name} · {format(new Date(booking.starts_at), "d MMM yyyy", { locale: es })}
        </p>

        <div style={{ marginBottom:20 }}>
          <StarInput value={rating} onChange={setRating} />
          {rating > 0 && (
            <p style={{ fontSize:12, color:'#C9965A', marginTop:8 }}>{LABELS[rating]}</p>
          )}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos tu experiencia... (opcional)"
          maxLength={400}
          rows={3}
          style={{
            width:'100%', boxSizing:'border-box',
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:12, padding:'12px 14px', color:'#F7F2EA',
            fontSize:14, fontFamily:'Outfit, sans-serif', resize:'vertical',
            outline:'none', marginBottom:20,
          }}
        />

        <div style={{ display:'flex', gap:10 }}>
          <button
            onClick={onClose}
            style={{
              flex:1, background:'transparent', border:'1px solid rgba(247,242,234,0.1)',
              borderRadius:10, padding:'12px 0', color:'rgba(247,242,234,0.4)',
              fontSize:14, fontFamily:'Outfit, sans-serif', cursor:'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (rating === 0) { toast.error('Selecciona una puntuación'); return }
              onSubmit({ rating, comment })
            }}
            disabled={isLoading}
            style={{
              flex:2,
              background: rating > 0 ? 'linear-gradient(135deg,#C9965A,#E8B97A)' : 'rgba(201,150,90,0.15)',
              border:'none', borderRadius:10, padding:'12px 0',
              color: rating > 0 ? '#0A0806' : 'rgba(201,150,90,0.3)',
              fontSize:14, fontWeight:700, fontFamily:'Outfit, sans-serif',
              cursor: rating > 0 ? 'pointer' : 'not-allowed', transition:'all 0.2s',
            }}
          >
            {isLoading ? 'Enviando...' : 'Enviar valoración ★'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BookingRow({ booking, onCancel, onReview }) {
  const st = STATUS_LABELS[booking.status] ?? STATUS_LABELS.pending
  const isPast = new Date(booking.starts_at) < new Date()
  const canCancel = ['pending', 'confirmed'].includes(booking.status) && !isPast
  const canReview = booking.status === 'completed' && !(booking.reviews?.length > 0)
  const hasReview = booking.reviews?.length > 0
  const proName = booking.professional_profiles?.business_name ?? booking.profiles?.full_name ?? '—'

  return (
    <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-semibold">{booking.services?.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
          {hasReview && (
            <span style={{ fontSize:11, color:'#C9965A', background:'rgba(201,150,90,0.1)', padding:'2px 8px', borderRadius:100, whiteSpace:'nowrap' }}>
              {'★'.repeat(booking.reviews[0].rating)} Valorada
            </span>
          )}
        </div>
        <p className="text-cream/50 text-sm">{proName}</p>
        <p className="text-cream/40 text-xs mt-1">
          📅 {format(new Date(booking.starts_at), "EEEE d MMM · HH:mm", { locale: es })}
          {' '}· ⏱ {booking.services?.duration_minutes} min
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap justify-end">
        <span className="font-display text-xl text-gold italic">{booking.total_price}€</span>
        {canReview && (
          <button
            onClick={() => onReview(booking)}
            style={{
              fontSize:12, background:'rgba(201,150,90,0.08)',
              border:'1px solid rgba(201,150,90,0.25)', borderRadius:8,
              padding:'6px 14px', color:'#C9965A', cursor:'pointer',
              fontFamily:'Outfit, sans-serif', transition:'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background='rgba(201,150,90,0.18)'; e.currentTarget.style.borderColor='rgba(201,150,90,0.55)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background='rgba(201,150,90,0.08)'; e.currentTarget.style.borderColor='rgba(201,150,90,0.25)' }}
          >
            ★ Valorar
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="text-xs text-red-400/70 hover:text-red-400 transition-colors border border-red-400/20 hover:border-red-400/50 px-3 py-1.5 rounded-lg"
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
  const [reviewBooking, setReviewBooking] = useState(null)

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

  const { mutate: submitReview, isPending: reviewLoading } = useMutation({
    mutationFn: ({ id, rating, comment }) => bookingsApi.review(id, { rating, comment }),
    onSuccess: () => {
      toast.success('¡Gracias por tu valoración! ★')
      setReviewBooking(null)
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al enviar valoración'),
  })

  const bookings = isProfessional() ? (proBookings ?? []) : (myBookings ?? [])

  return (
    <>
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={({ rating, comment }) => submitReview({ id: reviewBooking.id, rating, comment })}
          isLoading={reviewLoading}
        />
      )}

      <div className="container-app py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="section-tag mb-2">Panel de control</p>
            <h1 className="font-display text-4xl font-light">
              Hola, <em className="text-gold italic">{user?.full_name?.split(' ')[0]}</em>
            </h1>
          </div>
          {!isProfessional() && (
            <Link to="/search" className="btn-primary">+ Nueva cita</Link>
          )}
        </div>

        {isProfessional() && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <KpiCard label="Ingresos este mes" value={`${stats.revenue_this_month}€`} delta="↑ vs. mes anterior" />
            <KpiCard label="Citas totales"     value={stats.total_bookings} />
            <KpiCard label="Próximas citas"    value={stats.upcoming_bookings} />
            <KpiCard label="Valoración media"  value={stats.avg_rating || '—'} delta={`${stats.total_reviews} reseñas`} />
          </div>
        )}

        <div>
          <h2 className="section-tag mb-6">
            {isProfessional() ? 'Citas recibidas' : 'Mis reservas'}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 skeleton rounded-2xl" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="card py-20 text-center text-cream/30">
              <p className="text-5xl mb-4">📅</p>
              <p className="font-display text-2xl italic">Sin citas</p>
              {!isProfessional() && (
                <Link to="/search" className="btn-primary inline-block mt-6">Buscar profesionales</Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <BookingRow key={b.id} booking={b} onCancel={cancel} onReview={setReviewBooking} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}