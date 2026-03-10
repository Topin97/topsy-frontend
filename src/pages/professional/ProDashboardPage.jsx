import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profApi, bookingsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../services/api'

const STATUS = {
  pending:   { label: 'Pendiente',  color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  confirmed: { label: 'Confirmada', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
  completed: { label: 'Completada', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  cancelled: { label: 'Cancelada',  color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
}

// ── Shared sheet ──────────────────────────────────────────────────────────────
function Sheet({ onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', padding: '0 0 40px', width: '100%', maxWidth: 480, boxShadow: '0 -8px 40px rgba(0,0,0,0.15)', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.08)', margin: '16px auto 0', position: 'sticky', top: 0 }} />
        {children}
      </div>
    </div>
  )
}

// ── Notes modal ───────────────────────────────────────────────────────────────
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
      <div style={{ padding: '20px 20px 0' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 2, fontFamily: 'Outfit, sans-serif' }}>💬 Notas · {booking.profiles?.full_name}</p>
        <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>{booking.services?.name} · {format(new Date(booking.starts_at), "d MMM · HH:mm", { locale: es })}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, minHeight: 60, maxHeight: 240, overflowY: 'auto' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0', color: 'rgba(26,22,18,0.25)' }}>
              <p style={{ fontSize: 26, marginBottom: 6 }}>💬</p>
              <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>Sin notas aún</p>
            </div>
          ) : messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.isPro ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <p style={{ fontSize: 10, color: 'rgba(26,22,18,0.35)', margin: '0 0 3px', fontFamily: 'Outfit, sans-serif', textAlign: m.isPro ? 'right' : 'left' }}>{m.author}{m.time && ` · ${m.time}`}</p>
              <div style={{ background: m.isPro ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#F7F5F2', borderRadius: m.isPro ? '14px 4px 14px 14px' : '4px 14px 14px 14px', padding: '10px 14px' }}>
                <p style={{ margin: 0, fontSize: 14, color: m.isPro ? '#FFFFFF' : '#1A1612', fontFamily: 'Outfit, sans-serif', lineHeight: 1.4 }}>{m.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Escribe una nota para el cliente..." maxLength={500} rows={2}
            style={{ flex: 1, background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '11px 14px', fontSize: 14, fontFamily: 'Outfit, sans-serif', resize: 'none', outline: 'none', color: '#1A1612' }} />
          <button onClick={() => { if (!text.trim()) return; onSend(text.trim()); setText('') }} disabled={isLoading || !text.trim()}
            style={{ width: 46, height: 46, borderRadius: '50%', background: text.trim() ? 'linear-gradient(135deg,#B8833A,#D4A055)' : 'rgba(184,131,58,0.15)', border: 'none', color: '#FFFFFF', fontSize: 20, cursor: text.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
        </div>
      </div>
    </Sheet>
  )
}

// ── Reschedule modal ──────────────────────────────────────────────────────────
function RescheduleModal({ booking, onClose, onConfirm, isLoading }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedSlot, setSelectedSlot] = useState(null)

  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ['reschedule-slots', booking.professional_id, booking.service_id, selectedDate],
    queryFn: () => bookingsApi.getSlots({ professional_id: booking.professional_id, service_id: booking.service_id, date: selectedDate }).then(r => r.data.data ?? []),
    enabled: !!selectedDate,
  })

  // Generate next 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i)
    return { iso: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE d', { locale: es }) }
  })

  const freeSlots = (slotsData ?? []).filter(s => s.available)

  return (
    <Sheet onClose={onClose}>
      <div style={{ padding: '20px 20px 0' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 2, fontFamily: 'Outfit, sans-serif' }}>🔄 Reprogramar cita</p>
        <p style={{ fontSize: 13, color: '#1A1612', fontWeight: 600, marginBottom: 2, fontFamily: 'Outfit, sans-serif' }}>{booking.profiles?.full_name} · {booking.services?.name}</p>
        <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.4)', marginBottom: 18, fontFamily: 'Outfit, sans-serif' }}>
          Actual: {format(new Date(booking.starts_at), "EEEE d MMM · HH:mm", { locale: es })}
        </p>

        {/* Day picker - scroll horizontal */}
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,22,18,0.4)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>Selecciona día</p>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
          {days.map(d => (
            <button key={d.iso} onClick={() => { setSelectedDate(d.iso); setSelectedSlot(null) }}
              style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 12, border: `1.5px solid ${selectedDate === d.iso ? '#B8833A' : 'rgba(0,0,0,0.1)'}`, background: selectedDate === d.iso ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#FFFFFF', color: selectedDate === d.iso ? '#FFFFFF' : '#1A1612', fontSize: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
              {d.label}
            </button>
          ))}
        </div>

        {/* Time slots */}
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,22,18,0.4)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>
          Horas libres {loadingSlots && <span style={{ color: '#B8833A' }}>·  cargando...</span>}
        </p>

        {!loadingSlots && freeSlots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(26,22,18,0.3)' }}>
            <p style={{ fontSize: 24, marginBottom: 6 }}>😔</p>
            <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>Sin huecos ese día</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16, maxHeight: 180, overflowY: 'auto' }}>
            {freeSlots.map(slot => {
              const time = slot.starts_at.slice(11, 16)
              const isSelected = selectedSlot?.starts_at === slot.starts_at
              return (
                <button key={slot.starts_at} onClick={() => setSelectedSlot(slot)}
                  style={{ padding: '10px 4px', borderRadius: 12, border: `1.5px solid ${isSelected ? '#B8833A' : 'rgba(0,0,0,0.1)'}`, background: isSelected ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#F7F5F2', color: isSelected ? '#FFFFFF' : '#1A1612', fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>
                  {time}
                </button>
              )
            })}
          </div>
        )}

        {selectedSlot && (
          <div style={{ background: 'rgba(184,131,58,0.06)', border: '1.5px solid rgba(184,131,58,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#B8833A', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              Nueva hora: {format(new Date(selectedSlot.starts_at), "EEEE d MMM · HH:mm", { locale: es })}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '13px 0', color: 'rgba(26,22,18,0.4)', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => selectedSlot && onConfirm(selectedSlot.starts_at)} disabled={!selectedSlot || isLoading}
            style={{ flex: 2, background: selectedSlot ? 'linear-gradient(135deg,#B8833A,#D4A055)' : 'rgba(184,131,58,0.15)', border: 'none', borderRadius: 12, padding: '13px 0', color: '#FFFFFF', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: selectedSlot ? 'pointer' : 'not-allowed' }}>
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
      toast.success('Cita completada ✓')
      queryClient.invalidateQueries({ queryKey: ['pro-bookings-today'] })
      queryClient.invalidateQueries({ queryKey: ['pro-stats'] })
    },
    onError: () => toast.error('Error al completar'),
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

  return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh', paddingBottom: 60 }}>
      <style>{`
        .nav-btn:hover { background: rgba(184,131,58,0.08) !important; border-color: rgba(184,131,58,0.3) !important; color: #B8833A !important; }
        .booking-card { transition: box-shadow 0.2s, border-color 0.2s; }
        .booking-card:hover { border-color: rgba(184,131,58,0.2) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.06) !important; }
        .kpi-card { transition: transform 0.2s, box-shadow 0.2s; }
        .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.09) !important; }
        .complete-btn:hover { background: rgba(37,99,235,0.1) !important; border-color: rgba(37,99,235,0.3) !important; }
        .cancel-btn:hover { background: rgba(220,38,38,0.08) !important; border-color: rgba(220,38,38,0.3) !important; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .main-grid { grid-template-columns: 1fr !important; }
          .quick-nav { display: none !important; }
        }
      `}</style>

      {/* ── Reschedule modal ── */}
      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          onConfirm={(starts_at) => doReschedule({ id: rescheduleBooking.id, starts_at })}
          isLoading={rescheduling}
        />
      )}
      {/* ── Notes modal ── */}
      {notesBooking && (
        <NotesModal
          booking={notesBooking}
          onClose={() => setNotesBooking(null)}
          onSend={(note) => sendNote({ id: notesBooking.id, note })}
          isLoading={noteSending}
        />
      )}

      {/* Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '28px 0 22px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div className="container-app">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                <span style={{ display: 'inline-block', width: 20, height: 1.5, background: '#B8833A', borderRadius: 1 }} /> Panel profesional
              </p>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 300, lineHeight: 1.1, color: '#1A1612' }}>
                {greeting()},<br /><em style={{ color: '#B8833A' }}>{user?.full_name?.split(' ')[0]}</em>
              </h1>
              <p style={{ color: 'rgba(26,22,18,0.4)', fontSize: 12, marginTop: 6, fontFamily: 'Outfit, sans-serif' }}>
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
                  background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.1)',
                  color: 'rgba(26,22,18,0.55)', fontFamily: 'Outfit, sans-serif', fontWeight: 500,
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
                background: kpi.accent ? 'linear-gradient(135deg, rgba(184,131,58,0.08), rgba(184,131,58,0.03))' : '#FFFFFF',
                border: `1.5px solid ${kpi.accent ? 'rgba(184,131,58,0.2)' : 'rgba(0,0,0,0.07)'}`,
                borderRadius: 18, padding: '18px 16px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              }}>
                <div style={{ position: 'absolute', top: 14, right: 14, fontSize: '1.4rem', opacity: 0.15 }}>{kpi.icon}</div>
                <p style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.35)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>{kpi.label}</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 300, color: kpi.accent ? '#B8833A' : '#1A1612', lineHeight: 1, marginBottom: 4 }}>{kpi.value}</p>
                <p style={{ fontSize: 10, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>{kpi.delta}</p>
              </div>
            ))}
          </div>
        )}

        {/* Mini chart */}
        {weekData.length > 0 && (
          <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 18, padding: '20px 20px 16px', marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              <span style={{ display: 'inline-block', width: 16, height: 1.5, background: '#B8833A' }} /> Citas últimos 7 días
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 60 }}>
              {weekData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', background: d.count > 0 ? 'linear-gradient(180deg, #B8833A, rgba(184,131,58,0.3))' : '#EFEDE9', borderRadius: '4px 4px 0 0', height: `${Math.max((d.count / maxCount) * 48, d.count > 0 ? 8 : 4)}px`, transition: 'height 0.3s' }} />
                  <span style={{ fontSize: 9, color: 'rgba(26,22,18,0.3)', textTransform: 'capitalize', fontFamily: 'Outfit, sans-serif' }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Citas hoy */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
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
              <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: '36px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '2rem', marginBottom: 8 }}>☀️</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(26,22,18,0.3)' }}>Sin citas hoy</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bookingsToday.map(b => {
                  const st = STATUS[b.status] ?? STATUS.pending
                  const isPast = new Date(b.ends_at) < new Date()
                  return (
                    <div key={b.id} className="booking-card" style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'rgba(184,131,58,0.08)', border: '1.5px solid rgba(184,131,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {b.profiles?.avatar_url
                            ? <img src={b.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#B8833A' }}>{b.profiles?.full_name?.[0]?.toUpperCase()}</span>
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1A1612', fontFamily: 'Outfit, sans-serif' }}>{b.services?.name}</p>
                          <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', fontFamily: 'Outfit, sans-serif' }}>
                            {b.profiles?.full_name} · {format(new Date(b.starts_at), 'HH:mm')}–{format(new Date(b.ends_at), 'HH:mm')}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 100, color: st.color, background: st.bg, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{st.label}</span>
                          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#B8833A' }}>{b.total_price}€</span>
                        </div>
                      </div>
                      {b.status === 'confirmed' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
                          {isPast && (
                            <button className="complete-btn" onClick={() => completeBooking(b.id)} style={{ flex: 1, background: 'rgba(37,99,235,0.06)', border: '1.5px solid rgba(37,99,235,0.2)', borderRadius: 8, padding: '7px', fontSize: 12, color: '#2563eb', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', fontWeight: 600 }}>
                              ✓ Completar
                            </button>
                          )}
                          <button onClick={() => setNotesBooking(b)} style={{ flex: 1, background: b.notes ? 'rgba(184,131,58,0.06)' : 'transparent', border: `1.5px solid ${b.notes ? 'rgba(184,131,58,0.2)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 8, padding: '7px', fontSize: 12, color: b.notes ? '#B8833A' : 'rgba(26,22,18,0.4)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                            💬 {b.notes ? 'Notas' : 'Nota'}
                          </button>
                          <button onClick={() => setRescheduleBooking(b)} style={{ flex: 1, background: 'rgba(184,131,58,0.04)', border: '1.5px solid rgba(184,131,58,0.18)', borderRadius: 8, padding: '7px', fontSize: 12, color: '#B8833A', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                            🔄 Mover
                          </button>
                          <button className="cancel-btn" onClick={() => { if (confirm('¿Cancelar esta cita?')) cancelBooking(b.id) }} style={{ flex: 1, background: 'rgba(220,38,38,0.05)', border: '1.5px solid rgba(220,38,38,0.15)', borderRadius: 8, padding: '7px', fontSize: 12, color: '#dc2626', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', fontWeight: 600 }}>
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
              <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#B8833A', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                <span style={{ display: 'inline-block', width: 16, height: 1.5, background: '#B8833A' }} /> Próximas
              </p>
              <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>{upcoming?.length ?? 0} confirmadas</span>
            </div>

            {!upcoming?.length ? (
              <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: '36px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '2rem', marginBottom: 8 }}>📭</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(26,22,18,0.3)' }}>Sin próximas citas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcoming.slice(0, 8).map(b => (
                  <div key={b.id} className="booking-card" style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: 'rgba(184,131,58,0.08)', border: '1.5px solid rgba(184,131,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {b.profiles?.avatar_url
                        ? <img src={b.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.85rem', color: '#B8833A' }}>{b.profiles?.full_name?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1A1612', fontFamily: 'Outfit, sans-serif' }}>{b.services?.name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', fontFamily: 'Outfit, sans-serif' }}>
                        {b.profiles?.full_name} · {format(new Date(b.starts_at), "d MMM · HH:mm", { locale: es })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#B8833A' }}>{b.total_price}€</span>
                      <button onClick={() => setNotesBooking(b)} style={{ background: b.notes ? 'rgba(184,131,58,0.08)' : 'transparent', border: `1.5px solid ${b.notes ? 'rgba(184,131,58,0.2)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 8, padding: '5px 8px', fontSize: 11, color: b.notes ? '#B8833A' : 'rgba(26,22,18,0.3)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>💬</button>
                      <button onClick={() => setRescheduleBooking(b)} style={{ background: 'rgba(184,131,58,0.04)', border: '1.5px solid rgba(184,131,58,0.18)', borderRadius: 8, padding: '5px 8px', fontSize: 11, color: '#B8833A', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>🔄</button>
                      <button className="cancel-btn" onClick={() => { if (confirm('¿Cancelar esta cita?')) cancelBooking(b.id) }} style={{ background: 'rgba(220,38,38,0.05)', border: '1.5px solid rgba(220,38,38,0.15)', borderRadius: 8, padding: '5px 8px', fontSize: 11, color: '#dc2626', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', fontWeight: 600 }}>
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
    </div>
  )
}
