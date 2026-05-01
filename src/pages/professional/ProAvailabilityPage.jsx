import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profApi, authApi, calendarApi } from '../../services/api'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
  day_of_week:         d.key,
  is_available:        false,
  start_time:          '09:00',
  end_time:            '14:00',
  afternoon_available: true,
  afternoon_start:     '16:00',
  afternoon_end:       '20:00',
}))

function getLastSlot(endTime, durationMinutes) {
  if (!endTime || !durationMinutes) return null
  const [h, m] = endTime.split(':').map(Number)
  const totalMins = h * 60 + m - durationMinutes
  if (totalMins < 0) return null
  return `${String(Math.floor(totalMins / 60)).padStart(2, '0')}:${String(totalMins % 60).padStart(2, '0')}`
}

function TimeBlock({ label, startVal, endVal, active, onToggle, onStartChange, onEndChange, minDuration, accent }) {
  return (
    <div style={{
      background: active ? (accent ? 'rgba(184,131,58,0.05)' : '#FAFAF9') : '#F7F5F2',
      border: `1.5px solid ${active ? (accent ? 'rgba(184,131,58,0.2)' : 'rgba(0,0,0,0.1)') : 'rgba(0,0,0,0.06)'}`,
      borderRadius: 12, padding: '12px 14px', opacity: active ? 1 : 0.55, transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: active ? 12 : 0 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: active ? (accent ? '#B8833A' : 'rgba(26,22,18,0.55)') : 'rgba(26,22,18,0.25)', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
          {label}
        </span>
        <div onClick={onToggle} style={{
          width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
          background: active ? '#B8833A' : 'rgba(0,0,0,0.1)',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF',
            position: 'absolute', top: 3, left: active ? 21 : 3,
            transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }} />
        </div>
      </div>

      {active && (
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 9, color: 'rgba(26,22,18,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>Desde</p>
              <input type="time" value={startVal} onChange={e => onStartChange(e.target.value)}
                style={{ width: '100%', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '8px 10px', color: '#1A1612', fontSize: 13, fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box' }}
              />
            </div>
            <span style={{ color: 'rgba(26,22,18,0.2)', fontSize: 16, paddingTop: 16 }}>—</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 9, color: 'rgba(26,22,18,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>Hasta</p>
              <input type="time" value={endVal} onChange={e => onEndChange(e.target.value)}
                style={{ width: '100%', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '8px 10px', color: '#1A1612', fontSize: 13, fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          {minDuration && (
            <p style={{ fontSize: 10, color: 'rgba(26,22,18,0.35)', marginTop: 6, fontFamily: 'Outfit, sans-serif' }}>
              ⏰ Última cita: <span style={{ color: '#B8833A', fontWeight: 600 }}>{getLastSlot(endVal, minDuration)}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Google Calendar Connect Card
// ─────────────────────────────────────────────────────────────
function GoogleCalendarCard() {
  const [loading, setLoading] = useState(false)

  const { data: status, refetch } = useQuery({
    queryKey: ['gcalStatus'],
    queryFn: () => calendarApi.getStatus().then(r => r.data),
    retry: false,
  })

  const { mutate: doDisconnect, isPending: disconnecting } = useMutation({
    mutationFn: () => calendarApi.disconnect(),
    onSuccess: () => {
      toast.success('Google Calendar desconectado')
      refetch()
    },
    onError: () => toast.error('Error al desconectar'),
  })

  const handleConnect = async () => {
    try {
      setLoading(true)
      const { data } = await calendarApi.getConnectUrl()
      // Abre la URL de autorización de Google en la misma pestaña
      window.location.href = data.url
    } catch {
      toast.error('Error al conectar con Google Calendar')
      setLoading(false)
    }
  }

  const connected = status?.connected ?? false

  return (
    <div style={{
      background: '#FFFFFF', border: `1.5px solid ${connected ? 'rgba(184,131,58,0.25)' : 'rgba(0,0,0,0.07)'}`,
      borderRadius: 16, padding: '18px 20px', marginBottom: 20,
      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    }}>
      {/* Título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {/* Icono Google Calendar (SVG inline simplificado) */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="17" rx="2" fill={connected ? '#B8833A' : '#E0E0E0'} />
          <rect x="3" y="4" width="18" height="5" rx="2" fill={connected ? '#8B6020' : '#9E9E9E'} />
          <rect x="7" y="2" width="2" height="4" rx="1" fill={connected ? '#B8833A' : '#757575'} />
          <rect x="15" y="2" width="2" height="4" rx="1" fill={connected ? '#B8833A' : '#757575'} />
          <rect x="7" y="12" width="3" height="3" rx="0.5" fill="white" opacity="0.9" />
          <rect x="11" y="12" width="3" height="3" rx="0.5" fill="white" opacity="0.9" />
          <rect x="15" y="12" width="3" height="3" rx="0.5" fill="white" opacity="0.5" />
        </svg>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1612', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
            Google Calendar
          </p>
          <p style={{ fontSize: 10, color: connected ? '#B8833A' : 'rgba(26,22,18,0.4)', fontFamily: 'Outfit, sans-serif', margin: 0, fontWeight: connected ? 600 : 400 }}>
            {connected ? '● Sincronizado' : '○ No conectado'}
          </p>
        </div>
      </div>

      {/* Descripción */}
      <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.55)', fontFamily: 'Outfit, sans-serif', marginBottom: 14, lineHeight: 1.5 }}>
        {connected
          ? 'Tus reservas de Topsy se sincronizan automáticamente con tu calendario y los eventos externos bloquean tus slots.'
          : 'Conecta tu Google Calendar para sincronizar tus reservas y que tus eventos externos bloqueen automáticamente tus slots.'
        }
      </p>

      {/* Botón */}
      {connected ? (
        <button
          onClick={() => doDisconnect()}
          disabled={disconnecting}
          style={{
            width: '100%', border: '1.5px solid rgba(184,131,58,0.25)',
            borderRadius: 10, padding: '10px', background: 'rgba(184,131,58,0.04)',
            color: '#B8833A', fontSize: 12, fontWeight: 600, fontFamily: 'Outfit, sans-serif',
            cursor: disconnecting ? 'not-allowed' : 'pointer', opacity: disconnecting ? 0.6 : 1,
          }}
        >
          {disconnecting ? 'Desconectando...' : 'Desconectar Google Calendar'}
        </button>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          style={{
            width: '100%', border: 'none', borderRadius: 10, padding: '11px',
            background: loading ? 'rgba(184,131,58,0.4)' : 'linear-gradient(135deg, #B8833A, #D4A055)',
            color: '#FFFFFF', fontSize: 12, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 14px rgba(184,131,58,0.25)',
            opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {loading ? 'Redirigiendo...' : '🗓 Conectar Google Calendar'}
        </button>
      )}
    </div>
  )
}

function BlockedDatesCard() {
  const qc = useQueryClient()
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [adding, setAdding] = useState(false)

  const { data: blocked = [] } = useQuery({
    queryKey: ['blocked-dates'],
    queryFn: () => profApi.getBlockedDates().then(r => r.data.data),
  })

  const { mutate: addDate, isPending: addPending } = useMutation({
    mutationFn: ({ date, reason }) => profApi.addBlockedDate(date, reason),
    onSuccess: () => {
      toast.success('Fecha bloqueada ✓')
      setNewDate(''); setNewReason(''); setAdding(false)
      qc.invalidateQueries({ queryKey: ['blocked-dates'] })
    },
    onError: err => toast.error(err.response?.data?.error ?? 'Error'),
  })

  const { mutate: removeDate } = useMutation({
    mutationFn: (date) => profApi.removeBlockedDate(date),
    onSuccess: () => { toast.success('Fecha desbloqueada'); qc.invalidateQueries({ queryKey: ['blocked-dates'] }) },
    onError: () => toast.error('Error al desbloquear'),
  })

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: '18px 20px', marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
        <span style={{ display: 'inline-block', width: 16, height: 1.5, background: '#B8833A' }} /> Días no disponibles
      </p>
      <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.45)', marginBottom: 14, fontFamily: 'Outfit, sans-serif' }}>
        Bloquea días específicos por vacaciones, festivos o cualquier ausencia puntual.
      </p>

      {/* Lista de fechas bloqueadas */}
      {blocked.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {blocked.map(({ date, reason }) => (
            <div key={date} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.12)', borderRadius: 10, padding: '8px 12px' }}>
              <span style={{ fontSize: 14 }}>🚫</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1612', margin: 0 }}>
                  {new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                {reason && <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: 'rgba(26,22,18,0.4)', margin: '2px 0 0' }}>{reason}</p>}
              </div>
              <button
                onClick={() => { if (confirm('¿Desbloquear este día?')) removeDate(date) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'rgba(220,38,38,0.5)', padding: 4, lineHeight: 1 }}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Formulario para añadir */}
      {adding ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="date"
            value={newDate}
            min={today}
            onChange={e => setNewDate(e.target.value)}
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, border: '1.5px solid rgba(184,131,58,0.3)', borderRadius: 10, padding: '9px 12px', color: '#1A1612', background: '#FDFCFB', outline: 'none' }}
          />
          <input
            type="text"
            value={newReason}
            onChange={e => setNewReason(e.target.value)}
            placeholder="Motivo (opcional) — vacaciones, festivo..."
            maxLength={100}
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 10, padding: '9px 12px', color: '#1A1612', background: '#FDFCFB', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { if (newDate) addDate({ date: newDate, reason: newReason || null }) }}
              disabled={!newDate || addPending}
              style={{ flex: 1, background: newDate ? 'linear-gradient(135deg,#dc2626,#ef4444)' : 'rgba(0,0,0,0.08)', border: 'none', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 700, color: newDate ? '#fff' : 'rgba(0,0,0,0.3)', cursor: newDate ? 'pointer' : 'not-allowed', fontFamily: 'Outfit, sans-serif' }}
            >{addPending ? 'Bloqueando...' : 'Bloquear día'}</button>
            <button onClick={() => { setAdding(false); setNewDate(''); setNewReason('') }} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 13, color: 'rgba(26,22,18,0.5)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Cancelar</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ width: '100%', background: 'rgba(220,38,38,0.05)', border: '1.5px dashed rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px', fontSize: 13, color: '#dc2626', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}
        >+ Añadir día no disponible</button>
      )}
    </div>
  )
}

export default function ProAvailabilityPage() {
  const qc = useQueryClient()
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE)
  const [searchParams] = useSearchParams()

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.user),
  })

  // Toast tras callback de Google Calendar
  useEffect(() => {
    const gcal = searchParams.get('gcal')
    if (gcal === 'connected') {
      toast.success('¡Google Calendar conectado correctamente!')
    } else if (gcal === 'denied') {
      toast.error('Permisos denegados. No se conectó Google Calendar.')
    } else if (gcal === 'error') {
      toast.error('Error al conectar con Google Calendar. Inténtalo de nuevo.')
    }
  }, [])

  useEffect(() => {
    if (!me) return
    const saved = me?.professional_profiles?.availability
    if (saved && saved.length > 0) {
      const merged = DAYS.map(d => {
        const found = saved.find(s => s.day_of_week === d.key)
        return found ? {
          day_of_week:         d.key,
          is_available:        found.is_available,
          start_time:          found.start_time?.slice(0, 5)       ?? '09:00',
          end_time:            found.end_time?.slice(0, 5)         ?? '14:00',
          afternoon_available: found.afternoon_available ?? true,
          afternoon_start:     found.afternoon_start?.slice(0, 5)  ?? '16:00',
          afternoon_end:       found.afternoon_end?.slice(0, 5)    ?? '20:00',
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
    <div style={{ background: '#F7F5F2', minHeight: '100vh', paddingBottom: 100 }}>
      <style>{`
        input[type="time"] { color-scheme: light; }
        input[type="time"]::-webkit-calendar-picker-indicator { opacity: 0.5; }
        .day-card { transition: all 0.2s; }
        .day-card:hover { border-color: rgba(184,131,58,0.25) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.06) !important; }
        .copy-btn:hover { background: rgba(184,131,58,0.1) !important; border-color: rgba(184,131,58,0.35) !important; color: #B8833A !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '28px 0 22px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 28 }}>
        <div className="container-app" style={{ maxWidth: 640 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Panel profesional</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,5vw,2.8rem)', fontWeight: 300, color: '#1A1612', marginBottom: 6 }}>
            Mi <em style={{ color: '#B8833A' }}>disponibilidad</em>
          </h1>
          <p style={{ color: 'rgba(26,22,18,0.4)', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>
            Activa los días que trabajas y configura tu horario de mañana y tarde
          </p>
        </div>
      </div>

      <div className="container-app" style={{ padding: '0 16px', maxWidth: 640 }}>

        {activeDays.length === 0 && (
          <div style={{ background: 'rgba(184,131,58,0.06)', border: '1.5px solid rgba(184,131,58,0.15)', borderRadius: 14, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>👋</span>
            <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.55)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
              Activa los días en los que trabajas para que los clientes puedan reservar.
            </p>
          </div>
        )}

        {minDuration && activeDays.length > 0 && (
          <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <span>ℹ️</span>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.5)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
              Servicio más corto: <strong style={{ color: '#B8833A' }}>{minDuration} min</strong> · La última cita será <strong style={{ color: '#B8833A' }}>{minDuration} min antes</strong> del cierre.
            </p>
          </div>
        )}

        {/* Días */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {schedule.map(day => {
            const dayInfo = DAYS.find(d => d.key === day.day_of_week)
            return (
              <div key={day.day_of_week} className="day-card" style={{
                background: day.is_available ? '#FFFFFF' : '#FAFAF8',
                border: `1.5px solid ${day.is_available ? 'rgba(184,131,58,0.2)' : 'rgba(0,0,0,0.07)'}`,
                borderRadius: 18, padding: '16px',
                opacity: day.is_available ? 1 : 0.6,
                boxShadow: day.is_available ? '0 2px 12px rgba(184,131,58,0.06)' : 'none',
              }}>
                {/* Cabecera día */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: day.is_available ? 14 : 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: day.is_available ? '#1A1612' : 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                    {dayInfo?.label}
                  </span>
                  <div onClick={() => updateDay(day.day_of_week, 'is_available', !day.is_available)} style={{
                    width: 48, height: 26, borderRadius: 13, cursor: 'pointer',
                    background: day.is_available ? '#B8833A' : 'rgba(0,0,0,0.12)',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', background: '#FFFFFF',
                      position: 'absolute', top: 3, left: day.is_available ? 25 : 3,
                      transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }} />
                  </div>
                </div>

                {day.is_available && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <TimeBlock
                      label="☀️ Mañana" accent active={true}
                      startVal={day.start_time} endVal={day.end_time}
                      onToggle={() => {}}
                      onStartChange={v => updateDay(day.day_of_week, 'start_time', v)}
                      onEndChange={v => updateDay(day.day_of_week, 'end_time', v)}
                      minDuration={minDuration}
                    />
                    <TimeBlock
                      label="🌙 Tarde" accent={false} active={day.afternoon_available}
                      startVal={day.afternoon_start} endVal={day.afternoon_end}
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
            width: '100%', background: 'rgba(184,131,58,0.06)', border: '1.5px solid rgba(184,131,58,0.2)',
            borderRadius: 12, padding: '12px', cursor: 'pointer', marginBottom: 16,
            color: '#B8833A', fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: 600,
            transition: 'all 0.2s',
          }}>
            ↓ Aplicar horario del primer día activo a todos
          </button>
        )}

        {/* Resumen */}
        {activeDays.length > 0 && (
          <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: '18px 20px', marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              <span style={{ display: 'inline-block', width: 16, height: 1.5, background: '#B8833A' }} /> Resumen
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activeDays.map(d => (
                <div key={d.day_of_week} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontFamily: 'Outfit, sans-serif' }}>
                  <span style={{ fontWeight: 700, color: '#B8833A', minWidth: 32 }}>{DAYS.find(x => x.key === d.day_of_week)?.short}</span>
                  <span style={{ color: 'rgba(26,22,18,0.55)' }}>☀️ {d.start_time}–{d.end_time}</span>
                  {d.afternoon_available
                    ? <span style={{ color: 'rgba(26,22,18,0.55)' }}>🌙 {d.afternoon_start}–{d.afternoon_end}</span>
                    : <span style={{ color: 'rgba(26,22,18,0.25)', fontSize: 11 }}>Solo mañana</span>
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Google Calendar */}
        <GoogleCalendarCard />

        {/* Fechas bloqueadas */}
        <BlockedDatesCard />

        <button onClick={() => save()} disabled={isPending} style={{
          width: '100%', border: 'none', borderRadius: 14, padding: '16px',
          background: isPending ? 'rgba(184,131,58,0.4)' : 'linear-gradient(135deg, #B8833A, #D4A055)',
          color: '#FFFFFF', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif',
          cursor: isPending ? 'not-allowed' : 'pointer', letterSpacing: '0.06em',
          boxShadow: isPending ? 'none' : '0 6px 20px rgba(184,131,58,0.3)',
          opacity: isPending ? 0.7 : 1, transition: 'all 0.2s',
        }}>
          {isPending ? 'Guardando...' : 'Guardar disponibilidad'}
        </button>
      </div>
    </div>
  )
}
