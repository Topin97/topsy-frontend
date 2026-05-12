import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { calendarApi } from '../services/api'
import toast from 'react-hot-toast'

/**
 * Banner que aparece cuando Google Calendar se desconectó solo
 * (token revocado, contraseña cambiada, etc.). Solo se muestra si:
 *   - status.connected === false
 *   - status.expiry !== null  (=> alguna vez estuvo conectado)
 *   - el usuario no lo ha ocultado en esta sesión
 *
 * Si el profesional nunca conectó Calendar, NO aparece nada.
 */
export default function GCalDisconnectedBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('gcal-banner-dismissed') === '1'
  })
  const [connecting, setConnecting] = useState(false)

  const { data: status } = useQuery({
    queryKey: ['gcalStatus'],
    queryFn: () => calendarApi.getStatus().then(r => r.data),
    retry: false,
    // Refresca cada 60s para detectar cambios sin necesidad de F5
    refetchInterval: 60_000,
  })

  // Decisión de visibilidad
  const wasOnceConnected = !!status?.expiry
  const isDisconnected = status && !status.connected
  const shouldShow = wasOnceConnected && isDisconnected && !dismissed

  if (!shouldShow) return null

  const handleReconnect = async () => {
    try {
      setConnecting(true)
      const { data } = await calendarApi.getConnectUrl()
      window.location.href = data.url
    } catch {
      toast.error('Error al conectar con Google Calendar')
      setConnecting(false)
    }
  }

  const handleDismiss = () => {
    sessionStorage.setItem('gcal-banner-dismissed', '1')
    setDismissed(true)
  }

  return (
    <div className="gcal-banner anim-fadeup" style={{
      background: 'linear-gradient(135deg, rgba(217,119,6,0.08) 0%, rgba(184,131,58,0.12) 100%)',
      border: '1.5px solid rgba(217,119,6,0.3)',
      borderRadius: 14,
      padding: '14px 16px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      position: 'relative',
      boxShadow: '0 2px 10px rgba(217,119,6,0.08)',
    }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
        .anim-fadeup { animation: fadeInUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both }
        .gcal-reconnect-btn { transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; }
        .gcal-reconnect-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(217,119,6,0.35); }
        .gcal-reconnect-btn:not(:disabled):active { transform: translateY(0) scale(0.98); }
        .gcal-dismiss-btn { transition: color 0.2s ease, transform 0.2s ease; }
        .gcal-dismiss-btn:hover { color: rgba(0,0,0,0.6); transform: scale(1.15); }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: 'linear-gradient(135deg, #D97706, #F59E0B)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
        boxShadow: '0 4px 12px rgba(217,119,6,0.25)',
      }}>
        📅
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontFamily: 'Outfit, sans-serif',
          fontSize: 13, fontWeight: 700, color: '#92400E',
          lineHeight: 1.3,
        }}>
          Tu Google Calendar se ha desconectado
        </p>
        <p style={{
          margin: '2px 0 0', fontFamily: 'Outfit, sans-serif',
          fontSize: 11, color: '#B45309',
          lineHeight: 1.4,
        }}>
          Reconéctalo para que las citas se sincronicen con tu calendario.
        </p>
      </div>

      <button
        onClick={handleReconnect}
        disabled={connecting}
        className="gcal-reconnect-btn"
        style={{
          background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 10,
          padding: '9px 14px',
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'Outfit, sans-serif',
          cursor: connecting ? 'not-allowed' : 'pointer',
          flexShrink: 0,
          whiteSpace: 'nowrap',
          opacity: connecting ? 0.7 : 1,
          boxShadow: '0 3px 10px rgba(217,119,6,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {connecting ? (
          <>
            <span style={{
              width: 12, height: 12,
              border: '2px solid rgba(255,255,255,0.4)',
              borderTopColor: '#FFFFFF',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.8s linear infinite',
            }} />
            Conectando…
          </>
        ) : (
          <>Reconectar →</>
        )}
      </button>

      <button
        onClick={handleDismiss}
        className="gcal-dismiss-btn"
        aria-label="Ocultar aviso"
        style={{
          background: 'none', border: 'none',
          cursor: 'pointer',
          color: 'rgba(0,0,0,0.35)',
          fontSize: 16,
          padding: 4,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  )
}
