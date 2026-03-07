import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { icon: '💇‍♀️', label: 'Peluquería',        value: 'hair' },
  { icon: '💅',    label: 'Uñas',              value: 'nails' },
  { icon: '🧖‍♀️', label: 'Spa',               value: 'spa' },
  { icon: '🪒',    label: 'Barbería',          value: 'barber' },
  { icon: '✨',    label: 'Estética',          value: 'aesthetic' },
  { icon: '👁️',   label: 'Cejas',             value: 'brows' },
  { icon: '💆‍♀️', label: 'Masajes',           value: 'massage' },
  { icon: '🦷',    label: 'Dental',            value: 'dental' },
  { icon: '🏋️',   label: 'Personal trainer',  value: 'fitness' },
  { icon: '👗',    label: 'Moda',              value: 'fashion' },
  { icon: '🧴',    label: 'Skincare',          value: 'skincare' },
  { icon: '💋',    label: 'Maquillaje',        value: 'makeup' },
  { icon: '🧘',    label: 'Yoga',              value: 'yoga' },
  { icon: '📸',    label: 'Fotografía',        value: 'photography' },
]

const STEPS = [
  {
    title: 'Busca tu servicio',
    desc: 'Encuentra el profesional ideal entre opciones verificadas cerca de ti.',
    icon: '🔍',
  },
  {
    title: 'Elige fecha y hora',
    desc: 'Consulta disponibilidad en tiempo real y reserva el hueco que mejor te encaje.',
    icon: '📅',
  },
  {
    title: 'Disfruta la experiencia',
    desc: 'Recibe confirmación instantánea y un recordatorio 24h antes de tu cita.',
    icon: '✨',
  },
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

  return (
    <div
      style={{ overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
      onMouseDown={(e) => { setIsDragging(true); setStartX(e.pageX - trackRef.current.offsetLeft); setScrollLeft(trackRef.current.scrollLeft) }}
      onMouseLeave={() => setIsDragging(false)}
      onMouseUp={() => setIsDragging(false)}
      onMouseMove={(e) => { if (!isDragging) return; e.preventDefault(); const x = e.pageX - trackRef.current.offsetLeft; trackRef.current.scrollLeft = scrollLeft - (x - startX) }}
    >
      <div
        ref={trackRef}
        style={{
          display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}
      >
        {CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => navigate(`/search?category=${cat.value}`)}
            style={{
              flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(201,150,90,0.12)',
              borderRadius: 14, padding: '14px 18px',
              cursor: 'pointer', transition: 'all 0.2s',
              minWidth: 90,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(201,150,90,0.08)'
              e.currentTarget.style.borderColor = 'rgba(201,150,90,0.35)'
              e.currentTarget.style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.borderColor = 'rgba(201,150,90,0.12)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <span style={{ fontSize: 24 }}>{cat.icon}</span>
            <span style={{ fontSize: 11, color: 'rgba(247,242,234,0.55)', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
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
        borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.25s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = '1px solid rgba(201,150,90,0.35)'
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid rgba(201,150,90,0.12)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ height: 148, background: 'linear-gradient(135deg, rgba(201,150,90,0.12), rgba(10,8,6,0.8))', overflow: 'hidden', position: 'relative' }}>
        {prof.cover_image_url
          ? <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42 }}>✂️</div>
        }
        {prof.is_verified && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(201,150,90,0.9)', borderRadius: 100, padding: '3px 10px', fontSize: 10, color: '#0A0806', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
            ✓ Verificado
          </div>
        )}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 600, color: '#F7F2EA', margin: '0 0 3px' }}>
          {prof.business_name}
        </h3>
        <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)', margin: '0 0 10px', fontFamily: 'Outfit, sans-serif' }}>
          📍 {prof.city}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
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
      <section style={{ position: 'relative', minHeight: '82vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', right: '-5%', width: 560, height: 560, background: 'radial-gradient(circle, rgba(201,150,90,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-8%', width: 480, height: 480, background: 'radial-gradient(circle, rgba(201,150,90,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,150,90,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(201,150,90,0.025) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
        </div>

        <div className="container-app" style={{ position: 'relative', zIndex: 10, padding: '48px 0 56px' }}>
          <div style={{ maxWidth: 680 }}>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(201,150,90,0.2)', borderRadius: 100, padding: '5px 14px', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9965A' }} />
              <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.8)', fontFamily: 'Outfit, sans-serif' }}>
                Reservas de belleza y bienestar · España
              </span>
            </div>

            {/* Heading */}
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, lineHeight: 1.02, marginBottom: 20, fontSize: 'clamp(3rem, 6.5vw, 5.8rem)', color: '#F7F2EA' }}>
              Tu próxima<br />
              <em style={{ color: '#C9965A', fontStyle: 'italic' }}>experiencia</em><br />
              a un clic
            </h1>

            <p style={{ color: 'rgba(247,242,234,0.5)', fontSize: '1rem', fontWeight: 300, marginBottom: 32, maxWidth: 460, fontFamily: 'Outfit, sans-serif', lineHeight: 1.7 }}>
              Conectamos a personas con profesionales de belleza y bienestar. Reserva en segundos, sin llamadas.
            </p>

            {/* Search bar — todo en una fila */}
            <div style={{
              display: 'flex', gap: 0, maxWidth: 580, marginBottom: 20,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(201,150,90,0.18)',
              borderRadius: 14, overflow: 'hidden',
            }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${search}&city=${city}`)}
                placeholder="¿Qué servicio buscas?"
                style={{
                  flex: '1 1 200px', background: 'transparent', border: 'none', outline: 'none',
                  padding: '14px 18px', color: '#F7F2EA', fontFamily: 'Outfit, sans-serif', fontSize: 14,
                }}
              />
              <div style={{ width: 1, background: 'rgba(201,150,90,0.15)', flexShrink: 0 }} />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ciudad"
                style={{
                  flex: '0 1 130px', background: 'transparent', border: 'none', outline: 'none',
                  padding: '14px 16px', color: '#F7F2EA', fontFamily: 'Outfit, sans-serif', fontSize: 14,
                }}
              />
              <button
                onClick={() => navigate(`/search?q=${search}&city=${city}`)}
                style={{
                  padding: '0 28px', background: 'linear-gradient(135deg, #C9965A, #E8B97A)',
                  border: 'none', cursor: 'pointer', color: '#0A0806', fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif', fontSize: 13, letterSpacing: '0.08em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Buscar
              </button>
            </div>

            {/* Quick tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 36 }}>
              {['Peluquería', 'Masajes', 'Uñas', 'Barbería', 'Spa'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/search?q=${tag}`)}
                  style={{
                    fontSize: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 100, padding: '5px 14px', color: 'rgba(247,242,234,0.45)',
                    cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.18s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,150,90,0.4)'; e.currentTarget.style.color = '#C9965A' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(247,242,234,0.45)' }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Social proof — honesto */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                background: 'rgba(201,150,90,0.07)', border: '1px solid rgba(201,150,90,0.15)',
                borderRadius: 100,
              }}>
                <span style={{ fontSize: 14 }}>🚀</span>
                <span style={{ fontSize: 12, color: 'rgba(247,242,234,0.55)', fontFamily: 'Outfit, sans-serif' }}>
                  Plataforma recién lanzada · <strong style={{ color: '#C9965A' }}>Únete de los primeros</strong>
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────────── */}
      <section style={{ background: '#0A0806', borderTop: '1px solid rgba(201,150,90,0.08)', borderBottom: '1px solid rgba(201,150,90,0.08)', padding: '60px 0' }}>
        <div className="container-app">
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.55)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>
              Categorías
            </p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 300, color: '#F7F2EA', margin: 0 }}>
              Explora por <em style={{ color: '#C9965A' }}>tipo de servicio</em>
            </h2>
          </div>
          <CategoryCarousel />
          <div style={{ marginTop: 20, textAlign: 'right' }}>
            <button
              onClick={() => navigate('/search')}
              style={{ fontSize: 13, color: 'rgba(201,150,90,0.55)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#C9965A'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(201,150,90,0.55)'}
            >
              Ver todos los servicios →
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid rgba(201,150,90,0.08)' }}>
        <div className="container-app">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.55)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>
              Simple y rápido
            </p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 300, color: '#F7F2EA', margin: 0 }}>
              ¿Cómo <em style={{ color: '#C9965A' }}>funciona</em>?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 44, left: '16.6%', right: '16.6%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,150,90,0.2), rgba(201,150,90,0.2), transparent)', zIndex: 0 }} />
            {STEPS.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, rgba(201,150,90,0.13), rgba(201,150,90,0.04))',
                  border: '1px solid rgba(201,150,90,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, position: 'relative',
                }}>
                  {step.icon}
                  <div style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#C9965A', color: '#0A0806',
                    fontSize: 10, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </div>
                </div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 600, color: '#F7F2EA', marginBottom: 10 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.42)', lineHeight: 1.6, fontFamily: 'Outfit, sans-serif', maxWidth: 220, margin: '0 auto' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROFESSIONALS ──────────────────────────────── */}
      {featured?.length > 0 && (
        <section style={{ background: '#0A0806', borderBottom: '1px solid rgba(201,150,90,0.08)', padding: '80px 0' }}>
          <div className="container-app">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 14 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.55)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>
                  Top profesionales
                </p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 300, color: '#F7F2EA', margin: 0 }}>
                  Destacados <em style={{ color: '#C9965A' }}>esta semana</em>
                </h2>
              </div>
              <Link to="/search" style={{ fontSize: 13, color: 'rgba(201,150,90,0.55)', textDecoration: 'none', fontFamily: 'Outfit, sans-serif', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C9965A'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(201,150,90,0.55)'}
              >
                Ver todos →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 18 }}>
              {featured.slice(0, 8).map((prof) => (
                <ProfCard key={prof.id} prof={prof} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container-app">
          <div style={{
            position: 'relative', overflow: 'hidden', borderRadius: 24,
            border: '1px solid rgba(201,150,90,0.18)',
            background: 'linear-gradient(135deg, #1F1608 0%, #0A0806 60%, #1a1008 100%)',
            padding: 'clamp(40px, 7vw, 80px)', textAlign: 'center',
          }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 440, height: 440, background: 'radial-gradient(circle, rgba(201,150,90,0.09) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.55)', marginBottom: 14, fontFamily: 'Outfit, sans-serif' }}>
                Empieza hoy
              </p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', fontWeight: 300, color: '#F7F2EA', marginBottom: 14, lineHeight: 1.1 }}>
                Tu bienestar,<br /><em style={{ color: '#C9965A' }}>reservado</em>
              </h2>
              <p style={{ color: 'rgba(247,242,234,0.42)', marginBottom: 36, maxWidth: 380, margin: '0 auto 36px', fontFamily: 'Outfit, sans-serif', lineHeight: 1.7, fontSize: 14 }}>
                Crea tu cuenta gratis y empieza a reservar con los mejores profesionales cerca de ti.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '13px 32px', fontSize: 14 }}>
                  Crear cuenta gratis
                </button>
                <button onClick={() => navigate('/search')} className="btn-outline" style={{ padding: '13px 32px', fontSize: 14 }}>
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