import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { profApi, bookingsApi } from '../services/api'
import {
  format, addDays, isSameDay, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, addMonths, subMonths, isBefore,
  isToday, isSameMonth,
} from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

/* ─── Helpers calendario ─── */
function buildCalendarDays(month) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end   = endOfWeek(endOfMonth(month),     { weekStartsOn: 1 })
  const days  = []
  let cur = start
  while (cur <= end) { days.push(cur); cur = addDays(cur, 1) }
  return days
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

export default function BookingPage() {
  const { professionalId, serviceId } = useParams()
  const navigate = useNavigate()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate]  = useState(null)
  const [selectedSlot, setSelectedSlot]  = useState(null)
  const [notes, setNotes]                = useState('')

  const calDays = buildCalendarDays(currentMonth)

  const { data: prof } = useQuery({
    queryKey: ['professional', professionalId],
    queryFn: () => profApi.getOne(professionalId).then((r) => r.data.data),
  })

  const service = prof?.services?.find((s) => s.id === serviceId)

  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ['slots', professionalId, serviceId, selectedDate && format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () =>
      bookingsApi.getSlots({
        professional_id: professionalId,
        service_id: serviceId,
        date: format(selectedDate, 'yyyy-MM-dd'),
      }).then((r) => r.data.data),
    enabled: !!service && !!selectedDate,
  })

  const freeSlots = slotsData?.filter((s) => s.available) ?? []

  const { mutate: book, isPending } = useMutation({
    mutationFn: () =>
      bookingsApi.create({
        professional_id: professionalId,
        service_id: serviceId,
        starts_at: selectedSlot.starts_at,
        notes,
      }),
    onSuccess: () => {
      toast.success('¡Cita confirmada! 🎉')
      navigate('/dashboard')
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al reservar'),
  })

  // No permitir ir al mes anterior si ya estamos en el mes actual
  const isCurrentMonth = isSameMonth(currentMonth, new Date())

  return (
    <div style={{ background: '#0A0806', minHeight: '100vh', paddingBottom: 200 }}>
      <style>{`
        .cal-day:hover:not(:disabled) { background: rgba(201,150,90,0.1) !important; }
        .slot-btn:hover { background: rgba(201,150,90,0.1) !important; border-color: rgba(201,150,90,0.4) !important; }
        textarea:focus { outline: none; border-color: rgba(201,150,90,0.4) !important; }

        .slots-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        @media (min-width: 400px) {
          .slots-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .booking-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 769px) {
          .booking-grid { grid-template-columns: 1fr 300px; gap: 20px; }
        }

        .booking-summary-desktop { display: none; }
        .booking-summary-mobile  { display: flex !important; }
        @media (min-width: 769px) {
          .booking-summary-desktop { display: block; }
          .booking-summary-mobile  { display: none !important; }
        }

        .booking-header { position: sticky; top: 0; z-index: 10; }
        @media (min-width: 769px) { .booking-header { top: 68px; } }

        .month-nav-btn {
          width: 34px; height: 34px; border-radius: 8px; cursor: pointer;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(247,242,234,0.6); font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .month-nav-btn:hover:not(:disabled) {
          background: rgba(201,150,90,0.1);
          border-color: rgba(201,150,90,0.3);
          color: #C9965A;
        }
        .month-nav-btn:disabled {
          opacity: 0.2; cursor: default;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="booking-header" style={{
        background: 'rgba(10,8,6,0.97)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 0',
      }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '8px 12px', color: 'rgba(247,242,234,0.5)',
            fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', flexShrink: 0,
          }}>←</button>

          <div style={{
            width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
            border: '1.5px solid rgba(201,150,90,0.3)', background: 'rgba(201,150,90,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {prof?.profiles?.avatar_url
              ? <img src={prof.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '1rem' }}>✂️</span>}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#F7F2EA', margin: 0 }}>
              {prof?.business_name}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.35)', margin: 0 }}>📍 {prof?.city}</p>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#C9965A', fontStyle: 'italic', lineHeight: 1, margin: 0 }}>{service?.price}€</p>
            <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', margin: 0 }}>{service?.duration_minutes} min</p>
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '16px' }}>
        <div className="booking-grid" style={{ alignItems: 'start' }}>

          {/* ── Columna izquierda ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Servicio seleccionado */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(201,150,90,0.08), rgba(201,150,90,0.03))',
              border: '1px solid rgba(201,150,90,0.2)', borderRadius: 14,
              padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: '#F7F2EA' }}>{service?.name}</p>
                <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)', margin: 0 }}>⏱ {service?.duration_minutes} min</p>
              </div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#C9965A', fontStyle: 'italic', lineHeight: 1, flexShrink: 0, margin: 0 }}>
                {service?.price}€
              </p>
            </div>

            {/* ── Paso 1: Calendario mensual ── */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 14px' }}>

              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(201,150,90,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#C9965A', fontWeight: 700 }}>1</span>
                Selecciona el día
              </p>

              {/* Navegación mes */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 600, color: '#F7F2EA', margin: 0, textTransform: 'capitalize' }}>
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="month-nav-btn"
                    disabled={isCurrentMonth}
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >‹</button>
                  <button
                    className="month-nav-btn"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >›</button>
                </div>
              </div>

              {/* Cabecera días semana */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
                {WEEK_DAYS.map((d) => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'rgba(247,242,234,0.22)', letterSpacing: '0.04em', paddingBottom: 6 }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid días */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                {calDays.map((day) => {
                  const inMonth    = isSameMonth(day, currentMonth)
                  const isPast     = day < TODAY
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const todayMark  = isToday(day)
                  const disabled   = isPast || !inMonth

                  return (
                    <button
                      key={day.toISOString()}
                      className="cal-day"
                      disabled={disabled}
                      onClick={() => { setSelectedDate(day); setSelectedSlot(null) }}
                      style={{
                        aspectRatio: '1',
                        borderRadius: 10,
                        border: todayMark && !isSelected
                          ? '1px solid rgba(201,150,90,0.5)'
                          : '1px solid transparent',
                        cursor: disabled ? 'default' : 'pointer',
                        transition: 'all 0.15s',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 13,
                        fontWeight: isSelected ? 700 : 400,
                        background: isSelected
                          ? 'linear-gradient(135deg, #C9965A, #E8B97A)'
                          : 'transparent',
                        color: isSelected
                          ? '#0A0806'
                          : disabled
                            ? 'rgba(247,242,234,0.1)'
                            : todayMark
                              ? '#C9965A'
                              : 'rgba(247,242,234,0.75)',
                        boxShadow: isSelected ? '0 4px 14px rgba(201,150,90,0.35)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {inMonth ? format(day, 'd') : ''}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Paso 2: Horas (aparece al seleccionar día) ── */}
            {selectedDate && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 14px' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(201,150,90,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#C9965A', fontWeight: 700 }}>2</span>
                  Hora — {format(selectedDate, "EEEE d MMM", { locale: es })}
                </p>

                {loadingSlots ? (
                  <div className="slots-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="skeleton" style={{ height: 42, borderRadius: 8 }} />
                    ))}
                  </div>
                ) : freeSlots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ fontSize: '1.5rem', marginBottom: 6 }}>😔</p>
                    <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.3)', margin: 0 }}>Sin disponibilidad · Prueba otro día</p>
                  </div>
                ) : (
                  <div className="slots-grid">
                    {freeSlots.map((slot) => {
                      const active = selectedSlot?.starts_at === slot.starts_at
                      return (
                        <button key={slot.starts_at} className="slot-btn" onClick={() => setSelectedSlot(slot)} style={{
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

            {/* ── Paso 3: Notas ── */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 14px' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(201,150,90,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#C9965A', fontWeight: 700 }}>3</span>
                Notas <span style={{ color: 'rgba(247,242,234,0.2)', fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: prefiero tinte sin amoniaco..."
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
                  padding: '10px 12px', color: '#F7F2EA', fontSize: 13,
                  fontFamily: 'Outfit, sans-serif', resize: 'none', height: 76, boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* ── Columna derecha: Resumen desktop ── */}
          <div className="booking-summary-desktop" style={{ position: 'sticky', top: 100 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
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
                <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.2)', textAlign: 'center', marginTop: 10 }}>
                  Puedes cancelar hasta 24h antes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Barra inferior móvil ── */}
      <div className="booking-summary-mobile" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(10,8,6,0.99)', backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(201,150,90,0.15)',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        zIndex: 999, flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#F7F2EA' }}>
              {service?.name}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)', margin: 0 }}>
              {selectedSlot
                ? `📅 ${format(new Date(selectedSlot.starts_at), "d MMM", { locale: es })} · 🕐 ${format(new Date(selectedSlot.starts_at), 'HH:mm')}`
                : 'Selecciona fecha y hora'}
            </p>
          </div>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#C9965A', fontStyle: 'italic', lineHeight: 1, flexShrink: 0, margin: 0 }}>
            {service?.price}€
          </p>
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
        <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.2)', textAlign: 'center', margin: 0 }}>
          Puedes cancelar hasta 24h antes
        </p>
      </div>
    </div>
  )
}