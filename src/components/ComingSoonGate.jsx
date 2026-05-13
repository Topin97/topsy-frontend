import { useState, useEffect } from 'react'
import api from '../services/api'

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
  return { days, hours, mins, secs }
}

export default function ComingSoonGate({ children }) {
  const [hasBypass, setHasBypass] = useState(() => getCookie(COOKIE_NAME) === '1')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { days, hours, mins, secs } = useCountdown(LAUNCH_DATE)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('dev') === DEV_PASSWORD) {
      setCookie(COOKIE_NAME, '1', COOKIE_DAYS)
      setHasBypass(true)
      window.history.replaceState({}, '', window.location.pathname + window.location.hash)
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
      minHeight: '100vh', minHeight: '100dvh', width: '100%',
      background: 'linear-gradient(160deg, #1A0F05 0%, #2C1A0A 100%)',
      fontFamily: 'Outfit, sans-serif', color: '#FFFFFF',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes float{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-20px) scale(1.05)}}
        .cs-anim{animation:fadeUp 0.7s cubic-bezier(0.34,1.56,0.64,1) both}
        .blob{position:absolute;border-radius:50%;filter:blur(100px);opacity:0.18;pointer-events:none;animation:float 9s ease-in-out infinite}
        .blob-1{width:420px;height:420px;background:#B8833A;top:-100px;left:-100px}
        .blob-2{width:340px;height:340px;background:#D4A055;bottom:-100px;right:-100px;animation-delay:-4.5s}
        .cs-input{transition:border-color 0.2s,background 0.2s}
        .cs-input:focus{outline:none;border-color:#D4A055 !important;background:rgba(255,255,255,0.08) !important}
        .cs-btn{transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.25s,opacity 0.2s}
        .cs-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 18px 38px rgba(184,131,58,0.45)}
        .cs-btn:active:not(:disabled){transform:translateY(0) scale(0.98)}
        .cs-btn:disabled{opacity:0.5;cursor:not-allowed}
        .store-badge{transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),background 0.2s,border-color 0.2s}
        .store-badge:hover{transform:translateY(-3px);background:rgba(255,255,255,0.06) !important;border-color:rgba(212,160,85,0.4) !important}
        .feature-card{transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1)}
        .feature-card:hover{transform:translateY(-3px)}
        @media (prefers-reduced-motion:reduce){
          .cs-anim,.blob{animation:none !important;opacity:1 !important;transform:none !important}
          .cs-input,.cs-btn,.store-badge,.feature-card{transition:none !important}
        }
      `}</style>

      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {/* Contenido centrado */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 720, margin: '0 auto',
        padding: '60px 24px 40px',
        textAlign: 'center',
      }}>

        {/* Logo */}
        <p className="cs-anim" style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(2.6rem, 9vw, 3.8rem)', fontWeight: 700,
          letterSpacing: '0.25em', margin: 0, color: '#FFFFFF',
          textShadow: '0 4px 30px rgba(0,0,0,0.5)',
        }}>
          TOP<span style={{ color: '#D4A055', fontStyle: 'italic' }}>SY</span>
        </p>

        <p className="cs-anim" style={{
          fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase',
          color: '#D4A055', marginTop: 10, fontWeight: 700,
          animationDelay: '0.08s',
        }}>
          ★ Próxima apertura · 1 de junio
        </p>

        {/* Hero */}
        <h1 className="cs-anim" style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(2.2rem, 7vw, 3.4rem)',
          fontWeight: 400,
          lineHeight: 1.1,
          margin: '36px 0 18px',
          color: '#FFFFFF',
          animationDelay: '0.18s',
        }}>
          Reserva belleza y bienestar<br />
          <em style={{ color: '#D4A055', fontWeight: 400 }}>en un solo lugar</em>
        </h1>

        <p className="cs-anim" style={{
          fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
          lineHeight: 1.65,
          color: 'rgba(255,255,255,0.75)',
          margin: '0 auto 40px',
          maxWidth: 500,
          animationDelay: '0.26s',
        }}>
          El marketplace que conecta profesionales de peluquería, estética, masaje y bienestar con clientes en toda España.
        </p>

        {/* 3 features */}
        <div className="cs-anim" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 42,
          animationDelay: '0.34s',
        }}>
          {[
            { icon: '✂️', title: 'Reserva fácil', text: 'En segundos, desde el móvil' },
            { icon: '💎', title: 'Pros verificados', text: 'Solo profesionales de confianza' },
            { icon: '⭐', title: 'Reseñas reales', text: 'De clientes que ya reservaron' },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(184,131,58,0.18)',
              borderRadius: 14,
              padding: '16px 12px',
              backdropFilter: 'blur(12px)',
            }}>
              <p style={{ fontSize: 22, margin: 0, lineHeight: 1 }}>{f.icon}</p>
              <p style={{
                fontSize: 13, fontWeight: 700, color: '#FFFFFF',
                margin: '10px 0 4px', fontFamily: 'Outfit, sans-serif',
              }}>{f.title}</p>
              <p style={{
                fontSize: 11.5, color: 'rgba(255,255,255,0.55)',
                margin: 0, lineHeight: 1.4,
              }}>{f.text}</p>
            </div>
          ))}
        </div>

        {/* Cuenta atrás */}
        <p className="cs-anim" style={{
          fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)', margin: '0 0 14px', fontWeight: 700,
          animationDelay: '0.42s',
        }}>
          Apertura en
        </p>

        <div className="cs-anim" style={{
          display: 'flex', justifyContent: 'center',
          gap: 'clamp(8px, 2vw, 14px)',
          marginBottom: 44,
          animationDelay: '0.5s',
        }}>
          {[
            { label: 'Días', value: days },
            { label: 'Horas', value: hours },
            { label: 'Min', value: mins },
            { label: 'Seg', value: secs },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(184,131,58,0.25)',
              borderRadius: 14,
              padding: '14px 6px',
              minWidth: 64, flex: 1, maxWidth: 90,
              backdropFilter: 'blur(20px)',
            }}>
              <p style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(1.7rem, 5vw, 2.4rem)', fontWeight: 700,
                color: '#FFFFFF', margin: 0, lineHeight: 1,
              }}>
                {String(value).padStart(2, '0')}
              </p>
              <p style={{
                fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)', margin: '8px 0 0', fontWeight: 600,
              }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Form email */}
        {sent ? (
          <div className="cs-anim" style={{
            background: 'rgba(184,131,58,0.12)',
            border: '1.5px solid rgba(184,131,58,0.35)',
            borderRadius: 14,
            padding: '20px 24px',
            maxWidth: 440, margin: '0 auto',
            animationDelay: '0.58s',
          }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
              ✓ Listo. Te avisaremos cuando abramos.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="cs-anim" style={{
            maxWidth: 500, margin: '0 auto',
            animationDelay: '0.58s',
          }}>
            <p style={{
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#D4A055', margin: '0 0 12px', fontWeight: 700,
            }}>
              ✦ Sé el primero en entrar
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
                  border: '1.5px solid rgba(255,255,255,0.18)',
                  borderRadius: 12, padding: '14px 16px',
                  fontSize: 14, color: '#FFFFFF',
                  fontFamily: 'Outfit, sans-serif',
                }}
              />
              <button type="submit" disabled={loading} className="cs-btn"
                style={{
                  background: 'linear-gradient(135deg, #B8833A, #D4A055)',
                  border: 'none', borderRadius: 12,
                  padding: '14px 26px', color: '#FFFFFF',
                  fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  letterSpacing: '0.02em',
                  boxShadow: '0 12px 32px rgba(184,131,58,0.38)',
                  whiteSpace: 'nowrap',
                }}>
                {loading ? '...' : 'Avísame'}
              </button>
            </div>
            {error && <p style={{
              fontSize: 12, color: '#f87171', margin: '6px 0 0', textAlign: 'left',
            }}>{error}</p>}
          </form>
        )}

        {/* App badges */}
        <div className="cs-anim" style={{
          marginTop: 50,
          animationDelay: '0.66s',
        }}>
          <p style={{
            fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', fontWeight: 700,
          }}>
            Próximamente en
          </p>

          <div style={{
            display: 'flex', justifyContent: 'center',
            gap: 14, flexWrap: 'wrap',
          }}>
            {/* App Store */}
            <div className="store-badge" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              borderRadius: 14,
              padding: '11px 20px',
              cursor: 'not-allowed',
              opacity: 0.85,
            }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}></span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', margin: 0, letterSpacing: '0.05em' }}>Descárgate en</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', margin: 0, fontFamily: 'Outfit, sans-serif' }}>App Store</p>
              </div>
            </div>

            {/* Google Play */}
            <div className="store-badge" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              borderRadius: 14,
              padding: '11px 20px',
              cursor: 'not-allowed',
              opacity: 0.85,
            }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>▶</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', margin: 0, letterSpacing: '0.05em' }}>Disponible en</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Google Play</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="cs-anim" style={{
          marginTop: 50, fontSize: 11,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.05em',
          animationDelay: '0.74s',
        }}>
          © TopSy 2026 · <a href="mailto:hola@topsy.es" style={{ color: 'inherit', textDecoration: 'none' }}>hola@topsy.es</a>
        </p>
      </div>
    </div>
  )
}
