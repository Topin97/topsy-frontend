import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Capacitor } from '@capacitor/core'

const CATEGORIES = [
  { value: 'peluqueria',     label: '✂️ Peluquería' },
  { value: 'barberia',       label: '💈 Barbería' },
  { value: 'estetica',       label: '💆‍♀️ Estética' },
  { value: 'masaje',         label: '🌿 Masaje' },
  { value: 'unas',           label: '💅 Uñas' },
  { value: 'cejas_pestanas', label: '👁️ Cejas y pestañas' },
  { value: 'spa',            label: '🧖 Spa / Wellness' },
  { value: 'maquillaje',     label: '💄 Maquillaje' },
  { value: 'otros',          label: '✨ Otros' },
]

export default function ProSignupPage() {
  // iOS nativo: ocultar planes/precios (Apple Guideline 3.1.1)
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
    if (typeof window !== 'undefined') window.location.replace('/')
    return null
  }
  const [form, setForm] = useState({
    full_name: '', business: '', city: '', phone: '',
    category: '', team_size: '', email: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/pro-leads/subscribe', form)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al guardar. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{
        minHeight: '100vh', minHeight: '100dvh',
        background: '#0E0905', color: '#FFFFFF',
        fontFamily: 'Outfit, sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', textAlign: 'center',
      }}>
        <style>{`
          @keyframes pop{0%{transform:scale(0.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
          .ok-icon{animation:pop 0.65s cubic-bezier(0.22,1,0.36,1) both}
          .ok-text{animation:fadeUp 0.6s 0.2s cubic-bezier(0.22,1,0.36,1) both;opacity:0}
        `}</style>
        <div style={{ maxWidth: 460 }}>
          <div className="ok-icon" style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'linear-gradient(135deg,#B8833A,#D4A055)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.6rem', margin: '0 auto 32px',
            boxShadow: '0 20px 60px rgba(184,131,58,0.45)',
          }}>✓</div>
          <div className="ok-text">
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(2rem, 6vw, 2.8rem)', fontWeight: 400,
              lineHeight: 1.15, margin: '0 0 18px',
            }}>
              ¡Gracias, <em style={{ color: '#D4A055' }}>{form.full_name.split(' ')[0]}</em>!
            </h1>
            <p style={{
              fontSize: '1.05rem', lineHeight: 1.6,
              color: 'rgba(255,255,255,0.65)', margin: '0 0 36px',
            }}>
              Te hemos apuntado a la lista de profesionales TopSy. Te contactaremos
              personalmente <strong style={{ color: '#FFFFFF' }}>antes del 1 de junio</strong> para
              ayudarte a configurar tu perfil.
            </p>
            <Link to="/" style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              borderRadius: 12, padding: '12px 24px',
              color: '#FFFFFF', textDecoration: 'none',
              fontSize: 14, fontWeight: 600,
              fontFamily: 'Outfit, sans-serif',
            }}>← Volver al inicio</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', minHeight: '100dvh',
      background: '#0E0905', color: '#FFFFFF',
      fontFamily: 'Outfit, sans-serif',
      position: 'relative',
    }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%,100%{opacity:0.15}50%{opacity:0.3}}
        .pattern{position:absolute;inset:0;background-image:radial-gradient(ellipse 50% 40% at 20% 0%, rgba(184,131,58,0.12), transparent 50%),radial-gradient(ellipse 60% 50% at 80% 100%, rgba(184,131,58,0.08), transparent 50%);pointer-events:none}
        .grain{position:absolute;inset:0;opacity:0.04;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
        .anim{animation:fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both}
        .input,.select,.textarea{transition:border-color 0.2s,background 0.2s;background:rgba(255,255,255,0.03);border:1.5px solid rgba(255,255,255,0.12);border-radius:12px;padding:13px 15px;font-size:14px;color:#FFFFFF;font-family:Outfit,sans-serif;width:100%;box-sizing:border-box}
        .input:focus,.select:focus,.textarea:focus{outline:none;border-color:#D4A055;background:rgba(255,255,255,0.06)}
        .input::placeholder,.textarea::placeholder{color:rgba(255,255,255,0.32)}
        .select{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23D4A055' d='M6 8L0 0h12z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 18px center;padding-right:42px}
        .select option{background:#1A0F05;color:#FFFFFF}
        .label{font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#D4A055;font-weight:700;margin-bottom:8px;display:block}
        .label .opt{color:rgba(255,255,255,0.3);letter-spacing:0;text-transform:none;font-weight:400;margin-left:6px}
        .submit-btn{transition:transform 0.25s cubic-bezier(0.22,1,0.36,1),box-shadow 0.25s,opacity 0.2s}
        .submit-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 20px 44px rgba(184,131,58,0.5)}
        .submit-btn:active:not(:disabled){transform:translateY(0) scale(0.98)}
        .submit-btn:disabled{opacity:0.5;cursor:not-allowed}
        @media (prefers-reduced-motion:reduce){.anim{animation:none !important;opacity:1 !important;transform:none !important}.input,.select,.textarea,.submit-btn{transition:none !important}}
      `}</style>

      <div className="pattern" />
      <div className="grain" />

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 560, margin: '0 auto',
        padding: '40px 22px 50px',
      }}>

        {/* Pequeño badge superior */}
        <div className="anim" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(184,131,58,0.08)',
          border: '1px solid rgba(184,131,58,0.25)',
          borderRadius: 999, padding: '6px 14px 6px 12px',
          marginBottom: 24,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4A055', animation: 'shimmer 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4A055', fontWeight: 700 }}>
            Para profesionales
          </span>
        </div>

        {/* Hero */}
        <h1 className="anim" style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(2rem, 6vw, 2.8rem)',
          fontWeight: 400, lineHeight: 1.15,
          margin: '0 0 14px',
          animationDelay: '0.05s',
        }}>
          Únete a TopSy<br />
          <em style={{ color: '#D4A055' }}>antes que nadie</em>
        </h1>

        <p className="anim" style={{
          fontSize: '1rem', lineHeight: 1.65,
          color: 'rgba(255,255,255,0.62)',
          margin: '0 0 30px', maxWidth: 460,
          animationDelay: '0.12s',
        }}>
          Empezamos en <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>El Cuervo de Sevilla</strong>{' '}
          y queremos contar contigo desde el primer día.{' '}
          <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>Gratis durante el lanzamiento</strong>{' '}
          y con condiciones exclusivas como profesional fundador.
        </p>

        {/* ─── Ventajas para fundadores ──────────────────────── */}
        <div className="anim" style={{ animationDelay: '0.18s', marginBottom: 36 }}>
          <p style={{
            fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: '#D4A055', fontWeight: 700, margin: '0 0 18px',
          }}>
            ✦ Ventajas para profesionales fundadores
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { icon: '📍', title: 'Empezamos en El Cuervo de Sevilla', text: 'Apuesta local. Conocemos el pueblo y a sus vecinos.' },
              { icon: '💎', title: 'Gratis durante el lanzamiento', text: 'Sin coste hasta que introduzcamos el plan Pro.' },
              { icon: '⭐', title: 'Condiciones exclusivas', text: 'Los fundadores tendrán tarifas preferentes cuando lancemos suscripción.' },
              { icon: '🤝', title: 'Soporte personal', text: 'Te llamamos uno por uno para ayudarte a configurar tu perfil.' },
            ].map((v, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(184,131,58,0.18)',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 20, lineHeight: 1.2, flexShrink: 0 }}>{v.icon}</span>
                <div>
                  <p style={{
                    fontSize: 14, fontWeight: 600, color: '#FFFFFF',
                    margin: '0 0 3px', fontFamily: 'Outfit, sans-serif',
                  }}>{v.title}</p>
                  <p style={{
                    fontSize: 12.5, color: 'rgba(255,255,255,0.55)',
                    margin: 0, lineHeight: 1.5,
                  }}>{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Cómo funciona ─────────────────────────────────── */}
        <div className="anim" style={{ animationDelay: '0.22s', marginBottom: 36 }}>
          <p style={{
            fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: '#D4A055', fontWeight: 700, margin: '0 0 18px',
          }}>
            ✦ Cómo funciona
          </p>
          <div style={{ display: 'grid', gap: 14 }}>
            {[
              { n: '1', title: 'Apúntate', text: 'Rellena el formulario de abajo. Te lleva 1 minuto.' },
              { n: '2', title: 'Te llamamos', text: 'Hablamos contigo para conocer tu negocio y resolver dudas.' },
              { n: '3', title: 'Empieza el 1 de junio', text: 'Te ayudamos a configurar perfil, servicios y horarios.' },
            ].map((s) => (
              <div key={s.n} style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
              }}>
                <div style={{
                  flexShrink: 0,
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #B8833A, #D4A055)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 18, fontWeight: 700, color: '#FFFFFF',
                  boxShadow: '0 6px 16px rgba(184,131,58,0.3)',
                }}>{s.n}</div>
                <div style={{ paddingTop: 4 }}>
                  <p style={{
                    fontSize: 14, fontWeight: 600, color: '#FFFFFF',
                    margin: '0 0 3px', fontFamily: 'Outfit, sans-serif',
                  }}>{s.title}</p>
                  <p style={{
                    fontSize: 12.5, color: 'rgba(255,255,255,0.55)',
                    margin: 0, lineHeight: 1.5,
                  }}>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── FAQ ──────────────────────────────────────────── */}
        <div className="anim" style={{ animationDelay: '0.26s', marginBottom: 36 }}>
          <p style={{
            fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: '#D4A055', fontWeight: 700, margin: '0 0 18px',
          }}>
            ✦ Preguntas frecuentes
          </p>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              { q: '¿Cuánto cuesta usar TopSy?',
                a: 'Durante el lanzamiento es 100% gratis. Más adelante introduciremos un plan Pro con funciones avanzadas, pero los fundadores tendrán condiciones exclusivas y aviso con tiempo.' },
              { q: '¿Cobráis comisión por reserva?',
                a: 'No. Los pagos se realizan directamente entre cliente y profesional, como siempre.' },
              { q: '¿Tengo que pagar algo ahora?',
                a: 'Nada. Apuntarte como profesional fundador no tiene coste ni compromiso.' },
              { q: '¿Cuándo abrís?',
                a: 'El 1 de junio de 2026. Hasta entonces preparamos todo y contactamos uno por uno con los pros apuntados.' },
              { q: '¿Cómo aparecen mis servicios?',
                a: 'Configuras tu perfil con servicios, precios, fotos y horarios. Los clientes pueden reservarte directamente en tu hueco disponible.' },
              { q: '¿Dónde funciona TopSy?',
                a: 'Empezamos en El Cuervo de Sevilla y poco a poco iremos ampliando a la zona. Si eres de fuera, apúntate igualmente: vamos llegando a más sitios.' },
            ].map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="anim" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div>
            <label className="label">Nombre y apellidos</label>
            <input className="input" type="text" required maxLength={80}
              placeholder="Tu nombre"
              value={form.full_name} onChange={update('full_name')} />
          </div>

          <div>
            <label className="label">Nombre de tu negocio</label>
            <input className="input" type="text" required maxLength={80}
              placeholder="Nombre de tu negocio"
              value={form.business} onChange={update('business')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="label">Ciudad</label>
              <input className="input" type="text" required maxLength={50}
                placeholder="Ciudad"
                value={form.city} onChange={update('city')} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input className="input" type="tel" required maxLength={20}
                placeholder="+34 600 000 000"
                value={form.phone} onChange={update('phone')} />
            </div>
          </div>

          <div>
            <label className="label">Categoría</label>
            <select className="select" required value={form.category} onChange={update('category')}>
              <option value="" disabled>Selecciona una categoría</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Tamaño del equipo <span className="opt">(opcional)</span></label>
            <input className="input" type="text" maxLength={30}
              placeholder="¿Cuántas personas trabajáis?"
              value={form.team_size} onChange={update('team_size')} />
          </div>

          <div>
            <label className="label">Email <span className="opt">(opcional)</span></label>
            <input className="input" type="email" maxLength={120}
              placeholder="tu@email.com"
              value={form.email} onChange={update('email')} />
          </div>

          <div>
            <label className="label">¿Algo que quieras contarnos? <span className="opt">(opcional)</span></label>
            <textarea className="textarea" maxLength={500} rows={3}
              placeholder="Cuéntanos lo que quieras..."
              value={form.notes} onChange={update('notes')}
              style={{ resize: 'vertical', minHeight: 80 }} />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#f87171', margin: 0, padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10 }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="submit-btn"
            style={{
              background: 'linear-gradient(135deg, #B8833A, #D4A055)',
              border: 'none', borderRadius: 14,
              padding: '17px', color: '#FFFFFF',
              fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              letterSpacing: '0.03em',
              boxShadow: '0 14px 36px rgba(184,131,58,0.42)',
              marginTop: 8,
            }}>
            {loading ? 'Enviando...' : 'Apuntarme como profesional →'}
          </button>

          <p style={{
            fontSize: 11.5, color: 'rgba(255,255,255,0.35)',
            textAlign: 'center', margin: '6px 0 0',
            lineHeight: 1.5,
          }}>
            Te contactaremos solo para hablarte de TopSy. Sin spam, sin terceros.
          </p>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: 40, paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
        }}>
          <Link to="/" style={{
            fontSize: 13, color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none', letterSpacing: '0.04em',
          }}>← Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}

// ─── FAQ acordeón item ────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      overflow: 'hidden',
      transition: 'border-color 0.25s',
    }}>
      <button onClick={() => setOpen(!open)} type="button" style={{
        width: '100%', textAlign: 'left',
        background: 'transparent', border: 'none', cursor: 'pointer',
        padding: '14px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 10, color: '#FFFFFF',
        fontFamily: 'Outfit, sans-serif', fontSize: 13.5, fontWeight: 600,
      }}>
        <span>{q}</span>
        <span style={{
          color: '#D4A055', fontSize: 18, lineHeight: 1,
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1)',
          flexShrink: 0,
        }}>+</span>
      </button>
      <div style={{
        maxHeight: open ? 200 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <p style={{
          fontSize: 12.5, color: 'rgba(255,255,255,0.6)',
          margin: 0, padding: '0 16px 16px',
          lineHeight: 1.6,
        }}>{a}</p>
      </div>
    </div>
  )
}

