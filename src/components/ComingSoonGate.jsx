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
      background: '#0E0905',
      fontFamily: 'Outfit, sans-serif', color: '#FFFFFF',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%,100%{opacity:0.15}50%{opacity:0.3}}
        @keyframes glow{0%,100%{box-shadow:0 0 60px rgba(184,131,58,0.15)}50%{box-shadow:0 0 100px rgba(184,131,58,0.3)}}
        @keyframes lineSlide{from{transform:scaleX(0)}to{transform:scaleX(1)}}

        .cs-anim{animation:fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both}

        /* Patrón decorativo de fondo */
        .pattern{
          position:absolute;inset:0;
          background-image:
            radial-gradient(ellipse 50% 40% at 20% 0%, rgba(184,131,58,0.12), transparent 50%),
            radial-gradient(ellipse 60% 50% at 80% 100%, rgba(184,131,58,0.08), transparent 50%);
          pointer-events:none;
        }
        .grain{
          position:absolute;inset:0;opacity:0.04;pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .gold-line{
          height:1px;background:linear-gradient(90deg,transparent,#D4A055,transparent);
          animation:lineSlide 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s both;
          transform-origin:center;
        }

        .cs-input{transition:border-color 0.25s,background 0.25s}
        .cs-input:focus{outline:none;border-color:#D4A055 !important;background:rgba(255,255,255,0.06) !important}

        .cs-btn{transition:transform 0.3s cubic-bezier(0.22,1,0.36,1),box-shadow 0.3s,opacity 0.2s}
        .cs-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 20px 44px rgba(184,131,58,0.5)}
        .cs-btn:active:not(:disabled){transform:translateY(0) scale(0.98)}
        .cs-btn:disabled{opacity:0.5;cursor:not-allowed}

        .store-btn{transition:transform 0.3s cubic-bezier(0.22,1,0.36,1),background 0.25s,border-color 0.25s}
        .store-btn:hover{transform:translateY(-3px);background:rgba(255,255,255,0.05) !important;border-color:rgba(212,160,85,0.45) !important}

        .feature-card{transition:transform 0.35s cubic-bezier(0.22,1,0.36,1),border-color 0.25s,background 0.25s}
        .feature-card:hover{transform:translateY(-4px);border-color:rgba(212,160,85,0.35) !important;background:rgba(255,255,255,0.04) !important}

        .countdown-cell{transition:transform 0.3s cubic-bezier(0.22,1,0.36,1)}
        .countdown-cell:hover{transform:translateY(-2px)}

        @media (prefers-reduced-motion:reduce){
          .cs-anim,.gold-line{animation:none !important;opacity:1 !important;transform:none !important}
          .cs-input,.cs-btn,.store-btn,.feature-card,.countdown-cell{transition:none !important}
        }
      `}</style>

      <div className="pattern" />
      <div className="grain" />

      {/* Contenido centrado */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 680, margin: '0 auto',
        padding: 'clamp(40px, 8vw, 80px) 24px 50px',
        textAlign: 'center',
      }}>

        {/* Pequeño badge superior */}
        <div className="cs-anim" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(184,131,58,0.08)',
          border: '1px solid rgba(184,131,58,0.25)',
          borderRadius: 999,
          padding: '6px 14px 6px 12px',
          marginBottom: 32,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4A055', animation: 'shimmer 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4A055', fontWeight: 700 }}>
            Próxima apertura · 1 junio
          </span>
        </div>

        {/* Logo */}
        <p className="cs-anim" style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(3.4rem, 12vw, 5.6rem)',
          fontWeight: 600,
          letterSpacing: '0.18em',
          margin: 0,
          lineHeight: 1,
          color: '#FFFFFF',
          animationDelay: '0.05s',
        }}>
          TOP<span style={{ color: '#D4A055', fontStyle: 'italic', fontWeight: 700 }}>SY</span>
        </p>

        <div className="gold-line" style={{ width: 80, margin: '24px auto 0' }} />

        {/* Hero */}
        <h1 className="cs-anim" style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(1.9rem, 5.8vw, 2.8rem)',
          fontWeight: 400,
          lineHeight: 1.2,
          margin: '32px 0 18px',
          color: '#FFFFFF',
          animationDelay: '0.18s',
          maxWidth: 520,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Belleza, estética y bienestar.<br />
          <em style={{ color: '#D4A055', fontWeight: 400 }}>Reservar nunca fue tan elegante.</em>
        </h1>

        <p className="cs-anim" style={{
          fontSize: 'clamp(0.95rem, 2.4vw, 1.05rem)',
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.62)',
          margin: '0 auto 48px',
          maxWidth: 460,
          animationDelay: '0.26s',
        }}>
          El marketplace que conecta a los mejores profesionales con clientes que buscan calidad. Llega a TopSy el <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>1 de junio de 2026</strong>.
        </p>

        {/* 2 features */}
        <div className="cs-anim" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 52,
          maxWidth: 480,
          marginLeft: 'auto',
          marginRight: 'auto',
          animationDelay: '0.34s',
        }}>
          {[
            { icon: '✂', title: 'Reserva en segundos', text: 'Encuentra hueco hoy mismo en tu zona' },
            { icon: '✦', title: 'Profesionales verificados', text: 'Solo expertos que pasan nuestro filtro' },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '20px 16px',
              backdropFilter: 'blur(20px)',
              textAlign: 'left',
            }}>
              <p style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.6rem',
                color: '#D4A055',
                margin: 0,
                lineHeight: 1,
                fontWeight: 400,
              }}>{f.icon}</p>
              <p style={{
                fontSize: 14, fontWeight: 600, color: '#FFFFFF',
                margin: '12px 0 4px', fontFamily: 'Outfit, sans-serif',
              }}>{f.title}</p>
              <p style={{
                fontSize: 12.5, color: 'rgba(255,255,255,0.5)',
                margin: 0, lineHeight: 1.55,
              }}>{f.text}</p>
            </div>
          ))}
        </div>

        {/* Cuenta atrás */}
        <p className="cs-anim" style={{
          fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)', margin: '0 0 18px', fontWeight: 700,
          animationDelay: '0.42s',
        }}>
          Apertura en
        </p>

        <div className="cs-anim" style={{
          display: 'flex', justifyContent: 'center',
          gap: 'clamp(6px, 1.8vw, 14px)',
          marginBottom: 52,
          animationDelay: '0.5s',
        }}>
          {[
            { label: 'Días', value: days },
            { label: 'Horas', value: hours },
            { label: 'Min', value: mins },
            { label: 'Seg', value: secs },
          ].map(({ label, value }) => (
            <div key={label} className="countdown-cell" style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(184,131,58,0.22)',
              borderRadius: 14,
              padding: 'clamp(12px, 3vw, 18px) 6px',
              minWidth: 64, flex: 1, maxWidth: 96,
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
              <p style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(1.8rem, 5.5vw, 2.6rem)', fontWeight: 700,
                color: '#FFFFFF', margin: 0, lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {String(value).padStart(2, '0')}
              </p>
              <p style={{
                fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)', margin: '10px 0 0', fontWeight: 700,
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
            border: '1.5px solid rgba(184,131,58,0.35)',
            borderRadius: 16,
            padding: '22px 28px',
            maxWidth: 460, margin: '0 auto',
            animationDelay: '0.58s',
          }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
              ✓ Te avisaremos cuando abramos.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="cs-anim" style={{
            maxWidth: 500, margin: '0 auto',
            animationDelay: '0.58s',
          }}>
            <p style={{
              fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase',
              color: '#D4A055', margin: '0 0 14px', fontWeight: 700,
            }}>
              Sé el primero en entrar
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="email" value={email} required
                placeholder="tu@email.com"
                onChange={(e) => setEmail(e.target.value)}
                className="cs-input"
                style={{
                  flex: 1, minWidth: 200,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  borderRadius: 12, padding: '15px 18px',
                  fontSize: 14, color: '#FFFFFF',
                  fontFamily: 'Outfit, sans-serif',
                }}
              />
              <button type="submit" disabled={loading} className="cs-btn"
                style={{
                  background: 'linear-gradient(135deg, #B8833A, #D4A055)',
                  border: 'none', borderRadius: 12,
                  padding: '15px 28px', color: '#FFFFFF',
                  fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  letterSpacing: '0.04em',
                  boxShadow: '0 14px 36px rgba(184,131,58,0.42)',
                  whiteSpace: 'nowrap',
                }}>
                {loading ? '...' : 'Avísame'}
              </button>
            </div>
            {error && <p style={{
              fontSize: 12, color: '#f87171', margin: '8px 0 0', textAlign: 'left',
            }}>{error}</p>}
          </form>
        )}

        {/* Separador con línea dorada */}
        <div className="gold-line" style={{ width: 60, margin: '60px auto 32px' }} />

        {/* App badges */}
        <div className="cs-anim" style={{ animationDelay: '0.66s' }}>
          <p style={{
            fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)', margin: '0 0 20px', fontWeight: 700,
          }}>
            Próximamente disponible en
          </p>

          <div style={{
            display: 'flex', justifyContent: 'center',
            gap: 14, flexWrap: 'wrap', alignItems: 'center',
          }}>
            {/* App Store oficial */}
            <div className="store-btn" style={{
              opacity: 0.92, cursor: 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              height: 56,
              width: 178,
              borderRadius: 10,
              overflow: 'hidden',
            }}>
              <img src="/badges/app-store.svg" alt="Descárgalo en App Store"
                style={{ display: 'block', height: '100%', width: '100%', objectFit: 'contain' }} />
            </div>

            {/* Google Play oficial */}
            <div className="store-btn" style={{
              opacity: 0.92, cursor: 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              height: 56,
              width: 178,
              borderRadius: 10,
              overflow: 'hidden',
            }}>
              <img src="/badges/google-play.png" alt="Pre-regístrate en Google Play"
                style={{ display: 'block', height: '100%', width: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="cs-anim" style={{
          marginTop: 60, fontSize: 11,
          color: 'rgba(255,255,255,0.22)',
          letterSpacing: '0.08em',
          animationDelay: '0.74s',
        }}>
          © TopSy 2026 · <a href="mailto:hola@topsy.es" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>hola@topsy.es</a>
        </p>
      </div>
    </div>
  )
}
