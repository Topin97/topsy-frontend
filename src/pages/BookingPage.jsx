import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import api, { profApi, bookingsApi } from '../services/api'
import {
  format, addDays, isSameDay, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, addMonths, subMonths,
  isToday, isSameMonth,
} from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

function buildCalendarDays(month) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end   = endOfWeek(endOfMonth(month),     { weekStartsOn: 1 })
  const days  = []
  let cur = start
  while (cur <= end) { days.push(cur); cur = addDays(cur, 1) }
  return days
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const TODAY = new Date(); TODAY.setHours(0,0,0,0)
const slotTime = (isoStr) => isoStr.slice(11, 16)

// ── WaitlistModal ──────────────────────────────────────────────
function WaitlistModal({ date, profName, serviceName, professionalId, serviceId, onClose }) {
  const [timePreference, setTimePreference] = useState('any')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleJoin = async () => {
    setLoading(true)
    try {
      await api.post('/waitlist', { professional_id: professionalId, service_id: serviceId, date: format(date, 'yyyy-MM-dd'), time_preference: timePreference })
      setDone(true)
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Error al apuntarse'
      if (msg.includes('Ya estás')) { toast('Ya estás en la lista de espera para este día', { icon: 'ℹ️' }); onClose() }
      else toast.error(msg)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#FFFFFF', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 480 }}>
        {done ? (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔔</div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 300, marginBottom: 8, color: '#1A1612' }}>¡Apuntado a la<br /><em style={{ color: '#B8833A' }}>lista de espera!</em></h3>
            <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.5)', marginBottom: 28, lineHeight: 1.6 }}>Te avisaremos si se libera un hueco el <strong style={{ color: '#1A1612' }}>{format(date, "d 'de' MMMM", { locale: es })}</strong> en {profName}.</p>
            <button onClick={onClose} style={{ width: '100%', background: 'linear-gradient(135deg,#B8833A,#D4A055)', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#F7F5F2', cursor: 'pointer' }}>Entendido</button>
          </div>
        ) : (
          <>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.06)', margin: '0 auto 24px' }} />
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 300, marginBottom: 6, color: '#1A1612' }}>Lista de <em style={{ color: '#B8833A' }}>espera</em></h3>
            <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.5)', marginBottom: 24, lineHeight: 1.6 }}>
              Te avisaremos si alguien cancela el <strong style={{ color: '#1A1612' }}>{format(date, "d 'de' MMMM", { locale: es })}</strong> en {profName} para <strong style={{ color: '#1A1612' }}>{serviceName}</strong>.
            </p>
            <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.45)', marginBottom: 12 }}>¿Qué turno prefieres?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[
                { value: 'morning', icon: '☀️', label: 'Mañana', desc: 'Primer turno del día' },
                { value: 'afternoon', icon: '🌙', label: 'Tarde', desc: 'Segundo turno del día' },
                { value: 'any', icon: '✨', label: 'Cualquier turno', desc: 'Me da igual el horario' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setTimePreference(opt.value)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', border: `1.5px solid ${timePreference === opt.value ? 'rgba(184,131,58,0.5)' : 'rgba(0,0,0,0.1)'}`, background: timePreference === opt.value ? 'rgba(184,131,58,0.07)' : '#F7F5F2', fontFamily: 'Outfit, sans-serif' }}>
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{opt.icon}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: timePreference === opt.value ? '#B8833A' : '#1A1612', margin: 0, marginBottom: 2 }}>{opt.label}</p>
                    <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', margin: 0 }}>{opt.desc}</p>
                  </div>
                  {timePreference === opt.value && <span style={{ marginLeft: 'auto', color: '#B8833A', fontSize: 16 }}>✓</span>}
                </button>
              ))}
            </div>
            <button onClick={handleJoin} disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg,#B8833A,#D4A055)', border: 'none', borderRadius: 12, padding: '15px', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#F7F5F2', cursor: 'pointer' }}>
              {loading ? '⏳ Apuntando...' : '🔔 Avisarme si hay hueco'}
            </button>
            <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', padding: '12px', fontSize: 13, color: 'rgba(26,22,18,0.4)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>Cancelar</button>
          </>
        )}
      </div>
    </div>
  )
}

// ── RescheduleConflictModal ────────────────────────────────────
function RescheduleConflictModal({ conflict, newSlot, onConfirm, onCancel, isPending }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 480, boxShadow: '0 -8px 40px rgba(17,17,17,0.15)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(17,17,17,0.08)', margin: '0 auto 24px' }} />
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(197,138,61,0.1)', border: '1.5px solid rgba(197,138,61,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px' }}>📅</div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 600, color: '#181512', margin: '0 0 8px' }}>Ya tienes una cita ese día</h3>
          <p style={{ fontSize: 14, color: 'rgba(24,21,18,0.55)', lineHeight: 1.6, margin: 0 }}>
            Tienes una cita a las <strong style={{ color: '#181512' }}>{slotTime(conflict.starts_at)}</strong> en <strong style={{ color: '#181512' }}>{conflict.business_name}</strong>.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div style={{ background: 'rgba(220,38,38,0.06)', border: '1.5px solid rgba(220,38,38,0.15)', borderRadius: 14, padding: '14px', textAlign: 'center' }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#dc2626', fontWeight: 700, margin: '0 0 4px', fontFamily: 'Outfit, sans-serif' }}>Actual</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, color: '#181512', margin: '0 0 2px' }}>{slotTime(conflict.starts_at)}</p>
            <p style={{ fontSize: 11, color: 'rgba(24,21,18,0.4)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{conflict.business_name}</p>
          </div>
          <div style={{ fontSize: '1.2rem', color: 'rgba(24,21,18,0.3)' }}>→</div>
          <div style={{ background: 'rgba(22,163,74,0.06)', border: '1.5px solid rgba(22,163,74,0.2)', borderRadius: 14, padding: '14px', textAlign: 'center' }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#16a34a', fontWeight: 700, margin: '0 0 4px', fontFamily: 'Outfit, sans-serif' }}>Nueva</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, color: '#181512', margin: '0 0 2px' }}>{slotTime(newSlot.starts_at)}</p>
            <p style={{ fontSize: 11, color: 'rgba(24,21,18,0.4)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Mismo día</p>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(24,21,18,0.4)', textAlign: 'center', marginBottom: 20, lineHeight: 1.5, fontFamily: 'Outfit, sans-serif' }}>
          Se cancelará la cita actual y se confirmará la nueva. Esta acción no se puede deshacer.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onConfirm} disabled={isPending} style={{ width: '100%', background: 'linear-gradient(135deg,#B97830,#D19B52)', border: 'none', borderRadius: 14, padding: '15px', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#fff', cursor: 'pointer', boxShadow: '0 6px 20px rgba(185,120,48,0.3)' }}>
            {isPending ? 'Cambiando cita...' : '✓ Cambiar a las ' + slotTime(newSlot.starts_at)}
          </button>
          <button onClick={onCancel} style={{ width: '100%', background: '#F8F5F0', border: '1.5px solid rgba(17,17,17,0.08)', borderRadius: 14, padding: '14px', fontSize: 14, fontFamily: 'Outfit, sans-serif', color: 'rgba(24,21,18,0.5)', cursor: 'pointer' }}>
            Mantener la cita actual
          </button>
        </div>
      </div>
    </div>
  )
}

// ── BookingPage ────────────────────────────────────────────────
export default function BookingPage() {
  const { professionalId, serviceId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Si viene desde la lista de espera con ?date=YYYY-MM-DD, pre-seleccionamos ese día
  const preDate = (() => {
    const d = searchParams.get('date')
    if (!d) return null
    const parsed = new Date(d + 'T00:00:00')
    return isNaN(parsed.getTime()) ? null : parsed
  })()

  const [currentMonth, setCurrentMonth] = useState(preDate ?? new Date())
  const [selectedDate, setSelectedDate]  = useState(preDate)
  const [selectedSlot, setSelectedSlot]  = useState(null)
  const [notes, setNotes]                = useState('')
  const [daysData, setDaysData]          = useState({})
  const [booked, setBooked]              = useState(false)
  const [animSlot, setAnimSlot]          = useState(null)
  const [animDay, setAnimDay]            = useState(null)
  const [showWaitlist, setShowWaitlist]  = useState(false)
  const [conflictData, setConflictData]  = useState(null)
  const slotsRef = useRef(null)

  const calDays = buildCalendarDays(currentMonth)
  const isCurrentMonth = isSameMonth(currentMonth, new Date())

  const { data: prof } = useQuery({
    queryKey: ['professional', professionalId],
    queryFn: () => profApi.getOne(professionalId).then(r => r.data.data),
  })
  const service = prof?.services?.find(s => s.id === serviceId)

  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ['slots', professionalId, serviceId, selectedDate && format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => bookingsApi.getSlots({ professional_id: professionalId, service_id: serviceId, date: format(selectedDate, 'yyyy-MM-dd') }).then(r => r.data.data),
    enabled: !!service && !!selectedDate,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  // Incluir slots con client_conflict para mostrarlos en dorado
  const now = new Date()
const freeSlots = (slotsData?.filter(s => s.available || s.client_conflict) ?? [])
  .filter(slot => {
    if (!selectedDate || !isToday(selectedDate)) return true
    return new Date(slot.starts_at) > now
  })
  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
  const selectedDayInfo = selectedDateKey ? daysData[selectedDateKey] : null
  const isDayFull = selectedDayInfo != null && selectedDayInfo.available === 0 && selectedDayInfo.total > 0

  useEffect(() => {
    if (!selectedDate || loadingSlots) return
    const key = format(selectedDate, 'yyyy-MM-dd')
    const total = slotsData?.length ?? 0
    const available = slotsData?.filter(s => s.available).length ?? 0
    setDaysData(prev => ({ ...prev, [key]: { total, available } }))
  }, [slotsData, loadingSlots])

  useEffect(() => {
    if (!service || !professionalId || !serviceId) return
    const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))
    days.forEach(async (day) => {
      const key = format(day, 'yyyy-MM-dd')
      if (daysData[key] !== undefined) return
      try {
        const res = await bookingsApi.getSlots({ professional_id: professionalId, service_id: serviceId, date: key })
        const slots = res.data.data ?? []
        setDaysData(prev => ({ ...prev, [key]: { total: slots.length, available: slots.filter(s => s.available).length } }))
      } catch {}
    })
  }, [service, professionalId, serviceId])

  // Scroll automático a la sección de horas cuando se llega con ?date= pre-seleccionado
  useEffect(() => {
    if (!preDate || !slotsRef.current) return
    const timer = setTimeout(() => {
      slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 400)
    return () => clearTimeout(timer)
  }, [preDate, slotsRef.current])

  const handleSelectDate = (day) => {
    setSelectedDate(day); setSelectedSlot(null)
    setAnimDay(day.toISOString()); setTimeout(() => setAnimDay(null), 400)
  }
  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot)
    setAnimSlot(slot.starts_at); setTimeout(() => setAnimSlot(null), 400)
  }

  const { mutate: book, isPending } = useMutation({
    mutationFn: () => bookingsApi.create({ professional_id: professionalId, service_id: serviceId, starts_at: selectedSlot.starts_at, notes }),
    onSuccess: () => setBooked(true),
    onError: (err) => {
      const data = err.response?.data
      if (err.response?.status === 409 && data?.conflict) setConflictData(data.conflict)
      else toast.error(data?.error ?? 'Error al reservar')
    },
  })

const { mutate: rescheduleConflict, isPending: rescheduling } = useMutation({
  mutationFn: () => bookingsApi.rescheduleClient(conflictData.id, {
    starts_at: selectedSlot.starts_at,
    professional_id: professionalId,
    service_id: serviceId,
    notes,
  }),
  onSuccess: () => { setConflictData(null); setBooked(true) },
  onError: (err) => { setConflictData(null); toast.error(err.response?.data?.error ?? 'Error al cambiar la cita') },
})
  if (booked) return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`
        @keyframes popIn{0%{transform:scale(0.7);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        .success-icon{animation:popIn 0.5s cubic-bezier(.36,.07,.19,.97) forwards}
        .success-content{animation:fadeUp 0.5s 0.2s ease forwards;opacity:0}
      `}</style>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div className="success-icon" style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg,#B8833A,#D4A055)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', boxShadow: '0 0 60px rgba(201,150,90,0.4)' }}>✓</div>
        <div className="success-content">
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 300, marginBottom: 8 }}>¡Cita <em style={{ color: '#B8833A' }}>confirmada!</em></h1>
          <p style={{ color: 'rgba(26,22,18,0.5)', fontSize: 14, marginBottom: 6 }}>{service?.name} · {service?.duration_minutes} min</p>
          <p style={{ color: 'rgba(26,22,18,0.75)', fontSize: 15, marginBottom: 4, fontWeight: 600 }}>{prof?.business_name}</p>
          {selectedSlot && <p style={{ color: '#B8833A', fontSize: 15, marginBottom: 32 }}>📅 {format(new Date(selectedSlot.starts_at), "EEEE d 'de' MMMM", { locale: es })} · 🕐 {slotTime(selectedSlot.starts_at)}</p>}
          <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(184,131,58,0.15)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.5)', marginBottom: 4 }}>📍 {prof?.city}</p>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.5)' }}>💶 {service?.price}€ · Pago en el local</p>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', marginTop: 8 }}>Puedes cancelar hasta 24h antes</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selectedSlot && (() => {
              const start = new Date(selectedSlot.starts_at)
              const end   = new Date(selectedSlot.ends_at ?? start.getTime() + (service?.duration_minutes ?? 60) * 60000)
              const fmt   = d => d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z'
              const title = encodeURIComponent(`${service?.name} en ${prof?.business_name}`)
              const loc   = encodeURIComponent(prof?.address ? `${prof.address}, ${prof.city}` : prof?.city ?? '')
              const details = encodeURIComponent(`Cita reservada en TopSy · ${service?.price}€`)
              const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${loc}`
              const icsContent = [
                'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
                `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
                `SUMMARY:${decodeURIComponent(title)}`,
                `DESCRIPTION:${decodeURIComponent(details)}`,
                `LOCATION:${decodeURIComponent(loc)}`,
                'END:VEVENT', 'END:VCALENDAR'
              ].join('\n')
              const icsUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 2 }}>
                  <a href={googleUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', border: '1.5px solid rgba(184,131,58,0.2)', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: '#1A1612', textDecoration: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#EA4335" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#EA4335" strokeWidth="2"/><text x="12" y="19" textAnchor="middle" fontSize="8" fill="#1A73E8" fontWeight="bold">G</text></svg>
                    Google
                  </a>
                  <a href={icsUrl} download="cita-topsy.ics"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', border: '1.5px solid rgba(184,131,58,0.2)', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif', color: '#1A1612', textDecoration: 'none' }}>
                    🍎 Apple / iCal
                  </a>
                </div>
              )
            })()}
            <button onClick={() => navigate('/dashboard')} style={{ width: '100%', background: 'linear-gradient(135deg,#B8833A,#D4A055)', border: 'none', borderRadius: 12, padding: '15px', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#F7F5F2', cursor: 'pointer' }}>Ver mis citas</button>
            <button onClick={() => navigate('/')} style={{ width: '100%', background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '15px', fontSize: 14, fontFamily: 'Outfit, sans-serif', color: 'rgba(26,22,18,0.6)', cursor: 'pointer' }}>Volver al inicio</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh', paddingBottom: 200, fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        .cal-day:hover:not(:disabled){background:rgba(201,150,90,0.1) !important}
        .slot-btn:hover{background:rgba(201,150,90,0.1) !important;border-color:rgba(201,150,90,0.4) !important}
        textarea:focus{outline:none;border-color:rgba(201,150,90,0.4) !important}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(201,150,90,0.5)}50%{box-shadow:0 0 0 8px rgba(201,150,90,0)}}
        @keyframes slotPop{0%{transform:scale(0.9)}60%{transform:scale(1.08)}100%{transform:scale(1)}}
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        @keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes slideInRight{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes slideUpSticky{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes pulseDorado{0%,100%{box-shadow:0 8px 24px rgba(201,150,90,0.3)}50%{box-shadow:0 8px 30px rgba(201,150,90,0.6),0 0 0 4px rgba(201,150,90,0.08)}}
        @keyframes glowOnce{0%{box-shadow:0 0 0 0 rgba(184,131,58,0.5)}60%{box-shadow:0 0 0 12px rgba(184,131,58,0)}100%{box-shadow:0 0 0 0 rgba(184,131,58,0)}}
        .fade-up{animation:fadeUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both}
        .slide-down{animation:slideDown 0.5s cubic-bezier(0.34,1.56,0.64,1) both}
        .slide-in-right{animation:slideInRight 0.6s cubic-bezier(0.34,1.56,0.64,1) both}
        .slide-up-sticky{animation:slideUpSticky 0.6s cubic-bezier(0.34,1.56,0.64,1) both}
        .pulse-when-ready{animation:pulseDorado 2.6s ease-in-out infinite 1.5s}
        .glow-once{animation:glowOnce 1.6s ease-out 0.3s both}
        .month-nav-btn{transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),background 0.2s}
        .month-nav-btn:hover:not(:disabled){transform:scale(1.1);background:rgba(184,131,58,0.1)}
        .month-nav-btn:active:not(:disabled){transform:scale(0.95)}
        .slot-btn{transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.2s,background 0.2s}
        .slot-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 16px rgba(184,131,58,0.2)}
        .slot-btn:active:not(:disabled){transform:translateY(0) scale(0.97)}
        .booking-header{animation:slideDown 0.5s cubic-bezier(0.34,1.56,0.64,1) both}
        @media (prefers-reduced-motion:reduce){
          .fade-up,.slide-down,.slide-in-right,.slide-up-sticky,.pulse-when-ready,.glow-once,.booking-header,.success-icon,.success-content,.slot-anim,.day-anim{animation:none !important;opacity:1 !important;transform:none !important}
          .month-nav-btn,.slot-btn{transition:none !important}
        }
        .slot-anim{animation:slotPop 0.3s ease forwards}
        .day-anim{animation:pulse 0.4s ease}
        .skel{background:linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%);background-size:400px 100%;animation:shimmer 1.4s infinite}
        .slots-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        @media(min-width:400px){.slots-grid{grid-template-columns:repeat(4,1fr)}}
        .booking-grid{display:grid;grid-template-columns:1fr;gap:14px}
        @media(min-width:769px){.booking-grid{grid-template-columns:1fr 300px;gap:20px}}
        .booking-summary-desktop{display:none}
        .booking-summary-mobile{display:flex !important}
        @media(min-width:769px){.booking-summary-desktop{display:block}.booking-summary-mobile{display:none !important}}
        .booking-header{position:sticky;top:0;z-index:10}
        @media(min-width:769px){.booking-header{top:68px}}
        .month-nav-btn{width:34px;height:34px;border-radius:8px;cursor:pointer;background:#F7F5F2;border:1.5px solid rgba(0,0,0,0.1);color:rgba(26,22,18,0.5);font-size:16px;display:flex;align-items:center;justify-content:center;transition:all 0.15s}
        .month-nav-btn:hover:not(:disabled){background:rgba(201,150,90,0.1);border-color:rgba(201,150,90,0.3);color:#B8833A}
        .month-nav-btn:disabled{opacity:0.2;cursor:default}
        .waitlist-btn:hover{background:rgba(248,113,113,0.15) !important;border-color:rgba(248,113,113,0.4) !important}
      `}</style>

      {showWaitlist && selectedDate && (
        <WaitlistModal date={selectedDate} profName={prof?.business_name} serviceName={service?.name}
          professionalId={professionalId} serviceId={serviceId} onClose={() => setShowWaitlist(false)} />
      )}
      {conflictData && selectedSlot && (
        <RescheduleConflictModal conflict={conflictData} newSlot={selectedSlot}
          onConfirm={() => rescheduleConflict()} onCancel={() => setConflictData(null)} isPending={rescheduling} />
      )}

      {/* Header */}
      <div className="booking-header" style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {prof?.cover_image_url && (
          <div style={{ height: 90, overflow: 'hidden', position: 'relative' }}>
            <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 0%,rgba(247,245,242,0.85) 100%)' }} />
          </div>
        )}
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
          <button onClick={() => navigate(-1)} style={{ background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 10, padding: '8px 12px', color: 'rgba(26,22,18,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', flexShrink: 0 }}>←</button>
          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(201,150,90,0.4)', background: 'rgba(201,150,90,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: prof?.cover_image_url ? -20 : 0, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            {prof?.profiles?.avatar_url ? <img src={prof.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.1rem' }}>✂️</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1A1612', margin: 0 }}>{prof?.business_name}</p>
            <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', margin: 0 }}>📍 {prof?.city}</p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#B8833A', fontStyle: 'italic', lineHeight: 1, margin: 0 }}>{service?.price}€</p>
            <p style={{ fontSize: 10, color: 'rgba(26,22,18,0.4)', margin: 0 }}>{service?.duration_minutes} min</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '16px' }}>
        <div className="booking-grid" style={{ alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Servicio */}
            <div className="fade-up glow-once" style={{ background: '#FFFFFF', border: '1.5px solid rgba(184,131,58,0.2)', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, animationDelay: '0.1s' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: '#1A1612' }}>{service?.name}</p>
                <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.45)', margin: 0 }}>⏱ {service?.duration_minutes} min</p>
              </div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#B8833A', fontStyle: 'italic', lineHeight: 1, margin: 0 }}>{service?.price}€</p>
            </div>

            {/* Calendario */}
            <div className="fade-up" style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '16px 14px', animationDelay: '0.2s' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(184,131,58,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#B8833A', fontWeight: 700 }}>1</span>
                Selecciona el día
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', fontWeight: 600, color: '#1A1612', margin: 0, textTransform: 'capitalize' }}>{format(currentMonth, 'MMMM yyyy', { locale: es })}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="month-nav-btn" disabled={isCurrentMonth} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>‹</button>
                  <button className="month-nav-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>›</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
                {WEEK_DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'rgba(26,22,18,0.2)', letterSpacing: '0.04em', paddingBottom: 6 }}>{d}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
                {calDays.map(day => {
                  const inMonth = isSameMonth(day, currentMonth)
                  const isPast  = day < TODAY
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const todayMark  = isToday(day)
                  const disabled   = isPast || !inMonth
                  const key        = format(day, 'yyyy-MM-dd')
                  const dayInfo    = daysData[key]
                  const noSlots    = dayInfo !== undefined && dayInfo.available === 0
                  const fewSlots   = dayInfo?.available > 0 && dayInfo.available <= 3
                  const isAnim     = animDay === day.toISOString()
                  return (
                    <button key={day.toISOString()} className={`cal-day${isAnim ? ' day-anim' : ''}`}
                      disabled={disabled} onClick={() => handleSelectDate(day)}
                      style={{ aspectRatio: '1', borderRadius: 10, border: todayMark && !isSelected ? '1px solid rgba(201,150,90,0.5)' : '1px solid transparent', cursor: disabled ? 'default' : 'pointer', transition: 'all 0.15s', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: isSelected ? 700 : 400, background: isSelected ? 'linear-gradient(135deg,#B8833A,#D4A055)' : 'transparent', color: isSelected ? '#FFFFFF' : disabled ? 'rgba(26,22,18,0.15)' : todayMark ? '#B8833A' : 'rgba(26,22,18,0.7)', boxShadow: isSelected ? '0 4px 14px rgba(184,131,58,0.28)' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, opacity: noSlots && !isSelected ? 0.45 : 1 }}>
                      {inMonth ? format(day, 'd') : ''}
                      {inMonth && !disabled && dayInfo !== undefined && !isSelected && (
                        <span style={{ width: '60%', height: 3, borderRadius: 2, display: 'block', marginTop: 1, background: noSlots ? '#f87171' : fewSlots ? '#fb923c' : '#4ade80' }} />
                      )}
                    </button>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[{ color: '#4ade80', label: 'Disponible' }, { color: '#fb923c', label: 'Pocas citas' }, { color: '#f87171', label: 'Completo' }].map(({ color, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(26,22,18,0.45)' }}>
                    <span style={{ width: 14, height: 3, borderRadius: 2, background: color, display: 'inline-block' }} /> {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Horas */}
            {selectedDate && (
              <div ref={slotsRef} className="fade-up" style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '16px 14px' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(184,131,58,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#B8833A', fontWeight: 700 }}>2</span>
                  Hora — {format(selectedDate, "EEEE d MMM", { locale: es })}
                </p>
                {loadingSlots ? (
                  <div className="slots-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skel" style={{ height: 42, borderRadius: 8 }} />)}</div>
                ) : freeSlots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                    <p style={{ fontSize: '2rem', marginBottom: 8 }}>😔</p>
                    <p style={{ fontSize: 14, color: 'rgba(26,22,18,0.6)', marginBottom: 4, fontWeight: 500 }}>Día completo</p>
                    <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.2)', marginBottom: 20 }}>{isDayFull ? 'Todas las citas están ocupadas' : 'El profesional no trabaja este día'}</p>
                    {isDayFull && (
                      <button className="waitlist-btn" onClick={() => setShowWaitlist(true)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(248,113,113,0.08)', border: '1.5px solid rgba(248,113,113,0.25)', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, color: '#f87171' }}>
                        🔔 Avisarme si hay hueco
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Aviso si hay client_conflict */}
                    {freeSlots.some(s => s.client_conflict) && (
                      <div style={{ background: 'rgba(197,138,61,0.08)', border: '1px solid rgba(197,138,61,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#B57932', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>⚠️</span>
                        <span>Ya tienes una cita este día. Selecciona un horario para cambiarlo.</span>
                      </div>
                    )}
                    <div className="slots-grid">
                      {freeSlots.map(slot => {
                        const active = selectedSlot?.starts_at === slot.starts_at
                        const isAnim = animSlot === slot.starts_at
                        const isClientConflict = slot.client_conflict
                        return (
                          <button key={slot.starts_at} className={`slot-btn${isAnim ? ' slot-anim' : ''}`}
                            onClick={() => handleSelectSlot(slot)}
                            style={{ padding: '11px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s',
                              border: `1px solid ${active ? 'transparent' : isClientConflict ? 'rgba(197,138,61,0.3)' : 'rgba(0,0,0,0.1)'}`,
                              background: active ? 'linear-gradient(135deg,#B8833A,#D4A055)' : isClientConflict ? 'rgba(197,138,61,0.08)' : '#F7F5F2',
                              color: active ? '#FFFFFF' : isClientConflict ? '#B57932' : 'rgba(26,22,18,0.65)',
                              boxShadow: active ? '0 4px 12px rgba(201,150,90,0.3)' : 'none',
                            }}>
                            {slotTime(slot.starts_at)}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Notas */}
            <div className="fade-up" style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '16px 14px', animationDelay: '0.4s' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(184,131,58,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#B8833A', fontWeight: 700 }}>3</span>
                Notas <span style={{ color: 'rgba(26,22,18,0.3)', fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
              </p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: prefiero tinte sin amoniaco..." style={{ width: '100%', background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 10, padding: '10px 12px', color: '#1A1612', fontSize: 13, fontFamily: 'Outfit, sans-serif', resize: 'none', height: 76, boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Resumen Desktop */}
          <div className="booking-summary-desktop slide-in-right" style={{ position: 'sticky', top: 100, animationDelay: '0.3s' }}>
            <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 20, overflow: 'hidden' }}>
              {prof?.cover_image_url && (
                <div style={{ height: 80, overflow: 'hidden', position: 'relative' }}>
                  <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent,rgba(247,245,242,0.9))' }} />
                </div>
              )}
              <div style={{ background: 'linear-gradient(135deg,rgba(184,131,58,0.07),transparent)', padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.3)', marginBottom: 6 }}>Resumen</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 600, margin: 0, color: '#1A1612' }}>{prof?.business_name}</p>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {[
                  { label: 'Servicio', value: service?.name },
                  { label: 'Duración', value: `${service?.duration_minutes} min` },
                  { label: 'Fecha', value: selectedSlot ? format(new Date(selectedSlot.starts_at), "d MMM yyyy", { locale: es }) : '—' },
                  { label: 'Hora', value: selectedSlot ? `${slotTime(selectedSlot.starts_at)} — ${slotTime(selectedSlot.ends_at)}` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)', fontSize: 13 }}>
                    <span style={{ color: 'rgba(26,22,18,0.45)' }}>{label}</span>
                    <span style={{ color: '#1A1612', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 0' }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#1A1612' }}>Total</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#B8833A', fontStyle: 'italic', lineHeight: 1 }}>{service?.price}€</span>
                </div>
              </div>
              <div style={{ padding: '0 24px 24px' }}>
                <button onClick={() => book()} disabled={!selectedSlot || isPending}
                  className={selectedSlot ? 'pulse-when-ready' : ''}
                  style={{ width: '100%', border: 'none', borderRadius: 12, padding: '15px', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: selectedSlot ? 'pointer' : 'not-allowed', transition: 'all 0.2s', background: selectedSlot ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#F0EDE8', color: selectedSlot ? '#FFFFFF' : 'rgba(26,22,18,0.3)', boxShadow: selectedSlot ? '0 8px 24px rgba(201,150,90,0.3)' : 'none' }}>
                  {isPending ? 'Confirmando...' : selectedSlot ? 'Confirmar cita ✓' : 'Selecciona horario'}
                </button>
                <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', textAlign: 'center', marginTop: 10 }}>Puedes cancelar hasta 24h antes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior móvil */}
      <div className="booking-summary-mobile slide-up-sticky" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)', padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', zIndex: 999, flexDirection: 'column', gap: 10, animationDelay: '0.5s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1A1612' }}>{service?.name}</p>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.45)', margin: 0 }}>
              {selectedSlot ? `📅 ${format(new Date(selectedSlot.starts_at), "d MMM", { locale: es })} · 🕐 ${slotTime(selectedSlot.starts_at)}` : 'Selecciona fecha y hora'}
            </p>
          </div>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#B8833A', fontStyle: 'italic', lineHeight: 1, flexShrink: 0, margin: 0 }}>{service?.price}€</p>
        </div>
        {isDayFull && selectedDate && !selectedSlot ? (
          <button className="waitlist-btn" onClick={() => setShowWaitlist(true)}
            style={{ width: '100%', border: '1.5px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}>
            🔔 Avisarme si hay hueco
          </button>
        ) : (
          <button onClick={() => book()} disabled={!selectedSlot || isPending}
            className={selectedSlot ? 'pulse-when-ready' : ''}
            style={{ width: '100%', border: 'none', borderRadius: 12, padding: '16px', fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: selectedSlot ? 'pointer' : 'not-allowed', transition: 'all 0.2s', background: selectedSlot ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#F0EDE8', color: selectedSlot ? '#FFFFFF' : 'rgba(26,22,18,0.3)', boxShadow: selectedSlot ? '0 8px 24px rgba(201,150,90,0.3)' : 'none' }}>
            {isPending ? '⏳ Confirmando...' : selectedSlot ? '✓ Confirmar cita' : 'Selecciona un horario'}
          </button>
        )}
        <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', textAlign: 'center', margin: 0 }}>Puedes cancelar hasta 24h antes</p>
      </div>
    </div>
  )
}