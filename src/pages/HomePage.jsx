import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'

const CATEGORIES = [
  { icon: '💇‍♀️', label: 'Peluquería',       value: 'hair' },
  { icon: '🪒',    label: 'Barbería',          value: 'barber' },
  { icon: '✨',    label: 'Estética',           value: 'aesthetic' },
  { icon: '💅',    label: 'Uñas',              value: 'nails' },
  { icon: '🧖',    label: 'Spa',               value: 'spa' },
  { icon: '👁️',   label: 'Cejas',             value: 'brows' },
  { icon: '🧴',    label: 'Cuidado piel',      value: 'skincare' },
  { icon: '💆',    label: 'Masajes',           value: 'massage' },
  { icon: '💄',    label: 'Maquillaje',        value: 'makeup' },
  { icon: '🐾',    label: 'Mascotas',          value: 'pets' },
  { icon: '🦷',    label: 'Dental',            value: 'dental' },
  { icon: '🏋️',   label: 'Deporte',           value: 'sport' },
  { icon: '🖋️',   label: 'Tatuajes',          value: 'tattoo' },
  { icon: '💉',    label: 'Medicina estética', value: 'aesthetic_med' },
]

const HOW_IT_WORKS = [
  { icon: '🔍', step: '01', title: 'Busca',   desc: 'Encuentra el profesional perfecto por servicio, ciudad o categoría.' },
  { icon: '📅', step: '02', title: 'Reserva', desc: 'Elige el horario que mejor te venga y confirma al instante.' },
  { icon: '✅', step: '03', title: 'Disfruta', desc: 'Recibe confirmación por email y ve a tu cita sin preocupaciones.' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch]       = useState('')
  const [city, setCity]           = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const catRef = useRef(null)

  const { data } = useQuery({
    queryKey: ['featured-pros'],
    queryFn: () => profApi.getAll({ sort: 'avg_rating', limit: 8 }).then(r => r.data),
  })

  const featured = data?.data ?? []

  const handleGeolocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
        const d = await res.json()
        const cityName = d.address?.city || d.address?.town || d.address?.village
        if (cityName) setCity(cityName)
      } catch {}
    })
  }

  return (
    <div style={{ background: '#1C1C1E', color: '#F7F2EA', fontFamily: 'Outfit, sans-serif', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes marquee { from { transform:translateX(0) } to { transform:translateX(-50%) } }

        .cat-pill:hover { background: rgba(201,150,90,0.12) !important; border-color: rgba(201,150,90,0.35) !important; transform: translateY(-2px); }
        .cat-pill { transition: all 0.2s ease; }

        .prof-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4) !important; }
        .prof-card { transition: all 0.25s ease; cursor: pointer; }

        .search-input-wrap:focus-within { border-color: rgba(201,150,90,0.5) !important; box-shadow: 0 0 0 3px rgba(201,150,90,0.1) !important; }

        .nearby-scroll { display:flex; gap:14px; overflow-x:auto; padding-bottom:8px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; }
        .nearby-scroll::-webkit-scrollbar { display:none; }
        .nearby-card { scroll-snap-align:start; flex-shrink:0; width:220px; }

        .cat-scroll { display:flex; gap:10px; overflow-x:auto; padding-bottom:6px; -webkit-overflow-scrolling:touch; }
        .cat-scroll::-webkit-scrollbar { display:none; }

        .chip-scroll { display:flex; gap:8px; overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .chip-scroll::-webkit-scrollbar { display:none; }

        input::placeholder { color:rgba(100,100,110,0.6) !important; }
        input:focus { outline:none; }

        @media (max-width: 640px) {
          .featured-grid { grid-template-columns: 1fr 1fr !important; }
          .how-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .hero-cta { flex-direction: column !important; }
          .nearby-card { width: 200px !important; }
        }
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(160deg, #1A2820 0%, #141A16 40%, #1C1C1E 100%)',
        padding: '0 0 40px',
        position: 'relative',
        overflow: 'visible',
        zIndex: 10,
      }}>
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(201,150,90,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,150,90,0.15), transparent)' }} />

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 20px 0' }}>
          <Link to="/register" style={{ fontSize: 12, color: 'rgba(201,150,90,0.8)', textDecoration: 'none', fontWeight: 500 }}>
            Incluye tu negocio en la lista →
          </Link>
        </div>

        {/* Logo + tagline */}
        <div style={{ textAlign: 'center', padding: '24px 24px 28px', animation: 'fadeUp 0.5s ease both' }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.8rem,8vw,4rem)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1 }}>
            Top<em style={{ color: '#C9965A', fontStyle: 'italic' }}>Sy</em>
          </h1>
          <p style={{ color: 'rgba(247,242,234,0.5)', fontSize: 14, maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>
            Descubre y reserva una cita con profesionales de la belleza y el bienestar cerca de ti
          </p>
        </div>

        {/* Search bar */}
        <div style={{ padding: '0 16px', maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 100 }}>
          <div className="search-input-wrap" style={{
            background: '#F7F2EA', borderRadius: 14, border: '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
            transition: 'all 0.2s', position: 'relative', zIndex: 100, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🔍</span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setShowSearch(true) }}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              placeholder="Buscar servicios o negocios..."
              style={{ flex: 1, minWidth: 120, background: 'transparent', border: 'none', color: '#1C1C1E', fontSize: 15, fontFamily: 'Outfit, sans-serif' }}
            />

            {/* Ciudad badge */}
            {city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(201,150,90,0.12)', border: '1px solid rgba(201,150,90,0.3)', borderRadius: 8, padding: '4px 8px', flexShrink: 0 }}>
                <span style={{ fontSize: 11 }}>📍</span>
                <span style={{ fontSize: 12, color: '#C9965A', fontWeight: 600 }}>{city}</span>
                <button onClick={() => setCity('')} style={{ background: 'none', border: 'none', color: 'rgba(201,150,90,0.5)', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
              </div>
            )}

            <button
              onClick={() => navigate(`/search?q=${search}&city=${city}`)}
              style={{ background: 'linear-gradient(135deg, #C9965A, #E8B97A)', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#0A0806', fontWeight: 700, fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', flexShrink: 0 }}>
              Buscar
            </button>

            {/* Dropdown servicios populares */}
            {showSearch && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#2A2A2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px', zIndex: 999, boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
                <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Servicios populares</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Corte caballero','Manicura','Corte fade','Diseño de cejas','Uñas acrílicas','Masaje relajante'].map(s => (
                    <button key={s} onClick={() => { setSearch(s); setShowSearch(false); navigate(`/search?q=${s}`) }}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '6px 14px', fontSize: 12, color: 'rgba(247,242,234,0.6)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* City chips */}
          <div className="chip-scroll" style={{ marginTop: 10, paddingBottom: 2 }}>
            <button onClick={handleGeolocate} style={{ background: 'rgba(201,150,90,0.1)', border: '1px solid rgba(201,150,90,0.25)', borderRadius: 100, padding: '6px 14px', fontSize: 12, color: '#C9965A', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', flexShrink: 0, fontWeight: 600 }}>
              📍 Mi ubicación
            </button>
            {['Sevilla','Madrid','Barcelona','Valencia','Málaga'].map(c => (
              <button key={c} onClick={() => setCity(c === city ? '' : c)}
                style={{ background: city === c ? 'rgba(201,150,90,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${city === c ? 'rgba(201,150,90,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 100, padding: '6px 14px', fontSize: 12, color: city === c ? '#C9965A' : 'rgba(247,242,234,0.5)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', flexShrink: 0, transition: 'all 0.15s' }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CATEGORÍAS ════════════════════════════════════════ */}
      <section style={{ padding: '24px 0 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '0 16px' }}>
          <div className="cat-scroll" ref={catRef}>
            {CATEGORIES.map(cat => (
              <button key={cat.value} className="cat-pill"
                onClick={() => navigate(`/search?category=${cat.value}`)}
                style={{ flexShrink: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100, padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 16 }}>{cat.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(247,242,234,0.7)', fontWeight: 500 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CERCA DE TI ═══════════════════════════════════════ */}
      <section style={{ padding: '32px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '0 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 400, marginBottom: 2 }}>
              Cerca de <em style={{ color: '#C9965A' }}>ti</em>
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.3)', margin: 0 }}>Los mejor valorados de tu zona</p>
          </div>
          <Link to="/search" style={{ fontSize: 12, color: '#C9965A', textDecoration: 'none', fontWeight: 600 }}>Ver todos →</Link>
        </div>

        <div className="nearby-scroll" style={{ padding: '4px 16px' }}>
          {featured.length > 0 ? featured.map(p => {
            const minPrice = p.services?.length ? Math.min(...p.services.map(s => s.price)) : null
            return (
              <div key={p.id} className="nearby-card prof-card" onClick={() => navigate(`/professional/${p.id}`)}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' }}>
                  <div style={{ height: 150, background: 'linear-gradient(135deg, rgba(201,150,90,0.15), #242426)', position: 'relative', overflow: 'hidden' }}>
                    {p.cover_image_url
                      ? <img src={p.cover_image_url} alt={p.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', opacity: 0.3 }}>✂️</div>
                    }
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 100, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#C9965A', fontSize: 10 }}>★</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{p.avg_rating ?? '—'}</span>
                    </div>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#F7F2EA', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.business_name}</p>
                    <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.35)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {p.city}</p>
                    {p.total_reviews > 0 && (
                      <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.25)', margin: 0 }}>★ {p.avg_rating} · {p.total_reviews} reseñas</p>
                    )}
                    {minPrice != null && (
                      <p style={{ fontSize: 11, color: '#C9965A', marginTop: 6, fontWeight: 600 }}>Desde {minPrice}€</p>
                    )}
                  </div>
                </div>
              </div>
            )
          }) : (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="nearby-card">
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: 150 }} />
                  <div style={{ padding: 14 }}>
                    <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8, borderRadius: 6 }} />
                    <div className="skeleton" style={{ height: 10, width: '55%', borderRadius: 6 }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ══ MEJOR VALORADOS GRID ══════════════════════════════ */}
      <section style={{ padding: '8px 0 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '0 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 400, marginBottom: 2 }}>
              Los mejor <em style={{ color: '#C9965A' }}>valorados</em>
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.3)', margin: 0 }}>Profesionales con más reseñas positivas</p>
          </div>
          <Link to="/search" style={{ fontSize: 12, color: '#C9965A', textDecoration: 'none', fontWeight: 600 }}>Ver todos →</Link>
        </div>

        <div style={{ padding: '0 16px' }}>
          <div className="featured-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {featured.slice(0, 4).map(p => {
              const minPrice = p.services?.length ? Math.min(...p.services.map(s => s.price)) : null
              return (
                <Link key={p.id} to={`/professional/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="prof-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ height: 120, background: 'linear-gradient(135deg, rgba(201,150,90,0.12), #242426)', position: 'relative', overflow: 'hidden' }}>
                      {p.cover_image_url
                        ? <img src={p.cover_image_url} alt={p.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', opacity: 0.3 }}>✂️</div>
                      }
                      <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 100, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ color: '#C9965A', fontSize: 9 }}>★</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{p.avg_rating ?? '—'}</span>
                      </div>
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ fontWeight: 700, fontSize: 12, color: '#F7F2EA', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.business_name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {p.city}</p>
                      {minPrice != null && <p style={{ fontSize: 11, color: '#C9965A', marginTop: 4, fontWeight: 600 }}>Desde {minPrice}€</p>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ════════════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', padding: '10px 0', background: 'rgba(201,150,90,0.02)' }}>
        <div style={{ display: 'flex', animation: 'marquee 30s linear infinite', width: 'max-content' }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 48, paddingRight: 48 }}>
              {['Peluquería','Uñas','Spa','Barbería','Estética','Cejas','Masajes','Depilación','Maquillaje','Coloración','Extensiones'].map(s => (
                <span key={s} style={{ fontSize: 11, color: 'rgba(201,150,90,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {s} <span style={{ fontSize: 5, color: 'rgba(201,150,90,0.2)' }}>◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ CÓMO FUNCIONA ══════════════════════════════════════ */}
      <section style={{ padding: '48px 16px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 8 }}>Simple y rápido</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 300 }}>
            ¿Cómo <em style={{ color: '#C9965A' }}>funciona</em>?
          </h2>
        </div>
        <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, maxWidth: 820, margin: '0 auto' }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 14, right: 16, fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: 'rgba(201,150,90,0.07)', fontWeight: 700, lineHeight: 1 }}>{step.step}</div>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{step.icon}</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: 8, color: '#F7F2EA' }}>{step.title}</h3>
              <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.3)', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════════ */}
      <section style={{ padding: '40px 16px', background: 'linear-gradient(135deg, rgba(201,150,90,0.04), transparent)', borderTop: '1px solid rgba(201,150,90,0.08)' }}>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>
          {[
            { num: '2.000+', label: 'Profesionales' },
            { num: '50K+',   label: 'Citas al mes' },
            { num: '4.9★',   label: 'Valoración media' },
            { num: '120+',   label: 'Ciudades' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '20px 8px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 300, color: '#C9965A', lineHeight: 1, marginBottom: 6 }}>{s.num}</div>
              <div style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA PROFESIONAL ════════════════════════════════════ */}
      <section style={{ padding: '56px 24px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #1A2820 0%, #1C1C1E 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,150,90,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 14 }}>Para profesionales</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 300, marginBottom: 14, lineHeight: 1.2 }}>
            ¿Eres profesional?<br /><em style={{ color: '#C9965A' }}>Únete a TopSy</em>
          </h2>
          <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 13, marginBottom: 32, lineHeight: 1.8 }}>
            Gestiona tu agenda, recibe reservas online y haz crecer tu negocio. Gratis para empezar.
          </p>
          <div className="hero-cta" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ background: 'linear-gradient(135deg, #C9965A, #E8B97A)', border: 'none', borderRadius: 12, padding: '14px 32px', color: '#0A0806', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', textDecoration: 'none', letterSpacing: '0.05em' }}>
              Registrar mi negocio →
            </Link>
            <Link to="/search" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 24px', color: 'rgba(247,242,234,0.6)', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', textDecoration: 'none' }}>
              Explorar profesionales
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}