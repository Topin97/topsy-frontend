import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'

const CATEGORIES = [
  { icon: '💇‍♀️', label: 'Peluquería', value: 'hair' },
  { icon: '🪒',    label: 'Barbería',   value: 'barber' },
  { icon: '✨',    label: 'Estética',   value: 'aesthetic' },
  { icon: '💅',    label: 'Uñas',       value: 'nails' },
  { icon: '🧖',    label: 'Spa',        value: 'spa' },
  { icon: '👁️',   label: 'Cejas',      value: 'brows' },
]

const HOW_IT_WORKS = [
  { icon: '🔍', step: '01', title: 'Busca', desc: 'Encuentra el profesional perfecto por servicio, ciudad o categoría.' },
  { icon: '📅', step: '02', title: 'Reserva', desc: 'Elige el horario que mejor te venga y confirma al instante.' },
  { icon: '✅', step: '03', title: 'Disfruta', desc: 'Recibe confirmación por email y ve a tu cita sin preocupaciones.' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showCity, setShowCity] = useState(false)

  const { data } = useQuery({
    queryKey: ['featured-pros'],
    queryFn: () => profApi.getAll({ sort: 'avg_rating', limit: 6 }).then(r => r.data),
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
    <div style={{ background: '#0A0806', color: '#F7F2EA', fontFamily: 'Outfit, sans-serif', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes marquee { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .cat-btn:hover .cat-circle { background:rgba(201,150,90,0.15) !important; border-color:rgba(201,150,90,0.4) !important; transform:translateY(-4px) scale(1.05); }
        .cat-circle { transition:all 0.25s; }
        .prof-card:hover { transform:translateY(-6px); box-shadow:0 20px 50px rgba(0,0,0,0.6) !important; border-color:rgba(201,150,90,0.3) !important; }
        .prof-card { transition:all 0.3s cubic-bezier(0.4,0,0.2,1); }
        input::placeholder { color:rgba(247,242,234,0.25) !important; }
        input:focus { outline:none; }
        .search-box:focus-within { border-color:rgba(201,150,90,0.4) !important; }
        @media (max-width:640px) {
          .search-where,.search-divider { display:none !important; }
          .featured-grid { grid-template-columns:1fr !important; }
          .how-grid { grid-template-columns:1fr !important; }
          .stats-grid { grid-template-columns:repeat(2,1fr) !important; }
        }
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #13100A 0%, #0A0806 100%)', paddingBottom: 0 }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, background: 'radial-gradient(ellipse, rgba(201,150,90,0.1) 0%, transparent 65%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,150,90,0.2), transparent)' }} />
        </div>

        <div style={{ position: 'relative', textAlign: 'center', padding: '90px 24px 56px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,150,90,0.08)', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 28, animation: 'fadeUp 0.6s ease both' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9965A', display: 'inline-block', animation: 'float 2s ease infinite' }} />
            <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.8)' }}>2.000+ profesionales activos en España</span>
          </div>

          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.4rem,6vw,4.2rem)', fontWeight: 300, lineHeight: 1.12, marginBottom: 20, animation: 'fadeUp 0.6s 0.1s ease both' }}>
            Descubre y reserva con los mejores<br />
            <em style={{ color: '#C9965A' }}>profesionales cerca de ti</em>
          </h1>

          <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: 16, marginBottom: 44, animation: 'fadeUp 0.6s 0.2s ease both', maxWidth: 480, margin: '0 auto 44px' }}>
            Sin llamadas, sin esperas. Confirmación instantánea.
          </p>

          {/* Search */}
          <div style={{ maxWidth: 720, margin: '0 auto 56px', animation: 'fadeUp 0.6s 0.3s ease both' }}>
            <div className="search-box" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '6px', display: 'flex', alignItems: 'center', gap: 0, transition: 'all 0.2s' }}>
              <div style={{ flex: 2, minWidth: 140, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', position: 'relative' }}>
                <span style={{ opacity: 0.35, fontSize: 16, flexShrink: 0 }}>🔍</span>
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowSearch(true) }}
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  placeholder="Buscar servicios o negocios..."
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#F7F2EA', fontSize: 15, fontFamily: 'Outfit, sans-serif', padding: '4px 0' }}
                />
                {showSearch && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 12px)', left: 0, right: 0, background: '#1C1812', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px', zIndex: 100, boxShadow: '0 12px 40px rgba(0,0,0,0.7)', minWidth: 280 }}>
                    <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Servicios populares</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['Corte caballero','Manicura semipermanente','Corte fade','Diseño de cejas','Uñas acrílicas','Depilación láser'].map(s => (
                        <button key={s} onClick={() => { setSearch(s); setShowSearch(false); navigate(`/search?q=${s}`) }}
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100, padding: '6px 14px', fontSize: 12, color: 'rgba(247,242,234,0.6)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,150,90,0.4)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="search-divider" style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

              <div className="search-where" style={{ flex: 1, minWidth: 110, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', position: 'relative' }}>
                <span style={{ opacity: 0.35, fontSize: 16, flexShrink: 0 }}>📍</span>
                <input
                  value={city}
                  onChange={e => { setCity(e.target.value); setShowCity(true) }}
                  onFocus={() => setShowCity(true)}
                  onBlur={() => setTimeout(() => setShowCity(false), 200)}
                  placeholder="¿Dónde?"
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#F7F2EA', fontSize: 15, fontFamily: 'Outfit, sans-serif', padding: '4px 0', minWidth: 0 }}
                />
                {showCity && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 12px)', left: 0, background: '#1C1812', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '8px', zIndex: 100, boxShadow: '0 12px 40px rgba(0,0,0,0.7)', minWidth: 220 }}>
                    <button onClick={() => { handleGeolocate(); setShowCity(false) }} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 4 }}>
                      <span style={{ color: '#C9965A' }}>📍</span>
                      <span style={{ color: '#C9965A', fontWeight: 600, fontSize: 13 }}>Usar mi ubicación</span>
                    </button>
                    {['Madrid','Barcelona','Sevilla','Valencia','Málaga','Bilbao'].map(c => (
                      <button key={c} onClick={() => { setCity(c); setShowCity(false) }}
                        style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '9px 12px', cursor: 'pointer', color: 'rgba(247,242,234,0.6)', fontSize: 13, fontFamily: 'Outfit, sans-serif', borderRadius: 8 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >📍 {c}</button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => navigate(`/search?q=${search}&city=${city}`)}
                style={{ background: 'linear-gradient(135deg, #C9965A, #E8B97A)', border: 'none', borderRadius: 10, padding: '13px 28px', color: '#0A0806', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Buscar
              </button>
            </div>
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', animation: 'fadeUp 0.6s 0.4s ease both', paddingBottom: 8 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.value} className="cat-btn" onClick={() => navigate(`/search?category=${cat.value}`)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, fontFamily: 'Outfit, sans-serif' }}>
                <div className="cat-circle" style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.9rem' }}>
                  {cat.icon}
                </div>
                <span style={{ fontSize: 12, color: 'rgba(247,242,234,0.5)', fontWeight: 500 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ══════════════════════════════════════════ */}
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

      {/* ══ PROFESIONALES DESTACADOS ══════════════════════════ */}
      <section style={{ padding: '72px 0' }}>
        <div className="container-app">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 20, height: 1, background: '#C9965A' }} /> Destacados
              </p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300 }}>
                Los mejor <em style={{ color: '#C9965A' }}>valorados</em>
              </h2>
            </div>
            <Link to="/search" style={{ fontSize: 13, color: '#C9965A', textDecoration: 'none', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
              Ver todos →
            </Link>
          </div>

          <div className="featured-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {featured.length > 0 ? featured.map(p => {
              const minPrice = p.services?.length ? Math.min(...p.services.map(s => s.price)) : null
              return (
                <Link key={p.id} to={`/professional/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="prof-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', cursor: 'pointer' }}>
                    <div style={{ height: 180, background: 'linear-gradient(135deg, rgba(201,150,90,0.12), #111009)', position: 'relative', overflow: 'hidden' }}>
                      {p.cover_image_url
                        ? <img src={p.cover_image_url} alt={p.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', opacity: 0.3 }}>✂️</div>
                      }
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(10,8,6,0.6) 100%)' }} />
                      <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(10,8,6,0.8)', backdropFilter: 'blur(8px)', borderRadius: 100, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: '#C9965A', fontSize: 11 }}>★</span>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{p.avg_rating ?? '—'}</span>
                        <span style={{ fontSize: 11, color: 'rgba(247,242,234,0.4)' }}>({p.total_reviews})</span>
                      </div>
                      {minPrice != null && (
                        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(10,8,6,0.8)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '4px 10px' }}>
                          <span style={{ fontSize: 10, color: 'rgba(247,242,234,0.4)' }}>Desde </span>
                          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#C9965A', fontStyle: 'italic' }}>{minPrice}€</span>
                        </div>
                      )}
                      {/* Avatar */}
                      <div style={{ position: 'absolute', bottom: -20, left: 16, width: 44, height: 44, borderRadius: '50%', border: '3px solid #0A0806', overflow: 'hidden', background: 'rgba(201,150,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.profiles?.avatar_url
                          ? <img src={p.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: '1rem' }}>👤</span>
                        }
                      </div>
                    </div>
                    <div style={{ padding: '28px 16px 16px' }}>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', fontWeight: 600, marginBottom: 4 }}>{p.business_name}</h3>
                      <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.35)' }}>📍 {p.city}</p>
                    </div>
                  </div>
                </Link>
              )
            }) : (
              // Skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: 180 }} />
                  <div style={{ padding: 16 }}>
                    <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: 8, borderRadius: 6 }} />
                    <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6 }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ══ CÓMO FUNCIONA ═════════════════════════════════════ */}
      <section style={{ padding: '72px 0', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="container-app">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 20, height: 1, background: '#C9965A' }} /> Simple y rápido
            </p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300 }}>
              ¿Cómo <em style={{ color: '#C9965A' }}>funciona</em>?
            </h2>
          </div>
          <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '32px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 20, right: 20, fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem', color: 'rgba(201,150,90,0.08)', fontWeight: 700, lineHeight: 1 }}>{step.step}</div>
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{step.icon}</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 400, marginBottom: 10, color: '#F7F2EA' }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.35)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════ */}
      <section style={{ padding: '56px 0', background: 'linear-gradient(135deg, rgba(201,150,90,0.05), rgba(10,8,6,0))', borderTop: '1px solid rgba(201,150,90,0.08)' }}>
        <div className="container-app">
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}>
            {[
              { num: '2.000+', label: 'Profesionales' },
              { num: '50K+',   label: 'Citas al mes' },
              { num: '4.9★',   label: 'Valoración media' },
              { num: '120+',   label: 'Ciudades' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '24px 16px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: '#C9965A', lineHeight: 1, marginBottom: 8 }}>{s.num}</div>
                <div style={{ fontSize: 11, color: 'rgba(247,242,234,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA PROFESIONAL ══════════════════════════════════ */}
      <section style={{ padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,150,90,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 20, height: 1, background: '#C9965A' }} /> Para profesionales
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300, marginBottom: 16, lineHeight: 1.2 }}>
            ¿Eres profesional?<br /><em style={{ color: '#C9965A' }}>Únete a TopSy</em>
          </h2>
          <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 14, marginBottom: 40, lineHeight: 1.8 }}>
            Gestiona tu agenda, recibe reservas online y haz crecer tu negocio. Gratis para empezar.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ background: 'linear-gradient(135deg, #C9965A, #E8B97A)', border: 'none', borderRadius: 10, padding: '16px 40px', color: '#0A0806', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', textDecoration: 'none', letterSpacing: '0.05em' }}>
              Registrar mi negocio →
            </Link>
            <Link to="/search" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 32px', color: 'rgba(247,242,234,0.6)', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', textDecoration: 'none' }}>
              Explorar profesionales
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}