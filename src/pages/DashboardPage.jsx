import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const STATUS = {
  pending:   { label: 'Pendiente',  bg: 'rgba(217,119,6,0.1)',  color: '#d97706' },
  confirmed: { label: 'Confirmada', bg: 'rgba(22,163,74,0.1)',  color: '#16a34a' },
  completed: { label: 'Completada', bg: 'rgba(37,99,235,0.1)',  color: '#2563eb' },
  cancelled: { label: 'Cancelada',  bg: 'rgba(220,38,38,0.08)', color: '#dc2626' },
  no_show:   { label: 'No asistió', bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
}

const TABS = ['Próximas', 'Pasadas', 'Canceladas']

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 36, padding: 0, lineHeight: 1,
            color: star <= (hover || value) ? '#B8833A' : 'rgba(26,22,18,0.15)',
            transition: 'color 0.12s, transform 0.1s',
            transform: star <= (hover || value) ? 'scale(1.15)' : 'scale(1)',
          }}
        >★</button>
      ))}
    </div>
  )
}

function ReviewModal({ booking, onClose, onSubmit, isLoading }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const LABELS = ['', '😕 Malo', '😐 Regular', '😊 Bien', '😄 Muy bien', '🤩 Excelente']

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', border: '1px solid rgba(201,150,90,0.2)', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 440 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.06)', margin: '0 auto 24px' }} />
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.5)', marginBottom: 4 }}>Valorar visita</p>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 400, color: '#1A1612', margin: '0 0 4px' }}>
          {booking.professional_profiles?.business_name}
        </h3>
        <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.3)', marginBottom: 24 }}>
          {booking.services?.name} · {format(new Date(booking.starts_at), "d MMM yyyy", { locale: es })}
        </p>

        <div style={{ marginBottom: 20 }}>
          <StarInput value={rating} onChange={setRating} />
          {rating > 0 && <p style={{ fontSize: 13, color: '#B8833A', marginTop: 8 }}>{LABELS[rating]}</p>}
        </div>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Cuéntanos tu experiencia... (opcional)"
          maxLength={400} rows={3}
          style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 12, padding: '12px 14px', color: '#1A1612', fontSize: 14, fontFamily: 'Outfit, sans-serif', resize: 'none', outline: 'none', marginBottom: 20 }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 12, padding: '13px 0', color: 'rgba(26,22,18,0.4)', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button
            onClick={() => { if (!rating) { toast.error('Selecciona una puntuación'); return }; onSubmit({ rating, comment }) }}
            disabled={isLoading}
            style={{ flex: 2, background: rating > 0 ? 'linear-gradient(135deg,#B8833A,#D4A055)' : 'rgba(201,150,90,0.1)', border: 'none', borderRadius: 12, padding: '13px 0', color: rating > 0 ? '#F7F5F2' : 'rgba(201,150,90,0.3)', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: rating > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
          >
            {isLoading ? 'Enviando...' : '★ Enviar valoración'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BookingCard({ booking, onCancel, onReview }) {
  const st = STATUS[booking.status] ?? STATUS.pending
  const isPast = new Date(booking.starts_at) < new Date()
  const canCancel = ['pending', 'confirmed'].includes(booking.status) && !isPast
  const canReview = booking.status === 'completed' && !(booking.reviews?.length > 0)
  const hasReview = booking.reviews?.length > 0
  const proName = booking.professional_profiles?.business_name ?? '—'
  const coverUrl = booking.professional_profiles?.cover_image_url

  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 16, overflow: 'hidden', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      {/* Color strip */}
      <div style={{ width: 4, flexShrink: 0, background: st.color, opacity: 0.6 }} />

      {/* Cover thumb */}
      <div style={{ width: 80, flexShrink: 0, background: 'rgba(184,131,58,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, position: 'relative', overflow: 'hidden' }}>
        {coverUrl
          ? <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : '✂️'
        }
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: '#1A1612', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {booking.services?.name}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.4)', margin: '2px 0' }}>{proName}</p>
          </div>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: st.bg, color: st.color, whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'Outfit, sans-serif' }}>
            {st.label}
          </span>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.3)', margin: '0 0 8px' }}>
          📅 {format(new Date(booking.starts_at), "EEEE d MMM · HH:mm", { locale: es })}
          <span style={{ marginLeft: 6, color: 'rgba(26,22,18,0.3)' }}>· {booking.services?.duration_minutes} min</span>
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#B8833A', fontStyle: 'italic' }}>{booking.total_price}€</span>

          {hasReview && (
            <span style={{ fontSize: 11, color: '#B8833A', background: 'rgba(201,150,90,0.1)', padding: '2px 8px', borderRadius: 100 }}>
              {'★'.repeat(booking.reviews[0].rating)} Valorada
            </span>
          )}
          {canReview && (
            <button onClick={() => onReview(booking)} style={{ fontSize: 12, background: 'rgba(184,131,58,0.07)', border: '1px solid rgba(184,131,58,0.18)', borderRadius: 8, padding: '4px 12px', color: '#B8833A', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
              ★ Valorar
            </button>
          )}
          {canCancel && (
            <button onClick={() => onCancel(booking.id)} style={{ fontSize: 12, background: 'transparent', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '4px 12px', color: '#dc2626', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, sub }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>{label}</span>
      </div>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: '#B8833A', margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.35)', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { user, isProfessional } = useAuthStore()
  const qc = useQueryClient()
  const [reviewBooking, setReviewBooking] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  const { data: myBookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.getMine().then(r => r.data.data),
    enabled: !isProfessional(),
  })

  const { data: proBookings } = useQuery({
    queryKey: ['pro-bookings'],
    queryFn: () => bookingsApi.getProfessional().then(r => r.data.data),
    enabled: isProfessional(),
  })

  const { data: stats } = useQuery({
    queryKey: ['pro-stats'],
    queryFn: () => profApi.getStats().then(r => r.data.data),
    enabled: isProfessional(),
  })

  const { mutate: cancel } = useMutation({
    mutationFn: id => bookingsApi.cancel(id),
    onSuccess: () => {
      toast.success('Reserva cancelada')
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      qc.invalidateQueries({ queryKey: ['pro-bookings'] })
    },
    onError: err => toast.error(err.response?.data?.error ?? 'Error al cancelar'),
  })

  const { mutate: submitReview, isPending: reviewLoading } = useMutation({
    mutationFn: ({ id, rating, comment }) => bookingsApi.review(id, { rating, comment }),
    onSuccess: () => {
      toast.success('¡Gracias por tu valoración! ★')
      setReviewBooking(null)
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
    },
    onError: err => toast.error(err.response?.data?.error ?? 'Error'),
  })

  const allBookings = isProfessional() ? (proBookings ?? []) : (myBookings ?? [])
  const now = new Date()

  const tabs = {
    0: allBookings.filter(b => ['pending','confirmed'].includes(b.status) && new Date(b.starts_at) >= now),
    1: allBookings.filter(b => b.status === 'completed' || (new Date(b.starts_at) < now && !['cancelled','no_show'].includes(b.status))),
    2: allBookings.filter(b => ['cancelled','no_show'].includes(b.status)),
  }

  const displayBookings = tabs[activeTab] ?? []

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

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px 100px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.3)', margin: '0 0 4px', fontFamily: 'Outfit, sans-serif' }}>
              {isProfessional() ? 'Panel profesional' : 'Mis reservas'}
            </p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 300, margin: 0, color: '#1A1612' }}>
              Hola, <em style={{ color: '#B8833A' }}>{user?.full_name?.split(' ')[0]}</em>
            </h1>
          </div>
          {!isProfessional() && (
            <Link to="/search" style={{ textDecoration: 'none', background: 'linear-gradient(135deg,#B8833A,#D4A055)', borderRadius: 12, padding: '10px 18px', color: '#FFFFFF', fontWeight: 700, fontSize: 13, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
              + Nueva cita
            </Link>
          )}
        </div>

        {/* KPIs pro */}
        {isProfessional() && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 24 }}>
            <KpiCard icon="💶" label="Este mes" value={`${stats.revenue_this_month}€`} />
            <KpiCard icon="📅" label="Próximas" value={stats.upcoming_bookings} />
            <KpiCard icon="✅" label="Total citas" value={stats.total_bookings} />
            <KpiCard icon="⭐" label="Valoración" value={stats.avg_rating || '—'} sub={`${stats.total_reviews} reseñas`} />
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: '#EFEDE9', borderRadius: 12, padding: 4 }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif', fontSize: 13, transition: 'all 0.2s',
                background: activeTab === i ? 'rgba(201,150,90,0.15)' : 'transparent',
                color: activeTab === i ? '#B8833A' : 'rgba(247,242,234,0.4)',
                fontWeight: activeTab === i ? 600 : 400,
              }}
            >
              {tab}
              {tabs[i]?.length > 0 && (
                <span style={{ marginLeft: 5, fontSize: 10, background: activeTab === i ? '#B8833A' : 'rgba(26,22,18,0.12)', color: activeTab === i ? '#FFFFFF' : 'rgba(26,22,18,0.4)', borderRadius: 100, padding: '1px 6px' }}>
                  {tabs[i].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
          </div>
        ) : displayBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(26,22,18,0.3)' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📅</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontStyle: 'italic', marginBottom: 6 }}>Sin citas</p>
            {activeTab === 0 && !isProfessional() && (
              <Link to="/search" style={{ display: 'inline-block', marginTop: 12, textDecoration: 'none', background: 'linear-gradient(135deg,#B8833A,#D4A055)', borderRadius: 12, padding: '12px 24px', color: '#FFFFFF', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>
                Buscar profesionales
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayBookings.map(b => (
              <BookingCard key={b.id} booking={b} onCancel={cancel} onReview={setReviewBooking} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
