import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'

const CATEGORIES = [
  { icon: '💇‍♀️', label: 'Peluquería',       value: 'hair' },
  { icon: '💅',    label: 'Uñas',             value: 'nails' },
  { icon: '🧖‍♀️', label: 'Spa',              value: 'spa' },
  { icon: '🪒',    label: 'Barbería',         value: 'barber' },
  { icon: '✨',    label: 'Estética',         value: 'aesthetic' },
  { icon: '👁️',   label: 'Cejas',            value: 'brows' },
  { icon: '💆‍♀️', label: 'Masajes',          value: 'massage' },
  { icon: '🧴',    label: 'Skincare',         value: 'skincare' },
  { icon: '💋',    label: 'Maquillaje',       value: 'makeup' },
  { icon: '🧘',    label: 'Yoga',             value: 'yoga' },
  { icon: '📸',    label: 'Fotografía',       value: 'photography' },
  { icon: '🏋️',   label: 'Fitness',          value: 'fitness' },
]

const STEPS = [
  { icon: '🔍', n: '01', title: 'Busca', desc: 'Encuentra el profesional ideal verificado cerca de ti.' },
  { icon: '📅', n: '02', title: 'Reserva', desc: 'Elige fecha y hora en tiempo real, sin llamadas.' },
  { icon: '✨', n: '03', title: 'Disfruta', desc: 'Confirmación instantánea y recordatorio 24h antes.' },
]

function Stars({ rating }) {
  const r = Math.round(rating ?? 0)
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= r ? '#C9965A' : 'rgba(201,150,90,0.2)', fontSize: 11 }}>★</span>
      ))}
    </span>
  )
}

function ProfCard({ prof }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/professional/${prof.id}`)}
      style={{
        background: 'rgba(255,240,210,0.03)',
        border: '1px solid rgba(201,150,90,0.12)',
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.22s',
        flexShrink: 0, width: 175,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,150,90,0.4)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,150,90,0.12)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ height: 110, background: 'linear-gradient(135deg, rgba(201,150,90,0.1), rgba(20,14,8,0.9))', overflow: 'hidden', position: 'relative' }}>
        {prof.cover_image_url
          ? <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✂️</div>
        }
        {prof.is_verified && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(201,150,90,0.92)', borderRadius: 100, padding: '2px 8px', fontSize: 9, color: '#16120E', fontWeight: 700 }}>✓</div>
        )}
      </div>
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 600, color: '#F7F2EA', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {prof.business_name}
        </p>
        <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.35)', margin: '0 0 7px' }}>📍 {prof.city}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Stars rating={prof.avg_rating} />
          <span style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)' }}>({prof.total_reviews})</span>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [city, setCity]     = useState('')
  const scrollRef = useRef(null)

  const { data: featured } = useQuery({
    queryKey: ['featured-pros'],
    queryFn: () => profApi.getAll({ limit: 8, verified: true }).then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  })

  const handleSearch = () => navigate(`/search?q=${search}&city=${city}`)

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        .cat-pill:hover { background: rgba(201,150,90,0.12) !important; border-color: rgba(201,150,90,0.4) !important; color: #C9965A !important; }
        .quick-tag:hover { border-color: rgba(201,150,90,0.45) !important; color: #C9965A !important; }
        .scroll-row::-webkit-scrollbar { display: none; }
        .scroll-row { -ms-overflow-style: none; scrollbar-width: none; }
        @media (min-width: 769px) {
          .hero-search { flex-direction: row !important; }
          .hero-search input.city-input { display: flex !important; }
          .hero-search .divider { display: block !important; }
          .steps-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .pros-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .hero-search .city-input { display: none !important; }
          .hero-search .divider { display: none !important; }
          .connecting-line { display: none !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: 'clamp(40px, 8vw, 96px) 0 clamp(36px, 6vw, 72px)', overflow: 'hidden' }}>
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(201,150,90,0.08) 0%, transparent 65%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(160,90,30,0.06) 0%, transparent 65%)', borderRadius: '50%' }} />
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid rgba(201,150,90,0.18)', borderRadius: 100, padding: '4px 12px', marginBottom: 20 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C9965A', flexShrink: 0 }} />
            <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.7)' }}>
              Belleza y bienestar · España
            </span>
          </div>

          {/* Heading — compact & punchy */}
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif', fontWeight: 300,
            lineHeight: 1.0, marginBottom: 14,
            fontSize: 'clamp(2.6rem, 7vw, 5.2rem)', color: '#F7F2EA',
          }}>
            Tu próxima<br />
            <em style={{ color: '#C9965A', fontStyle: 'italic' }}>experiencia</em><br />
            a un clic
          </h1>

          <p style={{ color: 'rgba(247,242,234,0.45)', fontSize: 'clamp(0.85rem, 2vw, 1rem)', fontWeight: 300, marginBottom: 24, maxWidth: 400, lineHeight: 1.65 }}>
            Reserva con profesionales verificados. Sin llamadas, sin esperas.
          </p>

          {/* Search bar */}
          <div
            className="hero-search"
            style={{
              display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 540, marginBottom: 16,
              background: 'rgba(255,240,210,0.045)',
              border: '1px solid rgba(201,150,90,0.2)',
              borderRadius: 14, overflow: 'hidden',
            }}
          >
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="¿Qué servicio buscas?"
              style={{ flex: '1 1 200px', background: 'transparent', border: 'none', outline: 'none', padding: '13px 16px', color: '#F7F2EA', fontSize: 14 }}
            />
            <div className="divider" style={{ display: 'none', width: 1, background: 'rgba(201,150,90,0.15)' }} />
            <input
              className="city-input"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Ciudad"
              style={{ flex: '0 1 120px', background: 'transparent', border: 'none', outline: 'none', padding: '13px 14px', color: '#F7F2EA', fontSize: 14 }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: '13px 22px',
                background: 'linear-gradient(135deg, #C9965A, #E8B97A)',
                border: 'none', cursor: 'pointer', color: '#16120E',
                fontWeight: 700, fontSize: 12, letterSpacing: '0.1em',
                textTransform: 'uppercase', whiteSpace: 'nowrap',
                borderTop: '1px solid rgba(201,150,90,0.15)',
              }}
            >
              Buscar
            </button>
          </div>

          {/* Quick tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Peluquería', 'Masajes', 'Uñas', 'Barbería', 'Spa'].map(tag => (
              <button
                key={tag}
                className="quick-tag"
                onClick={() => navigate(`/search?q=${tag}`)}
                style={{
                  fontSize: 12, background: 'transparent',
                  border: '1px solid rgba(255,240,210,0.1)',
                  borderRadius: 100, padding: '4px 12px',
                  color: 'rgba(247,242,234,0.4)', cursor: 'pointer', transition: 'all 0.18s',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ padding: 'clamp(28px, 5vw, 56px) 0', borderTop: '1px solid rgba(201,150,90,0.07)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ padding: '0 20px', marginBottom: 18 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.5)', marginBottom: 4 }}>Categorías</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 300, color: '#F7F2EA', margin: 0 }}>
              Explora por <em style={{ color: '#C9965A' }}>servicio</em>
            </h2>
          </div>

          {/* Scrollable row — no padding so it bleeds on mobile */}
          <div
            className="scroll-row"
            style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 20px 12px' }}
          >
            {CATEGORIES.map((cat, i) => (
              <button
                key={i}
                className="cat-pill"
                onClick={() => navigate(`/search?category=${cat.value}`)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,240,210,0.03)',
                  border: '1px solid rgba(201,150,90,0.12)',
                  borderRadius: 100, padding: '8px 16px',
                  cursor: 'pointer', transition: 'all 0.18s', color: 'rgba(247,242,234,0.55)',
                  fontSize: 13, whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: 18 }}>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: 'clamp(32px, 6vw, 72px) 0', borderTop: '1px solid rgba(201,150,90,0.07)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.5)', marginBottom: 4 }}>Simple y rápido</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 300, color: '#F7F2EA', margin: 0 }}>
              ¿Cómo <em style={{ color: '#C9965A' }}>funciona</em>?
            </h2>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, position: 'relative' }}>
            <div className="connecting-line" style={{ position: 'absolute', top: 28, left: '16.6%', right: '16.6%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,150,90,0.2), rgba(201,150,90,0.2), transparent)', zIndex: 0 }} />
            {STEPS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                background: 'rgba(255,240,210,0.025)', border: '1px solid rgba(201,150,90,0.1)',
                borderRadius: 16, padding: '16px 18px',
              }}>
                {/* Number + icon */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#C9965A', letterSpacing: '0.05em' }}>{s.n}</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 600, color: '#F7F2EA', marginBottom: 4 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.4)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROS ── */}
      {featured?.length > 0 && (
        <section style={{ padding: 'clamp(32px, 6vw, 72px) 0', borderTop: '1px solid rgba(201,150,90,0.07)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ padding: '0 20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, gap: 10 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.5)', marginBottom: 4 }}>Destacados</p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 300, color: '#F7F2EA', margin: 0 }}>
                  Esta <em style={{ color: '#C9965A' }}>semana</em>
                </h2>
              </div>
              <Link to="/search" style={{ fontSize: 13, color: 'rgba(201,150,90,0.55)', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Ver todos →
              </Link>
            </div>

            {/* Mobile: horizontal scroll / Desktop: grid */}
            <div
              className="scroll-row pros-grid"
              style={{ display: 'flex', overflowX: 'auto', gap: 12, padding: '4px 20px 12px' }}
            >
              {featured.slice(0, 8).map(prof => (
                <ProfCard key={prof.id} prof={prof} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{ padding: 'clamp(28px, 5vw, 60px) 0 clamp(32px, 6vw, 80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            position: 'relative', overflow: 'hidden', borderRadius: 20,
            border: '1px solid rgba(201,150,90,0.18)',
            background: 'linear-gradient(135deg, #201508 0%, #16120E 55%, #1a1208 100%)',
            padding: 'clamp(28px, 6vw, 64px) clamp(20px, 5vw, 56px)',
            textAlign: 'center',
          }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(201,150,90,0.08) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.5)', marginBottom: 10 }}>Empieza hoy</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 300, color: '#F7F2EA', marginBottom: 10, lineHeight: 1.08 }}>
                Tu bienestar,<br /><em style={{ color: '#C9965A' }}>reservado</em>
              </h2>
              <p style={{ color: 'rgba(247,242,234,0.38)', marginBottom: 28, maxWidth: 320, margin: '0 auto 28px', fontSize: 14, lineHeight: 1.65 }}>
                Crea tu cuenta gratis y reserva con los mejores profesionales cerca de ti.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '12px 28px', fontSize: 13, width: 'auto' }}>
                  Crear cuenta gratis
                </button>
                <button onClick={() => navigate('/search')} className="btn-outline" style={{ padding: '12px 28px', fontSize: 13, width: 'auto' }}>
                  Explorar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}