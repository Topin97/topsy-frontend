import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const STATUS = {
  pending:   { label: 'Pendiente',  bg: 'rgba(217,119,6,0.1)',   color: '#d97706' },
  confirmed: { label: 'Confirmada', bg: 'rgba(22,163,74,0.1)',   color: '#16a34a' },
  completed: { label: 'Completada', bg: 'rgba(37,99,235,0.1)',   color: '#2563eb' },
  cancelled: { label: 'Cancelada',  bg: 'rgba(220,38,38,0.08)',  color: '#dc2626' },
  no_show:   { label: 'No asistió', bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
}
const TABS = ['Próximas', 'Pasadas', 'Canceladas']

function Sheet({ onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', padding: '0 0 40px', width: '100%', maxWidth: 480, boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.08)', margin: '16px auto 0' }} />
        {children}
      </div>
    </div>
  )
}

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button" onClick={() => onChange(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 36, padding: 0, lineHeight: 1, color: star <= (hover || value) ? '#B8833A' : 'rgba(26,22,18,0.15)', transition: 'color 0.12s, transform 0.1s', transform: star <= (hover || value) ? 'scale(1.15)' : 'scale(1)' }}>★</button>
      ))}
    </div>
  )
}

function ReviewModal({ booking, onClose, onSubmit, isLoading }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const LABELS = ['', '😕 Malo', '😐 Regular', '😊 Bien', '😄 Muy bien', '🤩 Excelente']
  return (
    <Sheet onClose={onClose}>
      <div style={{ padding: '20px 24px 0' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>Valorar visita</p>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 400, color: '#1A1612', margin: '0 0 4px' }}>{booking.professional_profiles?.business_name}</h3>
        <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.3)', marginBottom: 20, fontFamily: 'Outfit, sans-serif' }}>{booking.services?.name} · {format(new Date(booking.starts_at), "d MMM yyyy", { locale: es })}</p>
        <StarInput value={rating} onChange={setRating} />
        {rating > 0 && <p style={{ fontSize: 13, color: '#B8833A', marginTop: 8, fontFamily: 'Outfit, sans-serif' }}>{LABELS[rating]}</p>}
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Cuéntanos tu experiencia... (opcional)" maxLength={400} rows={3}
          style={{ width: '100%', boxSizing: 'border-box', background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '12px 14px', color: '#1A1612', fontSize: 14, fontFamily: 'Outfit, sans-serif', resize: 'none', outline: 'none', margin: '16px 0' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '13px 0', color: 'rgba(26,22,18,0.4)', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => { if (!rating) { toast.error('Selecciona una puntuación'); return }; onSubmit({ rating, comment }) }} disabled={isLoading}
            style={{ flex: 2, background: rating > 0 ? 'linear-gradient(135deg,#B8833A,#D4A055)' : 'rgba(201,150,90,0.1)', border: 'none', borderRadius: 12, padding: '13px 0', color: rating > 0 ? '#FFFFFF' : 'rgba(201,150,90,0.3)', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: rating > 0 ? 'pointer' : 'not-allowed' }}>
            {isLoading ? 'Enviando...' : '★ Enviar valoración'}
          </button>
        </div>
      </div>
    </Sheet>
  )
}

const CANCEL_REASONS = ['Me surgió algo imprevisto','Quiero cambiar de fecha','El precio es demasiado alto','Encontré otro profesional','Error al reservar','Otro motivo']

function CancelModal({ booking, onClose, onConfirm, isLoading }) {
  const [reason, setReason] = useState('')
  const [custom, setCustom] = useState('')
  const finalReason = reason === 'Otro motivo' ? custom : reason
  return (
    <Sheet onClose={onClose}>
      <div style={{ padding: '20px 24px 0' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#dc2626', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>Cancelar reserva</p>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 400, color: '#1A1612', margin: '0 0 4px' }}>{booking.services?.name}</h3>
        <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>📅 {format(new Date(booking.starts_at), "EEEE d MMM · HH:mm", { locale: es })}</p>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(26,22,18,0.45)', marginBottom: 10, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>¿Motivo?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
          {CANCEL_REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)} style={{ padding: '11px 16px', borderRadius: 12, border: `1.5px solid ${reason === r ? '#dc2626' : 'rgba(0,0,0,0.08)'}`, background: reason === r ? 'rgba(220,38,38,0.04)' : '#FFFFFF', color: reason === r ? '#dc2626' : '#1A1612', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', textAlign: 'left', fontWeight: reason === r ? 600 : 400 }}>{r}</button>
          ))}
        </div>
        {reason === 'Otro motivo' && (
          <input value={custom} onChange={e => setCustom(e.target.value)} placeholder="Escribe el motivo..." maxLength={200}
            style={{ width: '100%', boxSizing: 'border-box', background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontFamily: 'Outfit, sans-serif', outline: 'none', marginBottom: 10 }} />
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '13px 0', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', color: 'rgba(26,22,18,0.5)' }}>Volver</button>
          <button onClick={() => { if (!finalReason) { toast.error('Selecciona un motivo'); return }; onConfirm(finalReason) }} disabled={isLoading}
            style={{ flex: 2, background: reason ? 'rgba(220,38,38,0.9)' : 'rgba(220,38,38,0.2)', border: 'none', borderRadius: 12, padding: '13px 0', color: '#FFFFFF', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: reason ? 'pointer' : 'not-allowed' }}>
            {isLoading ? 'Cancelando...' : 'Confirmar cancelación'}
          </button>
        </div>
      </div>
    </Sheet>
  )
}

function NotesModal({ booking, onClose, onSend, isLoading }) {
  const [text, setText] = useState('')
  const parseNotes = (raw) => {
    if (!raw) return []
    return raw.split('\n---\n').map(block => {
      const m = block.match(/^\[(.+?) · (.+?)\]\n([\s\S]*)/)
      if (m) return { author: m[1], time: m[2], message: m[3].trim(), isPro: m[1] === 'Profesional' }
      return { author: '', time: '', message: block.trim(), isPro: false }
    }).filter(b => b.message)
  }
  const messages = parseNotes(booking.notes)
  return (
    <Sheet onClose={onClose}>
      <div style={{ padding: '20px 24px 0', display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 2, fontFamily: 'Outfit, sans-serif' }}>💬 Notas de la reserva</p>
        <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>{booking.services?.name} · {booking.professional_profiles?.business_name}</p>
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, minHeight: 80, maxHeight: 260 }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(26,22,18,0.25)' }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>💬</p>
              <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>Sin notas aún. Añade indicaciones, peticiones de estilo, alergias...</p>
            </div>
          ) : messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.isPro ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
              <p style={{ fontSize: 10, color: 'rgba(26,22,18,0.35)', margin: '0 0 3px', fontFamily: 'Outfit, sans-serif', textAlign: m.isPro ? 'left' : 'right' }}>{m.author}{m.time && ` · ${m.time}`}</p>
              <div style={{ background: m.isPro ? '#F7F5F2' : 'linear-gradient(135deg,#B8833A,#D4A055)', borderRadius: m.isPro ? '4px 14px 14px 14px' : '14px 4px 14px 14px', padding: '10px 14px' }}>
                <p style={{ margin: 0, fontSize: 14, color: m.isPro ? '#1A1612' : '#FFFFFF', fontFamily: 'Outfit, sans-serif', lineHeight: 1.4 }}>{m.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Escribe una nota o petición..." maxLength={500} rows={2}
            style={{ flex: 1, background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '11px 14px', fontSize: 14, fontFamily: 'Outfit, sans-serif', resize: 'none', outline: 'none', color: '#1A1612' }} />
          <button onClick={() => { if (!text.trim()) return; onSend(text.trim()) }} disabled={isLoading || !text.trim()}
            style={{ width: 46, height: 46, borderRadius: '50%', background: text.trim() ? 'linear-gradient(135deg,#B8833A,#D4A055)' : 'rgba(184,131,58,0.15)', border: 'none', color: '#FFFFFF', fontSize: 20, cursor: text.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
        </div>
      </div>
    </Sheet>
  )
}

function BookingCard({ booking, onCancel, onReview, onNotes }) {
  const st       = STATUS[booking.status] ?? STATUS.pending
  const isPast   = new Date(booking.starts_at) < new Date()
  const canCancel= ['pending','confirmed'].includes(booking.status) && !isPast
  const canReview= booking.status === 'completed' && !(booking.reviews?.length > 0)
  const hasReview= booking.reviews?.length > 0
  const hasNotes = !!booking.notes
  const isActive = ['pending','confirmed'].includes(booking.status)
  const proName  = booking.professional_profiles?.business_name ?? '—'
  const coverUrl = booking.professional_profiles?.cover_image_url
  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 4, flexShrink: 0, background: st.color, opacity: 0.6 }} />
        <div style={{ width: 76, flexShrink: 0, background: 'rgba(184,131,58,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, position: 'relative', overflow: 'hidden' }}>
          {coverUrl ? <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : '✂️'}
        </div>
        <div style={{ flex: 1, padding: '11px 14px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: '#1A1612', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{booking.services?.name}</p>
              <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.4)', margin: '2px 0 0', fontFamily: 'Outfit, sans-serif' }}>{proName}</p>
            </div>
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: st.bg, color: st.color, whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{st.label}</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.32)', margin: '6px 0', fontFamily: 'Outfit, sans-serif' }}>
            📅 {format(new Date(booking.starts_at), "EEEE d MMM · HH:mm", { locale: es })}
            <span style={{ marginLeft: 5 }}>· {booking.services?.duration_minutes} min</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', color: '#B8833A', fontStyle: 'italic' }}>{booking.total_price}€</span>
            {hasReview && <span style={{ fontSize: 11, color: '#B8833A', background: 'rgba(201,150,90,0.1)', padding: '2px 8px', borderRadius: 100, fontFamily: 'Outfit, sans-serif' }}>{'★'.repeat(booking.reviews[0].rating)} Valorada</span>}
            {isActive && (
              <button onClick={() => onNotes(booking)} style={{ fontSize: 12, background: hasNotes ? 'rgba(184,131,58,0.08)' : 'transparent', border: `1.5px solid ${hasNotes ? 'rgba(184,131,58,0.25)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 8, padding: '4px 10px', color: hasNotes ? '#B8833A' : 'rgba(26,22,18,0.4)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                💬 {hasNotes ? 'Notas' : 'Añadir nota'}
              </button>
            )}
            {canReview && <button onClick={() => onReview(booking)} style={{ fontSize: 12, background: 'rgba(184,131,58,0.07)', border: '1px solid rgba(184,131,58,0.18)', borderRadius: 8, padding: '4px 12px', color: '#B8833A', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>★ Valorar</button>}
            {canCancel && <button onClick={() => onCancel(booking)} style={{ fontSize: 12, background: 'transparent', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '4px 12px', color: '#dc2626', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Cancelar</button>}
          </div>
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
      {sub && <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.35)', margin: '4px 0 0', fontFamily: 'Outfit, sans-serif' }}>{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { user, isProfessional } = useAuthStore()
  const qc = useQueryClient()
  const [reviewBooking, setReviewBooking] = useState(null)
  const [cancelBooking, setCancelBooking] = useState(null)
  const [notesBooking,  setNotesBooking]  = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  const { data: myBookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.getMine().then(r => r.data.data),
    enabled: !isProfessional(),
  })
  const { data: proBookings } = useQuery({
    queryKey: ['pro-bookings'],
    queryFn: () => bookingsApi.getPro().then(r => r.data.data),
    enabled: isProfessional(),
  })
  const { data: stats } = useQuery({
    queryKey: ['pro-stats'],
    queryFn: () => profApi.getStats().then(r => r.data.data),
    enabled: isProfessional(),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['my-bookings'] })
    qc.invalidateQueries({ queryKey: ['pro-bookings'] })
  }

  const { mutate: doCancel, isPending: cancelling } = useMutation({
    mutationFn: ({ id, reason }) => bookingsApi.cancel(id, reason),
    onSuccess: () => { toast.success('Reserva cancelada'); setCancelBooking(null); invalidate() },
    onError: err => toast.error(err.response?.data?.error ?? 'Error al cancelar'),
  })
  const { mutate: submitReview, isPending: reviewLoading } = useMutation({
    mutationFn: ({ id, rating, comment }) => bookingsApi.review(id, { rating, comment }),
    onSuccess: () => { toast.success('¡Gracias por tu valoración! ★'); setReviewBooking(null); invalidate() },
    onError: err => toast.error(err.response?.data?.error ?? 'Error'),
  })
  const { mutate: sendNote, isPending: noteSending } = useMutation({
    mutationFn: ({ id, note }) => bookingsApi.addNote(id, note),
    onSuccess: (res) => {
      toast.success('Nota añadida ✓')
      setNotesBooking(prev => prev ? { ...prev, notes: res.data.data.notes } : null)
      invalidate()
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
      {reviewBooking && <ReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)} onSubmit={({ rating, comment }) => submitReview({ id: reviewBooking.id, rating, comment })} isLoading={reviewLoading} />}
      {cancelBooking && <CancelModal booking={cancelBooking} onClose={() => setCancelBooking(null)} onConfirm={(reason) => doCancel({ id: cancelBooking.id, reason })} isLoading={cancelling} />}
      {notesBooking  && <NotesModal  booking={notesBooking}  onClose={() => setNotesBooking(null)}  onSend={(note) => sendNote({ id: notesBooking.id, note })} isLoading={noteSending} />}

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px 100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.3)', margin: '0 0 4px', fontFamily: 'Outfit, sans-serif' }}>{isProfessional() ? 'Panel profesional' : 'Mis reservas'}</p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 300, margin: 0, color: '#1A1612' }}>Hola, <em style={{ color: '#B8833A' }}>{user?.full_name?.split(' ')[0]}</em></h1>
          </div>
          {!isProfessional() && (
            <Link to="/search" style={{ textDecoration: 'none', background: 'linear-gradient(135deg,#B8833A,#D4A055)', borderRadius: 12, padding: '10px 18px', color: '#FFFFFF', fontWeight: 700, fontSize: 13, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(184,131,58,0.25)' }}>+ Nueva cita</Link>
          )}
        </div>

        {isProfessional() && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 24 }}>
            <KpiCard icon="💶" label="Este mes"    value={`${stats.revenue_this_month}€`} />
            <KpiCard icon="📅" label="Próximas"    value={stats.upcoming_bookings} />
            <KpiCard icon="✅" label="Total citas"  value={stats.total_bookings} />
            <KpiCard icon="⭐" label="Valoración"   value={stats.avg_rating || '—'} sub={`${stats.total_reviews} reseñas`} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: '#EFEDE9', borderRadius: 12, padding: 4 }}>
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 13, transition: 'all 0.2s', background: activeTab === i ? '#FFFFFF' : 'transparent', color: activeTab === i ? '#1A1612' : 'rgba(26,22,18,0.4)', fontWeight: activeTab === i ? 600 : 400, boxShadow: activeTab === i ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
              {tab}
              {tabs[i]?.length > 0 && <span style={{ marginLeft: 5, fontSize: 10, background: activeTab === i ? 'rgba(184,131,58,0.15)' : 'rgba(26,22,18,0.08)', color: activeTab === i ? '#B8833A' : 'rgba(26,22,18,0.4)', borderRadius: 100, padding: '1px 6px' }}>{tabs[i].length}</span>}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
          </div>
        ) : displayBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(26,22,18,0.3)' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📅</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontStyle: 'italic', marginBottom: 6 }}>Sin citas</p>
            {activeTab === 0 && !isProfessional() && (
              <Link to="/search" style={{ display: 'inline-block', marginTop: 12, textDecoration: 'none', background: 'linear-gradient(135deg,#B8833A,#D4A055)', borderRadius: 12, padding: '12px 24px', color: '#FFFFFF', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>Buscar profesionales</Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayBookings.map(b => (
              <BookingCard key={b.id} booking={b} onCancel={setCancelBooking} onReview={setReviewBooking} onNotes={setNotesBooking} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
