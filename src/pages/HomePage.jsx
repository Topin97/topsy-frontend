import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'

const CATEGORIES = [
  { icon: '💇‍♀️', label: 'Peluquería',   value: 'hair',        grad: 'linear-gradient(135deg,#FFF0E6,#FFE4CC)' },
  { icon: '💅',    label: 'Uñas',         value: 'nails',       grad: 'linear-gradient(135deg,#FFF0F5,#FFE0EC)' },
  { icon: '🧖‍♀️', label: 'Spa',          value: 'spa',         grad: 'linear-gradient(135deg,#F0FFF4,#DCFCE7)' },
  { icon: '🪒',    label: 'Barbería',     value: 'barber',      grad: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' },
  { icon: '✨',    label: 'Estética',     value: 'aesthetic',   grad: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)' },
  { icon: '👁️',   label: 'Cejas',        value: 'brows',       grad: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)' },
  { icon: '💆‍♀️', label: 'Masajes',      value: 'massage',     grad: 'linear-gradient(135deg,#FFF5F0,#FFE4D9)' },
  { icon: '🧴',    label: 'Skincare',     value: 'skincare',    grad: 'linear-gradient(135deg,#F0FBFF,#CFFAFE)' },
  { icon: '💋',    label: 'Maquillaje',   value: 'makeup',      grad: 'linear-gradient(135deg,#FDF2F8,#FCE7F3)' },
  { icon: '🧘',    label: 'Yoga',         value: 'yoga',        grad: 'linear-gradient(135deg,#F0FFF8,#CCFBF1)' },
  { icon: '🏋️',   label: 'Fitness',      value: 'fitness',     grad: 'linear-gradient(135deg,#FFF1F2,#FFE4E6)' },
  { icon: '📸',    label: 'Fotografía',   value: 'photography', grad: 'linear-gradient(135deg,#F8F0FF,#F3E8FF)' },
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
  const minPrice = prof.services?.length
    ? Math.min(...prof.services.filter(s => s.is_active !== false).map(s => s.price))
    : null

  return (
    <div
      onClick={() => navigate(`/professional/${prof.id}`)}
      style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, width: 200, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.25s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(184,131,58,0.16)'; e.currentTarget.style.borderColor = 'rgba(184,131,58,0.35)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)' }}
    >
      <div style={{ height: 130, background: '#EFEDE9', overflow: 'hidden', position: 'relative' }}>
        {prof.cover_image_url
          ? <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>✂️</div>
        }
        {prof.is_verified && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg,#B8833A,#D4A055)', borderRadius: 100, padding: '3px 9px', fontSize: 9, color: '#FFFFFF', fontWeight: 800, letterSpacing: '0.06em', boxShadow: '0 2px 8px rgba(184,131,58,0.4)' }}>✓ TOP</div>
        )}
        {minPrice != null && (
          <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(26,22,18,0.7)', backdropFilter: 'blur(8px)', borderRadius: 100, padding: '3px 10px', fontSize: 11, color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
            desde {minPrice}€
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 600, color: '#1A1612', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {prof.business_name}
        </p>
        <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.38)', margin: '0 0 7px', fontFamily: 'Outfit, sans-serif' }}>📍 {prof.city}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Stars rating={prof.avg_rating} />
          <span style={{ fontSize: 11, color: '#B8833A', fontWeight: 700 }}>{prof.avg_rating ? Number(prof.avg_rating).toFixed(1) : '—'}</span>
          <span style={{ fontSize: 10, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>({prof.total_reviews})</span>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const scrollRef = useRef(null)

  const { data: featured } = useQuery({
    queryKey: ['featured-pros'],
    queryFn: () => profApi.getAll({ limit: 12, verified: true }).then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  })

  const handleSearch = e => {
    e.preventDefault()
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`)
    else navigate('/search')
  }

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif', background: '#F7F5F2' }}>
      <style>{`
        .scroll-row::-webkit-scrollbar { display: none; }
        .scroll-row { -ms-overflow-style: none; scrollbar-width: none; }
        .cat-pill:hover { transform: translateY(-3px) scale(1.03) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .cat-pill { transition: all 0.2s ease !important; }
        .hero-search:focus-within { box-shadow: 0 0 0 3px rgba(184,131,58,0.15), 0 8px 32px rgba(0,0,0,0.12) !important; border-color: rgba(184,131,58,0.5) !important; }
        .quick-tag:hover { background: rgba(184,131,58,0.1) !important; border-color: rgba(184,131,58,0.35) !important; color: #B8833A !important; }
        .trust-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
        .trust-card { transition: all 0.2s; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:none } }
        .fade-up-1 { animation: fadeUp 0.6s ease both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.2s ease both; }
        .fade-up-4 { animation: fadeUp 0.6s 0.3s ease both; }
        @media (min-width: 640px) {
          .cats-grid { grid-template-columns: repeat(4,1fr) !important; }
          .trust-grid { grid-template-columns: repeat(4,1fr) !important; }
          .steps-grid { grid-template-columns: repeat(3,1fr) !important; }
        }
        @media (min-width: 960px) {
          .cats-grid { grid-template-columns: repeat(6,1fr) !important; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '70vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'linear-gradient(160deg, #FFFFFF 0%, #F7F5F2 40%, #F0EBE3 100%)' }}>

        {/* Decoración de fondo */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(212,160,85,0.12) 0%, transparent 60%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-15%', left: '-8%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(184,131,58,0.07) 0%, transparent 60%)', borderRadius: '50%' }} />
          {/* Líneas decorativas */}
          <svg style={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '100%', opacity: 0.04 }} viewBox="0 0 400 600" fill="none">
            <circle cx="300" cy="200" r="200" stroke="#B8833A" strokeWidth="1"/>
            <circle cx="300" cy="200" r="150" stroke="#B8833A" strokeWidth="1"/>
            <circle cx="300" cy="200" r="100" stroke="#B8833A" strokeWidth="1"/>
            <circle cx="300" cy="200" r="50"  stroke="#B8833A" strokeWidth="1"/>
          </svg>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(60px,10vw,120px) 20px clamp(50px,8vw,100px)', position: 'relative', zIndex: 1, width: '100%' }}>

          {/* Badge */}
          <div className="fade-up-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(184,131,58,0.08)', border: '1px solid rgba(184,131,58,0.22)', borderRadius: 100, padding: '5px 16px', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#B8833A', flexShrink: 0, boxShadow: '0 0 0 3px rgba(184,131,58,0.2)' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B8833A', fontWeight: 700 }}>
              Belleza · Bienestar · España
            </span>
          </div>

          {/* Heading */}
          <h1 className="fade-up-2" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, lineHeight: 1.0, marginBottom: 20, fontSize: 'clamp(3rem, 8vw, 6rem)', color: '#1A1612', letterSpacing: '-0.01em' }}>
            Tu próxima<br />
            <em style={{ color: '#B8833A', fontStyle: 'italic' }}>experiencia</em><br />
            <span style={{ fontWeight: 200, color: 'rgba(26,22,18,0.55)' }}>a un clic</span>
          </h1>

          {/* Buscador integrado en el hero */}
          <form className="fade-up-3 hero-search" onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 18, padding: '6px 6px 6px 18px', maxWidth: 520, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: 18, transition: 'all 0.2s' }}>
            <span style={{ fontSize: 18, marginRight: 10, flexShrink: 0, opacity: 0.4 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Peluquería, masajes, barbería..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#1A1612', background: 'transparent', fontFamily: 'Outfit, sans-serif', minWidth: 0 }}
            />
            <button type="submit" style={{ flexShrink: 0, background: 'linear-gradient(135deg,#B8833A,#D4A055)', border: 'none', borderRadius: 12, padding: '11px 22px', color: '#FFFFFF', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 14px rgba(184,131,58,0.35)', whiteSpace: 'nowrap' }}>
              Buscar
            </button>
          </form>

          {/* Quick tags */}
          <div className="fade-up-3" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
            {['Peluquería', 'Masajes', 'Uñas', 'Barbería', 'Yoga'].map(tag => (
              <button key={tag} className="quick-tag" onClick={() => navigate(`/search?q=${tag}`)} style={{ fontSize: 13, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 100, padding: '7px 16px', color: 'rgba(26,22,18,0.55)', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'Outfit, sans-serif', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>{tag}</button>
            ))}
          </div>

          {/* Social proof */}
          <div className="fade-up-4" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex' }}>
                {['👩','👨','👩‍🦱','🧑','👩‍🦰'].map((e,i) => (
                  <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#EFEDE9,#E8E4DE)', border: '2px solid #F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginLeft: i > 0 ? -9 : 0, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>{e}</div>
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.45)' }}>+2.000 clientes felices</span>
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {'★★★★★'.split('').map((s,i) => <span key={i} style={{ color: '#B8833A', fontSize: 15 }}>{s}</span>)}
              <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.45)', marginLeft: 4 }}>4.9 · media valoraciones</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS ───────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(36px,5vw,64px) 0', background: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 6, fontWeight: 700 }}>Categorías</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 300, color: '#1A1612', margin: 0 }}>
                ¿Qué buscas <em style={{ color: '#B8833A' }}>hoy</em>?
              </h2>
            </div>
            <button onClick={() => navigate('/search')} style={{ fontSize: 12, color: '#B8833A', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'Outfit, sans-serif', flexShrink: 0 }}>
              Ver todo →
            </button>
          </div>

          <div className="cats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {CATEGORIES.map((cat, i) => (
              <button key={i} className="cat-pill" onClick={() => navigate(`/search?category=${cat.value}`)} style={{
                background: cat.grad, border: '1.5px solid rgba(0,0,0,0.06)',
                borderRadius: 18, padding: 'clamp(14px,3vw,20px) 12px',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <span style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', lineHeight: 1 }}>{cat.icon}</span>
                <span style={{ fontSize: 'clamp(11px,2.5vw,13px)', color: '#1A1612', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROFESIONALES DESTACADOS ─────────────────────────────────── */}
      {featured?.length > 0 && (
        <section style={{ padding: 'clamp(36px,5vw,64px) 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ padding: '0 20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 6, fontWeight: 700 }}>Destacados</p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 300, color: '#1A1612', margin: 0 }}>
                  Los mejores <em style={{ color: '#B8833A' }}>cerca de ti</em>
                </h2>
              </div>
              <Link to="/search" style={{ fontSize: 13, color: '#B8833A', textDecoration: 'none', fontWeight: 600, flexShrink: 0, fontFamily: 'Outfit, sans-serif' }}>
                Ver todos →
              </Link>
            </div>

            <div ref={scrollRef} className="scroll-row" style={{ display: 'flex', overflowX: 'auto', gap: 14, padding: '4px 20px 20px' }}>
              {featured.map(prof => <ProfCard key={prof.id} prof={prof} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(36px,5vw,72px) 0', background: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 8, fontWeight: 700 }}>Simple y rápido</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 300, color: '#1A1612', margin: 0 }}>
              Reserva en <em style={{ color: '#B8833A' }}>3 pasos</em>
            </h2>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
            {[
              { n: '01', icon: '🔍', title: 'Busca', desc: 'Encuentra el profesional ideal verificado cerca de ti por categoría, ciudad o nombre.', accent: '#B8833A' },
              { n: '02', icon: '📅', title: 'Reserva', desc: 'Elige fecha y hora disponible en tiempo real. Sin llamadas, sin esperas.', accent: '#16a34a' },
              { n: '03', icon: '✨', title: 'Disfruta', desc: 'Confirmación instantánea por email y recordatorio automático 24h antes.', accent: '#2563eb' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.06)', borderRadius: 22, padding: 'clamp(22px,4vw,32px)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: 10, fontFamily: 'Cormorant Garamond, serif', fontSize: '7rem', fontWeight: 800, color: 'rgba(0,0,0,0.04)', lineHeight: 1, userSelect: 'none' }}>{s.n}</div>
                <div style={{ width: 50, height: 50, borderRadius: 15, background: '#FFFFFF', border: `1.5px solid rgba(0,0,0,0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 600, color: '#1A1612', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(26,22,18,0.5)', lineHeight: 1.65, margin: 0, fontFamily: 'Outfit, sans-serif' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(28px,4vw,52px) 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {[
              { icon: '✅', label: 'Profesionales verificados', sub: 'Revisados por TopSy' },
              { icon: '⭐', label: 'Valoraciones reales',       sub: 'Solo clientes confirmados' },
              { icon: '🔔', label: 'Recordatorios 24h',         sub: 'Nunca olvides una cita' },
              { icon: '💬', label: 'Notas en la reserva',       sub: 'Comunícate con el profesional' },
            ].map((t, i) => (
              <div key={i} className="trust-card" style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(184,131,58,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{t.icon}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1612', margin: '0 0 2px', fontFamily: 'Outfit, sans-serif' }}>{t.label}</p>
                  <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(28px,5vw,64px) 0 clamp(48px,8vw,100px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ borderRadius: 28, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #1A0F05 0%, #2C1A08 60%, #1A0F05 100%)', padding: 'clamp(40px,6vw,80px) clamp(24px,5vw,64px)', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(184,131,58,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(212,160,85,0.7)', marginBottom: 16, fontWeight: 700 }}>Empieza hoy · Gratis</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.4rem,5.5vw,4.2rem)', fontWeight: 300, color: '#F7F5F2', marginBottom: 14, lineHeight: 1.06 }}>
                Tu bienestar,<br /><em style={{ color: '#D4A055' }}>reservado</em>
              </h2>
              <p style={{ color: 'rgba(247,245,242,0.4)', marginBottom: 36, maxWidth: 380, margin: '0 auto 36px', fontSize: 15, lineHeight: 1.65, fontFamily: 'Outfit, sans-serif' }}>
                Crea tu cuenta gratis y reserva con los mejores profesionales verificados cerca de ti.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/register/client')} style={{ background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: '15px 34px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 28px rgba(184,131,58,0.45)' }}>
                  Crear cuenta gratis
                </button>
                <button onClick={() => navigate('/search')} style={{ background: 'rgba(247,245,242,0.07)', color: 'rgba(247,245,242,0.75)', border: '1.5px solid rgba(247,245,242,0.15)', borderRadius: 14, padding: '15px 34px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
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
