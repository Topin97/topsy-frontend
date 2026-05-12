import { useState } from 'react'
import GCalDisconnectedBanner from '../../components/GCalDisconnectedBanner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profApi, bookingsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../services/api'

const STATUS = {
  pending:   { label: 'Pendiente',      color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  confirmed: { label: 'Confirmada',     color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
  completed: { label: 'Completada',     color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  cancelled: { label: 'Cancelada',      color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  no_show:   { label: 'No presentado',  color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
}

function Sheet({ onClose, children }) {
  return (
    <div onClick={onClose} className="sheet-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <div onClick={e => e.stopPropagation()} className="sheet-content" style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', padding: '0 0 env(safe-area-inset-bottom, 24px)', width: '100%', maxWidth: 480, boxShadow: '0 -8px 40px rgba(0,0,0,0.15)', maxHeight: '92dvh', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.08)', margin: '16px auto 0', position: 'sticky', top: 0 }} />
        {children}
      </div>
    </div>
  )
}

// ── Client Profile Sheet ──────────────────────────────────────────────────────
function ClientSheet({ booking, onClose }) {
  const clientId = booking.profiles?.id ?? booking.client_id

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['client-history', clientId],
    queryFn: () => api.get(`/bookings/professional?client_id=${clientId}`).then(r => r.data.data ?? []),
    enabled: !!clientId,
  })

  const history = historyData ?? []
  const totalSpent = history.filter(b => b.status === 'completed').reduce((acc, b) => acc + (b.total_price ?? 0), 0)
  const totalVisits = history.filter(b => b.status === 'completed').length

  const initials = booking.profiles?.full_name?.slice(0, 2).toUpperCase() ?? 'CL'

  return (
    <Sheet onClose={onClose}>
      <div style={{ padding: '20px', overflowX: 'hidden', boxSizing: 'border-box' }}>
	<GCalDisconnectedBanner />
        {/* Header cliente */}
        <div className="anim-fadeup" style={{ animationDelay: '0.05s', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#1A0F05,#2C1810)', border: '2px solid rgba(184,131,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {booking.profiles?.avatar_url
              ? <img src={booking.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#D4A055', fontWeight: 700 }}>{initials}</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#1A1612', margin: 0, marginBottom: 4 }}>{booking.profiles?.full_name}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#B8833A', background: 'rgba(184,131,58,0.1)', padding: '2px 8px', borderRadius: 999, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{totalVisits} visitas</span>
              <span style={{ fontSize: 11, color: '#16a34a', background: 'rgba(22,163,74,0.08)', padding: '2px 8px', borderRadius: 999, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{totalSpent}€ gastados</span>
            </div>
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="anim-fadeup" style={{ animationDelay: '0.12s', background: '#FAFAF9', borderRadius: 14, padding: '14px 16px', marginBottom: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,22,18,0.4)', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Contacto</p>
          {booking.profiles?.phone && (
            <>
              <a href={`tel:${booking.profiles.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, textDecoration: 'none' }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>📞</span>
                <div>
                  <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Teléfono</p>
                  <p style={{ fontSize: 14, color: '#1A1612', margin: 0, fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>{booking.profiles.phone}</p>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#16a34a', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Llamar →</span>
              </a>
              <a href={`https://wa.me/${booking.profiles.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, textDecoration: 'none', background: 'rgba(37,211,102,0.07)', borderRadius: 10, padding: '8px 10px' }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#25D166', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </span>
                <div>
                  <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>WhatsApp</p>
                  <p style={{ fontSize: 14, color: '#1A1612', margin: 0, fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>{booking.profiles.phone}</p>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#25D166', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Mensaje →</span>
              </a>
            </>
          )}
          {booking.profiles?.email && (
            <a href={`mailto:${booking.profiles.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(184,131,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>✉️</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Email</p>
                <p style={{ fontSize: 13, color: '#1A1612', margin: 0, fontWeight: 600, fontFamily: 'Outfit, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{booking.profiles.email}</p>
              </div>
            </a>
          )}
          {!booking.profiles?.phone && !booking.profiles?.email && (
            <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>Sin datos de contacto</p>
          )}
        </div>

        {/* Historial */}
        <p className="anim-fadeup" style={{ animationDelay: '0.18s', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,22,18,0.4)', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>Historial de citas</p>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 56, borderRadius: 12, background: 'linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite' }} />)}
          </div>
        ) : history.length === 0 ? (
          <div className="anim-scale" style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(26,22,18,0.3)' }}>
            <p style={{ fontSize: 24, marginBottom: 6 }}>📋</p>
            <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>Sin historial aún</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
            {history.map((b, idx) => {
              const st = STATUS[b.status] ?? STATUS.pending
              return (
                <div key={b.id} className="anim-fadeup" style={{ animationDelay: `${0.2 + idx * 0.04}s`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#FAFAF9', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1612', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{b.services?.name}</p>
                    <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{format(new Date(b.starts_at), "d MMM yyyy · HH:mm", { locale: es })}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, color: st.color, background: st.bg, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{st.label}</span>
                    <span style={{ fontSize: 12, color: '#B8833A', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}>{b.total_price}€</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
      <div style={{ padding: '20px' }}>
        <p className="anim-fadeup" style={{ animationDelay: '0.05s', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 2, fontFamily: 'Outfit, sans-serif' }}>💬 Notas · {booking.profiles?.full_name}</p>
        <p className="anim-fadeup" style={{ animationDelay: '0.08s', fontSize: 12, color: 'rgba(26,22,18,0.35)', marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>{booking.services?.name} · {format(new Date(booking.starts_at), "d MMM · HH:mm", { locale: es })}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, minHeight: 60, maxHeight: 240, overflowY: 'auto' }}>
          {messages.length === 0 ? (
            <div className="anim-scale" style={{ textAlign: 'center', padding: '16px 0', color: 'rgba(26,22,18,0.25)' }}>
              <p style={{ fontSize: 26, marginBottom: 6 }}>💬</p>
              <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>Sin notas aún</p>
            </div>
          ) : messages.map((m, i) => (
            <div key={i} className={m.isPro ? 'anim-slide-right' : 'anim-slide-left'} style={{ animationDelay: `${0.1 + i * 0.05}s`, alignSelf: m.isPro ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <p style={{ fontSize: 10, color: 'rgba(26,22,18,0.35)', margin: '0 0 3px', fontFamily: 'Outfit, sans-serif', textAlign: m.isPro ? 'right' : 'left' }}>{m.author}{m.time && ` · ${m.time}`}</p>
              <div style={{ background: m.isPro ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#F7F5F2', borderRadius: m.isPro ? '14px 4px 14px 14px' : '4px 14px 14px 14px', padding: '10px 14px' }}>
                <p style={{ margin: 0, fontSize: 14, color: m.isPro ? '#FFFFFF' : '#1A1612', fontFamily: 'Outfit, sans-serif', lineHeight: 1.4 }}>{m.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="anim-fadeup" style={{ animationDelay: '0.15s', display: 'flex', gap: 10, alignItems: 'flex-end', width: '100%' }}>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Escribe una nota para el cliente..." maxLength={500} rows={2}
            style={{ flex: 1, minWidth: 0, background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '11px 14px', fontSize: 14, fontFamily: 'Outfit, sans-serif', resize: 'none', outline: 'none', color: '#1A1612', boxSizing: 'border-box' }} />
          <button onClick={() => { if (!text.trim()) return; onSend(text.trim()); setText('') }} disabled={isLoading || !text.trim()}
            style={{ width: 46, height: 46, minWidth: 46, borderRadius: '50%', background: text.trim() ? 'linear-gradient(135deg,#B8833A,#D4A055)' : 'rgba(184,131,58,0.15)', border: 'none', color: '#FFFFFF', fontSize: 20, cursor: text.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >↑</button>
        </div>
      </div>
    </Sheet>
  )
}

function RescheduleModal({ booking, onClose, onConfirm, isLoading }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('sv-SE'))
  const [selectedSlot, setSelectedSlot] = useState(null)

  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ['reschedule-slots', booking.professional_id, booking.service_id, selectedDate],
    queryFn: () => bookingsApi.getSlots({ professional_id: booking.professional_id, service_id: booking.service_id, date: selectedDate }).then(r => r.data.data ?? []),
    enabled: !!selectedDate,
  })

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i)
    return { iso: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE d', { locale: es }) }
  })

  const freeSlots = (slotsData ?? []).filter(s => s.available)

  return (
    <Sheet onClose={onClose}>
      <div style={{ padding: '20px' }}>
        <p className="anim-fadeup" style={{ animationDelay: '0.05s', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 2, fontFamily: 'Outfit, sans-serif' }}>🔄 Reprogramar cita</p>
        <p className="anim-fadeup" style={{ animationDelay: '0.08s', fontSize: 13, color: '#1A1612', fontWeight: 600, marginBottom: 2, fontFamily: 'Outfit, sans-serif' }}>{booking.profiles?.full_name} · {booking.services?.name}</p>
        <p className="anim-fadeup" style={{ animationDelay: '0.11s', fontSize: 12, color: 'rgba(26,22,18,0.4)', marginBottom: 18, fontFamily: 'Outfit, sans-serif' }}>
          Actual: {format(new Date(booking.starts_at), "EEEE d MMM · HH:mm", { locale: es })}
        </p>
        <p className="anim-fadeup" style={{ animationDelay: '0.14s', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,22,18,0.4)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>Selecciona día</p>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
          {days.map((d, i) => (
            <button key={d.iso} onClick={() => { setSelectedDate(d.iso); setSelectedSlot(null) }}
              className="anim-fadeup"
              style={{ animationDelay: `${0.16 + i * 0.025}s`, flexShrink: 0, padding: '8px 14px', borderRadius: 12, border: `1.5px solid ${selectedDate === d.iso ? '#B8833A' : 'rgba(0,0,0,0.1)'}`, background: selectedDate === d.iso ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#FFFFFF', color: selectedDate === d.iso ? '#FFFFFF' : '#1A1612', fontSize: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', transition: 'transform 0.15s, border-color 0.2s, background 0.2s' }}>
              {d.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,22,18,0.4)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>
          Horas libres {loadingSlots && <span style={{ color: '#B8833A' }}>· cargando...</span>}
        </p>
        {!loadingSlots && freeSlots.length === 0 ? (
          <div className="anim-scale" style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(26,22,18,0.3)' }}>
            <p style={{ fontSize: 24, marginBottom: 6 }}>😔</p>
            <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>Sin huecos ese día</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16, maxHeight: 180, overflowY: 'auto' }}>
            {freeSlots.map((slot, i) => {
              const time = slot.starts_at.slice(11, 16)
              const isSelected = selectedSlot?.starts_at === slot.starts_at
              return (
                <button key={slot.starts_at} onClick={() => setSelectedSlot(slot)}
                  className="anim-scale slot-btn"
                  style={{ animationDelay: `${0.05 + i * 0.02}s`, padding: '10px 4px', borderRadius: 12, border: `1.5px solid ${isSelected ? '#B8833A' : 'rgba(0,0,0,0.1)'}`, background: isSelected ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#F7F5F2', color: isSelected ? '#FFFFFF' : '#1A1612', fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: 600, cursor: 'pointer', textAlign: 'center', transition: 'transform 0.15s, border-color 0.2s, background 0.2s' }}>
                  {time}
                </button>
              )
            })}
          </div>
        )}
        {selectedSlot && (
          <div className="anim-scale" style={{ background: 'rgba(184,131,58,0.06)', border: '1.5px solid rgba(184,131,58,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#B8833A', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              Nueva hora: {format(new Date(selectedSlot.starts_at), "EEEE d MMM · HH:mm", { locale: es })}
            </p>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '13px 0', color: 'rgba(26,22,18,0.4)', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => selectedSlot && onConfirm(selectedSlot.starts_at)} disabled={!selectedSlot || isLoading}
            style={{ flex: 2, background: selectedSlot ? 'linear-gradient(135deg,#B8833A,#D4A055)' : 'rgba(184,131,58,0.15)', border: 'none', borderRadius: 12, padding: '13px 0', color: '#FFFFFF', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: selectedSlot ? 'pointer' : 'not-allowed', transition: 'transform 0.15s' }}>
            {isLoading ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Guardando...</span> : '✓ Confirmar nueva hora'}
          </button>
        </div>
      </div>
    </Sheet>
  )
}

export default function ProDashboardPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [rescheduleBooking, setRescheduleBooking] = useState(null)
  const [notesBooking, setNotesBooking] = useState(null)
  const [clientBooking, setClientBooking] = useState(null)
  const [showRevenueChart, setShowRevenueChart] = useState(true)
  const today = new Date().toLocaleDateString('sv-SE')

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['pro-stats'],
    queryFn: () => profApi.getStats().then(r => r.data.data),
  })

  const { data: myReviews } = useQuery({
    queryKey: ['pro-reviews'],
    queryFn: () => api.get('/professionals/me/reviews').then(r => r.data.data),
  })

  const { data: bookingsToday, isLoading: loadingToday } = useQuery({
    queryKey: ['pro-bookings-today'],
    queryFn: () => bookingsApi.getPro({ date: today }).then(r => r.data.data),
  })

  const { data: upcomingRaw } = useQuery({
    queryKey: ['pro-bookings-upcoming'],
    queryFn: () => bookingsApi.getPro({ status: 'confirmed' }).then(r => r.data.data),
  })
  // Solo citas futuras (starts_at >= ahora)
  const now = new Date()
  const upcoming = upcomingRaw?.filter(b => new Date(b.starts_at) > now)

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
      toast.success('Cita completada ✓')
      queryClient.invalidateQueries({ queryKey: ['pro-bookings-today'] })
      queryClient.invalidateQueries({ queryKey: ['pro-bookings-upcoming'] })
      queryClient.invalidateQueries({ queryKey: ['pro-stats'] })
    },
    onError: () => toast.error('Error al completar'),
  })

  const { mutate: noShowBooking } = useMutation({
    mutationFn: (id) => api.patch(`/bookings/${id}/no-show`),
    onSuccess: () => {
      toast.success('Marcado como no presentado')
      queryClient.invalidateQueries({ queryKey: ['pro-bookings-today'] })
      queryClient.invalidateQueries({ queryKey: ['pro-bookings-upcoming'] })
      queryClient.invalidateQueries({ queryKey: ['pro-stats'] })
    },
    onError: () => toast.error('Error al actualizar'),
  })

  const { mutate: doReschedule, isPending: rescheduling } = useMutation({
    mutationFn: ({ id, starts_at }) => bookingsApi.reschedule(id, starts_at),
    onSuccess: () => {
      toast.success('Cita reprogramada ✓')
      setRescheduleBooking(null)
      queryClient.invalidateQueries({ queryKey: ['pro-bookings-today'] })
      queryClient.invalidateQueries({ queryKey: ['pro-bookings-upcoming'] })
    },
    onError: err => toast.error(err.response?.data?.error ?? 'Error al reprogramar'),
  })

  const { mutate: sendNote, isPending: noteSending } = useMutation({
    mutationFn: ({ id, note }) => bookingsApi.addNote(id, note),
    onSuccess: (res) => {
      toast.success('Nota añadida ✓')
      setNotesBooking(prev => prev ? { ...prev, notes: res.data.data.notes } : null)
      queryClient.invalidateQueries({ queryKey: ['pro-bookings-today'] })
      queryClient.invalidateQueries({ queryKey: ['pro-bookings-upcoming'] })
    },
    onError: err => toast.error(err.response?.data?.error ?? 'Error'),
  })

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const weekData = stats?.bookings_by_day
    ? Object.entries(stats.bookings_by_day).slice(-7).map(([date, count]) => ({
        day: format(new Date(date), 'EEE', { locale: es }),
        count,
      }))
    : []
  const maxCount = Math.max(...weekData.map(d => d.count), 1)

  // Booking card — reutilizable para hoy y próximas
  const BookingCard = ({ b, compact = false, index = 0 }) => {
    const st = STATUS[b.status] ?? STATUS.pending
    const isPast = new Date(b.ends_at) < new Date()
    return (
      <div className="booking-card anim-fadeup" style={{ animationDelay: `${0.1 + index * 0.05}s`, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: compact ? '12px 14px' : '14px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Avatar — tap abre perfil cliente */}
          <button onClick={() => setClientBooking(b)} style={{ width: compact ? 32 : 38, height: compact ? 32 : 38, borderRadius: '50%', overflow: 'hidden', background: 'rgba(184,131,58,0.08)', border: '1.5px solid rgba(184,131,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', padding: 0, transition: 'transform 0.15s' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {b.profiles?.avatar_url
              ? <img src={b.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: compact ? '0.85rem' : '1rem', color: '#B8833A' }}>{b.profiles?.full_name?.[0]?.toUpperCase()}</span>
            }
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1A1612', fontFamily: 'Outfit, sans-serif' }}>{b.services?.name}</p>
            <button onClick={() => setClientBooking(b)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
              <p style={{ fontSize: 11, color: '#B8833A', fontFamily: 'Outfit, sans-serif', margin: 0, textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
                {b.profiles?.full_name} · {compact
                  ? format(new Date(b.starts_at), "d MMM · HH:mm", { locale: es })
                  : `${format(new Date(b.starts_at), 'HH:mm')}–${format(new Date(b.ends_at), 'HH:mm')}`
                }
              </p>
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 100, color: st.color, background: st.bg, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{st.label}</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#B8833A' }}>{b.total_price}€</span>
          </div>
        </div>
        {/* Nota del cliente al reservar */}
        {b.notes && (() => {
          // La primera línea sin timestamp es la nota original del cliente
          const clientNote = b.notes.split('\n---\n')[0]?.replace(/^\[.*?\]\n/, '').trim()
          return clientNote ? (
            <div style={{ marginTop: 8, background: 'rgba(184,131,58,0.05)', border: '1px solid rgba(184,131,58,0.15)', borderRadius: 8, padding: '6px 10px', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12, flexShrink: 0 }}>✏️</span>
              <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.6)', margin: 0, fontFamily: 'Outfit, sans-serif', fontStyle: 'italic', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clientNote}</p>
            </div>
          ) : null
        })()}
        {b.status === 'confirmed' && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
            {isPast && <button className="complete-btn action-btn" onClick={() => completeBooking(b.id)} style={{ flex: 1, minWidth: 70, background: 'rgba(37,99,235,0.06)', border: '1.5px solid rgba(37,99,235,0.2)', borderRadius: 8, padding: '7px 4px', fontSize: 12, color: '#2563eb', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', fontWeight: 600 }}>✓ OK</button>}
            {isPast && <button className="noshow-btn action-btn" onClick={() => { if (confirm('¿Marcar como no presentado?')) noShowBooking(b.id) }} style={{ flex: 1, minWidth: 50, background: 'rgba(245,158,11,0.05)', border: '1.5px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '7px 4px', fontSize: 12, color: '#d97706', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', fontWeight: 600 }}>👻</button>}
            <button className="action-btn" onClick={() => setNotesBooking(b)} style={{ flex: 1, minWidth: 50, background: b.notes ? 'rgba(184,131,58,0.06)' : 'transparent', border: `1.5px solid ${b.notes ? 'rgba(184,131,58,0.2)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 8, padding: '7px 4px', fontSize: 12, color: b.notes ? '#B8833A' : 'rgba(26,22,18,0.4)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, transition: 'all 0.2s' }}>💬</button>
            <button className="action-btn" onClick={() => setRescheduleBooking(b)} style={{ flex: 1, minWidth: 50, background: 'rgba(184,131,58,0.04)', border: '1.5px solid rgba(184,131,58,0.18)', borderRadius: 8, padding: '7px 4px', fontSize: 12, color: '#B8833A', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, transition: 'all 0.2s' }}>🔄</button>
            <button className="cancel-btn action-btn" onClick={() => { if (confirm('¿Cancelar esta cita?')) cancelBooking(b.id) }} style={{ flex: 1, minWidth: 50, background: 'rgba(220,38,38,0.05)', border: '1.5px solid rgba(220,38,38,0.15)', borderRadius: 8, padding: '7px 4px', fontSize: 12, color: '#dc2626', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', fontWeight: 600 }}>✕</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh', paddingBottom: 80 }}>
      <style>{`
        .nav-btn:hover { background: rgba(184,131,58,0.08) !important; border-color: rgba(184,131,58,0.3) !important; color: #B8833A !important; }
        .booking-card { transition: box-shadow 0.25s, border-color 0.25s, transform 0.25s; }
        .booking-card:hover { border-color: rgba(184,131,58,0.2) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.06) !important; transform: translateY(-1px); }
        .kpi-card { transition: transform 0.25s, box-shadow 0.25s; }
        .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(0,0,0,0.1) !important; }
        .complete-btn:hover { background: rgba(37,99,235,0.1) !important; border-color: rgba(37,99,235,0.3) !important; }
        .cancel-btn:hover { background: rgba(220,38,38,0.08) !important; border-color: rgba(220,38,38,0.3) !important; }
        .noshow-btn:hover { background: rgba(245,158,11,0.1) !important; border-color: rgba(245,158,11,0.35) !important; }
        .action-btn:active { transform: scale(0.94); }
        .slot-btn:active { transform: scale(0.94); }

        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.9) } to { opacity: 1; transform: scale(1) } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes slideUpSheet { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes fadeInBackdrop { from { opacity: 0 } to { opacity: 1 } }
        @keyframes growBar { from { height: 4px; opacity: 0.4 } to { height: var(--bar-h); opacity: 1 } }

        .anim-fadeup { animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both }
        .anim-scale { animation: fadeInScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both }
        .anim-slide-left { animation: slideInLeft 0.4s ease-out both }
        .anim-slide-right { animation: slideInRight 0.4s ease-out both }
        .anim-bar { animation: growBar 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both }

        .sheet-backdrop { animation: fadeInBackdrop 0.25s ease-out both; }
        .sheet-content { animation: slideUpSheet 0.4s cubic-bezier(0.32, 0.72, 0.32, 1) both; }

        @media (prefers-reduced-motion: reduce) {
          .anim-fadeup, .anim-scale, .anim-slide-left, .anim-slide-right, .anim-bar,
          .sheet-backdrop, .sheet-content { animation: none !important; opacity: 1 !important; transform: none !important; }
        }

        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .main-grid { grid-template-columns: 1fr !important; }
          .quick-nav { display: none !important; }
        }
      `}</style>

      {rescheduleBooking && <RescheduleModal booking={rescheduleBooking} onClose={() => setRescheduleBooking(null)} onConfirm={(starts_at) => doReschedule({ id: rescheduleBooking.id, starts_at })} isLoading={rescheduling} />}
      {notesBooking && <NotesModal booking={notesBooking} onClose={() => setNotesBooking(null)} onSend={(note) => sendNote({ id: notesBooking.id, note })} isLoading={noteSending} />}
      {clientBooking && <ClientSheet booking={clientBooking} onClose={() => setClientBooking(null)} />}

      {/* Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '28px 0 22px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div className="container-app">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p className="anim-fadeup" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                <span style={{ display: 'inline-block', width: 20, height: 1.5, background: '#B8833A', borderRadius: 1 }} /> Panel profesional
              </p>
              <h1 className="anim-fadeup" style={{ animationDelay: '0.08s', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 300, lineHeight: 1.1, color: '#1A1612' }}>
                {greeting()},<br /><em style={{ color: '#B8833A' }}>{user?.full_name?.split(' ')[0]}</em>
              </h1>
              <p className="anim-fadeup" style={{ animationDelay: '0.14s', color: 'rgba(26,22,18,0.4)', fontSize: 12, marginTop: 6, fontFamily: 'Outfit, sans-serif' }}>
                {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
            <div className="quick-nav" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { to: '/pro/profile', icon: '⚙️', label: 'Perfil' },
                { to: '/pro/services', icon: '✂️', label: 'Servicios' },
                { to: '/pro/availability', icon: '🕐', label: 'Horarios' },
                { to: '/pro/waitlist', icon: '⏳', label: 'Espera' },
              ].map(({ to, icon, label }, i) => (
                <Link
                  key={to}
                  to={to}
                  className="nav-btn anim-fadeup"
                  style={{
                    animationDelay: `${0.2 + i * 0.05}s`,
                    textDecoration: 'none',
                    fontSize: 12,
                    padding: '9px 16px',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                    background: '#F7F5F2',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    color: 'rgba(26,22,18,0.55)',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 500
                  }}
                >
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
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 18 }} />)}
          </div>
        ) : stats && (
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Ingresos mes', value: `${stats.revenue_this_month ?? 0}€`, icon: '💶', accent: true, delta: 'este mes' },
              { label: 'Próximas', value: stats.upcoming_bookings ?? 0, icon: '📅', delta: 'confirmadas' },
              { label: 'Completadas', value: stats.completed ?? 0, icon: '✅', delta: 'total' },
              { label: 'Valoración', value: stats.avg_rating || '—', icon: '⭐', delta: `${stats.total_reviews ?? 0} reseñas` },
            ].map((kpi, i) => (
              <div key={i} className="kpi-card anim-fadeup" style={{ animationDelay: `${i * 0.08}s`, background: kpi.accent ? 'linear-gradient(135deg, rgba(184,131,58,0.08), rgba(184,131,58,0.03))' : '#FFFFFF', border: `1.5px solid ${kpi.accent ? 'rgba(184,131,58,0.2)' : 'rgba(0,0,0,0.07)'}`, borderRadius: 18, padding: '18px 16px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <div style={{ position: 'absolute', top: 14, right: 14, fontSize: '1.4rem', opacity: 0.15 }}>{kpi.icon}</div>
                <p style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.35)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>{kpi.label}</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 300, color: kpi.accent ? '#B8833A' : '#1A1612', lineHeight: 1, marginBottom: 4 }}>{kpi.value}</p>
                <p style={{ fontSize: 10, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>{kpi.delta}</p>
              </div>
            ))}
          </div>
        )}

        {/* Gráfico de ingresos por mes */}
        {stats?.revenue_by_month && (() => {
          const maxRev = Math.max(...stats.revenue_by_month.map(m => m.revenue), 1)
          return (
            <div className="anim-fadeup" style={{ animationDelay: '0.35s', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 18, padding: '20px 20px 16px', marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showRevenueChart ? 16 : 0 }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600, margin: 0 }}>
                  <span style={{ display: 'inline-block', width: 16, height: 1.5, background: '#B8833A' }} /> Ingresos últimos 6 meses
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#B8833A', fontStyle: 'italic' }}>
                    {stats.revenue_by_month.reduce((s, m) => s + m.revenue, 0).toFixed(0)}€ total
                  </span>
                  <button onClick={() => setShowRevenueChart(!showRevenueChart)} style={{ background: 'none', border: '1px solid rgba(184,131,58,0.2)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#B8833A', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, transition: 'background 0.2s' }}>
                    {showRevenueChart ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>
              {showRevenueChart && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 72 }}>
                  {stats.revenue_by_month.map((m, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      {m.revenue > 0 && (
                        <span style={{ fontSize: 9, color: '#B8833A', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{m.revenue.toFixed(0)}€</span>
                      )}
                      <div className="anim-bar" style={{ '--bar-h': `${Math.max((m.revenue / maxRev) * 52, m.revenue > 0 ? 10 : 4)}px`, animationDelay: `${0.5 + i * 0.08}s`, width: '100%', background: m.revenue > 0 ? 'linear-gradient(180deg, #B8833A, rgba(184,131,58,0.25))' : '#EFEDE9', borderRadius: '5px 5px 0 0', height: `${Math.max((m.revenue / maxRev) * 52, m.revenue > 0 ? 10 : 4)}px` }} />
                      <span style={{ fontSize: 9, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{m.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })()}

        {/* Mini chart de citas últimos 7 días */}
        {weekData.length > 0 && (
          <div className="anim-fadeup" style={{ animationDelay: '0.42s', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 18, padding: '20px 20px 16px', marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              <span style={{ display: 'inline-block', width: 16, height: 1.5, background: '#B8833A' }} /> Citas últimos 7 días
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 60 }}>
              {weekData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div className="anim-bar" style={{ '--bar-h': `${Math.max((d.count / maxCount) * 48, d.count > 0 ? 8 : 4)}px`, animationDelay: `${0.6 + i * 0.06}s`, width: '100%', background: d.count > 0 ? 'linear-gradient(180deg, #B8833A, rgba(184,131,58,0.3))' : '#EFEDE9', borderRadius: '4px 4px 0 0', height: `${Math.max((d.count / maxCount) * 48, d.count > 0 ? 8 : 4)}px` }} />
                  <span style={{ fontSize: 9, color: 'rgba(26,22,18,0.3)', textTransform: 'capitalize', fontFamily: 'Outfit, sans-serif' }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Citas hoy */}
          <div>
            <div className="anim-fadeup" style={{ animationDelay: '0.5s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#B8833A', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                <span style={{ display: 'inline-block', width: 16, height: 1.5, background: '#B8833A' }} /> Citas hoy
              </p>
              <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>{format(new Date(), "d MMM", { locale: es })}</span>
            </div>
            {loadingToday ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
              </div>
            ) : !bookingsToday?.length ? (
              <div className="anim-scale" style={{ animationDelay: '0.55s', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: '36px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '2rem', marginBottom: 8 }}>☀️</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(26,22,18,0.3)' }}>Sin citas hoy</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bookingsToday.map((b, i) => <BookingCard key={b.id} b={b} index={i} />)}
              </div>
            )}
          </div>

          {/* Próximas */}
          <div>
            <div className="anim-fadeup" style={{ animationDelay: '0.55s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#B8833A', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                <span style={{ display: 'inline-block', width: 16, height: 1.5, background: '#B8833A' }} /> Próximas
              </p>
              <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>{upcoming?.length ?? 0} confirmadas</span>
            </div>
            {!upcoming?.length ? (
              <div className="anim-scale" style={{ animationDelay: '0.6s', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: '36px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '2rem', marginBottom: 8 }}>📭</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(26,22,18,0.3)' }}>Sin próximas citas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcoming.slice(0, 8).map((b, i) => <BookingCard key={b.id} b={b} compact index={i} />)}
              </div>
            )}
          </div>
        </div>

        {/* Reseñas */}
        {myReviews?.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <p className="anim-fadeup" style={{ animationDelay: '0.65s', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#B8833A', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600, marginBottom: 14 }}>
              <span style={{ display: 'inline-block', width: 16, height: 1.5, background: '#B8833A' }} /> Reseñas de clientes
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myReviews.map((r, i) => (
                <div key={r.id} className="anim-fadeup" style={{ animationDelay: `${0.7 + i * 0.06}s`, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.25s, transform 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#1A0F05,#2C1810)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {r.profiles?.avatar_url
                        ? <img src={r.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#D4A055', fontWeight: 700 }}>{r.profiles?.full_name?.slice(0,2).toUpperCase() ?? 'CL'}</span>
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1612', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{r.profiles?.full_name ?? 'Cliente'}</p>
                      <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.35)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{format(new Date(r.created_at), "d MMM yyyy", { locale: es })}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(idx => (
                        <span key={idx} style={{ fontSize: 14, color: idx <= r.rating ? '#F59E0B' : '#E5E7EB' }}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.65)', margin: 0, fontFamily: 'Outfit, sans-serif', lineHeight: 1.5, fontStyle: 'italic' }}>"{r.comment}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
