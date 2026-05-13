import { useState, useEffect } from 'react'
import api from '../services/api'

// Fecha de apertura: 1 de junio 2026, 09:00 hora Madrid
const LAUNCH_DATE = new Date('2026-06-01T09:00:00+02:00')
const DEV_PASSWORD = 'topin2026'
const COOKIE_NAME = 'topsy_dev'
const COOKIE_DAYS = 30

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^| )' + name + '=([^;]+)'))
  return match ? match[1] : null
}

function setCookie(name, value, days) {
  const d = new Date()
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`
}

function useCountdown(target) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, target.getTime() - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const mins = Math.floor((diff / (1000 * 60)) % 60)
  const secs = Math.floor((diff / 1000) % 60)
  return { days, hours, mins, secs, finished: diff === 0 }
}

export default function ComingSoonGate({ children }) {
  const [hasBypass, setHasBypass] = useState(() => getCookie(COOKIE_NAME) === '1')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { days, hours, mins, secs } = useCountdown(LAUNCH_DATE)

  // Detectar ?dev=topin2026 en la URL al montar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('dev') === DEV_PASSWORD) {
      setCookie(COOKIE_NAME, '1', COOKIE_DAYS)
      setHasBypass(true)
      // Limpiar URL
      const url = window.location.pathname + window.location.hash
      window.history.replaceState({}, '', url)
    }
  }, [])

  if (hasBypass) return children

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/coming-soon/subscribe', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al guardar. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      background: 'linear-gradient(135deg, #1A0F05 0%, #2C1A0A 50%, #1A0F05 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'Outfit, sans-serif', color: '#FFFFFF',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes float{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-20px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(184,131,58,0.4)}50%{box-shadow:0 0 0 12px rgba(184,131,58,0)}}
        .blob{position:absolute;border-radius:50%;filter:blur(80px);opacity:0.25;animation:float 8s ease-in-out infinite}
        .blob-1{width:380px;height:380px;background:#B8833A;top:-10%;left:-10%}
        .blob-2{width:300px;height:300px;background:#D4A055;bottom:-10%;right:-10%;animation-delay:-4s}
        .cs-anim{animation:fadeUp 0.7s cubic-bezier(0.34,1.56,0.64,1) both}
        .cs-input{transition:border-color 0.2s,background 0.2s}
        .cs-input:focus{outline:none;border-color:#D4A055 !important;background:rgba(255,255,255,0.06) !important}
        .cs-btn{transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.25s,opacity 0.2s}
        .cs-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 16px 36px rgba(184,131,58,0.4)}
        .cs-btn:active:not(:disabled){transform:translateY(0) scale(0.98)}
        .cs-btn:disabled{opacity:0.5;cursor:not-allowed}
      `}</style>

      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div style={{ position: 'relative', maxWidth: 520, width: '100%', textAlign: 'center', zIndex: 1 }}>

        {/* Logo */}
        <p className="cs-anim" style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(2.4rem, 8vw, 3.4rem)', fontWeight: 700,
          letterSpacing: '0.25em', margin: 0, color: '#FFFFFF',
        }}>
          TOP<span style={{ color: '#D4A055', fontStyle: 'italic' }}>SY</span>
        </p>

        <p className="cs-anim" style={{
          fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase',
          color: '#D4A055', marginTop: 8, fontWeight: 700, animationDelay: '0.1s',
        }}>
          ★ Próxima apertura
        </p>

        {/* Título */}
        <h1 className="cs-anim" style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(2rem, 7vw, 3rem)', fontWeight: 300,
          lineHeight: 1.1, margin: '38px 0 16px', animationDelay: '0.2s',
        }}>
          Algo bonito está <em style={{ color: '#D4A055' }}>en camino</em>
        </h1>

        <p className="cs-anim" style={{
          fontSize: '1.05rem', lineHeight: 1.6,
          color: 'rgba(255,255,255,0.65)', margin: '0 0 38px',
          maxWidth: 420, marginLeft: 'auto', marginRight: 'auto',
          animationDelay: '0.3s',
        }}>
          El marketplace de belleza y bienestar que tu negocio merece. Estamos preparando los últimos detalles.
        </p>

        {/* Cuenta atrás */}
        <div className="cs-anim" style={{
          display: 'flex', justifyContent: 'center', gap: 'clamp(8px, 2vw, 16px)',
          marginBottom: 38, animationDelay: '0.4s',
        }}>
          {[
            { label: 'Días', value: days },
            { label: 'Horas', value: hours },
            { label: 'Min', value: mins },
            { label: 'Seg', value: secs },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(184,131,58,0.2)',
              borderRadius: 14, padding: '14px 6px',
              minWidth: 64, flex: 1, maxWidth: 88,
              backdropFilter: 'blur(20px)',
            }}>
              <p style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 700,
                color: '#FFFFFF', margin: 0, lineHeight: 1,
              }}>
                {String(value).padStart(2, '0')}
              </p>
              <p style={{
                fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)', margin: '8px 0 0', fontWeight: 600,
              }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Form email */}
        {sent ? (
          <div className="cs-anim" style={{
            background: 'rgba(184,131,58,0.1)',
            border: '1.5px solid rgba(184,131,58,0.3)',
            borderRadius: 14, padding: '18px 24px',
            animationDelay: '0.5s',
          }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
              ✓ Listo. Te avisaremos cuando abramos.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="cs-anim" style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            animationDelay: '0.5s',
          }}>
            <p style={{
              fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#D4A055', margin: '0 0 6px', fontWeight: 700,
            }}>
              Sé el primero en saberlo
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="email" value={email} required
                placeholder="tu@email.com"
                onChange={(e) => setEmail(e.target.value)}
                className="cs-input"
                style={{
                  flex: 1, minWidth: 200,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  borderRadius: 12, padding: '14px 16px',
                  fontSize: 14, color: '#FFFFFF',
                  fontFamily: 'Outfit, sans-serif',
                }}
              />
              <button type="submit" disabled={loading} className="cs-btn"
                style={{
                  background: 'linear-gradient(135deg, #B8833A, #D4A055)',
                  border: 'none', borderRadius: 12,
                  padding: '14px 24px', color: '#FFFFFF',
                  fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  letterSpacing: '0.02em',
                  boxShadow: '0 10px 28px rgba(184,131,58,0.32)',
                  whiteSpace: 'nowrap',
                }}>
                {loading ? '...' : 'Avísame'}
              </button>
            </div>
            {error && <p style={{
              fontSize: 12, color: '#f87171', margin: '4px 0 0', textAlign: 'left',
            }}>{error}</p>}
          </form>
        )}

        <p className="cs-anim" style={{
          marginTop: 50, fontSize: 11, color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.05em', animationDelay: '0.6s',
        }}>
          © TopSy 2026 · hola@topsy.es
        </p>
      </div>
    </div>
  )
}
