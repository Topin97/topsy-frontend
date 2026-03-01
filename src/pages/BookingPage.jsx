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
    queryFn: () =>
      bookingsApi
        .getSlots({
          professional_id: professionalId,
          service_id: serviceId,
          date: format(selectedDate, 'yyyy-MM-dd'),
        })
        .then((r) => r.data.data),
    enabled: !!service,
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

  const days = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i))

  return (
    <div style={{ background: '#0A0806', minHeight: '100vh', paddingBottom: 200 }}>
      <style>{`
        .day-btn:hover { background: rgba(201,150,90,0.08) !important; }
        .slot-btn:hover { background: rgba(201,150,90,0.08) !important; border-color: rgba(201,150,90,0.3) !important; }

        .days-scroll {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 6px;
          scroll-snap-type: x mandatory;
        }
        .days-scroll::-webkit-scrollbar { height: 2px; }
        .days-scroll::-webkit-scrollbar-thumb { background: rgba(201,150,90,0.2); border-radius: 2px; }
        .day-btn { scroll-snap-align: start; flex-shrink: 0; }

        textarea:focus { outline: none; border-color: rgba(201,150,90,0.3) !important; }

        /* Slots: 3 columnas por defecto en móvil, 4 en desktop */
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        @media (min-width: 480px) {
          .slots-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* Layout principal */
        .booking-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 769px) {
          .booking-grid {
            grid-template-columns: 1fr 300px;
            gap: 20px;
          }
        }

        /* Summary desktop/mobile */
        .booking-summary-desktop { display: none; }
        .booking-summary-mobile  { display: flex !important; }

        @media (min-width: 769px) {
          .booking-summary-desktop { display: block; }
          .booking-summary-mobile  { display: none !important; }
        }

        /* Header sticky: en móvil no hay navbar encima → top:0 */
        .booking-header {
          position: sticky;
          top: 0;
          z-index: 10;
        }
        @media (min-width: 769px) {
          .booking-header {
            top: 68px;
          }
        }
      `}</style>

      {/* Header */}
      <div
        className="booking-header"
        style={{
          background: 'rgba(10,8,6,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '12px 0',
        }}
      >
        <div
          style={{
            maxWidth: 820,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 16px',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '8px 12px',
              color: 'rgba(247,242,234,0.5)',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
              flexShrink: 0,
            }}
          >
            ←
          </button>

          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1.5px solid rgba(201,150,90,0.3)',
              background: 'rgba(201,150,90,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {prof?.profiles?.avatar_url ? (
              <img
                src={prof.profiles.avatar_url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '1rem' }}>✂️</span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1rem',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#F7F2EA',
                margin: 0,
              }}
            >
              {prof?.business_name}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.35)', margin: 0 }}>
              📍 {prof?.city}
            </p>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.3rem',
                color: '#C9965A',
                fontStyle: 'italic',
                lineHeight: 1,
                margin: 0,
              }}
            >
              {service?.price}€
            </p>
            <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', margin: 0 }}>
              {service?.duration_minutes} min
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '16px 16px' }}>
        <div className="booking-grid" style={{ alignItems: 'start' }}>

          {/* ── Left column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Service card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(201,150,90,0.08), rgba(201,150,90,0.03))',
                border: '1px solid rgba(201,150,90,0.2)',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: '#F7F2EA' }}>
                  {service?.name}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)', margin: 0 }}>
                  ⏱ {service?.duration_minutes} min
                </p>
              </div>
              <p
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.8rem',
                  color: '#C9965A',
                  fontStyle: 'italic',
                  lineHeight: 1,
                  flexShrink: 0,
                  margin: 0,
                }}
              >
                {service?.price}€
              </p>
            </div>

            {/* Step 1: Date */}
            <div
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: '16px 14px 12px',
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'rgba(247,242,234,0.35)',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'rgba(201,150,90,0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    color: '#C9965A',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  1
                </span>
                Selecciona el día
              </p>

              <div className="days-scroll">
                {days.map((day) => {
                  const active = isSameDay(day, selectedDate)
                  return (
                    <button
                      key={day.toISOString()}
                      className="day-btn"
                      onClick={() => {
                        setSelectedDate(day)
                        setSelectedSlot(null)
                      }}
                      style={{
                        width: 46,
                        height: 62,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.06)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontFamily: 'Outfit, sans-serif',
                        background: active
                          ? 'linear-gradient(135deg, #C9965A, #E8B97A)'
                          : 'rgba(255,255,255,0.02)',
                        color: active ? '#0A0806' : 'rgba(247,242,234,0.5)',
                        boxShadow: active ? '0 4px 12px rgba(201,150,90,0.3)' : 'none',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 8,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontWeight: active ? 700 : 400,
                        }}
                      >
                        {format(day, 'EEE', { locale: es })}
                      </span>
                      <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>
                        {format(day, 'd')}
                      </span>
                      <span style={{ fontSize: 8, opacity: 0.7 }}>
                        {format(day, 'MMM', { locale: es })}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Time */}
            <div
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: '16px 14px',
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'rgba(247,242,234,0.35)',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'rgba(201,150,90,0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    color: '#C9965A',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  2
                </span>
                Hora — {format(selectedDate, 'd MMM', { locale: es })}
              </p>

              {loadingSlots ? (
                <div className="slots-grid">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />
                  ))}
                </div>
              ) : freeSlots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ fontSize: '1.5rem', marginBottom: 6 }}>😔</p>
                  <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.3)', margin: 0 }}>
                    Sin disponibilidad · Prueba otro día
                  </p>
                </div>
              ) : (
                <div className="slots-grid">
                  {freeSlots.map((slot) => {
                    const active = selectedSlot?.starts_at === slot.starts_at
                    return (
                      <button
                        key={slot.starts_at}
                        className="slot-btn"
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: '10px 4px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 600,
                          fontFamily: 'Outfit, sans-serif',
                          border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.06)'}`,
                          transition: 'all 0.2s',
                          background: active
                            ? 'linear-gradient(135deg, #C9965A, #E8B97A)'
                            : 'rgba(255,255,255,0.02)',
                          color: active ? '#0A0806' : 'rgba(247,242,234,0.6)',
                          boxShadow: active ? '0 4px 12px rgba(201,150,90,0.3)' : 'none',
                        }}
                      >
                        {format(new Date(slot.starts_at), 'HH:mm')}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Notes */}
            <div
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: '16px 14px',
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'rgba(247,242,234,0.35)',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'rgba(201,150,90,0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    color: '#C9965A',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  3
                </span>
                Notas{' '}
                <span
                  style={{
                    color: 'rgba(247,242,234,0.2)',
                    fontSize: 10,
                    textTransform: 'none',
                    letterSpacing: 0,
                  }}
                >
                  (opcional)
                </span>
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: prefiero tinte sin amoniaco..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  color: '#F7F2EA',
                  fontSize: 13,
                  fontFamily: 'Outfit, sans-serif',
                  resize: 'none',
                  height: 76,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* ── Right: Summary Desktop ── */}
          <div className="booking-summary-desktop" style={{ position: 'sticky', top: 100 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(201,150,90,0.08), transparent)',
                  padding: '20px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(247,242,234,0.35)',
                    marginBottom: 6,
                  }}
                >
                  Resumen
                </p>
                <p
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    margin: 0,
                    color: '#F7F2EA',
                  }}
                >
                  {prof?.business_name}
                </p>
              </div>

              <div style={{ padding: '20px 24px' }}>
                {[
                  { label: 'Servicio', value: service?.name },
                  { label: 'Duración', value: `${service?.duration_minutes} min` },
                  {
                    label: 'Fecha',
                    value: selectedSlot
                      ? format(new Date(selectedSlot.starts_at), 'd MMM yyyy', { locale: es })
                      : '—',
                  },
                  {
                    label: 'Hora',
                    value: selectedSlot
                      ? `${format(new Date(selectedSlot.starts_at), 'HH:mm')} – ${format(new Date(selectedSlot.ends_at), 'HH:mm')}`
                      : '—',
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'rgba(247,242,234,0.4)' }}>{label}</span>
                    <span style={{ color: '#F7F2EA', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0 0',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#F7F2EA' }}>Total</span>
                  <span
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '2rem',
                      color: '#C9965A',
                      fontStyle: 'italic',
                      lineHeight: 1,
                    }}
                  >
                    {service?.price}€
                  </span>
                </div>
              </div>

              <div style={{ padding: '0 24px 24px' }}>
                <button
                  onClick={() => book()}
                  disabled={!selectedSlot || isPending}
                  style={{
                    width: '100%',
                    border: 'none',
                    borderRadius: 12,
                    padding: '15px',
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'Outfit, sans-serif',
                    cursor: selectedSlot ? 'pointer' : 'not-allowed',
                    letterSpacing: '0.05em',
                    transition: 'all 0.2s',
                    background: selectedSlot
                      ? 'linear-gradient(135deg, #C9965A, #E8B97A)'
                      : 'rgba(255,255,255,0.06)',
                    color: selectedSlot ? '#0A0806' : 'rgba(247,242,234,0.3)',
                    boxShadow: selectedSlot ? '0 8px 24px rgba(201,150,90,0.3)' : 'none',
                  }}
                >
                  {isPending ? 'Confirmando...' : selectedSlot ? 'Confirmar cita ✓' : 'Selecciona horario'}
                </button>
                <p
                  style={{
                    fontSize: 11,
                    color: 'rgba(247,242,234,0.2)',
                    textAlign: 'center',
                    marginTop: 10,
                  }}
                >
                  Puedes cancelar hasta 24h antes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom bar ── */}
      <div
        className="booking-summary-mobile"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(10,8,6,0.99)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(201,150,90,0.15)',
          padding: '12px 16px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          zIndex: 999,
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#F7F2EA',
              }}
            >
              {service?.name}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)', margin: 0 }}>
              {selectedSlot
                ? `📅 ${format(new Date(selectedSlot.starts_at), 'd MMM', { locale: es })} · 🕐 ${format(new Date(selectedSlot.starts_at), 'HH:mm')}`
                : 'Selecciona fecha y hora'}
            </p>
          </div>
          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.5rem',
              color: '#C9965A',
              fontStyle: 'italic',
              lineHeight: 1,
              flexShrink: 0,
              margin: 0,
            }}
          >
            {service?.price}€
          </p>
        </div>

        <button
          onClick={() => book()}
          disabled={!selectedSlot || isPending}
          style={{
            width: '100%',
            border: 'none',
            borderRadius: 12,
            padding: '16px',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'Outfit, sans-serif',
            cursor: selectedSlot ? 'pointer' : 'not-allowed',
            letterSpacing: '0.05em',
            transition: 'all 0.2s',
            background: selectedSlot
              ? 'linear-gradient(135deg, #C9965A, #E8B97A)'
              : 'rgba(255,255,255,0.08)',
            color: selectedSlot ? '#0A0806' : 'rgba(247,242,234,0.3)',
            boxShadow: selectedSlot ? '0 8px 24px rgba(201,150,90,0.3)' : 'none',
          }}
        >
          {isPending ? '⏳ Confirmando...' : selectedSlot ? '✓ Confirmar cita' : 'Selecciona un horario'}
        </button>

        <p
          style={{
            fontSize: 11,
            color: 'rgba(247,242,234,0.2)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Puedes cancelar hasta 24h antes
        </p>
      </div>
    </div>
  )
}