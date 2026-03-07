import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { icon: '💇‍♀️', label: 'Peluquería',   value: 'hair' },
  { icon: '💅',    label: 'Uñas',         value: 'nails' },
  { icon: '🧖‍♀️', label: 'Spa',          value: 'spa' },
  { icon: '🪒',    label: 'Barbería',     value: 'barber' },
  { icon: '✨',    label: 'Estética',     value: 'aesthetic' },
  { icon: '👁️',   label: 'Cejas',        value: 'brows' },
  { icon: '💆‍♀️', label: 'Masajes',      value: 'massage' },
  { icon: '🦷',    label: 'Dental',       value: 'dental' },
  { icon: '🏋️',   label: 'Personal trainer', value: 'fitness' },
  { icon: '👗',    label: 'Moda',         value: 'fashion' },
  { icon: '🧴',    label: 'Skincare',     value: 'skincare' },
  { icon: '💋',    label: 'Maquillaje',   value: 'makeup' },
  { icon: '🧘',    label: 'Yoga',         value: 'yoga' },
  { icon: '📸',    label: 'Fotografía',   value: 'photography' },
]

const STEPS = [
  {
    num: '01',
    title: 'Busca tu servicio',
    desc: 'Encuentra el profesional ideal entre miles de opciones verificadas cerca de ti.',
    icon: '🔍',
  },
  {
    num: '02',
    title: 'Elige fecha y hora',
    desc: 'Consulta disponibilidad en tiempo real y reserva el hueco que mejor te encaje.',
    icon: '📅',
  },
  {
    num: '03',
    title: 'Disfruta la experiencia',
    desc: 'Recibe confirmación instantánea y un recordatorio 24h antes de tu cita.',
    icon: '✨',
  },
]

const STATS = [
  { num: '2K+',  label: 'Profesionales verificados' },
  { num: '50K+', label: 'Citas reservadas al mes' },
  { num: '4.9★', label: 'Valoración media' },
  { num: '120+', label: 'Ciudades disponibles' },
]

// ── Star display ───────────────────────────────────────────────────────────────
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

// ── Horizontal infinite scroll for categories ──────────────────────────────────
function CategoryCarousel() {
  const navigate = useNavigate()
  const trackRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const doubled = [...CATEGORIES, ...CATEGORIES]

  return (
    <div style={{ overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
      onMouseDown={(e) => { setIsDragging(true); setStartX(e.pageX - trackRef.current.offsetLeft); setScrollLeft(trackRef.current.scrollLeft) }}
      onMouseLeave={() => setIsDragging(false)}
      onMouseUp={() => setIsDragging(false)}
      onMouseMove={(e) => { if (!isDragging) return; e.preventDefault(); const x = e.pageX - trackRef.current.offsetLeft; trackRef.current.scrollLeft = scrollLeft - (x - startX) }}
    >
      <div
        ref={trackRef}
        style={{
          display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}
      >
        {doubled.map((cat, i) => (
          <button
            key={i}
            onClick={() => navigate(`/search?category=${cat.value}`)}
            style={{
              flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(201,150,90,0.12)',
              borderRadius: 16, padding: '18px 22px',
              cursor: 'pointer', transition: 'all 0.25s',
              minWidth: 100,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(201,150,90,0.08)'
              e.currentTarget.style.borderColor = 'rgba(201,150,90,0.35)'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.borderColor = 'rgba(201,150,90,0.12)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <span style={{ fontSize: 28 }}>{cat.icon}</span>
            <span style={{ fontSize: 12, color: 'rgba(247,242,234,0.6)', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Professional card ──────────────────────────────────────────────────────────
function ProfCard({ prof }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/professional/${prof.id}`)}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(201,150,90,0.12)',
        borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = '1px solid rgba(201,150,90,0.35)'
        e.currentTarget.style.transform = 'translateY(-6px)'
        e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid rgba(201,150,90,0.12)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Cover */}
      <div style={{ height: 160, background: 'linear-gradient(135deg, rgba(201,150,90,0.12), rgba(10,8,6,0.8))', overflow: 'hidden', position: 'relative' }}>
        {prof.cover_image_url
          ? <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>✂️</div>
        }
        {prof.is_verified && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(201,150,90,0.9)', borderRadius: 100, padding: '3px 10px', fontSize: 10, color: '#0A0806', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
            ✓ Verificado
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px' }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', fontWeight: 600, color: '#F7F2EA', margin: '0 0 4px' }}>
          {prof.business_name}
        </h3>
        <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)', margin: '0 0 10px', fontFamily: 'Outfit, sans-serif' }}>
          📍 {prof.city}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Stars rating={prof.avg_rating} />
            <span style={{ fontSize: 11, color: 'rgba(247,242,234,0.35)', fontFamily: 'Outfit, sans-serif' }}>
              ({prof.total_reviews})
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#C9965A', background: 'rgba(201,150,90,0.08)', padding: '3px 10px', borderRadius: 100, fontFamily: 'Outfit, sans-serif' }}>
            Ver perfil →
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [city, setCity]     = useState('')

  const { data: featured } = useQuery({
    queryKey: ['featured-pros'],
    queryFn: () => profApi.getAll({ limit: 8, verified: true }).then((r) => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '20%', right: '-5%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(201,150,90,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(201,150,90,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,150,90,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,150,90,0.03) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
        </div>

        <div className="container-app" style={{ position: 'relative', zIndex: 10, padding: '80px 0' }}>
          <div style={{ maxWidth: 700 }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(201,150,90,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 32 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9965A', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.8)', fontFamily: 'Outfit, sans-serif' }}>
                Plataforma N°1 de reservas en España
              </span>
            </div>

            {/* Heading */}
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, lineHeight: 1.02, marginBottom: 24, fontSize: 'clamp(3.2rem, 7vw, 6.5rem)', color: '#F7F2EA' }}>
              Tu próxima<br />
              <em style={{ color: '#C9965A', fontStyle: 'italic' }}>experiencia</em><br />
              a un clic
            </h1>

            <p style={{ color: 'rgba(247,242,234,0.5)', fontSize: '1.1rem', fontWeight: 300, marginBottom: 40, maxWidth: 500, fontFamily: 'Outfit, sans-serif', lineHeight: 1.7 }}>
              Conectamos a personas con los mejores profesionales de belleza y bienestar. Reserva en segundos, sin llamadas.
            </p>

            {/* Search bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, maxWidth: 580, marginBottom: 32 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${search}&city=${city}`)}
                placeholder="¿Qué servicio buscas?"
                className="input"
                style={{ flex: '1 1 200px' }}
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ciudad"
                className="input"
                style={{ flex: '0 1 140px' }}
              />
              <button
                onClick={() => navigate(`/search?q=${search}&city=${city}`)}
                className="btn-primary"
                style={{ whiteSpace: 'nowrap' }}
              >
                Buscar
              </button>
            </div>

            {/* Quick tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
              {['Peluquería', 'Masajes', 'Uñas', 'Barbería', 'Spa'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/search?q=${tag}`)}
                  style={{
                    fontSize: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 100, padding: '5px 14px', color: 'rgba(247,242,234,0.5)',
                    cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,150,90,0.4)'; e.currentTarget.style.color = '#C9965A' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(247,242,234,0.5)' }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex' }}>
                {['👩','👱','👦','👩‍🦱','👨'].map((e, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,150,90,0.2)', border: '2px solid #0A0806', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginLeft: i > 0 ? -8 : 0 }}>
                    {e}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.4)', fontFamily: 'Outfit, sans-serif' }}>
                <strong style={{ color: '#E8B97A' }}>+50.000 personas</strong> reservaron este mes · ★★★★★ 4.9/5
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(201,150,90,0.1)', borderBottom: '1px solid rgba(201,150,90,0.1)', background: 'rgba(201,150,90,0.03)' }}>
        <div className="container-app">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ padding: '28px 0', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(201,150,90,0.1)' : 'none' }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', fontWeight: 300, color: '#C9965A', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 11, color: 'rgba(247,242,234,0.35)', marginTop: 6, fontFamily: 'Outfit, sans-serif', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ──────────────────────────────────────────── */}
      <section style={{ background: '#0A0806', borderBottom: '1px solid rgba(201,150,90,0.1)', padding: '80px 0' }}>
        <div className="container-app">
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>
              Categorías
            </p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: '#F7F2EA', margin: 0 }}>
              Explora por <em style={{ color: '#C9965A' }}>tipo de servicio</em>
            </h2>
          </div>
          <CategoryCarousel />
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <button
              onClick={() => navigate('/search')}
              style={{ fontSize: 13, color: 'rgba(201,150,90,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#C9965A'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(201,150,90,0.6)'}
            >
              Ver todos los servicios →
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid rgba(201,150,90,0.1)' }}>
        <div className="container-app">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>
              Simple y rápido
            </p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: '#F7F2EA', margin: 0 }}>
              ¿Cómo <em style={{ color: '#C9965A' }}>funciona</em>?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, position: 'relative' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: 48, left: '16.6%', right: '16.6%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,150,90,0.2), rgba(201,150,90,0.2), transparent)', zIndex: 0 }} />

            {STEPS.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                {/* Icon circle */}
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
                  background: 'linear-gradient(135deg, rgba(201,150,90,0.15), rgba(201,150,90,0.05))',
                  border: '1px solid rgba(201,150,90,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30, position: 'relative',
                }}>
                  {step.icon}
                  <div style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 22, height: 22, borderRadius: '50%',
                    background: '#C9965A', color: '#0A0806',
                    fontSize: 10, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </div>
                </div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 600, color: '#F7F2EA', marginBottom: 12 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(247,242,234,0.45)', lineHeight: 1.6, fontFamily: 'Outfit, sans-serif', maxWidth: 240, margin: '0 auto' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROFESSIONALS ──────────────────────────────── */}
      {featured?.length > 0 && (
        <section style={{ background: '#0A0806', borderBottom: '1px solid rgba(201,150,90,0.1)', padding: '100px 0' }}>
          <div className="container-app">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>
                  Top profesionales
                </p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: '#F7F2EA', margin: 0 }}>
                  Destacados <em style={{ color: '#C9965A' }}>esta semana</em>
                </h2>
              </div>
              <Link to="/search" style={{ fontSize: 13, color: 'rgba(201,150,90,0.6)', textDecoration: 'none', fontFamily: 'Outfit, sans-serif', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C9965A'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(201,150,90,0.6)'}
              >
                Ver todos →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {featured.slice(0, 8).map((prof) => (
                <ProfCard key={prof.id} prof={prof} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0' }}>
        <div className="container-app">
          <div style={{
            position: 'relative', overflow: 'hidden', borderRadius: 28,
            border: '1px solid rgba(201,150,90,0.2)',
            background: 'linear-gradient(135deg, #1F1608 0%, #0A0806 60%, #1a1008 100%)',
            padding: 'clamp(48px, 8vw, 96px)', textAlign: 'center',
          }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(201,150,90,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>
                Empieza hoy
              </p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', fontWeight: 300, color: '#F7F2EA', marginBottom: 16, lineHeight: 1.1 }}>
                Tu bienestar,<br /><em style={{ color: '#C9965A' }}>reservado</em>
              </h2>
              <p style={{ color: 'rgba(247,242,234,0.45)', marginBottom: 40, maxWidth: 420, margin: '0 auto 40px', fontFamily: 'Outfit, sans-serif', lineHeight: 1.7 }}>
                Únete a miles de personas que ya gestionan sus citas con TopSy. Gratis, sin complicaciones.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '14px 36px', fontSize: 15 }}>
                  Crear cuenta gratis
                </button>
                <button onClick={() => navigate('/search')} className="btn-outline" style={{ padding: '14px 36px', fontSize: 15 }}>
                  Explorar profesionales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}