import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import GoogleAddressInput from '../components/GoogleAddressInput'

import heroBg       from '../assets/hero-bg.webp'

// Iconos SVG inline — línea dorada, estilo minimal premium
const IC_HAIR = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
)
const IC_BARBER = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M9 2v6m6-6v6M5 8h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z"/>
    <line x1="7" y1="13" x2="17" y2="13"/>
  </svg>
)
const IC_NAILS = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M12 2c-3 0-5 2-5 5v10a5 5 0 0 0 10 0V7c0-3-2-5-5-5z"/>
    <path d="M9 8c1-1 5-1 6 0"/>
  </svg>
)
const IC_AESTHETIC = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5z"/>
  </svg>
)
const IC_PETS = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <circle cx="11" cy="4.5" r="1.5"/><circle cx="17.5" cy="7.5" r="1.5"/><circle cx="4.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="14" r="1.5"/><circle cx="15.5" cy="14" r="1.5"/>
    <path d="M11 9c-2.5 0-4 2-4 4 0 1.5 1 3 2 4 1 1 1 2 2 2s1-1 2-2c1-1 2-2.5 2-4 0-2-1.5-4-4-4z"/>
  </svg>
)

const CATEGORIES = [
  { icon: IC_HAIR,      label: 'Peluquería', value: 'hair' },
  { icon: IC_BARBER,    label: 'Barbería',   value: 'barber' },
  { icon: IC_NAILS,     label: 'Uñas',       value: 'nails' },
  { icon: IC_AESTHETIC, label: 'Estética',   value: 'aesthetic' },
  { icon: IC_PETS,      label: 'Mascotas',   value: 'pets' },
]

const TYPEWRITER_TEXTS = [
  'el corte que siempre quisiste.',
  'una tarde de puro bienestar.',
  'el ritual que mereces.',
  'tu mejor versión, reservada.',
  'el masaje que lo cambia todo.',
  'minutos de calma absoluta.',
]

function useTypewriter(texts, speed = 55, pause = 2200) {
  const [display, setDisplay] = useState('')
  const [textIdx, setTextIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[textIdx]
    if (!deleting && charIdx < current.length) {
      const t = setTimeout(() => setCharIdx(i => i + 1), speed)
      return () => clearTimeout(t)
    }
    if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), pause)
      return () => clearTimeout(t)
    }
    if (deleting && charIdx > 0) {
      const t = setTimeout(() => setCharIdx(i => i - 1), speed / 2)
      return () => clearTimeout(t)
    }
    if (deleting && charIdx === 0) {
      setDeleting(false)
      setTextIdx(i => (i + 1) % texts.length)
    }
  }, [charIdx, deleting, textIdx, texts, speed, pause])

  useEffect(() => {
    setDisplay(texts[textIdx].slice(0, charIdx))
  }, [charIdx, textIdx, texts])

  return display
}

// Hook: anima cuando el elemento entra al viewport (scroll-triggered)
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, inView]
}

// Hook: parallax sutil del hero (mueve bg al hacer scroll)
function useParallax() {
  const [y, setY] = useState(0)
  useEffect(() => {
    let raf = null
    const handler = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        setY(window.scrollY * 0.3)
        raf = null
      })
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => {
      window.removeEventListener('scroll', handler)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  return y
}

function Stars({ rating }) {
  const r = Math.round(rating ?? 0)
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= r ? '#C58A3D' : 'rgba(197,138,61,0.2)', fontSize: 11 }}>★</span>
      ))}
    </span>
  )
}

function ProfCard({ prof, index = 0 }) {
  const navigate = useNavigate()
  const [hov, setHov] = useState(false)
  const minPrice = useMemo(() => {
    const active = prof.services?.filter(s => s.is_active !== false) ?? []
    if (!active.length) return null
    return Math.min(...active.map(s => Number(s.price)))
  }, [prof.services])

  return (
    <button
      onClick={() => navigate(`/professional/${prof.id}`)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="prof-card anim-fadeup"
      style={{
        animationDelay: `${0.1 + index * 0.07}s`,
        flexShrink: 0, width: 220, textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
      }}>
      <div style={{
        background: '#fff', border: `1px solid ${hov ? 'rgba(197,138,61,0.4)' : 'rgba(17,17,17,0.08)'}`,
        borderRadius: 20, overflow: 'hidden',
        boxShadow: hov ? '0 16px 40px rgba(17,17,17,0.13)' : '0 2px 12px rgba(17,17,17,0.06)',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ position: 'relative', height: 150, overflow: 'hidden', background: 'linear-gradient(135deg,#F4EEE6,#EDE4D4)' }}>
          {prof.cover_image_url
            ? <img src={prof.cover_image_url} alt={prof.business_name} loading="lazy" decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)' }}
                onError={e => { e.target.style.display = 'none' }} />
            : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 36 }}>✨</div>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(17,11,5,0.35) 0%,transparent 50%)' }} />
          {prof.is_verified && (
            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.95)', borderRadius: 999, padding: '3px 9px', fontSize: 10, fontWeight: 800, color: '#1A1612', transform: hov ? 'translateY(-2px)' : 'translateY(0)', transition: 'transform 0.25s ease' }}>✓ Verificado</div>
          )}
          {minPrice != null && (
            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'linear-gradient(135deg,#B97830,#D19B52)', color: '#fff', borderRadius: 10, padding: '4px 10px', fontSize: 12, fontWeight: 700, transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.25s ease' }}>Desde {minPrice}€</div>
          )}
        </div>
        <div style={{ padding: '12px 14px 14px' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, fontWeight: 700, color: '#181512', marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prof.business_name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <Stars rating={prof.avg_rating} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#C58A3D' }}>{prof.avg_rating ? Number(prof.avg_rating).toFixed(1) : '—'}</span>
            <span style={{ fontSize: 11, color: 'rgba(24,21,18,0.4)' }}>({prof.total_reviews || 0})</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(24,21,18,0.45)' }}>📍 {prof.city || 'España'}</div>
        </div>
      </div>
    </button>
  )
}

// Skeleton card mientras cargan los destacados
function ProfCardSkeleton({ index = 0 }) {
  return (
    <div className="anim-fadeup" style={{ animationDelay: `${0.1 + index * 0.07}s`, flexShrink: 0, width: 220 }}>
      <div style={{ background: '#fff', border: '1px solid rgba(17,17,17,0.08)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(17,17,17,0.06)' }}>
        <div className="skeleton-shimmer" style={{ height: 150 }} />
        <div style={{ padding: '12px 14px 14px' }}>
          <div className="skeleton-shimmer" style={{ height: 18, borderRadius: 6, marginBottom: 8, width: '75%' }} />
          <div className="skeleton-shimmer" style={{ height: 12, borderRadius: 6, marginBottom: 6, width: '60%' }} />
          <div className="skeleton-shimmer" style={{ height: 11, borderRadius: 6, width: '45%' }} />
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const token = useAuthStore(s => s.token)
  const user  = useAuthStore(s => s.user)
  const typeText = useTypewriter(TYPEWRITER_TEXTS, 85, 3000)
  const parallaxY = useParallax()

  // Scroll-triggered animations para secciones del medio/abajo
  const [featuredRef, featuredInView] = useInView(0.1)
  const [moreRef, moreInView] = useInView(0.1)
  const [howRef, howInView] = useInView(0.15)
  const [proCtaRef, proCtaInView] = useInView(0.2)
  const [ctaRef, ctaInView] = useInView(0.2)

  const { data: featured = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-pros'],
    queryFn: () => profApi.getAll({ limit: 12, verified: true }).then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  })

  const handleSearch = (e) => {
    if (e?.preventDefault) e.preventDefault()
    const q = search.trim()
    navigate(q ? `/search?city=${encodeURIComponent(q)}` : '/search')
  }

  const firstName = user?.full_name?.split(' ')[0]

  return (
    <div style={{ background: '#F8F5F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }

        /* ── KEYFRAMES (sistema unificado TopSy) ── */
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.9) } to { opacity: 1; transform: scale(1) } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }
        @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
        @keyframes float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }

        .anim-fadeup { animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both }
        .anim-scale { animation: fadeInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both }
        .anim-slide-left { animation: slideInLeft 0.5s ease-out both }
        .anim-slide-right { animation: slideInRight 0.5s ease-out both }

        /* Variante para scroll-triggered: empieza oculto, anima solo cuando .in-view se añade */
        .scroll-anim { opacity: 0; transform: translateY(28px); transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .scroll-anim.in-view { opacity: 1; transform: translateY(0); }

        /* Skeleton shimmer para loaders */
        .skeleton-shimmer {
          background: linear-gradient(90deg, #EDE6DA 25%, #F4EEE6 50%, #EDE6DA 75%);
          background-size: 800px 100%;
          animation: shimmer 1.6s infinite linear;
        }

        /* Categorías móvil — hover + entrada */
        .cat-pill { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .cat-pill:hover { transform: translateY(-3px); }
        .cat-pill:hover .cat-circle { border-color: #B8833A; background: linear-gradient(135deg,#FFF8EE,#FAEFDF); transform: scale(1.05); box-shadow: 0 8px 24px rgba(184,131,58,0.18); }
        .cat-pill:hover .cat-label { color: #B57932 !important; }
        .cat-pill:active { transform: translateY(-1px) scale(0.97); }

        /* Botones cat desktop */

        /* Botones generales */
        .gold-btn { border: none; cursor: pointer; background: linear-gradient(135deg,#B97830,#D19B52); color: #fff; font-weight: 700; border-radius: 14px; padding: 14px 26px; font-family: Outfit, sans-serif; box-shadow: 0 6px 20px rgba(185,120,48,0.32); transition: all .25s cubic-bezier(0.34,1.56,0.64,1); }
        .gold-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(185,120,48,0.42); }
        .gold-btn:active { transform: translateY(-1px) scale(0.98); }
        .ghost-dark { border: 1px solid rgba(248,245,240,0.2); background: rgba(255,255,255,0.07); color: #F8F5F0; cursor: pointer; font-weight: 600; border-radius: 14px; padding: 14px 26px; font-family: Outfit, sans-serif; transition: all .25s cubic-bezier(0.34,1.56,0.64,1); }
        .ghost-dark:hover { background: rgba(255,255,255,0.14); transform: translateY(-2px); }
        .ghost-dark:active { transform: translateY(-1px) scale(0.98); }

        /* Step cards — hover */
        .step-card { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease; }
        .step-card:hover { transform: translateY(-3px); border-color: rgba(197,138,61,0.25) !important; box-shadow: 0 8px 24px rgba(17,17,17,0.06); }
        .step-card:hover .step-icon { transform: scale(1.08) rotate(-3deg); }
        .step-icon { transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1); }

        /* Banner mis citas — hover */
        .bookings-banner { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
        .bookings-banner:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(17,17,17,0.18); }

        /* Pro CTA card */
        .pro-cta { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
        .pro-cta:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(184,131,58,0.18); }
        .pro-cta:hover .pro-cta-icon { transform: scale(1.1) rotate(-5deg); }
        .pro-cta-icon { transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1); }

        /* Cursor typewriter */
        .cursor { display: inline-block; width: 3px; height: .85em; background: #D4A055; margin-left: 3px; vertical-align: middle; animation: blink 1s step-end infinite; }

        /* Hide scrollbars */
        .hide-sb::-webkit-scrollbar { display: none }
        .hide-sb { -ms-overflow-style: none; scrollbar-width: none }

        .feat-scroll { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; }
        .feat-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
        @media (min-width: 640px) { .feat-grid { grid-template-columns: repeat(3,1fr); } }
        @media (min-width: 1024px) { .feat-grid { grid-template-columns: repeat(4,1fr); } }

        .sec-eyebrow { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #B57932; font-weight: 700; margin: 0 0 6px; display: inline-flex; align-items: center; gap: 8px; }
        .sec-eyebrow::before { content: ''; display: inline-block; width: 16px; height: 1.5px; background: #B57932; }
        .sec-title { margin: 0; font-family: 'Cormorant Garamond', serif; font-size: clamp(1.8rem,3vw,2.4rem); line-height: 1.05; font-weight: 600; color: #181512; }

        /* ── BUSCADOR FLOTANTE — animaciones premium ── */
        .search-floating-card {
          background: #FFFFFF;
          border-radius: 22px;
          padding: 10px;
          box-shadow: 0 20px 60px rgba(17,11,5,0.18), 0 2px 8px rgba(17,11,5,0.06);
          border: 1.5px solid rgba(212,160,85,0.15);
          display: flex;
          align-items: stretch;
          gap: 8px;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, border-color 0.35s ease;
        }
        .search-floating-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 28px 70px rgba(17,11,5,0.22), 0 4px 12px rgba(184,131,58,0.10);
          border-color: rgba(212,160,85,0.30);
        }
        .search-floating-card:focus-within {
          transform: translateY(-3px) scale(1.012);
          box-shadow: 0 0 0 6px rgba(212,160,85,0.18), 0 32px 80px rgba(17,11,5,0.25), 0 0 40px rgba(212,160,85,0.15);
          border-color: rgba(212,160,85,0.55);
        }
        @media (prefers-reduced-motion: reduce) {
          .search-floating-card, .search-floating-card:hover, .search-floating-card:focus-within {
            transform: none !important;
            transition: box-shadow 0.2s ease !important;
          }
        }

        /* ── HERO MOBILE ── */
        .hero-title-main {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: clamp(2rem, 8vw, 3.6rem);
          line-height: 1.05;
          color: #F8F5F0;
          margin-bottom: 4px;
        }
        .hero-title-typewriter {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-style: italic;
          font-size: clamp(1.3rem, 4.2vw, 2.6rem);
          line-height: 1.2;
          color: #D4A055;
          margin-bottom: 20px;
          word-break: break-word;
          overflow-wrap: break-word;
          min-height: 2.6em;
          display: block;
          max-width: 100%;
        }

        /* ── HERO BG ── */
        .hero-bg-dark { display: block; }
        .hero-bg-img { display: none; }
        .hero-overlay { display: none; }
        /* removed: .cats-desktop { display: none !important; } */
        /* removed: .cats-mobile { display: block; } */

        /* ── RECAPTCHA FIX ── */
        .grecaptcha-badge {
          bottom: 80px !important;
          right: 12px !important;
          z-index: 10 !important;
        }

        @media (min-width: 768px) {
          .hide-desktop { display: none !important; }
          .cats-row { justify-content: center !important; gap: 40px !important; padding: 0 32px 4px !important; }
          .hero-bg-dark { display: none !important; }
          .hero-bg-img { display: block !important; }
          .hero-overlay { display: block !important; }
        /* removed: .cats-desktop { display: flex !important; } */
        /* removed: .cats-mobile { display: none !important; } */
          .hero-min-h { min-height: 520px; }
          .grecaptcha-badge { bottom: 14px !important; }
        }

        /* ── REDUCED MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          .anim-fadeup, .anim-scale, .anim-slide-left, .anim-slide-right,
          .scroll-anim, .skeleton-shimmer {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .scroll-anim { opacity: 1; transform: none; }
        }
      `}</style>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="hero-min-h" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Backgrounds con parallax sutil (envueltos en wrapper con overflow para no recortar el dropdown del autocomplete) */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
          <div className="hero-bg-dark" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#1A0F05 0%,#2C1810 55%,#1A0F05 100%)', transform: `translateY(${parallaxY * 0.4}px)` }} />
          <div className="hero-bg-img" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center', transform: `translateY(${parallaxY * 0.4}px)` }} />
          <div className="hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,rgba(8,5,2,0.88) 0%,rgba(8,5,2,0.65) 45%,rgba(8,5,2,0.25) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top,rgba(197,138,61,0.07),transparent)', pointerEvents: 'none' }} />
        </div>

        {/* Contenido del hero */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 780, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1, padding: 'calc(64px + env(safe-area-inset-top)) 20px 28px' }}>
          {token && firstName && (
            <div className="anim-fadeup" style={{ animationDelay: '0s', fontSize: 14, color: 'rgba(248,245,240,0.5)', marginBottom: 8 }}>
              Hola de nuevo, <span style={{ color: '#D4A055', fontWeight: 600 }}>{firstName}</span> 👋
            </div>
          )}

          <div className="anim-fadeup hero-title-main" style={{ animationDelay: '0.08s' }}>
            {token ? 'Reserva' : 'Descubre'}
          </div>

          <div className="anim-fadeup hero-title-typewriter" style={{ animationDelay: '0.14s' }}>
            {typeText}<span className="cursor" />
          </div>

          <p className="anim-fadeup" style={{ animationDelay: '0.2s', margin: '0 0 24px', fontSize: 14, color: 'rgba(248,245,240,0.55)', lineHeight: 1.65, maxWidth: 480 }}>
            Profesionales locales verificados de belleza y bienestar, a un click.
          </p>

          <div className="anim-fadeup search-in-hero-wrap" style={{ animationDelay: '0.3s' }}>
            <div className="search-floating-card">
              <div style={{ flex: 1, position: 'relative' }}>
                <GoogleAddressInput
                  type="city"
                  value={search}
                  onChange={setSearch}
                  onSelect={({ city }) => { setSearch(city || ''); navigate(`/search?city=${encodeURIComponent(city || '')}`) }}
                  placeholder="¿Qué ciudad o pueblo?"
                />
              </div>
              <button type="button" onClick={handleSearch} className="gold-btn" style={{ borderRadius: 14, padding: '0 26px', fontSize: 14, flexShrink: 0, alignSelf: 'stretch', whiteSpace: 'nowrap' }}>Buscar</button>
            </div>
          </div>
        </div>


      </section>

      {/* ═══════════════════ CATEGORÍAS MÓVIL ═══════════════════ */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(17,17,17,0.07)', padding: '18px 0 14px' }}>
        <div className="anim-fadeup" style={{ animationDelay: '0.35s', padding: '0 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p className="sec-eyebrow hide-desktop" style={{ margin: 0 }}>Categorías</p>
          <span className="hide-desktop" style={{ fontSize: 11, color: 'rgba(181,121,50,0.6)', fontWeight: 600 }}>desliza →</span>
        </div>
        <div className="hide-sb cats-row" style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '0 20px 4px' }}>
          {CATEGORIES.map((cat, i) => (
            <button key={cat.value} className="cat-pill anim-fadeup" onClick={() => navigate(`/search?category=${cat.value}`)}
              style={{ animationDelay: `${0.4 + i * 0.05}s`, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: 0 }}>
              <div className="cat-circle" style={{ width: 54, height: 54, borderRadius: '50%', border: '1.5px solid rgba(184,131,58,0.4)', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #FFFDF9, #FFF8EE)', color: '#B8833A', padding: 14, transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                {cat.icon}
              </div>
              <span className="cat-label" style={{ fontSize: 11, fontWeight: 600, color: '#181512', fontFamily: 'Outfit, sans-serif', transition: 'color 0.2s ease', whiteSpace: 'nowrap' }}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════ BANNER MIS CITAS ═══════════════════ */}
      {token && (
        <section style={{ padding: '16px 20px 8px' }}>
          <div className="bookings-banner anim-fadeup" style={{ animationDelay: '0.5s', background: 'linear-gradient(135deg,#1A0F05,#2C1810)', borderRadius: 20, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 28px rgba(17,17,17,0.12)', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(212,160,85,0.65)', fontWeight: 700, marginBottom: 3 }}>Mis citas</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#F8F5F0' }}>Ver tus próximas reservas</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); navigate('/dashboard') }} className="gold-btn" style={{ fontSize: 13, padding: '10px 18px', borderRadius: 12 }}>Ver →</button>
          </div>
        </section>
      )}

      {/* ═══════════════════ DESTACADOS (solo si hay 3+) ═══════════════════ */}
      {(featured.length >= 3 || loadingFeatured) && (
      <section ref={featuredRef} style={{ padding: '28px 0 12px' }}>
        <div className={`scroll-anim ${featuredInView ? 'in-view' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 20px', marginBottom: 16 }}>
          <div>
            <p className="sec-eyebrow">Destacados</p>
            <h2 className="sec-title">Cerca de ti</h2>
          </div>
          <Link to="/search" style={{ color: '#B57932', fontWeight: 700, textDecoration: 'none', fontSize: 14, transition: 'transform 0.2s ease', display: 'inline-block' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
            Ver todos →
          </Link>
        </div>
        <div className="hide-sb feat-scroll" style={{ padding: '4px 20px 12px' }}>
          {loadingFeatured
            ? Array.from({ length: 4 }).map((_, i) => <ProfCardSkeleton key={i} index={i} />)
            : featured.slice(0, 8).map((prof, i) => <ProfCard key={prof.id} prof={prof} index={i} />)
          }
        </div>
      </section>
      )}

      {/* ═══════════════════ MÁS PROFESIONALES ═══════════════════ */}
      {featured.length > 8 && (
        <section ref={moreRef} style={{ padding: '8px 20px 40px' }}>
          <div className={`scroll-anim ${moreInView ? 'in-view' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
            <div>
              <p className="sec-eyebrow">Más profesionales</p>
              <h2 className="sec-title">Todos verificados</h2>
            </div>
          </div>
          <div className="feat-grid">
            {featured.slice(8, 12).map((prof, i) => (
              <div key={prof.id} className={`scroll-anim ${moreInView ? 'in-view' : ''}`} style={{ transitionDelay: moreInView ? `${i * 0.08}s` : '0s' }}>
                <div style={{ width: '100%' }}>
                  <ProfCard prof={prof} index={0} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════ CÓMO FUNCIONA ═══════════════════ */}
      <section ref={howRef} style={{ padding: '40px 20px', background: '#fff', borderTop: '1px solid rgba(17,17,17,0.07)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className={`scroll-anim ${howInView ? 'in-view' : ''}`} style={{ textAlign: 'center', marginBottom: 24 }}>
            <p className="sec-eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Cómo funciona</p>
            <h2 className="sec-title">Reserva en tres pasos</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { n: '01', icon: '⌕', title: 'Explora',  desc: 'Busca por servicio, ciudad o nombre.' },
              { n: '02', icon: '◷', title: 'Elige',    desc: 'Consulta disponibilidad y reserva al instante.' },
              { n: '03', icon: '✦', title: 'Disfruta', desc: 'Confirmación inmediata y recordatorio 24h.' },
            ].map((step, i) => (
              <div key={step.n} className={`step-card scroll-anim ${howInView ? 'in-view' : ''}`}
                style={{ transitionDelay: howInView ? `${0.1 + i * 0.1}s` : '0s', display: 'flex', alignItems: 'center', gap: 16, background: '#F8F5F0', border: '1px solid rgba(17,17,17,0.07)', borderRadius: 18, padding: '18px 20px' }}>
                <div className="step-icon" style={{ width: 48, height: 48, borderRadius: 15, flexShrink: 0, background: 'linear-gradient(135deg,rgba(197,138,61,0.12),rgba(197,138,61,0.05))', display: 'grid', placeItems: 'center', fontSize: 20 }}>{step.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 21, fontWeight: 700, color: '#181512', marginBottom: 2 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(24,21,18,0.5)', lineHeight: 1.5 }}>{step.desc}</div>
                </div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, color: 'rgba(24,21,18,0.06)', fontWeight: 700, lineHeight: 1 }}>{step.n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ¿ERES PROFESIONAL? ═══════════════════ */}
      {!token && (
        <section ref={proCtaRef} style={{ padding: '0 20px 40px', background: '#fff' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className={`pro-cta scroll-anim ${proCtaInView ? 'in-view' : ''}`} style={{
              borderRadius: 24, overflow: 'hidden',
              border: '1.5px solid rgba(184,131,58,0.2)',
              background: 'linear-gradient(135deg, #FFFDF9 0%, #FFF8EE 100%)',
              boxShadow: '0 4px 24px rgba(184,131,58,0.08)',
            }}>
              <div style={{ height: 3, background: 'linear-gradient(90deg, #B8833A, #D4A055, #B8833A)' }} />
              <div style={{ padding: 'clamp(20px,5vw,40px)', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div className="pro-cta-icon" style={{ width: 56, height: 56, borderRadius: 20, background: 'linear-gradient(135deg,rgba(184,131,58,0.12),rgba(212,160,85,0.06))', border: '1.5px solid rgba(184,131,58,0.2)', display: 'grid', placeItems: 'center', fontSize: 26, flexShrink: 0 }}>
                  ✂️
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ margin: '0 0 2px', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#B8833A', fontWeight: 700 }}>Para profesionales</p>
                  <h3 style={{ margin: '0 0 6px', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.2rem,3.5vw,1.8rem)', fontWeight: 700, color: '#1A1612', lineHeight: 1.15 }}>
                    Haz crecer tu negocio con TopSy
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(24,21,18,0.5)', lineHeight: 1.6 }}>
                    Gestiona tus citas, muestra tus servicios y llega a nuevos clientes cada día.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/register/pro')}
                  className="gold-btn"
                  style={{
                    flexShrink: 0, borderRadius: 14, padding: '12px 22px',
                    fontSize: 14, whiteSpace: 'nowrap', width: '100%',
                  }}
                >
                  Únete gratis →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ CTA FINAL ═══════════════════ */}
      {!token && (
        <section ref={ctaRef} style={{ padding: '0 20px 80px', background: '#fff' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className={`scroll-anim ${ctaInView ? 'in-view' : ''}`} style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: 'linear-gradient(135deg,#140E08 0%,#221507 50%,#140E08 100%)', padding: 'clamp(28px,6vw,52px)', boxShadow: '0 32px 80px rgba(17,17,17,0.2)' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 240, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(ellipse,rgba(197,138,61,0.18) 0%,transparent 65%)' }} />
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 100, height: 1, background: 'linear-gradient(90deg,transparent,rgba(197,138,61,0.6),transparent)' }} />
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <p style={{ margin: '0 0 14px', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(209,155,82,0.65)', fontWeight: 700 }}>Empieza hoy</p>
                <h2 style={{ margin: '0 0 12px', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,5vw,3.2rem)', lineHeight: 1.05, color: '#F8F5F0', fontWeight: 600 }}>
                  Tu próxima cita,<br /><em style={{ color: '#D4A055' }}>mejor en TopSy</em>
                </h2>
                <p style={{ margin: '0 auto 24px', maxWidth: 420, fontSize: 14, lineHeight: 1.7, color: 'rgba(248,245,240,0.52)' }}>
                  Crea tu cuenta gratis y reserva de forma más elegante, rápida y cómoda.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <button className="gold-btn" onClick={() => navigate('/register/client')} style={{ fontSize: 14 }}>Crear cuenta gratis</button>
                  <button className="ghost-dark" onClick={() => navigate('/search')} style={{ fontSize: 14 }}>Explorar primero</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
