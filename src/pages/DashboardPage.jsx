import { useState } from 'react'
import { useFavorites } from '../hooks/useFavorites'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, profApi, authApi, waitlistApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

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
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', padding: '0 0 40px', width: '100%', maxWidth: 520, boxShadow: '0 -8px 40px rgba(17,17,17,0.15)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(17,17,17,0.08)', margin: '16px auto 0' }} />
        {children}
      </div>
    </div>
  )
}

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 38, padding: 0, lineHeight: 1, color: star <= (hover || value) ? '#C58A3D' : 'rgba(24,21,18,0.12)', transition: 'all 0.12s', transform: star <= (hover || value) ? 'scale(1.18)' : 'scale(1)' }}>★</button>
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
      <div style={{ padding: '24px 24px 0' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B57932', marginBottom: 4, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Valorar visita</p>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 600, color: '#181512', margin: '0 0 2px' }}>{booking.professional_profiles?.business_name}</h3>
        <p style={{ fontSize: 12, color: 'rgba(24,21,18,0.35)', marginBottom: 24, fontFamily: 'Outfit, sans-serif' }}>{booking.services?.name} · {format(new Date(booking.starts_at), "d MMM yyyy", { locale: es })}</p>
        <StarInput value={rating} onChange={setRating} />
        {rating > 0 && <p style={{ fontSize: 13, color: '#B57932', marginTop: 10, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{LABELS[rating]}</p>}
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Cuéntanos tu experiencia... (opcional)" maxLength={400} rows={3}
          style={{ width: '100%', boxSizing: 'border-box', background: '#F8F5F0', border: '1.5px solid rgba(17,17,17,0.08)', borderRadius: 14, padding: '12px 14px', color: '#181512', fontSize: 14, fontFamily: 'Outfit, sans-serif', resize: 'none', outline: 'none', margin: '16px 0' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#F8F5F0', border: '1.5px solid rgba(17,17,17,0.08)', borderRadius: 14, padding: '13px 0', color: 'rgba(24,21,18,0.4)', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => { if (!rating) { toast.error('Selecciona una puntuación'); return }; onSubmit({ rating, comment }) }} disabled={isLoading}
            style={{ flex: 2, background: rating > 0 ? 'linear-gradient(135deg,#B97830,#D19B52)' : 'rgba(197,138,61,0.12)', border: 'none', borderRadius: 14, padding: '13px 0', color: rating > 0 ? '#fff' : 'rgba(197,138,61,0.4)', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: rating > 0 ? 'pointer' : 'not-allowed', boxShadow: rating > 0 ? '0 4px 14px rgba(185,120,48,0.3)' : 'none' }}>
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
      <div style={{ padding: '24px 24px 0' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#dc2626', marginBottom: 4, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Cancelar reserva</p>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 600, color: '#181512', margin: '0 0 4px' }}>{booking.services?.name}</h3>
        <p style={{ fontSize: 12, color: 'rgba(24,21,18,0.4)', marginBottom: 20, fontFamily: 'Outfit, sans-serif' }}>📅 {format(new Date(booking.starts_at), "EEEE d MMM · HH:mm", { locale: es })}</p>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(24,21,18,0.4)', marginBottom: 10, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>¿Motivo?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
          {CANCEL_REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)} style={{ padding: '12px 16px', borderRadius: 14, border: `1.5px solid ${reason === r ? '#dc2626' : 'rgba(17,17,17,0.08)'}`, background: reason === r ? 'rgba(220,38,38,0.04)' : '#fff', color: reason === r ? '#dc2626' : '#181512', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', textAlign: 'left', fontWeight: reason === r ? 600 : 400 }}>{r}</button>
          ))}
        </div>
        {reason === 'Otro motivo' && (
          <input value={custom} onChange={e => setCustom(e.target.value)} placeholder="Escribe el motivo..." maxLength={200}
            style={{ width: '100%', boxSizing: 'border-box', background: '#F8F5F0', border: '1.5px solid rgba(17,17,17,0.08)', borderRadius: 14, padding: '12px 14px', fontSize: 14, fontFamily: 'Outfit, sans-serif', outline: 'none', marginBottom: 12 }} />
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#F8F5F0', border: '1.5px solid rgba(17,17,17,0.08)', borderRadius: 14, padding: '13px 0', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', color: 'rgba(24,21,18,0.5)' }}>Volver</button>
          <button onClick={() => { if (!finalReason) { toast.error('Selecciona un motivo'); return }; onConfirm(finalReason) }} disabled={isLoading}
            style={{ flex: 2, background: reason ? 'rgba(220,38,38,0.88)' : 'rgba(220,38,38,0.2)', border: 'none', borderRadius: 14, padding: '13px 0', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: reason ? 'pointer' : 'not-allowed' }}>
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
      <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B57932', marginBottom: 2, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>💬 Notas de la reserva</p>
        <p style={{ fontSize: 12, color: 'rgba(24,21,18,0.38)', marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>{booking.services?.name} · {booking.professional_profiles?.business_name}</p>
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, minHeight: 80, maxHeight: 260 }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(24,21,18,0.25)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
              <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', lineHeight: 1.6 }}>Sin notas aún. Añade indicaciones, peticiones de estilo, alergias...</p>
            </div>
          ) : messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.isPro ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
              <p style={{ fontSize: 10, color: 'rgba(24,21,18,0.35)', margin: '0 0 3px', fontFamily: 'Outfit, sans-serif', textAlign: m.isPro ? 'left' : 'right' }}>{m.author}{m.time && ` · ${m.time}`}</p>
              <div style={{ background: m.isPro ? '#F8F5F0' : 'linear-gradient(135deg,#B97830,#D19B52)', borderRadius: m.isPro ? '4px 14px 14px 14px' : '14px 4px 14px 14px', padding: '10px 14px' }}>
                <p style={{ margin: 0, fontSize: 14, color: m.isPro ? '#181512' : '#fff', fontFamily: 'Outfit, sans-serif', lineHeight: 1.45 }}>{m.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Escribe una nota o petición..." maxLength={500} rows={2}
            style={{ flex: 1, background: '#F8F5F0', border: '1.5px solid rgba(17,17,17,0.08)', borderRadius: 14, padding: '11px 14px', fontSize: 14, fontFamily: 'Outfit, sans-serif', resize: 'none', outline: 'none', color: '#181512' }} />
          <button onClick={() => { if (!text.trim()) return; onSend(text.trim()); setText('') }} disabled={isLoading || !text.trim()}
            style={{ width: 46, height: 46, borderRadius: '50%', background: text.trim() ? 'linear-gradient(135deg,#B97830,#D19B52)' : 'rgba(185,120,48,0.15)', border: 'none', color: '#fff', fontSize: 20, cursor: text.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
        </div>
      </div>
    </Sheet>
  )
}

function RescheduleModal({ booking, onClose, onConfirm, isLoading }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [slots, setSlots]               = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const profId    = booking.professional_id ?? booking.professional_profiles?.id
  const serviceId = booking.service_id ?? booking.services?.id

  const fetchSlots = async (date) => {
    if (!profId || !serviceId || !date) return
    setLoadingSlots(true)
    setSelectedSlot(null)
    try {
      const res = await bookingsApi.getSlots({ professional_id: profId, service_id: serviceId, date })
      setSlots(res.data.data?.filter(s => s.available) ?? [])
    } catch { setSlots([]) }
    finally { setLoadingSlots(false) }
  }

  const dayChips = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    const iso = d.toLocaleDateString('sv-SE')
    const label = i === 0
      ? 'Mañana'
      : d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
    return { iso, label }
  })

  return (
    <Sheet onClose={onClose}>
      <div style={{ padding: '24px 24px 0' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B57932', marginBottom: 4, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Reagendar cita</p>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 600, color: '#181512', margin: '0 0 4px' }}>{booking.services?.name}</h3>
        <p style={{ fontSize: 12, color: 'rgba(24,21,18,0.4)', marginBottom: 20, fontFamily: 'Outfit, sans-serif' }}>
          📅 Ahora: {format(new Date(booking.starts_at), "EEEE d MMM · HH:mm", { locale: es })}
        </p>

        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(24,21,18,0.4)', marginBottom: 10, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nueva fecha</p>

        {/* Chips de días */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
          {dayChips.map(({ iso, label }) => {
            const active = selectedDate === iso
            return (
              <button key={iso} onClick={() => { setSelectedDate(iso); fetchSlots(iso) }}
                style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 12, border: `1.5px solid ${active ? '#B8833A' : 'rgba(0,0,0,0.1)'}`, background: active ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#F8F5F0', color: active ? '#fff' : '#181512', fontSize: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                {label}
              </button>
            )
          })}
        </div>

        {selectedDate && (
          loadingSlots ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
              {Array.from({ length: 6 }).map((_,i) => <div key={i} style={{ height: 40, borderRadius: 10, background: 'linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%)', backgroundSize: '400px 100%' }} />)}
            </div>
          ) : slots.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'rgba(24,21,18,0.35)', fontSize: 14, fontFamily: 'Outfit, sans-serif', padding: '8px 0 16px' }}>😔 No hay huecos ese día</p>
          ) : (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(24,21,18,0.4)', marginBottom: 8, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hora</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16, maxHeight: 180, overflowY: 'auto' }}>
                {slots.map(slot => {
                  const active = selectedSlot?.starts_at === slot.starts_at
                  return (
                    <button key={slot.starts_at} onClick={() => setSelectedSlot(slot)}
                      style={{ padding: '10px 0', borderRadius: 10, border: `1.5px solid ${active ? 'rgba(185,120,48,0.6)' : 'rgba(17,17,17,0.1)'}`, background: active ? 'linear-gradient(135deg,rgba(185,120,48,0.12),rgba(209,155,82,0.08))' : '#F8F5F0', color: active ? '#B57932' : '#181512', fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: active ? 700 : 400, cursor: 'pointer' }}>
                      {format(new Date(slot.starts_at), 'HH:mm')}
                    </button>
                  )
                })}
              </div>
            </>
          )
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#F8F5F0', border: '1.5px solid rgba(17,17,17,0.08)', borderRadius: 14, padding: '13px 0', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', color: 'rgba(24,21,18,0.5)' }}>Volver</button>
          <button onClick={() => selectedSlot && onConfirm(selectedSlot.starts_at)} disabled={!selectedSlot || isLoading}
            style={{ flex: 2, background: selectedSlot ? 'linear-gradient(135deg,#B97830,#D19B52)' : 'rgba(185,120,48,0.15)', border: 'none', borderRadius: 14, padding: '13px 0', color: selectedSlot ? '#fff' : 'rgba(185,120,48,0.4)', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: selectedSlot ? 'pointer' : 'not-allowed' }}>
            {isLoading ? 'Guardando...' : '📅 Confirmar cambio'}
          </button>
        </div>
      </div>
    </Sheet>
  )
}

function BookingCard({ booking, onCancel, onReview, onNotes, onReschedule }) {
  const [hov, setHov] = useState(false)
  const navigate = useNavigate()
  const st        = STATUS[booking.status] ?? STATUS.pending
  const isPast    = new Date(booking.starts_at) < new Date()
  const canCancel = ['pending','confirmed'].includes(booking.status) && !isPast
  const canReview = booking.status === 'completed' && !(booking.reviews?.length > 0)
  const hasReview = booking.reviews?.length > 0
  const hasNotes  = !!booking.notes
  const isActive  = ['pending','confirmed'].includes(booking.status)
  const isCompleted = booking.status === 'completed'
  const proName   = booking.professional_profiles?.business_name ?? '—'
  const coverUrl  = booking.professional_profiles?.cover_image_url

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hov ? 'rgba(197,138,61,0.3)' : 'rgba(17,17,17,0.07)'}`,
        borderRadius: 20, overflow: 'hidden',
        boxShadow: hov ? '0 8px 28px rgba(17,17,17,0.09)' : '0 2px 8px rgba(17,17,17,0.05)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ width: 4, flexShrink: 0, background: st.color, opacity: 0.7 }} />
        <div style={{ width: 88, flexShrink: 0, background: 'linear-gradient(135deg,#F4EEE6,#EDE4D4)', position: 'relative', overflow: 'hidden', minHeight: 88 }}>
          {coverUrl
            ? <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✂️</div>
          }
        </div>
        <div style={{ flex: 1, padding: '14px 16px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 700, color: '#181512', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{booking.services?.name}</p>
              <p style={{ fontSize: 12, color: 'rgba(24,21,18,0.45)', margin: '2px 0 0', fontFamily: 'Outfit, sans-serif' }}>{proName}</p>
            </div>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: st.bg, color: st.color, whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{st.label}</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(24,21,18,0.38)', margin: 0, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 3 }}>
            📅 {format(new Date(booking.starts_at), "EEEE d MMM · HH:mm", { locale: es })}
            <span style={{ opacity: 0.6 }}>· {booking.services?.duration_minutes} min</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginTop: 2 }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#B57932', fontStyle: 'italic', fontWeight: 600 }}>{booking.total_price}€</span>
            {hasReview && (
              <span style={{ fontSize: 11, color: '#B57932', background: 'rgba(197,138,61,0.1)', padding: '3px 9px', borderRadius: 999, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                {'★'.repeat(booking.reviews[0].rating)} Valorada
              </span>
            )}
            {isActive && (
              <button onClick={() => onNotes(booking)} style={{ fontSize: 12, background: hasNotes ? 'rgba(197,138,61,0.08)' : 'transparent', border: `1.5px solid ${hasNotes ? 'rgba(197,138,61,0.25)' : 'rgba(17,17,17,0.1)'}`, borderRadius: 10, padding: '4px 11px', color: hasNotes ? '#B57932' : 'rgba(24,21,18,0.4)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s' }}>
                💬 {hasNotes ? 'Notas' : 'Añadir nota'}
              </button>
            )}
            {canReview && (
              <button onClick={() => onReview(booking)} style={{ fontSize: 12, background: 'rgba(197,138,61,0.08)', border: '1.5px solid rgba(197,138,61,0.2)', borderRadius: 10, padding: '4px 12px', color: '#B57932', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                ★ Valorar
              </button>
            )}
            {isCompleted && booking.professional_profiles?.id && booking.services?.id && (
              <button
                onClick={() => navigate(`/booking/${booking.professional_profiles.id}/${booking.services.id}`)}
                style={{ fontSize: 12, background: 'rgba(184,131,58,0.08)', border: '1.5px solid rgba(184,131,58,0.25)', borderRadius: 10, padding: '4px 12px', color: '#B8833A', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                ↺ Repetir
              </button>
            )}
            {canCancel && (
              <button onClick={() => onReschedule(booking)} style={{ fontSize: 12, background: 'transparent', border: '1.5px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '4px 12px', color: '#16a34a', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                📅 Cambiar
              </button>
            )}
            {canCancel && (
              <button onClick={() => onCancel(booking)} style={{ fontSize: 12, background: 'transparent', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '4px 12px', color: '#dc2626', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, sub }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid rgba(17,17,17,0.07)', borderRadius: 18, padding: '18px 20px', boxShadow: '0 2px 8px rgba(17,17,17,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(24,21,18,0.3)', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{label}</span>
      </div>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 300, color: '#B57932', margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'rgba(24,21,18,0.35)', margin: '5px 0 0', fontFamily: 'Outfit, sans-serif' }}>{sub}</p>}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: '1.5px solid rgba(17,17,17,0.07)', borderRadius: 20, overflow: 'hidden', display: 'flex', height: 90 }}>
      <div style={{ width: 4, flexShrink: 0, background: 'rgba(17,17,17,0.06)' }} />
      <div className="skel" style={{ width: 88, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skel" style={{ height: 16, width: '50%', borderRadius: 6 }} />
        <div className="skel" style={{ height: 12, width: '35%', borderRadius: 6 }} />
        <div className="skel" style={{ height: 12, width: '60%', borderRadius: 6 }} />
      </div>
    </div>
  )
}

function FavCard({ proId, onRemove }) {
  const { data: prof, isLoading } = useQuery({
    queryKey: ['prof-mini', proId],
    queryFn: () => profApi.getOne(proId).then(r => r.data.data),
    staleTime: 5 * 60_000,
  })
  if (isLoading) return <div style={{ width: 120, flexShrink: 0, height: 120, background: '#f0ede8', borderRadius: 16 }} />
  if (!prof) return null
  return (
    <Link to={`/professional/${proId}`} style={{ textDecoration: 'none', flexShrink: 0, width: 120 }}>
      <div style={{ background: '#fff', border: '1.5px solid rgba(17,17,17,0.07)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(17,17,17,0.05)', position: 'relative' }}>
        <div style={{ height: 72, background: 'linear-gradient(135deg,#F4EEE6,#EDE4D4)', overflow: 'hidden' }}>
          {prof.cover_image_url
            ? <img src={prof.cover_image_url} alt={prof.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>✨</div>
          }
        </div>
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onRemove() }}
          style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        <div style={{ padding: '7px 8px' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.85rem', fontWeight: 700, color: '#181512', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prof.business_name}</p>
          <p style={{ fontSize: 10, color: 'rgba(24,21,18,0.4)', margin: '2px 0 0', fontFamily: 'Outfit, sans-serif' }}>{prof.city}</p>
        </div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { user, isProfessional, updatePoints } = useAuthStore()
  const qc = useQueryClient()

  useQuery({
    queryKey: ['my-profile-points'],
    queryFn: () => authApi.me().then(r => {
      const pts = r.data.user?.points ?? 0
      updatePoints(pts)
      return pts
    }),
    enabled: !isProfessional(),
    staleTime: 30_000,
  })

  const [reviewBooking,     setReviewBooking]     = useState(null)
  const [cancelBooking,     setCancelBooking]     = useState(null)
  const [notesBooking,      setNotesBooking]      = useState(null)
  const [rescheduleBooking, setRescheduleBooking] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  const { favs, toggle: toggleFav } = useFavorites()

  const { data: myBookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.getMine().then(r => r.data.data),
    enabled: !isProfessional(),
    staleTime: 0,
    refetchOnWindowFocus: true,
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
  const { data: myWaitlists = [] } = useQuery({
    queryKey: ['my-waitlists'],
    queryFn: () => waitlistApi.getMine().then(r => r.data.data),
    enabled: !isProfessional(),
    staleTime: 0,
  })

  const { mutate: leaveWaitlist } = useMutation({
    mutationFn: ({ professional_id, date }) => waitlistApi.leave(professional_id, date),
    onSuccess: () => { toast.success('Saliste de la lista de espera'); qc.invalidateQueries({ queryKey: ['my-waitlists'] }) },
    onError: () => toast.error('Error al salir de la lista'),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['my-bookings'] })
    qc.invalidateQueries({ queryKey: ['pro-bookings'] })
  }

  const { mutate: doCancel, isPending: cancelling } = useMutation({
    mutationFn: ({ id, reason }) => bookingsApi.cancel(id, reason),
    onSuccess: () => { toast.success('Reserva cancelada'); setCancelBooking(null); invalidate(); qc.invalidateQueries({ queryKey: ['slots'] }) },
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

  const { mutate: doReschedule, isPending: rescheduling } = useMutation({
    mutationFn: ({ id, starts_at }) => bookingsApi.rescheduleClient(id, {
      starts_at,
      professional_id: rescheduleBooking?.professional_id ?? rescheduleBooking?.professional_profiles?.id,
      service_id: rescheduleBooking?.service_id ?? rescheduleBooking?.services?.id,
    }),
    onSuccess: () => {
      toast.success('Cita reagendada ✓')
      setRescheduleBooking(null)
      invalidate()
      qc.invalidateQueries({ queryKey: ['slots'] })
    },
    onError: err => toast.error(err.response?.data?.error ?? 'Error al reagendar'),
  })

  const allBookings = isProfessional() ? (proBookings ?? []) : (myBookings ?? [])
  const now = new Date()

  const tabs = {
    0: allBookings.filter(b => ['pending','confirmed'].includes(b.status) && new Date(b.starts_at) >= now),
    1: allBookings.filter(b => b.status === 'completed' || (new Date(b.starts_at) < now && !['cancelled','no_show'].includes(b.status))),
    2: allBookings.filter(b => ['cancelled','no_show'].includes(b.status)),
  }
  const displayBookings = tabs[activeTab] ?? []
  const firstName = user?.full_name?.split(' ')[0]

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        .skel{background:linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%);background-size:400px 100%;animation:shimmer 1.4s infinite;}
      `}</style>

      {reviewBooking     && <ReviewModal     booking={reviewBooking}     onClose={() => setReviewBooking(null)}     onSubmit={({ rating, comment }) => submitReview({ id: reviewBooking.id, rating, comment })} isLoading={reviewLoading} />}
      {cancelBooking     && <CancelModal     booking={cancelBooking}     onClose={() => setCancelBooking(null)}     onConfirm={(reason) => doCancel({ id: cancelBooking.id, reason })} isLoading={cancelling} />}
      {notesBooking      && <NotesModal      booking={notesBooking}      onClose={() => setNotesBooking(null)}      onSend={(note) => sendNote({ id: notesBooking.id, note })} isLoading={noteSending} />}
      {rescheduleBooking && <RescheduleModal booking={rescheduleBooking} onClose={() => setRescheduleBooking(null)} onConfirm={(starts_at) => doReschedule({ id: rescheduleBooking.id, starts_at })} isLoading={rescheduling} />}

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 16px 100px', fontFamily: 'Outfit, sans-serif' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,21,18,0.35)', margin: '0 0 4px', fontWeight: 600 }}>
              {isProfessional() ? 'Panel profesional' : 'Mis reservas'}
            </p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 600, margin: 0, color: '#181512', lineHeight: 1.1 }}>
              Hola, <em style={{ color: '#B57932' }}>{firstName}</em>
            </h1>
            {!isProfessional() && (user?.points ?? 0) >= 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, background: 'linear-gradient(135deg,rgba(185,120,48,0.1),rgba(209,155,82,0.08))', border: '1px solid rgba(185,120,48,0.2)', borderRadius: 999, padding: '4px 12px' }}>
                <span style={{ fontSize: 14 }}>⭐</span>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 700, color: '#B57932' }}>{user?.points ?? 0}</span>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: 'rgba(24,21,18,0.45)' }}>puntos</span>
              </div>
            )}
          </div>
          {!isProfessional() && (
            <Link to="/search" style={{ textDecoration: 'none', background: 'linear-gradient(135deg,#B97830,#D19B52)', borderRadius: 14, padding: '11px 20px', color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 6px 16px rgba(185,120,48,0.3)' }}>+ Nueva cita</Link>
          )}
        </div>

        {!isProfessional() && myBookings && myBookings.length > 0 && (() => {
          const completed = myBookings.filter(b => b.status === 'completed')
          const totalSpent = completed.reduce((s, b) => s + Number(b.total_price ?? 0), 0)
          const favPro = completed.length > 0
            ? Object.entries(completed.reduce((acc, b) => { const name = b.professional_profiles?.business_name ?? '—'; acc[name] = (acc[name] ?? 0) + 1; return acc }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
            : null
          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
              {[
                { icon: '✅', label: 'Visitas', value: completed.length },
                { icon: '💶', label: 'Gastado', value: `${totalSpent}€` },
                { icon: '💇', label: 'Favorito', value: favPro ?? '—', small: true },
              ].map((kpi, i) => (
                <div key={i} style={{ background: '#fff', border: '1.5px solid rgba(17,17,17,0.07)', borderRadius: 16, padding: '14px 12px', boxShadow: '0 2px 8px rgba(17,17,17,0.04)', textAlign: 'center' }}>
                  <span style={{ fontSize: 20 }}>{kpi.icon}</span>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: kpi.small ? '1rem' : '1.5rem', fontWeight: 600, color: '#B57932', margin: '4px 0 2px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kpi.value}</p>
                  <p style={{ fontSize: 10, color: 'rgba(24,21,18,0.35)', margin: 0, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{kpi.label}</p>
                </div>
              ))}
            </div>
          )
        })()}

        {!isProfessional() && favs.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B57932', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: 12 }}>❤️ Guardados</p>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
              {favs.map(proId => <FavCard key={proId} proId={proId} onRemove={() => toggleFav(proId)} />)}
            </div>
          </div>
        )}

        {isProfessional() && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 28 }}>
            <KpiCard icon="💶" label="Este mes"   value={`${stats.revenue_this_month}€`} />
            <KpiCard icon="📅" label="Próximas"   value={stats.upcoming_bookings} />
            <KpiCard icon="✅" label="Total citas" value={stats.total_bookings} />
            <KpiCard icon="⭐" label="Valoración"  value={stats.avg_rating || '—'} sub={`${stats.total_reviews} reseñas`} />
          </div>
        )}

        {!isProfessional() && activeTab === 0 && tabs[0]?.length > 0 && (() => {
          const next = tabs[0][0]
          const st = STATUS[next.status] ?? STATUS.pending
          return (
            <div style={{ background: 'linear-gradient(135deg,#1A0F05,#2C1810)', borderRadius: 20, padding: '20px 22px', marginBottom: 20, position: 'relative', overflow: 'hidden', boxShadow: '0 8px 28px rgba(17,17,17,0.15)' }}>
              <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(197,138,61,0.2) 0%,transparent 65%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(212,160,85,0.65)', margin: 0, fontWeight: 700 }}>Próxima cita</p>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: st.bg, color: st.color, fontWeight: 700 }}>{st.label}</span>
                </div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 600, color: '#F8F5F0', margin: '0 0 4px' }}>{next.services?.name}</h3>
                <p style={{ fontSize: 13, color: 'rgba(248,245,240,0.55)', margin: '0 0 12px', fontFamily: 'Outfit, sans-serif' }}>
                  {next.professional_profiles?.business_name} · {format(new Date(next.starts_at), "EEEE d MMM · HH:mm", { locale: es })}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#D4A055', fontStyle: 'italic' }}>{next.total_price}€</span>
                  <button onClick={() => setNotesBooking(next)} style={{ fontSize: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '5px 12px', color: 'rgba(248,245,240,0.8)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                    💬 {next.notes ? 'Notas' : 'Añadir nota'}
                  </button>
                  <button onClick={() => setCancelBooking(next)} style={{ fontSize: 12, background: 'transparent', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '5px 12px', color: 'rgba(220,38,38,0.8)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

        {!isProfessional() && (() => {
          const pending = tabs[1]?.filter(b => b.status === 'completed' && !(b.reviews?.length > 0)) ?? []
          if (!pending.length) return null
          return (
            <div onClick={() => setActiveTab(1)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg,rgba(184,131,58,0.1),rgba(184,131,58,0.06))', border: '1.5px solid rgba(184,131,58,0.25)', borderRadius: 14, padding: '12px 16px', marginBottom: 16, cursor: 'pointer' }}>
              <span style={{ fontSize: 22 }}>⭐</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 700, color: '#B57932', margin: 0 }}>
                  {pending.length === 1 ? 'Tienes 1 cita sin valorar' : `Tienes ${pending.length} citas sin valorar`}
                </p>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: 'rgba(24,21,18,0.45)', margin: '2px 0 0' }}>Tu opinión ayuda a otros clientes a elegir</p>
              </div>
              <span style={{ fontSize: 16, color: 'rgba(184,131,58,0.5)' }}>→</span>
            </div>
          )
        })()}

        {!isProfessional() && myWaitlists.length > 0 && (
          <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: '16px 18px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(24,21,18,0.35)', fontWeight: 700, margin: '0 0 12px' }}>⏳ En lista de espera</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myWaitlists.map(w => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(184,131,58,0.04)', border: '1px solid rgba(184,131,58,0.15)', borderRadius: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden', background: 'linear-gradient(135deg,#F4EEE6,#EDE4D4)', flexShrink: 0 }}>
                    {w.professional_profiles?.cover_image_url
                      ? <img src={w.professional_profiles.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✂️</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, color: '#181512', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.professional_profiles?.business_name}</p>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: 'rgba(24,21,18,0.45)', margin: '2px 0 0' }}>
                      {w.services?.name} · {new Date(w.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <button onClick={() => { if (confirm('¿Salir de la lista de espera?')) leaveWaitlist({ professional_id: w.professional_profiles?.id, date: w.date }) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'rgba(220,38,38,0.4)', padding: 4, flexShrink: 0 }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 0, marginBottom: 18, background: '#EFEDE9', borderRadius: 14, padding: 4 }}>
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: '10px 0', borderRadius: 11, border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 13, transition: 'all 0.2s', background: activeTab === i ? '#fff' : 'transparent', color: activeTab === i ? '#181512' : 'rgba(24,21,18,0.4)', fontWeight: activeTab === i ? 700 : 400, boxShadow: activeTab === i ? '0 2px 8px rgba(17,17,17,0.08)' : 'none' }}>
              {tab}
              {tabs[i]?.length > 0 && (
                <span style={{ marginLeft: 6, fontSize: 10, background: activeTab === i ? 'rgba(197,138,61,0.15)' : 'rgba(24,21,18,0.08)', color: activeTab === i ? '#B57932' : 'rgba(24,21,18,0.4)', borderRadius: 999, padding: '1px 6px' }}>
                  {tabs[i].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : displayBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff', border: '1.5px solid rgba(17,17,17,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px', boxShadow: '0 4px 20px rgba(17,17,17,0.06)' }}>📅</div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.7rem', fontWeight: 600, color: '#181512', margin: '0 0 8px' }}>Sin citas</h3>
            <p style={{ fontSize: 14, color: 'rgba(24,21,18,0.4)', marginBottom: 24, lineHeight: 1.6 }}>
              {activeTab === 0 ? 'No tienes citas próximas.' : activeTab === 1 ? 'No tienes citas pasadas.' : 'No tienes citas canceladas.'}
            </p>
            {activeTab === 0 && !isProfessional() && (
              <Link to="/search" style={{ display: 'inline-block', textDecoration: 'none', background: 'linear-gradient(135deg,#B97830,#D19B52)', borderRadius: 14, padding: '13px 28px', color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', boxShadow: '0 6px 16px rgba(185,120,48,0.3)' }}>
                Buscar profesionales
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayBookings.map(b => (
              <BookingCard key={b.id} booking={b}
                onCancel={setCancelBooking}
                onReview={setReviewBooking}
                onNotes={setNotesBooking}
                onReschedule={setRescheduleBooking}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}