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
  day_of_week:  d.key,
  is_available: !['saturday', 'sunday'].includes(d.key),
  start_time:   '09:00',
  end_time:     '18:00',
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

export default function ProAvailabilityPage() {
  const qc = useQueryClient()
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE)
  const [initialized, setInitialized] = useState(false)

  // Cargar datos guardados
  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.user),
  })

  // Inicializar schedule con datos de la API
  useEffect(() => {
    if (!me || initialized) return
    const saved = me?.professional_profiles?.availability
    if (saved && saved.length > 0) {
      // Mergear con DEFAULT para asegurar que todos los días están presentes
      const merged = DAYS.map(d => {
        const found = saved.find(s => s.day_of_week === d.key)
        return found
          ? { day_of_week: d.key, is_available: found.is_available, start_time: found.start_time?.slice(0,5) ?? '09:00', end_time: found.end_time?.slice(0,5) ?? '18:00' }
          : DEFAULT_SCHEDULE.find(s => s.day_of_week === d.key)
      })
      setSchedule(merged)
    }
    setInitialized(true)
  }, [me])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => profApi.setAvail({ availability: schedule }),
    onSuccess: () => {
      toast.success('Disponibilidad guardada ✓')
      qc.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al guardar'),
  })

  const updateDay = (dayKey, field, value) => {
    setSchedule(prev => prev.map(d => d.day_of_week === dayKey ? { ...d, [field]: value } : d))
  }

  const copyToAll = (sourceKey) => {
    const source = schedule.find(d => d.day_of_week === sourceKey)
    setSchedule(prev => prev.map(d => d.is_available ? { ...d, start_time: source.start_time, end_time: source.end_time } : d))
    toast.success('Horario copiado a todos los días activos')
  }

  const activeDays = schedule.filter(d => d.is_available)

  // Servicios del profesional para calcular última cita
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
        .day-row:hover { border-color: rgba(201,150,90,0.2) !important; }
        .day-row { transition: all 0.2s; }
        .copy-btn:hover { background: rgba(201,150,90,0.1) !important; border-color: rgba(201,150,90,0.3) !important; color: #C9965A !important; }
      `}</style>

      <div className="container-app" style={{ padding: '32px 16px', maxWidth: 640 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 20, height: 1, background: '#C9965A' }} /> Panel profesional
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,5vw,2.8rem)', fontWeight: 300, marginBottom: 8 }}>
          Mi <em style={{ color: '#C9965A' }}>disponibilidad</em>
        </h1>
        <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 13, marginBottom: 32 }}>
          Configura los días y horarios en los que aceptas citas
        </p>

        {/* Aviso última cita */}
        {minDuration && (
          <div style={{ background: 'rgba(201,150,90,0.06)', border: '1px solid rgba(201,150,90,0.15)', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
            <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.5)', margin: 0 }}>
              Tu servicio más corto dura <strong style={{ color: '#C9965A' }}>{minDuration} min</strong>. La última cita posible será <strong style={{ color: '#C9965A' }}>{minDuration} min antes</strong> del cierre.
            </p>
          </div>
        )}

        {/* Days */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {schedule.map(day => {
            const dayInfo = DAYS.find(d => d.key === day.day_of_week)
            const lastSlot = day.is_available && minDuration ? getLastSlot(day.end_time, minDuration) : null

            return (
              <div key={day.day_of_week} className="day-row" style={{
                background: day.is_available ? 'rgba(201,150,90,0.05)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${day.is_available ? 'rgba(201,150,90,0.15)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 16, padding: '16px',
                opacity: day.is_available ? 1 : 0.5,
              }}>
                {/* Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: day.is_available ? 14 : 0 }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: day.is_available ? '#F7F2EA' : 'rgba(247,242,234,0.4)' }}>
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

                {/* Horas */}
                {day.is_available && (
                  <div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Apertura</p>
                        <input type="time" value={day.start_time}
                          onChange={e => updateDay(day.day_of_week, 'start_time', e.target.value)}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', color: '#F7F2EA', fontSize: 14, fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ paddingBottom: 12, color: 'rgba(247,242,234,0.2)', fontSize: 18 }}>—</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Cierre</p>
                        <input type="time" value={day.end_time}
                          onChange={e => updateDay(day.day_of_week, 'end_time', e.target.value)}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', color: '#F7F2EA', fontSize: 14, fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    {/* Última cita posible */}
                    {lastSlot && (
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, color: 'rgba(247,242,234,0.25)' }}>⏰ Última cita posible:</span>
                        <span style={{ fontSize: 11, color: '#C9965A', fontWeight: 600 }}>{lastSlot}</span>
                        <span style={{ fontSize: 10, color: 'rgba(247,242,234,0.2)' }}>({minDuration} min antes del cierre)</span>
                      </div>
                    )}
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
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {activeDays.map(d => {
                const last = minDuration ? getLastSlot(d.end_time, minDuration) : null
                return (
                  <div key={d.day_of_week} style={{ background: 'rgba(201,150,90,0.08)', border: '1px solid rgba(201,150,90,0.18)', borderRadius: 10, padding: '7px 12px', fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color: '#C9965A' }}>{DAYS.find(x => x.key === d.day_of_week)?.short}</span>
                    <span style={{ color: 'rgba(247,242,234,0.45)', marginLeft: 6 }}>{d.start_time} – {d.end_time}</span>
                    {last && <span style={{ color: 'rgba(247,242,234,0.25)', marginLeft: 6, fontSize: 11 }}>· última {last}</span>}
                  </div>
                )
              })}
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