import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../../services/api'
import api from '../../services/api'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { useState } from 'react'

function formatDateLabel(dateStr) {
  const d = parseISO(dateStr + 'T12:00:00')
  if (isToday(d))    return 'Hoy'
  if (isTomorrow(d)) return 'Mañana'
  return format(d, "EEEE d 'de' MMMM", { locale: es })
}

export default function ProWaitlistPage() {
  const qc = useQueryClient()
  const [notifying, setNotifying] = useState(null)

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.user),
  })
  const waitlistEnabled = meData?.professional_profiles?.waitlist_enabled ?? false

  const { mutate: toggleWaitlist, isPending: toggling } = useMutation({
    mutationFn: () => api.patch('/professionals/waitlist/toggle'),
    onSuccess: (res) => {
      toast.success(res.data.message)
      qc.invalidateQueries({ queryKey: ['me'] })
    },
    onError: () => toast.error('Error al cambiar estado'),
  })

  const { data: waitlistData, isLoading } = useQuery({
    queryKey: ['pro-waitlist'],
    queryFn: () => api.get('/waitlist/pro').then(r => r.data.data ?? []),
    refetchInterval: 60000,
  })

  const waitlist = waitlistData ?? []
  const notifiedCount = waitlist.filter(w => w.notified_at).length
  const pendingCount  = waitlist.filter(w => !w.notified_at).length

  const grouped = waitlist.reduce((acc, w) => {
    if (!acc[w.date]) acc[w.date] = []
    acc[w.date].push(w)
    return acc
  }, {})

  const { mutate: notifyClient } = useMutation({
    mutationFn: (waitlist_id) => api.post('/waitlist/notify', { waitlist_id }),
    onSuccess: () => {
      toast.success('Cliente notificado por email ✓')
      setNotifying(null)
      qc.invalidateQueries({ queryKey: ['pro-waitlist'] })
    },
    onError: () => { toast.error('Error al notificar'); setNotifying(null) },
  })

  return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh', paddingBottom: 80 }}>
      <style>{`
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        .waiter-card { transition: box-shadow 0.2s; }
        .waiter-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; }
        .notify-btn:hover { opacity: 0.88 !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '28px 0 22px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div className="container-app" style={{ maxWidth: 680 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            <span style={{ display: 'inline-block', width: 20, height: 1.5, background: '#B8833A', borderRadius: 1 }} /> Panel profesional
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 300, lineHeight: 1.1, color: '#1A1612', margin: 0 }}>
              Clientes en <em style={{ color: '#B8833A' }}>espera</em>
            </h1>
            {waitlist.length > 0 && (
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingBottom: 2 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#B8833A', margin: 0, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{pendingCount}</p>
                  <p style={{ fontSize: 10, color: 'rgba(26,22,18,0.4)', margin: '3px 0 0', fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pendientes</p>
                </div>
                <div style={{ width: 1, height: 32, background: 'rgba(0,0,0,0.08)' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#16a34a', margin: 0, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{notifiedCount}</p>
                  <p style={{ fontSize: 10, color: 'rgba(26,22,18,0.4)', margin: '3px 0 0', fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Avisados</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-app" style={{ padding: '24px 16px', maxWidth: 680 }}>

        {/* Toggle */}
        <div style={{ background: '#FFFFFF', border: `1.5px solid ${waitlistEnabled ? 'rgba(184,131,58,0.2)' : 'rgba(0,0,0,0.07)'}`, borderRadius: 18, padding: '20px 24px', marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: waitlistEnabled ? 'rgba(184,131,58,0.1)' : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                ⏳
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1612', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Lista de espera</p>
                <p style={{ fontSize: 12, color: waitlistEnabled ? '#B8833A' : 'rgba(26,22,18,0.4)', margin: '3px 0 0', fontFamily: 'Outfit, sans-serif', fontWeight: waitlistEnabled ? 600 : 400 }}>
                  {waitlistEnabled ? '● Activa — los clientes pueden apuntarse' : '○ Desactivada'}
                </p>
              </div>
            </div>
            <button onClick={() => toggleWaitlist()} disabled={toggling}
              style={{ width: 52, height: 30, borderRadius: 15, background: waitlistEnabled ? '#B8833A' : 'rgba(0,0,0,0.15)', border: 'none', position: 'relative', cursor: toggling ? 'not-allowed' : 'pointer', transition: 'background 0.25s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 3, left: waitlistEnabled ? 25 : 3, width: 24, height: 24, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.25s' }} />
            </button>
          </div>

          {waitlistEnabled && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(184,131,58,0.06)', border: '1px solid rgba(184,131,58,0.15)', borderRadius: 10, padding: '7px 12px', fontSize: 12, color: 'rgba(26,22,18,0.55)', fontFamily: 'Outfit, sans-serif' }}>
                📧 Email de confirmación al apuntarse
              </span>
              <span style={{ background: 'rgba(184,131,58,0.06)', border: '1px solid rgba(184,131,58,0.15)', borderRadius: 10, padding: '7px 12px', fontSize: 12, color: 'rgba(26,22,18,0.55)', fontFamily: 'Outfit, sans-serif' }}>
                🔔 Aviso automático si se cancela una cita
              </span>
            </div>
          )}
        </div>

        {/* Lista */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 90, borderRadius: 16, background: 'linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite' }} />)}
          </div>
        ) : waitlist.length === 0 ? (
          <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 18, padding: '56px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: '2.8rem', marginBottom: 14 }}>⏳</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontStyle: 'italic', color: '#1A1612', marginBottom: 8 }}>Sin clientes en espera</p>
            <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif', maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
              {waitlistEnabled
                ? 'Cuando un cliente se apunte para un día completo, aparecerá aquí.'
                : 'Activa la lista de espera para que los clientes puedan solicitarla.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {Object.entries(grouped).map(([date, waiters]) => (
              <div key={date}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ background: 'linear-gradient(135deg,#B8833A,#D4A055)', borderRadius: 8, padding: '4px 12px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#FFFFFF', fontFamily: 'Outfit, sans-serif', margin: 0, textTransform: 'capitalize', letterSpacing: '0.04em' }}>
                      {formatDateLabel(date)}
                    </p>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                    {waiters.length} {waiters.length === 1 ? 'cliente' : 'clientes'} · {waiters.filter(w => !w.notified_at).length} pendientes
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {waiters.map((w, idx) => (
                    <div key={w.id} className="waiter-card" style={{ background: '#FFFFFF', border: `1.5px solid ${w.notified_at ? 'rgba(22,163,74,0.15)' : 'rgba(0,0,0,0.07)'}`, borderRadius: 16, padding: '16px 18px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: idx === 0 ? 'linear-gradient(135deg,#B8833A,#D4A055)' : 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: idx === 0 ? '#FFFFFF' : 'rgba(26,22,18,0.35)', flexShrink: 0, fontFamily: 'Outfit, sans-serif' }}>
                          {idx + 1}
                        </div>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', background: 'rgba(184,131,58,0.08)', border: '1.5px solid rgba(184,131,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {w.profiles?.avatar_url
                            ? <img src={w.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#B8833A', fontWeight: 600 }}>{w.profiles?.full_name?.[0]?.toUpperCase()}</span>
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1612', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{w.profiles?.full_name ?? 'Cliente'}</p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                            {w.services?.name && (
                              <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.5)', fontFamily: 'Outfit, sans-serif', background: 'rgba(0,0,0,0.04)', borderRadius: 6, padding: '2px 7px' }}>
                                {w.services.name}
                              </span>
                            )}
                            {w.time_preference && (
                              <span style={{ fontSize: 11, color: '#B8833A', fontFamily: 'Outfit, sans-serif', background: 'rgba(184,131,58,0.08)', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>
                                ⏰ {{ morning: 'Mañana', afternoon: 'Tarde', any: 'Cualquier hora' }[w.time_preference] ?? w.time_preference}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {w.notified_at ? (
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: 11, color: '#16a34a', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 999, padding: '4px 10px', fontFamily: 'Outfit, sans-serif', fontWeight: 600, display: 'block' }}>✓ Avisado</span>
                              <p style={{ fontSize: 10, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif', margin: '4px 0 0', textAlign: 'right' }}>
                                {format(new Date(w.notified_at), 'HH:mm')}
                              </p>
                            </div>
                          ) : (
                            <button className="notify-btn" onClick={() => { setNotifying(w.id); notifyClient(w.id) }} disabled={notifying === w.id}
                              style={{ background: 'linear-gradient(135deg,#B8833A,#D4A055)', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, color: '#FFFFFF', fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: notifying === w.id ? 'not-allowed' : 'pointer', opacity: notifying === w.id ? 0.6 : 1, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}>
                              {notifying === w.id ? '...' : '📩 Avisar'}
                            </button>
                          )}
                        </div>
                      </div>

                      {w.profiles?.phone && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: 8 }}>
                          <a href={`tel:${w.profiles.phone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: 10, textDecoration: 'none', color: '#16a34a', fontSize: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                            📞 Llamar
                          </a>
                          <a href={`https://wa.me/${w.profiles.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 10, textDecoration: 'none', color: '#128C7E', fontSize: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                            💬 WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
