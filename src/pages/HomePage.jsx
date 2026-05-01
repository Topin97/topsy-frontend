import { useMemo, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

import heroBg       from '../assets/hero-bg.webp'
import catHair      from '../assets/cat-hair.webp'
import catNails     from '../assets/cat-nails.webp'
import catSpa       from '../assets/cat-spa.webp'
import catBarber    from '../assets/cat-barber.webp'
import catAesthetic from '../assets/cat-aesthetic.webp'
import catBrows     from '../assets/cat-brows.webp'
import catMassage   from '../assets/cat-massage.webp'
import catSkincare  from '../assets/cat-skincare.webp'

const CATEGORIES = [
  { img: catHair,      label: 'Peluquería', value: 'hair' },
  { img: catBarber,    label: 'Barbería',   value: 'barber' },
  { img: catNails,     label: 'Uñas',       value: 'nails' },
  { img: catMassage,   label: 'Masajes',    value: 'massage' },
  { img: catAesthetic, label: 'Estética',   value: 'aesthetic' },
  { img: catBrows,     label: 'Cejas',      value: 'brows' },
  { img: catSkincare,  label: 'Skincare',   value: 'skincare' },
  { img: catSpa,       label: 'Spa',        value: 'spa' },
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

function ProfCard({ prof }) {
  const navigate = useNavigate()
  const [hov, setHov] = useState(false)
  const minPrice = useMemo(() => {
    const active = prof.services?.filter(s => s.is_active !== false) ?? []
    if (!active.length) return null
    return Math.min(...active.map(s => Number(s.price)))
  }, [prof.services])

  return (
    <button onClick={() => navigate(`/professional/${prof.id}`)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flexShrink: 0, width: 220, textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
      <div style={{
        background: '#fff', border: `1px solid ${hov ? 'rgba(197,138,61,0.4)' : 'rgba(17,17,17,0.08)'}`,
        borderRadius: 20, overflow: 'hidden',
        boxShadow: hov ? '0 16px 40px rgba(17,17,17,0.13)' : '0 2px 12px rgba(17,17,17,0.06)',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ position: 'relative', height: 150, overflow: 'hidden', background: 'linear-gradient(135deg,#F4EEE6,#EDE4D4)' }}>
          {prof.cover_image_url
            ? <img src={prof.cover_image_url} alt={prof.business_name} loading="lazy" decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.4s ease' }}
                onError={e => { e.target.style.display = 'none' }} />
            : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 36 }}>✨</div>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(17,11,5,0.35) 0%,transparent 50%)' }} />
          {prof.is_verified && (
            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.95)', borderRadius: 999, padding: '3px 9px', fontSize: 10, fontWeight: 800, color: '#1A1612' }}>✓ Verificado</div>
          )}
          {minPrice != null && (
            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'linear-gradient(135deg,#B97830,#D19B52)', color: '#fff', borderRadius: 10, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>Desde {minPrice}€</div>
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

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const token = useAuthStore(s => s.token)
  const user  = useAuthStore(s => s.user)
  const typeText = useTypewriter(TYPEWRITER_TEXTS, 85, 3000)

  useEffect(() => { setTimeout(() => setMounted(true), 40) }, [])

  const { data: featured = [] } = useQuery({
    queryKey: ['featured-pros'],
    queryFn: () => profApi.getAll({ limit: 12, verified: true }).then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  })

  const handleSearch = e => {
    e.preventDefault()
    const q = search.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  const firstName = user?.full_name?.split(' ')[0]

  return (
    <div style={{ background: '#F8F5F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        .hr { opacity: 0; transform: translateY(20px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .hr.show { opacity: 1; transform: none; }
        .d1{transition-delay:0s} .d2{transition-delay:.1s} .d3{transition-delay:.2s} .d4{transition-delay:.3s} .d5{transition-delay:.4s}
        .hide-sb::-webkit-scrollbar{display:none}
        .hide-sb{-ms-overflow-style:none;scrollbar-width:none}
        .cat-pill:hover .cat-img { transform: scale(1.08) !important; }
        .cat-pill:hover .cat-label { color: #B57932 !important; }
        .gold-btn{border:none;cursor:pointer;background:linear-gradient(135deg,#B97830,#D19B52);color:#fff;font-weight:700;border-radius:14px;padding:14px 26px;font-family:Outfit,sans-serif;box-shadow:0 6px 20px rgba(185,120,48,0.32);transition:all .2s ease;}
        .gold-btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(185,120,48,0.42);}
        .ghost-dark{border:1px solid rgba(248,245,240,0.2);background:rgba(255,255,255,0.07);color:#F8F5F0;cursor:pointer;font-weight:600;border-radius:14px;padding:14px 26px;font-family:Outfit,sans-serif;transition:all .2s ease;}
        .ghost-dark:hover{background:rgba(255,255,255,0.14);transform:translateY(-2px);}
        .feat-scroll{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px;}
        .feat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}
        @media(min-width:640px){.feat-grid{grid-template-columns:repeat(3,1fr);}}
        @media(min-width:1024px){.feat-grid{grid-template-columns:repeat(4,1fr);}}
        .sec-eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#B57932;font-weight:700;margin:0 0 6px;}
        .sec-title{margin:0;font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,3vw,2.4rem);line-height:1.05;font-weight:600;color:#181512;}
        .cursor{display:inline-block;width:3px;height:.85em;background:#D4A055;margin-left:3px;vertical-align:middle;animation:blink 1s step-end infinite;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

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
          /* FIX: tamaño más pequeño en móvil para que no se corte */
          font-size: clamp(1.4rem, 5.5vw, 3.2rem);
          line-height: 1.2;
          color: #D4A055;
          margin-bottom: 20px;
          /* FIX: permite que el texto fluya a la siguiente línea */
          word-break: break-word;
          overflow-wrap: break-word;
          /* FIX: altura mínima fija para 2 líneas, evita layout shift */
          min-height: 2.6em;
          display: block;
        }

        /* ── HERO BG ── */
        .hero-bg-dark{display:block;}
        .hero-bg-img{display:none;}
        .hero-overlay{display:none;}
        .cats-desktop{display:none !important;}
        .cats-mobile{display:block;}
        .cat-desktop-btn{background:none;border:none;cursor:pointer;color:rgba(248,245,240,0.72);font-size:14px;font-weight:500;font-family:Outfit,sans-serif;padding:18px 20px;white-space:nowrap;transition:all .2s ease;border-bottom:2px solid transparent;letter-spacing:.01em;}
        .cat-desktop-btn:hover{color:#D4A055;border-bottom-color:#D4A055;}

        /* ── RECAPTCHA FIX ── */
        /* Empuja el badge hacia arriba para que no tape el tab bar */
        .grecaptcha-badge {
          bottom: 80px !important;
          right: 12px !important;
          z-index: 10 !important;
        }

        @media(min-width:768px){
          .hero-bg-dark{display:none !important;}
          .hero-bg-img{display:block !important;}
          .hero-overlay{display:block !important;}
          .cats-desktop{display:flex !important;}
          .cats-mobile{display:none !important;}
          .hero-min-h{min-height:520px;}
          .grecaptcha-badge { bottom: 14px !important; }
        }
      `}</style>

      {/* HERO */}
      {/* FIX: quitado minHeight fijo en móvil, ahora crece con el contenido */}
      <section className="hero-min-h" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="hero-bg-dark" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#1A0F05 0%,#2C1810 55%,#1A0F05 100%)' }} />
        <div className="hero-bg-img" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,rgba(8,5,2,0.88) 0%,rgba(8,5,2,0.65) 45%,rgba(8,5,2,0.25) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top,rgba(197,138,61,0.07),transparent)', pointerEvents: 'none' }} />

        {/* Contenido */}
        {/* FIX: padding top reducido en móvil (56px → antes 88px), más compacto */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 780, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1, padding: '64px 20px 28px' }}>
          {token && firstName && (
            <div className={`hr d1 ${mounted ? 'show' : ''}`} style={{ fontSize: 14, color: 'rgba(248,245,240,0.5)', marginBottom: 8 }}>
              Hola de nuevo, <span style={{ color: '#D4A055', fontWeight: 600 }}>{firstName}</span> 👋
            </div>
          )}

          <div className={`hr d1 ${mounted ? 'show' : ''} hero-title-main`}>
            {token ? 'Reserva' : 'Descubre'}
          </div>

          {/* FIX: clase dedicada con font-size controlado y word-break */}
          <div className={`hr d2 ${mounted ? 'show' : ''} hero-title-typewriter`}>
            {typeText}<span className="cursor" />
          </div>

          <p className={`hr d3 ${mounted ? 'show' : ''}`} style={{ margin: '0 0 24px', fontSize: 14, color: 'rgba(248,245,240,0.5)', lineHeight: 1.65, maxWidth: 480 }}>
            Profesionales verificados de belleza y bienestar, cerca de ti.
          </p>

          <div className={`hr d4 ${mounted ? 'show' : ''}`} style={{ maxWidth: 580 }}>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.97)', border: `1.5px solid ${searchFocused ? '#C58A3D' : 'transparent'}`, borderRadius: 18, padding: '8px 8px 8px 16px', boxShadow: searchFocused ? '0 0 0 4px rgba(197,138,61,0.15),0 16px 48px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.28)', transition: 'all 0.25s ease' }}>
                <span style={{ fontSize: 18, color: 'rgba(24,21,18,0.3)', lineHeight: 1, flexShrink: 0 }}>⌕</span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                  placeholder="Buscar servicios o negocios..."
                  style={{ flex: 1, height: 46, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: '#181512', fontFamily: 'Outfit, sans-serif' }} />
                <button type="submit" className="gold-btn" style={{ borderRadius: 12, padding: '11px 22px', fontSize: 14, flexShrink: 0 }}>Buscar</button>
              </div>
            </form>
          </div>
        </div>

        {/* Categorías escritorio — barra inferior del hero */}
        <div className={`cats-desktop hr d5 ${mounted ? 'show' : ''}`}
          style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(14px)', padding: '0 24px', overflowX: 'auto' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.value} className="cat-desktop-btn" onClick={() => navigate(`/search?category=${cat.value}`)}>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Categorías móvil */}
      {/* FIX: padding reducido, sin border-bottom innecesario en móvil */}
      <div className="cats-mobile" style={{ background: '#fff', borderBottom: '1px solid rgba(17,17,17,0.07)', padding: '18px 0 14px' }}>
        <div style={{ padding: '0 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p className="sec-eyebrow" style={{ margin: 0 }}>Categorías</p>
          {/* FIX: indicador de scroll — hint visual de que hay más */}
          <span style={{ fontSize: 11, color: 'rgba(181,121,50,0.6)', fontWeight: 600 }}>desliza →</span>
        </div>
        <div className="hide-sb" style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '0 20px 4px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.value} className="cat-pill" onClick={() => navigate(`/search?category=${cat.value}`)}
              style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: 0 }}>
              {/* FIX: círculos ligeramente más pequeños (72→64) para que quepan mejor */}
              <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: '2.5px solid rgba(197,138,61,0.25)', boxShadow: '0 4px 16px rgba(17,17,17,0.1)' }}>
                <img className="cat-img" src={cat.img} alt={cat.label} loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} />
              </div>
              <span className="cat-label" style={{ fontSize: 11, fontWeight: 600, color: '#181512', fontFamily: 'Outfit, sans-serif', transition: 'color 0.2s ease', whiteSpace: 'nowrap' }}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Banner mis citas */}
      {token && (
        <section style={{ padding: '16px 20px 8px' }}>
          <div style={{ background: 'linear-gradient(135deg,#1A0F05,#2C1810)', borderRadius: 20, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 28px rgba(17,17,17,0.12)' }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(212,160,85,0.65)', fontWeight: 700, marginBottom: 3 }}>Mis citas</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#F8F5F0' }}>Ver tus próximas reservas</div>
            </div>
            <button onClick={() => navigate('/dashboard')} className="gold-btn" style={{ fontSize: 13, padding: '10px 18px', borderRadius: 12 }}>Ver →</button>
          </div>
        </section>
      )}

      {/* Destacados */}
      {featured.length > 0 && (
        <section style={{ padding: '28px 0 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 20px', marginBottom: 16 }}>
            <div><p className="sec-eyebrow">Destacados</p><h2 className="sec-title">Cerca de ti</h2></div>
            <Link to="/search" style={{ color: '#B57932', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Ver todos →</Link>
          </div>
          <div className="hide-sb feat-scroll" style={{ padding: '4px 20px 12px' }}>
            {featured.slice(0, 8).map(prof => <ProfCard key={prof.id} prof={prof} />)}
          </div>
        </section>
      )}

      {featured.length > 8 && (
        <section style={{ padding: '8px 20px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
            <div><p className="sec-eyebrow">Más profesionales</p><h2 className="sec-title">Todos verificados</h2></div>
          </div>
          <div className="feat-grid">
            {featured.slice(8, 12).map(prof => <ProfCard key={prof.id} prof={prof} />)}
          </div>
        </section>
      )}

      {/* Cómo funciona */}
      <section style={{ padding: '40px 20px', background: '#fff', borderTop: '1px solid rgba(17,17,17,0.07)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p className="sec-eyebrow">Cómo funciona</p>
            <h2 className="sec-title">Reserva en tres pasos</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { n: '01', icon: '⌕', title: 'Explora',  desc: 'Busca por servicio, ciudad o nombre.' },
              { n: '02', icon: '◷', title: 'Elige',    desc: 'Consulta disponibilidad y reserva al instante.' },
              { n: '03', icon: '✦', title: 'Disfruta', desc: 'Confirmación inmediata y recordatorio 24h.' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#F8F5F0', border: '1px solid rgba(17,17,17,0.07)', borderRadius: 18, padding: '18px 20px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 15, flexShrink: 0, background: 'linear-gradient(135deg,rgba(197,138,61,0.12),rgba(197,138,61,0.05))', display: 'grid', placeItems: 'center', fontSize: 20 }}>{step.icon}</div>
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

      {/* ¿Eres profesional? */}
      <section style={{ padding: '0 20px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            borderRadius: 24, overflow: 'hidden',
            border: '1.5px solid rgba(184,131,58,0.2)',
            background: 'linear-gradient(135deg, #FFFDF9 0%, #FFF8EE 100%)',
            boxShadow: '0 4px 24px rgba(184,131,58,0.08)',
          }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg, #B8833A, #D4A055, #B8833A)' }} />
            <div style={{ padding: 'clamp(20px,5vw,40px)', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ width: 56, height: 56, borderRadius: 20, background: 'linear-gradient(135deg,rgba(184,131,58,0.12),rgba(212,160,85,0.06))', border: '1.5px solid rgba(184,131,58,0.2)', display: 'grid', placeItems: 'center', fontSize: 26, flexShrink: 0 }}>
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
                style={{
                  flexShrink: 0, background: 'linear-gradient(135deg,#B8833A,#D4A055)',
                  border: 'none', borderRadius: 14, padding: '12px 22px',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  boxShadow: '0 4px 16px rgba(184,131,58,0.3)',
                  whiteSpace: 'nowrap',
                  /* FIX: en móvil ocupa todo el ancho si está solo en su fila */
                  width: '100%',
                }}
              >
                Únete gratis →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!token && (
        <section style={{ padding: '0 20px 80px', background: '#fff' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: 'linear-gradient(135deg,#140E08 0%,#221507 50%,#140E08 100%)', padding: 'clamp(28px,6vw,52px)', boxShadow: '0 32px 80px rgba(17,17,17,0.2)' }}>
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