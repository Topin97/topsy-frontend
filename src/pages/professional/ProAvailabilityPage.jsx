import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profApi, authApi } from '../../services/api'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const DAYS = [
  { key: 'monday',    label: 'Lunes' },
  { key: 'tuesday',   label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday',  label: 'Jueves' },
  { key: 'friday',    label: 'Viernes' },
  { key: 'saturday',  label: 'Sábado' },
  { key: 'sunday',    label: 'Domingo' },
]

const DEFAULT_SCHEDULE = DAYS.map((d) => ({
  day_of_week:  d.key,
  is_available: !['saturday', 'sunday'].includes(d.key),
  start_time:   '09:00',
  end_time:     '18:00',
}))

export default function ProAvailabilityPage() {
  const qc = useQueryClient()
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE)

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then((r) => r.data.user),
  })

  // Pre-fill with existing availability
  useEffect(() => {
    if (me?.professional_profiles?.id) {
      // Will be populated from professional profile data
    }
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
    setSchedule((prev) =>
      prev.map((d) => d.day_of_week === dayKey ? { ...d, [field]: value } : d)
    )
  }

  const copyToAll = (sourceKey) => {
    const source = schedule.find((d) => d.day_of_week === sourceKey)
    setSchedule((prev) =>
      prev.map((d) => d.is_available ? { ...d, start_time: source.start_time, end_time: source.end_time } : d)
    )
    toast.success('Horario copiado a todos los días activos')
  }

  return (
    <div className="container-app" style={{ padding: '40px 24px', maxWidth: 700 }}>
      <p className="section-tag" style={{ marginBottom: 8 }}>Panel profesional</p>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, marginBottom: 8 }}>
        Mi <em style={{ color: '#C9965A' }}>disponibilidad</em>
      </h1>
      <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: 14, marginBottom: 32 }}>
        Configura los días y horarios en los que aceptas citas
      </p>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 80px 1fr 1fr 80px', gap: 12, padding: '8px 12px', marginBottom: 8 }}>
            {['Día', 'Activo', 'Inicio', 'Fin', ''].map((h) => (
              <span key={h} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.3)' }}>{h}</span>
            ))}
          </div>

          {schedule.map((day) => {
            const dayLabel = DAYS.find((d) => d.key === day.day_of_week)?.label
            return (
              <div
                key={day.day_of_week}
                style={{
                  display: 'grid', gridTemplateColumns: '120px 80px 1fr 1fr 80px',
                  gap: 12, alignItems: 'center', padding: '12px',
                  borderRadius: 12, background: day.is_available ? 'rgba(201,150,90,0.05)' : 'transparent',
                  border: `1px solid ${day.is_available ? 'rgba(201,150,90,0.15)' : 'rgba(255,255,255,0.04)'}`,
                  opacity: day.is_available ? 1 : 0.5, transition: 'all 0.2s',
                }}
              >
                <span style={{ fontWeight: 500, fontSize: 14 }}>{dayLabel}</span>

                {/* Toggle */}
                <div
                  onClick={() => updateDay(day.day_of_week, 'is_available', !day.is_available)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                    background: day.is_available ? '#C9965A' : 'rgba(255,255,255,0.1)',
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3,
                    left: day.is_available ? 23 : 3,
                    transition: 'left 0.2s',
                  }} />
                </div>

                <input
                  type="time"
                  value={day.start_time}
                  onChange={(e) => updateDay(day.day_of_week, 'start_time', e.target.value)}
                  disabled={!day.is_available}
                  className="input"
                  style={{ padding: '8px 12px', fontSize: 14 }}
                />

                <input
                  type="time"
                  value={day.end_time}
                  onChange={(e) => updateDay(day.day_of_week, 'end_time', e.target.value)}
                  disabled={!day.is_available}
                  className="input"
                  style={{ padding: '8px 12px', fontSize: 14 }}
                />

                <button
                  onClick={() => copyToAll(day.day_of_week)}
                  disabled={!day.is_available}
                  title="Copiar a todos"
                  style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
                    color: 'rgba(247,242,234,0.4)', fontSize: 12, fontFamily: 'Outfit, sans-serif',
                    transition: 'all 0.2s',
                  }}
                >
                  Copiar
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <p className="section-tag" style={{ marginBottom: 16, fontSize: 10 }}>Resumen</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {schedule.filter((d) => d.is_available).map((d) => (
            <div key={d.day_of_week} style={{ background: 'rgba(201,150,90,0.1)', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: '#C9965A' }}>{DAYS.find((x) => x.key === d.day_of_week)?.label.slice(0, 3)}</span>
              <span style={{ color: 'rgba(247,242,234,0.5)', marginLeft: 6 }}>{d.start_time} – {d.end_time}</span>
            </div>
          ))}
          {schedule.every((d) => !d.is_available) && (
            <p style={{ color: 'rgba(247,242,234,0.3)', fontSize: 13, fontStyle: 'italic' }}>Ningún día activo</p>
          )}
        </div>
      </div>

      <button
        onClick={() => save()}
        disabled={isPending}
        className="btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: '14px' }}
      >
        {isPending ? 'Guardando...' : 'Guardar disponibilidad'}
      </button>
    </div>
  )
}