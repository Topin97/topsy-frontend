import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { profApi, bookingsApi } from '../services/api'
import { format, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function BookingPage() {
  const { professionalId, serviceId } = useParams()
  const navigate = useNavigate()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [notes, setNotes] = useState('')

  const { data: prof } = useQuery({
    queryKey: ['professional', professionalId],
    queryFn: () => profApi.getOne(professionalId).then((r) => r.data.data),
  })

  const service = prof?.services?.find((s) => s.id === serviceId)

  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ['slots', professionalId, serviceId, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => bookingsApi.getSlots({
      professional_id: professionalId,
      service_id: serviceId,
      date: format(selectedDate, 'yyyy-MM-dd'),
    }).then((r) => r.data.data),
    enabled: !!service,
  })

  const freeSlots = slotsData?.filter((s) => s.available) ?? []

  const { mutate: book, isPending } = useMutation({
    mutationFn: () => bookingsApi.create({
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

  const days = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i))

  return (
    <div style={{ background: '#0A0806', minHeight: '100vh', paddingBottom: 120 }}>
      <style>{`
        .day-btn:hover { background: rgba(201,150,90,0.1) !important; }
        .slot-btn:hover { background: rgba(201,150,90,0.1) !important; border-color: rgba(201,150,90,0.3) !important; }
        .days-scroll::-webkit-scrollbar { height: 3px; }
        .days-scroll::-webkit-scrollbar-track { background: transparent; }
        .days-scroll::-webkit-scrollbar-thumb { background: rgba(201,150,90,0.2); border-radius: 2px; }
        textarea:focus { outline: none; border-color: rgba(201,150,90,0.3) !important; }
        @media (max-width: 768px) {
          .booking-grid { grid-template-columns: 1fr !important; }
          .booking-summary-desktop { display: none !important; }
          .booking-summary-mobile { display: block !important; }
          .slots-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 769px) {
          .booking-summary-mobile { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: 'rgba(13,11,8,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container-app" style={{ maxWidth: 820, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', color: 'rgba(247,242,234,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            ← Volver
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, rgba(201,150,90,0.3), rgba(201,150,90,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>✂️</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Reservando en</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prof?.business_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app" style={{ maxWidth: 820, padding: '24px 16px' }}>
        <div className="booking-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

          {/* Left: Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Service */}
            <div style={{ background: 'rgba(201,150,90,0.06)', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 16, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{service?.name}</p>
                <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)' }}>⏱ {service?.duration_minutes} min</p>
              </div>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#C9965A', fontStyle: 'italic' }}>{service?.price}€</span>
            </div>

            {/* Date picker */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '20px 20px 16px' }}>
              <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(201,150,90,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#C9965A', fontWeight: 700 }}>1</span>
                Selecciona el día
              </p>
              <div className="days-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {days.map((day) => {
                  const active = isSameDay(day, selectedDate)
                  return (
                    <button key={day.toISOString()} className="day-btn" onClick={() => { setSelectedDate(day); setSelectedSlot(null) }} style={{
                      flexShrink: 0, width: 52, height: 68,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 14, border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer',
                      background: active ? 'linear-gradient(135deg, #C9965A, #E8B97A)' : 'rgba(255,255,255,0.03)',
                      color: active ? '#0A0806' : 'rgba(247,242,234,0.5)',
                      fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
                      boxShadow: active ? '0 4px 16px rgba(201,150,90,0.3)' : 'none',
                    }}>
                      <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: active ? 700 : 400 }}>{format(day, 'EEE', { locale: es })}</span>
                      <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{format(day, 'd')}</span>
                      <span style={{ fontSize: 9, opacity: 0.7 }}>{format(day, 'MMM', { locale: es })}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 20 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(201,150,90,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#C9965A', fontWeight: 700 }}>2</span>
                Elige la hora — {format(selectedDate, "d 'de' MMMM", { locale: es })}
              </p>

              {loadingSlots ? (
                <div className="slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 10 }} />)}
                </div>
              ) : freeSlots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(247,242,234,0.2)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>😔</div>
                  <p style={{ fontSize: 14, fontStyle: 'italic' }}>Sin disponibilidad este día</p>
                  <p style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}>Prueba con otro día</p>
                </div>
              ) : (
                <div className="slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {freeSlots.map((slot) => {
                    const active = selectedSlot?.starts_at === slot.starts_at
                    return (
                      <button key={slot.starts_at} className="slot-btn" onClick={() => setSelectedSlot(slot)} style={{
                        padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                        fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                        border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.06)'}`,
                        transition: 'all 0.2s',
                        background: active ? 'linear-gradient(135deg, #C9965A, #E8B97A)' : 'rgba(255,255,255,0.03)',
                        color: active ? '#0A0806' : 'rgba(247,242,234,0.6)',
                        boxShadow: active ? '0 4px 16px rgba(201,150,90,0.3)' : 'none',
                      }}>
                        {format(new Date(slot.starts_at), 'HH:mm')}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Notes */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 20 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(201,150,90,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#C9965A', fontWeight: 700 }}>3</span>
                Notas (opcional)
              </p>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: prefiero tinte sin amoniaco, alergia a ciertos productos..." style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#F7F2EA', fontSize: 14, fontFamily: 'Outfit, sans-serif', resize: 'none', height: 88, boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Right: Summary - Desktop */}
          <div className="booking-summary-desktop" style={{ position: 'sticky', top: 90 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(201,150,90,0.08), transparent)', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.35)', marginBottom: 6 }}>Resumen</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 600 }}>{prof?.business_name}</p>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0' }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>Total</span>
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
                <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.25)', textAlign: 'center', marginTop: 10 }}>Puedes cancelar hasta 24h antes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="booking-summary-mobile" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(13,11,8,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 20px', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)', marginBottom: 2 }}>{service?.name}</p>
            <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.7)' }}>
              {selectedSlot
                ? `${format(new Date(selectedSlot.starts_at), "d MMM", { locale: es })} · ${format(new Date(selectedSlot.starts_at), 'HH:mm')}`
                : 'Selecciona fecha y hora'
              }
            </p>
          </div>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#C9965A', fontStyle: 'italic' }}>{service?.price}€</span>
        </div>
        <button onClick={() => book()} disabled={!selectedSlot || isPending} style={{
          width: '100%', border: 'none', borderRadius: 12, padding: '15px',
          fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
          cursor: selectedSlot ? 'pointer' : 'not-allowed', letterSpacing: '0.05em', transition: 'all 0.2s',
          background: selectedSlot ? 'linear-gradient(135deg, #C9965A, #E8B97A)' : 'rgba(255,255,255,0.08)',
          color: selectedSlot ? '#0A0806' : 'rgba(247,242,234,0.3)',
          boxShadow: selectedSlot ? '0 8px 24px rgba(201,150,90,0.3)' : 'none',
        }}>
          {isPending ? 'Confirmando...' : selectedSlot ? '✓ Confirmar cita' : 'Selecciona un horario'}
        </button>
      </div>
    </div>
  )
}