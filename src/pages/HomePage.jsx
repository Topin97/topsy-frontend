import { useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'

const CATEGORIES = [
  { icon: '💇‍♀️', label: 'Peluquería',  value: 'hair',      color: '#FFF3E8', border: '#FDDBB8' },
  { icon: '💅',    label: 'Uñas',        value: 'nails',     color: '#FFF0F5', border: '#FBBFD4' },
  { icon: '🧖‍♀️', label: 'Spa',         value: 'spa',       color: '#F0FFF4', border: '#B8E8C8' },
  { icon: '🪒',    label: 'Barbería',    value: 'barber',    color: '#F0F5FF', border: '#BDD1F8' },
  { icon: '✨',    label: 'Estética',    value: 'aesthetic', color: '#FFFBF0', border: '#F5E4A0' },
  { icon: '👁️',   label: 'Cejas',       value: 'brows',     color: '#F5F0FF', border: '#D4BEF8' },
  { icon: '💆‍♀️', label: 'Masajes',     value: 'massage',   color: '#FFF5F0', border: '#F8CDB8' },
  { icon: '🧴',    label: 'Skincare',    value: 'skincare',  color: '#F0FBFF', border: '#B8E4F8' },
  { icon: '💋',    label: 'Maquillaje', value: 'makeup',    color: '#FFF0F8', border: '#F8B8E0' },
  { icon: '🧘',    label: 'Yoga',        value: 'yoga',      color: '#F0FFF8', border: '#B8F0D8' },
  { icon: '🏋️',   label: 'Fitness',     value: 'fitness',   color: '#FFF0F0', border: '#F8C0C0' },
  { icon: '📸',    label: 'Fotografía', value: 'photography', color: '#F8F0FF', border: '#E0B8F8' },
]

const STEPS = [
  {
    n: '01', icon: '🔍', title: 'Busca',
    desc: 'Encuentra el profesional ideal verificado cerca de ti por categoría, ciudad o nombre.',
    color: 'rgba(184,131,58,0.08)', border: 'rgba(184,131,58,0.18)',
  },
  {
    n: '02', icon: '📅', title: 'Reserva',
    desc: 'Elige fecha y hora disponible en tiempo real. Sin llamadas, sin esperas.',
    color: 'rgba(22,163,74,0.06)', border: 'rgba(22,163,74,0.18)',
  },
  {
    n: '03', icon: '✨', title: 'Disfruta',
    desc: 'Confirmación instantánea por email y recordatorio automático 24h antes.',
    color: 'rgba(37,99,235,0.06)', border: 'rgba(37,99,235,0.18)',
  },
]

const TRUST = [
  { icon: '🔒', label: 'Pagos seguros',         sub: 'Protección total' },
  { icon: '✅', label: 'Profesionales verificados', sub: 'Revisados por TopSy' },
  { icon: '⭐', label: 'Valoraciones reales',    sub: 'Solo clientes confirmados' },
  { icon: '🔔', label: 'Recordatorios 24h',      sub: 'Nunca olvides una cita' },
]

function Stars({ rating }) {
  const r = Math.round(rating ?? 0)
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= r ? '#B8833A' : 'rgba(184,131,58,0.2)', fontSize: 11 }}>★</span>
      ))}
    </span>
  )
}

function ProfCard({ prof }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/professional/${prof.id}`)}
      style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.22s', flexShrink: 0, width: 190, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(184,131,58,0.14)'; e.currentTarget.style.borderColor = 'rgba(184,131,58,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)' }}
    >
      <div style={{ height: 120, background: '#EFEDE9', overflow: 'hidden', position: 'relative' }}>
        {prof.cover_image_url
          ? <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>✂️</div>
        }
        {prof.is_verified && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'linear-gradient(135deg,#B8833A,#D4A055)', borderRadius: 100, padding: '3px 8px', fontSize: 9, color: '#FFFFFF', fontWeight: 800, letterSpacing: '0.05em' }}>✓ TOP</div>
        )}
      </div>
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 600, color: '#1A1612', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {prof.business_name}
        </p>
        <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.38)', margin: '0 0 8px', fontFamily: 'Outfit, sans-serif' }}>📍 {prof.city}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Stars rating={prof.avg_rating} />
            <span style={{ fontSize: 10, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>({prof.total_reviews})</span>
          </div>
          {prof.services?.[0]?.price && (
            <span style={{ fontSize: 12, color: '#B8833A', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>desde {prof.services[0].price}€</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()

  const { data: featured } = useQuery({
    queryKey: ['featured-pros'],
    queryFn: () => profApi.getAll({ limit: 10, verified: true }).then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif', background: '#F7F5F2' }}>
      <style>{`
        .scroll-row::-webkit-scrollbar { display: none; }
        .scroll-row { -ms-overflow-style: none; scrollbar-width: none; }
        .cat-card:hover { transform: translateY(-3px) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
        .cat-card { transition: all 0.2s ease !important; }
        .quick-tag:hover { border-color: rgba(184,131,58,0.4) !important; color: #B8833A !important; background: rgba(184,131,58,0.05) !important; }
        .trust-item:hover { border-color: rgba(184,131,58,0.25) !important; transform: translateY(-2px); }
        .trust-item { transition: all 0.2s; }
        @media (min-width: 640px) {
          .steps-grid { grid-template-columns: repeat(3,1fr) !important; }
          .cats-grid { grid-template-columns: repeat(4,1fr) !important; }
          .trust-grid { grid-template-columns: repeat(4,1fr) !important; }
        }
        @media (min-width: 960px) {
          .cats-grid { grid-template-columns: repeat(6,1fr) !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: 'clamp(48px,8vw,100px) 0 clamp(40px,6vw,80px)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(184,131,58,0.08) 0%, transparent 65%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(160,90,30,0.06) 0%, transparent 65%)', borderRadius: '50%' }} />
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(184,131,58,0.08)', border: '1px solid rgba(184,131,58,0.2)', borderRadius: 100, padding: '5px 14px', marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#B8833A', flexShrink: 0 }} />
            <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B8833A', fontWeight: 600 }}>
              Belleza y bienestar · España
            </span>
          </div>

          {/* Heading */}
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, lineHeight: 1.0, marginBottom: 16, fontSize: 'clamp(2.8rem, 7.5vw, 5.6rem)', color: '#1A1612' }}>
            Tu próxima<br />
            <em style={{ color: '#B8833A', fontStyle: 'italic' }}>experiencia</em><br />
            a un clic
          </h1>

          <p style={{ color: 'rgba(26,22,18,0.4)', fontSize: 'clamp(0.9rem,2vw,1.05rem)', fontWeight: 300, marginBottom: 28, maxWidth: 420, lineHeight: 1.7 }}>
            Reserva con profesionales verificados cerca de ti.<br />Sin llamadas, sin esperas.
          </p>

          {/* CTAs + quick tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <button onClick={() => navigate('/search')} style={{
              background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', border: 'none',
              borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 6px 20px rgba(184,131,58,0.3)',
              letterSpacing: '0.02em',
            }}>
              Explorar profesionales →
            </button>
            {['Peluquería', 'Masajes', 'Uñas', 'Barbería'].map(tag => (
              <button key={tag} className="quick-tag" onClick={() => navigate(`/search?q=${tag}`)} style={{
                fontSize: 13, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.1)',
                borderRadius: 100, padding: '8px 16px', color: 'rgba(26,22,18,0.5)',
                cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>{tag}</button>
            ))}
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex' }}>
                {['👩', '👨', '👩‍🦱', '🧑'].map((e,i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: '#EFEDE9', border: '2px solid #F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginLeft: i > 0 ? -8 : 0 }}>{e}</div>
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.4)', fontFamily: 'Outfit, sans-serif' }}>+2.000 clientes satisfechos</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {'★★★★★'.split('').map((s,i) => <span key={i} style={{ color: '#B8833A', fontSize: 14 }}>{s}</span>)}
              <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.4)', fontFamily: 'Outfit, sans-serif', marginLeft: 4 }}>4.9 de media</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS VISUALES ── */}
      <section style={{ padding: 'clamp(32px,5vw,64px) 0', borderTop: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 6, fontWeight: 600 }}>Categorías</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 300, color: '#1A1612', margin: 0 }}>
              ¿Qué buscas <em style={{ color: '#B8833A' }}>hoy</em>?
            </h2>
          </div>

          <div className="cats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {CATEGORIES.map((cat, i) => (
              <button key={i} className="cat-card" onClick={() => navigate(`/search?category=${cat.value}`)} style={{
                background: cat.color, border: `1.5px solid ${cat.border}`,
                borderRadius: 16, padding: '16px 12px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              }}>
                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{cat.icon}</span>
                <span style={{ fontSize: 12, color: '#1A1612', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ padding: 'clamp(40px,6vw,80px) 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 8, fontWeight: 600 }}>Simple y rápido</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 300, color: '#1A1612', margin: 0 }}>
              Reserva en <em style={{ color: '#B8833A' }}>3 pasos</em>
            </h2>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                background: '#FFFFFF', border: `1.5px solid ${s.border}`,
                borderRadius: 20, padding: '28px 24px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Big number watermark */}
                <div style={{ position: 'absolute', top: -10, right: 16, fontFamily: 'Cormorant Garamond, serif', fontSize: '6rem', fontWeight: 700, color: s.border, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>{s.n}</div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: s.color, border: `1.5px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: 16 }}>
                    {s.icon}
                  </div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 600, color: '#1A1612', marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(26,22,18,0.5)', lineHeight: 1.65, margin: 0, fontFamily: 'Outfit, sans-serif' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROFESIONALES DESTACADOS ── */}
      {featured?.length > 0 && (
        <section style={{ padding: 'clamp(32px,5vw,64px) 0', borderTop: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ padding: '0 20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 10 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 6, fontWeight: 600 }}>Destacados</p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 300, color: '#1A1612', margin: 0 }}>
                  Los mejores <em style={{ color: '#B8833A' }}>cerca de ti</em>
                </h2>
              </div>
              <Link to="/search" style={{ fontSize: 13, color: '#B8833A', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                Ver todos →
              </Link>
            </div>

            <div className="scroll-row" style={{ display: 'flex', overflowX: 'auto', gap: 12, padding: '4px 20px 16px' }}>
              {featured.map(prof => <ProfCard key={prof.id} prof={prof} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST BAR ── */}
      <section style={{ padding: 'clamp(28px,4vw,52px) 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {TRUST.map((t, i) => (
              <div key={i} className="trust-item" style={{
                background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 16,
                padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              }}>
                <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1612', margin: '0 0 2px', fontFamily: 'Outfit, sans-serif' }}>{t.label}</p>
                  <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: 'clamp(28px,5vw,64px) 0 clamp(40px,7vw,100px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            borderRadius: 24, overflow: 'hidden', position: 'relative',
            background: 'linear-gradient(135deg, #1A0F05 0%, #2A1A08 50%, #1A0F05 100%)',
            padding: 'clamp(36px,6vw,72px) clamp(24px,5vw,64px)',
            textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            {/* Gold glow */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(184,131,58,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(184,131,58,0.15)', border: '1px solid rgba(184,131,58,0.3)', borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
                <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#D4A055', fontWeight: 600 }}>Empieza hoy · Gratis</span>
              </div>

              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 300, color: '#F7F5F2', marginBottom: 12, lineHeight: 1.08 }}>
                Tu bienestar,<br /><em style={{ color: '#D4A055' }}>reservado</em>
              </h2>
              <p style={{ color: 'rgba(247,245,242,0.45)', marginBottom: 32, maxWidth: 380, margin: '0 auto 32px', fontSize: 15, lineHeight: 1.65, fontFamily: 'Outfit, sans-serif' }}>
                Crea tu cuenta gratis y reserva con los mejores profesionales verificados cerca de ti.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/register/client')} style={{
                  background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', border: 'none',
                  borderRadius: 12, padding: '14px 32px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 6px 24px rgba(184,131,58,0.4)',
                }}>
                  Crear cuenta gratis
                </button>
                <button onClick={() => navigate('/search')} style={{
                  background: 'rgba(247,245,242,0.06)', color: 'rgba(247,245,242,0.7)',
                  border: '1.5px solid rgba(247,245,242,0.15)', borderRadius: 12,
                  padding: '14px 32px', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                }}>
                  Explorar primero
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
