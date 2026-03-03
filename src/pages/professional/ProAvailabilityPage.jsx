import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profApi, authApi } from '../../services/api'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const DAYS = [
  { key: 'monday',    label: 'Lunes',     short: 'Lun' },
  { key: 'tuesday',   label: 'Martes',    short: 'Mar' },
  { key: 'wednesday', label: 'Miércoles', short: 'Mié' },
  { key: 'thursday',  label: 'Jueves',    short: 'Jue' },
  { key: 'friday',    label: 'Viernes',   short: 'Vie' },
  { key: 'saturday',  label: 'Sábado',    short: 'Sáb' },
  { key: 'sunday',    label: 'Domingo',   short: 'Dom' },
]

const DEFAULT_SCHEDULE = DAYS.map(d => ({
  day_of_week:          d.key,
  is_available:         false,
  start_time:           '09:00',
  end_time:             '14:00',
  afternoon_available:  true,
  afternoon_start:      '16:00',
  afternoon_end:        '20:00',
}))

function getLastSlot(endTime, durationMinutes) {
  if (!endTime || !durationMinutes) return null
  const [h, m] = endTime.split(':').map(Number)
  const totalMins = h * 60 + m - durationMinutes
  if (totalMins < 0) return null
  const hh = String(Math.floor(totalMins / 60)).padStart(2, '0')
  const mm = String(totalMins % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

function TimeBlock({ label, startVal, endVal, active, onToggle, onStartChange, onEndChange, minDuration, accent }) {
  return (
    <div style={{
      background: active ? (accent ? 'rgba(201,150,90,0.06)' : 'rgba(255,255,255,0.03)') : 'rgba(255,255,255,0.01)',
      border: `1px solid ${active ? (accent ? 'rgba(201,150,90,0.2)' : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.04)'}`,
      borderRadius: 12, padding: '12px 14px', opacity: active ? 1 : 0.5, transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: active ? 12 : 0 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: active ? (accent ? '#C9965A' : 'rgba(247,242,234,0.5)') : 'rgba(247,242,234,0.2)', fontWeight: 600 }}>
          {label}
        </span>
        <div onClick={onToggle} style={{
          width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
          background: active ? (accent ? '#C9965A' : 'rgba(247,242,234,0.2)') : 'rgba(255,255,255,0.08)',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 3, left: active ? 21 : 3,
            transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }} />
        </div>
      </div>

      {active && (
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 9, color: 'rgba(247,242,234,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Desde</p>
              <input type="time" value={startVal} onChange={e => onStartChange(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px', color: '#F7F2EA', fontSize: 13, fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box' }}
              />
            </div>
            <span style={{ color: 'rgba(247,242,234,0.2)', fontSize: 16, paddingTop: 16 }}>—</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 9, color: 'rgba(247,242,234,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Hasta</p>
              <input type="time" value={endVal} onChange={e => onEndChange(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px', color: '#F7F2EA', fontSize: 13, fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          {minDuration && (
            <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.2)', marginTop: 6 }}>
              ⏰ Última cita: <span style={{ color: '#C9965A' }}>{getLastSlot(endVal, minDuration)}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProAvailabilityPage() {
  const qc = useQueryClient()
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE)

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.user),
  })

  useEffect(() => {
    if (!me) return
    const saved = me?.professional_profiles?.availability
    if (saved && saved.length > 0) {
      const merged = DAYS.map(d => {
        const found = saved.find(s => s.day_of_week === d.key)
        return found ? {
          day_of_week:         d.key,
          is_available:        found.is_available,
          start_time:          found.start_time?.slice(0, 5)        ?? '09:00',
          end_time:            found.end_time?.slice(0, 5)          ?? '14:00',
          afternoon_available: found.afternoon_available ?? true,
          afternoon_start:     found.afternoon_start?.slice(0, 5)   ?? '16:00',
          afternoon_end:       found.afternoon_end?.slice(0, 5)     ?? '20:00',
        } : DEFAULT_SCHEDULE.find(s => s.day_of_week === d.key)
      })
      setSchedule(merged)
    }
  }, [JSON.stringify(me?.professional_profiles?.availability)])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => profApi.setAvail({ availability: schedule }),
    onSuccess: () => {
      toast.success('Disponibilidad guardada ✓')
      qc.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al guardar'),
  })

  const updateDay = (dayKey, field, value) =>
    setSchedule(prev => prev.map(d => d.day_of_week === dayKey ? { ...d, [field]: value } : d))

  const copyToAll = (sourceKey) => {
    const src = schedule.find(d => d.day_of_week === sourceKey)
    setSchedule(prev => prev.map(d => d.is_available ? {
      ...d,
      start_time: src.start_time, end_time: src.end_time,
      afternoon_start: src.afternoon_start, afternoon_end: src.afternoon_end,
      afternoon_available: src.afternoon_available,
    } : d))
    toast.success('Horario copiado a todos los días activos')
  }

  const activeDays = schedule.filter(d => d.is_available)
  const services = me?.professional_profiles?.services ?? []
  const minDuration = services.length > 0
    ? Math.min(...services.filter(s => s.is_active !== false).map(s => s.duration_minutes))
    : null

  if (isLoading) return (
    <div className="container-app" style={{ padding: '40px 24px', maxWidth: 640 }}>
      <div className="skeleton" style={{ height: 400, borderRadius: 20 }} />
    </div>
  )

  return (
    <div style={{ background: '#0A0806', minHeight: '100vh', paddingBottom: 100 }}>
      <style>{`
        input[type="time"] { color-scheme: dark; }
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        .day-card { transition: all 0.2s; }
        .day-card:hover { border-color: rgba(201,150,90,0.2) !important; }
        .copy-btn:hover { background: rgba(201,150,90,0.1) !important; border-color: rgba(201,150,90,0.3) !important; color: #C9965A !important; }
      `}</style>

      <div className="container-app" style={{ padding: '32px 16px', maxWidth: 640 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 20, height: 1, background: '#C9965A' }} /> Panel profesional
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,5vw,2.8rem)', fontWeight: 300, marginBottom: 8 }}>
          Mi <em style={{ color: '#C9965A' }}>disponibilidad</em>
        </h1>
        <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 13, marginBottom: 28 }}>
          Activa los días que trabajas y configura tu horario de mañana y tarde
        </p>

        {activeDays.length === 0 && (
          <div style={{ background: 'rgba(201,150,90,0.06)', border: '1px solid rgba(201,150,90,0.15)', borderRadius: 14, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>👋</span>
            <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.5)', margin: 0 }}>
              Activa los días en los que trabajas para que los clientes puedan reservar.
            </p>
          </div>
        )}

        {minDuration && activeDays.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>ℹ️</span>
            <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)', margin: 0 }}>
              Servicio más corto: <strong style={{ color: '#C9965A' }}>{minDuration} min</strong> · La última cita será <strong style={{ color: '#C9965A' }}>{minDuration} min antes</strong> del cierre de cada turno.
            </p>
          </div>
        )}

        {/* Días */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {schedule.map(day => {
            const dayInfo = DAYS.find(d => d.key === day.day_of_week)
            return (
              <div key={day.day_of_week} className="day-card" style={{
                background: day.is_available ? 'rgba(201,150,90,0.04)' : 'rgba(255,255,255,0.015)',
                border: `1px solid ${day.is_available ? 'rgba(201,150,90,0.15)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 18, padding: '16px',
                opacity: day.is_available ? 1 : 0.55,
              }}>
                {/* Cabecera día */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: day.is_available ? 14 : 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: day.is_available ? '#F7F2EA' : 'rgba(247,242,234,0.3)' }}>
                    {dayInfo?.label}
                  </span>
                  <div onClick={() => updateDay(day.day_of_week, 'is_available', !day.is_available)} style={{
                    width: 48, height: 26, borderRadius: 13, cursor: 'pointer',
                    background: day.is_available ? '#C9965A' : 'rgba(255,255,255,0.1)',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 3,
                      left: day.is_available ? 25 : 3,
                      transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }} />
                  </div>
                </div>

                {/* Bloques horarios */}
                {day.is_available && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <TimeBlock
                      label="☀️ Mañana"
                      accent
                      active={true}
                      startVal={day.start_time}
                      endVal={day.end_time}
                      onToggle={() => {}} // Mañana siempre activo si el día está activo
                      onStartChange={v => updateDay(day.day_of_week, 'start_time', v)}
                      onEndChange={v => updateDay(day.day_of_week, 'end_time', v)}
                      minDuration={minDuration}
                    />
                    <TimeBlock
                      label="🌙 Tarde"
                      accent={false}
                      active={day.afternoon_available}
                      startVal={day.afternoon_start}
                      endVal={day.afternoon_end}
                      onToggle={() => updateDay(day.day_of_week, 'afternoon_available', !day.afternoon_available)}
                      onStartChange={v => updateDay(day.day_of_week, 'afternoon_start', v)}
                      onEndChange={v => updateDay(day.day_of_week, 'afternoon_end', v)}
                      minDuration={minDuration}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {activeDays.length > 1 && (
          <button onClick={() => copyToAll(activeDays[0].day_of_week)} className="copy-btn" style={{
            width: '100%', background: 'rgba(201,150,90,0.08)', border: '1px solid rgba(201,150,90,0.25)',
            borderRadius: 12, padding: '12px', cursor: 'pointer', marginBottom: 16,
            color: '#C9965A', fontSize: 13, fontFamily: 'Outfit, sans-serif',
          }}>
            ↓ Aplicar horario del primer día activo a todos
          </button>
        )}

        {/* Resumen */}
        {activeDays.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '18px 20px', marginBottom: 24 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 16, height: 1, background: '#C9965A' }} /> Resumen
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activeDays.map(d => (
                <div key={d.day_of_week} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: '#C9965A', minWidth: 32 }}>{DAYS.find(x => x.key === d.day_of_week)?.short}</span>
                  <span style={{ color: 'rgba(247,242,234,0.5)' }}>☀️ {d.start_time}–{d.end_time}</span>
                  {d.afternoon_available && (
                    <span style={{ color: 'rgba(247,242,234,0.5)' }}>🌙 {d.afternoon_start}–{d.afternoon_end}</span>
                  )}
                  {!d.afternoon_available && (
                    <span style={{ color: 'rgba(247,242,234,0.2)', fontSize: 11 }}>Solo mañana</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => save()} disabled={isPending} style={{
          width: '100%', border: 'none', borderRadius: 12, padding: '16px',
          background: 'linear-gradient(135deg, #C9965A, #E8B97A)', color: '#0A0806',
          fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif',
          cursor: isPending ? 'not-allowed' : 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase',
          opacity: isPending ? 0.7 : 1,
        }}>
          {isPending ? 'Guardando...' : 'Guardar disponibilidad'}
        </button>
      </div>
    </div>
  )
}