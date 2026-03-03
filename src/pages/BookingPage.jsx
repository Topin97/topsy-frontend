import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { profApi, bookingsApi } from '../services/api'
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

export default function BookingPage() {
  const { professionalId, serviceId } = useParams()
  const navigate = useNavigate()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate]  = useState(null)
  const [selectedSlot, setSelectedSlot]  = useState(null)
  const [notes, setNotes]                = useState('')
  const [daysData, setDaysData] = useState({}) // { 'yyyy-MM-dd': { total, available } } // { 'yyyy-MM-dd': true/false }
  const [booked, setBooked]              = useState(false)
  const [animSlot, setAnimSlot]          = useState(null)
  const [animDay, setAnimDay]            = useState(null)

  const calDays = buildCalendarDays(currentMonth)
  const isCurrentMonth = isSameMonth(currentMonth, new Date())

  const { data: prof } = useQuery({
    queryKey: ['professional', professionalId],
    queryFn: () => profApi.getOne(professionalId).then(r => r.data.data),
  })

  const service = prof?.services?.find(s => s.id === serviceId)

  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ['slots', professionalId, serviceId, selectedDate && format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => bookingsApi.getSlots({
      professional_id: professionalId,
      service_id: serviceId,
      date: format(selectedDate, 'yyyy-MM-dd'),
    }).then(r => r.data.data),
    enabled: !!service && !!selectedDate,
  })

  const freeSlots = slotsData?.filter(s => s.available) ?? []

// Guardar slots del día seleccionado
useEffect(() => {
  if (!selectedDate || loadingSlots) return
  const key = format(selectedDate, 'yyyy-MM-dd')
  const total = slotsData?.length ?? 0
  const available = freeSlots.length
  setDaysData(prev => ({ ...prev, [key]: { total, available } }))
}, [slotsData, loadingSlots])

// Precargar slots de los próximos 14 días en segundo plano
useEffect(() => {
  if (!service || !professionalId || !serviceId) return
  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))
  days.forEach(async (day) => {
    const key = format(day, 'yyyy-MM-dd')
    if (daysData[key] !== undefined) return
    try {
      const res = await bookingsApi.getSlots({
        professional_id: professionalId,
        service_id: serviceId,
        date: key,
      })
      const slots = res.data.data ?? []
      const total = slots.length
      const available = slots.filter(s => s.available).length
      setDaysData(prev => ({ ...prev, [key]: { total, available } }))
    } catch {}
  })
}, [service, professionalId, serviceId])

  const handleSelectDate = (day) => {
    setSelectedDate(day)
    setSelectedSlot(null)
    setAnimDay(day.toISOString())
    setTimeout(() => setAnimDay(null), 400)
  }

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot)
    setAnimSlot(slot.starts_at)
    setTimeout(() => setAnimSlot(null), 400)
  }

  const { mutate: book, isPending } = useMutation({
    mutationFn: () => bookingsApi.create({
      professional_id: professionalId,
      service_id: serviceId,
      starts_at: selectedSlot.starts_at,
      notes,
    }),
    onSuccess: () => setBooked(true),
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al reservar'),
  })

  // ── Pantalla de éxito ──────────────────────────────────────
  if (booked) return (
    <div style={{background: '#1C1C1E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`
        @keyframes popIn { 0% { transform: scale(0.7); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .success-icon { animation: popIn 0.5s cubic-bezier(.36,.07,.19,.97) forwards; }
        .success-content { animation: fadeUp 0.5s 0.2s ease forwards; opacity: 0; }
      `}</style>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div className="success-icon" style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #C9965A, #E8B97A)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', boxShadow: '0 0 60px rgba(201,150,90,0.4)' }}>
          ✓
        </div>
        <div className="success-content">
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 300, marginBottom: 8 }}>
            ¡Cita <em style={{ color: '#C9965A' }}>confirmada!</em>
          </h1>
          <p style={{ color: 'rgba(247,242,234,0.5)', fontSize: 14, marginBottom: 6 }}>
            {service?.name} · {service?.duration_minutes} min
          </p>
          <p style={{ color: 'rgba(247,242,234,0.7)', fontSize: 15, marginBottom: 4, fontWeight: 600 }}>
            {prof?.business_name}
          </p>
          {selectedSlot && (
            <p style={{ color: '#C9965A', fontSize: 15, marginBottom: 32 }}>
              📅 {format(new Date(selectedSlot.starts_at), "EEEE d 'de' MMMM", { locale: es })} · 🕐 {format(new Date(selectedSlot.starts_at), 'HH:mm')}
            </p>
          )}
          <div style={{ background: 'rgba(201,150,90,0.06)', border: '1px solid rgba(201,150,90,0.15)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
            <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)', marginBottom: 4 }}>📍 {prof?.city}</p>
            <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)' }}>💶 {service?.price}€ · Pago en el local</p>
            <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.3)', marginTop: 8 }}>Puedes cancelar hasta 24h antes</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => navigate('/dashboard')} style={{ width: '100%', background: 'linear-gradient(135deg, #C9965A, #E8B97A)', border: 'none', borderRadius: 12, padding: '15px', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#0A0806', cursor: 'pointer', letterSpacing: '0.05em' }}>
              Ver mis citas
            </button>
            <button onClick={() => navigate('/')} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '15px', fontSize: 14, fontFamily: 'Outfit, sans-serif', color: 'rgba(247,242,234,0.6)', cursor: 'pointer' }}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#1C1C1E', minHeight: '100vh', paddingBottom: 200 }}>
      <style>{`
        .cal-day:hover:not(:disabled) { background: rgba(201,150,90,0.1) !important; }
        .slot-btn:hover { background: rgba(201,150,90,0.1) !important; border-color: rgba(201,150,90,0.4) !important; }
        textarea:focus { outline: none; border-color: rgba(201,150,90,0.4) !important; }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(201,150,90,0.5); } 50% { box-shadow: 0 0 0 8px rgba(201,150,90,0); } }
        @keyframes slotPop { 0% { transform: scale(0.9); } 60% { transform: scale(1.08); } 100% { transform: scale(1); } }
        .slot-anim { animation: slotPop 0.3s ease forwards; }
        .day-anim { animation: pulse 0.4s ease; }
        .slots-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
        @media (min-width: 400px) { .slots-grid { grid-template-columns: repeat(4,1fr); } }
        .booking-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 769px) { .booking-grid { grid-template-columns: 1fr 300px; gap: 20px; } }
        .booking-summary-desktop { display: none; }
        .booking-summary-mobile { display: flex !important; }
        @media (min-width: 769px) {
          .booking-summary-desktop { display: block; }
          .booking-summary-mobile { display: none !important; }
        }
        .booking-header { position: sticky; top: 0; z-index: 10; }
        @media (min-width: 769px) { .booking-header { top: 68px; } }
        .month-nav-btn { width: 34px; height: 34px; border-radius: 8px; cursor: pointer; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(247,242,234,0.6); font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .month-nav-btn:hover:not(:disabled) { background: rgba(201,150,90,0.1); border-color: rgba(201,150,90,0.3); color: #C9965A; }
        .month-nav-btn:disabled { opacity: 0.2; cursor: default; }
      `}</style>

      {/* ── Header con cover ── */}
      <div className="booking-header" style={{ background: 'rgba(10,8,6,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Cover image */}
        {prof?.cover_image_url && (
          <div style={{ height: 90, overflow: 'hidden', position: 'relative' }}>
            <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(10,8,6,0.8) 100%)' }} />
          </div>
        )}
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px', color: 'rgba(247,242,234,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', flexShrink: 0 }}>←</button>
          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(201,150,90,0.4)', background: 'rgba(201,150,90,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: prof?.cover_image_url ? -20 : 0, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            {prof?.profiles?.avatar_url
              ? <img src={prof.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '1.1rem' }}>✂️</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#F7F2EA', margin: 0 }}>{prof?.business_name}</p>
            <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.35)', margin: 0 }}>📍 {prof?.city}</p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#C9965A', fontStyle: 'italic', lineHeight: 1, margin: 0 }}>{service?.price}€</p>
            <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', margin: 0 }}>{service?.duration_minutes} min</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '16px' }}>
        <div className="booking-grid" style={{ alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Servicio */}
            <div style={{ background: 'linear-gradient(135deg, rgba(201,150,90,0.08), rgba(201,150,90,0.03))', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: '#F7F2EA' }}>{service?.name}</p>
                <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)', margin: 0 }}>⏱ {service?.duration_minutes} min</p>
              </div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#C9965A', fontStyle: 'italic', lineHeight: 1, flexShrink: 0, margin: 0 }}>{service?.price}€</p>
            </div>

            {/* Paso 1: Calendario */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 14px' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(201,150,90,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#C9965A', fontWeight: 700 }}>1</span>
                Selecciona el día
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', fontWeight: 600, color: '#F7F2EA', margin: 0, textTransform: 'capitalize' }}>
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="month-nav-btn" disabled={isCurrentMonth} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>‹</button>
                  <button className="month-nav-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>›</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
                {WEEK_DAYS.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'rgba(247,242,234,0.22)', letterSpacing: '0.04em', paddingBottom: 6 }}>{d}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
                {calDays.map(day => {
                  const inMonth    = isSameMonth(day, currentMonth)
                  const isPast     = day < TODAY
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const todayMark  = isToday(day)
                  const disabled   = isPast || !inMonth
                  const key        = format(day, 'yyyy-MM-dd')
                  const dayInfo  = daysData[key]
                  const hasSlots = dayInfo?.available > 0
                  const noSlots  = dayInfo !== undefined && dayInfo.available === 0
                  const fewSlots = dayInfo?.available > 0 && dayInfo.available <= 3
                  const isAnim     = animDay === day.toISOString()

                  return (
                    <button
                      key={day.toISOString()}
                      className={`cal-day${isAnim ? ' day-anim' : ''}`}
                      disabled={disabled}
                      onClick={() => handleSelectDate(day)}
                      style={{
                        aspectRatio: '1', borderRadius: 10, position: 'relative',
                        border: todayMark && !isSelected ? '1px solid rgba(201,150,90,0.5)' : '1px solid transparent',
                        cursor: disabled ? 'default' : 'pointer', transition: 'all 0.15s',
                        fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: isSelected ? 700 : 400,
                        background: isSelected ? 'linear-gradient(135deg, #C9965A, #E8B97A)' : 'transparent',
                        color: isSelected ? '#0A0806' : disabled ? 'rgba(247,242,234,0.1)' : todayMark ? '#C9965A' : 'rgba(247,242,234,0.75)',
                        boxShadow: isSelected ? '0 4px 14px rgba(201,150,90,0.35)' : 'none',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                        opacity: noSlots && !isSelected ? 0.45 : 1,
                      }}
                    >
                      {inMonth ? format(day, 'd') : ''}
                      {/* Punto disponibilidad */}
                  {inMonth && !disabled && dayInfo !== undefined && !isSelected && (
                    <span style={{
                      width: '60%', height: 3, borderRadius: 2, display: 'block', marginTop: 1,
                      background: noSlots
                        ? '#f87171'
                        : fewSlots
                          ? '#fb923c'
                          : '#4ade80',
                    }} />
                  )}
                    </button>
                  )
                })}
              </div>

                          {/* Leyenda */}
            <div style={{ display: 'flex', gap: 14, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { color: '#4ade80', label: 'Disponible' },
                { color: '#fb923c', label: 'Pocas citas' },
                { color: '#f87171', label: 'Completo' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(247,242,234,0.3)' }}>
                  <span style={{ width: 14, height: 3, borderRadius: 2, background: color, display: 'inline-block' }} /> {label}
                </div>
              ))}
            </div>
            </div>

            {/* Paso 2: Horas */}
            {selectedDate && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 14px' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(201,150,90,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#C9965A', fontWeight: 700 }}>2</span>
                  Hora — {format(selectedDate, "EEEE d MMM", { locale: es })}
                </p>

                {loadingSlots ? (
                  <div className="slots-grid">
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 42, borderRadius: 8 }} />)}
                  </div>
                ) : freeSlots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ fontSize: '1.5rem', marginBottom: 6 }}>😔</p>
                    <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.3)', margin: 0 }}>Sin disponibilidad · Prueba otro día</p>
                  </div>
                ) : (
                  <div className="slots-grid">
                    {freeSlots.map(slot => {
                      const active  = selectedSlot?.starts_at === slot.starts_at
                      const isAnim  = animSlot === slot.starts_at
                      return (
                        <button key={slot.starts_at} className={`slot-btn${isAnim ? ' slot-anim' : ''}`} onClick={() => handleSelectSlot(slot)} style={{
                          padding: '11px 4px', borderRadius: 8, cursor: 'pointer',
                          fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                          border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                          transition: 'all 0.15s',
                          background: active ? 'linear-gradient(135deg, #C9965A, #E8B97A)' : 'rgba(255,255,255,0.02)',
                          color: active ? '#0A0806' : 'rgba(247,242,234,0.65)',
                          boxShadow: active ? '0 4px 12px rgba(201,150,90,0.3)' : 'none',
                        }}>
                          {format(new Date(slot.starts_at), 'HH:mm')}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Paso 3: Notas */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 14px' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(201,150,90,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#C9965A', fontWeight: 700 }}>3</span>
                Notas <span style={{ color: 'rgba(247,242,234,0.2)', fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
              </p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: prefiero tinte sin amoniaco..." style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 12px', color: '#F7F2EA', fontSize: 13, fontFamily: 'Outfit, sans-serif', resize: 'none', height: 76, boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Resumen Desktop */}
          <div className="booking-summary-desktop" style={{ position: 'sticky', top: 100 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
              {prof?.cover_image_url && (
                <div style={{ height: 80, overflow: 'hidden', position: 'relative' }}>
                  <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(10,8,6,0.7))' }} />
                </div>
              )}
              <div style={{ background: 'linear-gradient(135deg, rgba(201,150,90,0.08), transparent)', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 6 }}>Resumen</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 600, margin: 0, color: '#F7F2EA' }}>{prof?.business_name}</p>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {[
                  { label: 'Servicio',  value: service?.name },
                  { label: 'Duración', value: `${service?.duration_minutes} min` },
                  { label: 'Fecha',    value: selectedSlot ? format(new Date(selectedSlot.starts_at), "d MMM yyyy", { locale: es }) : '—' },
                  { label: 'Hora',     value: selectedSlot ? `${format(new Date(selectedSlot.starts_at), 'HH:mm')} – ${format(new Date(selectedSlot.ends_at), 'HH:mm')}` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
                    <span style={{ color: 'rgba(247,242,234,0.4)' }}>{label}</span>
                    <span style={{ color: '#F7F2EA', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 0' }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#F7F2EA' }}>Total</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#C9965A', fontStyle: 'italic', lineHeight: 1 }}>{service?.price}€</span>
                </div>
              </div>
              <div style={{ padding: '0 24px 24px' }}>
                <button onClick={() => book()} disabled={!selectedSlot || isPending} style={{
                  width: '100%', border: 'none', borderRadius: 12, padding: '15px',
                  fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
                  cursor: selectedSlot ? 'pointer' : 'not-allowed', letterSpacing: '0.05em', transition: 'all 0.2s',
                  background: selectedSlot ? 'linear-gradient(135deg, #C9965A, #E8B97A)' : 'rgba(255,255,255,0.06)',
                  color: selectedSlot ? '#0A0806' : 'rgba(247,242,234,0.3)',
                  boxShadow: selectedSlot ? '0 8px 24px rgba(201,150,90,0.3)' : 'none',
                }}>
                  {isPending ? 'Confirmando...' : selectedSlot ? 'Confirmar cita ✓' : 'Selecciona horario'}
                </button>
                <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.2)', textAlign: 'center', marginTop: 10 }}>Puedes cancelar hasta 24h antes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior móvil */}
      <div className="booking-summary-mobile" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(10,8,6,0.99)', backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(201,150,90,0.15)',
        padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        zIndex: 999, flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#F7F2EA' }}>{service?.name}</p>
            <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)', margin: 0 }}>
              {selectedSlot
                ? `📅 ${format(new Date(selectedSlot.starts_at), "d MMM", { locale: es })} · 🕐 ${format(new Date(selectedSlot.starts_at), 'HH:mm')}`
                : 'Selecciona fecha y hora'
              }
            </p>
          </div>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#C9965A', fontStyle: 'italic', lineHeight: 1, flexShrink: 0, margin: 0 }}>{service?.price}€</p>
        </div>
        <button onClick={() => book()} disabled={!selectedSlot || isPending} style={{
          width: '100%', border: 'none', borderRadius: 12, padding: '16px',
          fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
          cursor: selectedSlot ? 'pointer' : 'not-allowed', letterSpacing: '0.05em', transition: 'all 0.2s',
          background: selectedSlot ? 'linear-gradient(135deg, #C9965A, #E8B97A)' : 'rgba(255,255,255,0.08)',
          color: selectedSlot ? '#0A0806' : 'rgba(247,242,234,0.3)',
          boxShadow: selectedSlot ? '0 8px 24px rgba(201,150,90,0.3)' : 'none',
        }}>
          {isPending ? '⏳ Confirmando...' : selectedSlot ? '✓ Confirmar cita' : 'Selecciona un horario'}
        </button>
        <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.2)', textAlign: 'center', margin: 0 }}>Puedes cancelar hasta 24h antes</p>
      </div>
    </div>
  )
}