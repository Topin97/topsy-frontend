import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = [
  { icon: '💇‍♀️', label: 'Peluquería',  value: 'hair' },
  { icon: '🪒',    label: 'Barbería',    value: 'barber' },
  { icon: '💅',    label: 'Uñas',        value: 'nails' },
  { icon: '🧖‍♀️', label: 'Spa',         value: 'spa' },
  { icon: '✨',    label: 'Estética',    value: 'aesthetic' },
  { icon: '👁️',   label: 'Cejas',       value: 'brows' },
]

const FEATURED = [
  { name: 'Barberia Paquito Don', city: 'El Cuervo de Sevilla', rating: 4.9, reviews: 1275, category: 'barber', emoji: '✂️' },
  { name: 'Salón Elena',          city: 'Madrid',               rating: 4.8, reviews: 832,  category: 'hair',   emoji: '💇' },
  { name: 'Nails Studio',         city: 'Barcelona',            rating: 4.9, reviews: 654,  category: 'nails',  emoji: '💅' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  return (
    <div style={{ background: '#0F1210', color: '#F0EDE8', fontFamily: 'Outfit, sans-serif', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes marquee { from { transform:translateX(0) } to { transform:translateX(-50%) } }

        .cat-btn:hover .cat-circle { background: rgba(201,150,90,0.2) !important; border-color: rgba(201,150,90,0.5) !important; transform: translateY(-4px); }
        .cat-circle { transition: all 0.25s; }

        .prof-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.5) !important; }
        .prof-card { transition: all 0.25s; }
        
        .cats-row::-webkit-scrollbar { display: none; }
        .cats-row { -ms-overflow-style: none; scrollbar-width: none; }

        .search-box:focus-within { border-color: rgba(201,150,90,0.5) !important; box-shadow: 0 0 0 3px rgba(201,150,90,0.08); }
        .search-box { transition: all 0.2s; }
        input::placeholder { color: rgba(240,237,232,0.3) !important; }
        input:focus { outline: none; }

        @media (max-width: 768px) {
          .hero-title { font-size: clamp(1.8rem, 7vw, 2.5rem) !important; }
          .cats-row { gap: 12px !important; }
          .cat-circle { width: 64px !important; height: 64px !important; font-size: 1.6rem !important; }
          .featured-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ══ HERO ═══════════════════════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #1A1F1C 0%, #0F1210 100%)', paddingBottom: 64 }}>
        {/* BG decoration */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(201,150,90,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        <div style={{ position: 'relative', textAlign: 'center', padding: '80px 24px 48px' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.7)', marginBottom: 20, animation: 'fadeUp 0.6s ease both' }}>
            ● 2.000+ profesionales activos en España
          </p>
          <h1 className="hero-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontWeight: 300, lineHeight: 1.15, marginBottom: 16, animation: 'fadeUp 0.6s 0.1s ease both' }}>
            Descubre y reserva con los mejores<br />
            <em style={{ color: '#C9965A' }}>profesionales cerca de ti</em>
          </h1>
          <p style={{ color: 'rgba(240,237,232,0.4)', fontSize: 15, marginBottom: 40, animation: 'fadeUp 0.6s 0.2s ease both' }}>
            Sin llamadas, sin esperas. Confirmación instantánea.
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: 560, margin: '0 auto 48px', animation: 'fadeUp 0.6s 0.3s ease both' }}>
            <div className="search-box" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '6px 6px 6px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, opacity: 0.4 }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && navigate(`/search?q=${search}`)}
                placeholder="Buscar servicios o negocios..."
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#F0EDE8', fontSize: 15, fontFamily: 'Outfit, sans-serif', padding: '10px 0' }}
              />
              <button
                onClick={() => navigate(`/search?q=${search}`)}
                style={{ background: 'linear-gradient(135deg, #C9965A, #E8B97A)', border: 'none', borderRadius: 10, padding: '12px 28px', color: '#0A0806', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="cats-row" style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 8, animation: 'fadeUp 0.6s 0.4s ease both' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.value} className="cat-btn" onClick={() => navigate(`/search?category=${cat.value}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, fontFamily: 'Outfit, sans-serif' }}>
                <div className="cat-circle" style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                  {cat.icon}
                </div>
                <span style={{ fontSize: 12, color: 'rgba(240,237,232,0.6)', fontWeight: 500 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ════════════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', padding: '10px 0', background: 'rgba(201,150,90,0.02)' }}>
        <div style={{ display: 'flex', animation: 'marquee 25s linear infinite', width: 'max-content' }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 48, paddingRight: 48 }}>
              {['Peluquería','Uñas','Spa','Barbería','Estética','Cejas','Masajes','Depilación','Maquillaje'].map(s => (
                <span key={s} style={{ fontSize: 11, color: 'rgba(201,150,90,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {s} <span style={{ fontSize: 6, color: 'rgba(201,150,90,0.2)' }}>◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ RECOMENDADO ════════════════════════════════════════ */}
      <section style={{ padding: '64px 0' }}>
        <div className="container-app">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 400 }}>Recomendado</h2>
            <button onClick={() => navigate('/search')} style={{ background: 'none', border: 'none', color: '#C9965A', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.05em' }}>Ver todos →</button>
          </div>

          <div className="featured-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {FEATURED.map((p, i) => (
              <div key={i} className="prof-card" onClick={() => navigate('/search')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', cursor: 'pointer' }}>
                {/* Cover */}
                <div style={{ height: 160, background: `linear-gradient(135deg, rgba(201,150,90,0.15), rgba(15,18,16,0.9))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', position: 'relative' }}>
                  {p.emoji}
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: 100, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: '#C9965A', fontSize: 11 }}>★</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{p.rating}</span>
                    <span style={{ fontSize: 11, color: 'rgba(240,237,232,0.4)' }}>({p.reviews})</span>
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: '16px 18px' }}>
                  <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{p.name}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(240,237,232,0.4)' }}>📍 {p.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════════ */}
      <section style={{ padding: '48px 0', background: 'rgba(201,150,90,0.04)', borderTop: '1px solid rgba(201,150,90,0.08)', borderBottom: '1px solid rgba(201,150,90,0.08)' }}>
        <div className="container-app">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 24, textAlign: 'center' }}>
            {[
              { num: '2.000+', label: 'Profesionales' },
              { num: '50K+',   label: 'Citas al mes' },
              { num: '4.9★',   label: 'Valoración media' },
              { num: '120+',   label: 'Ciudades' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: '#C9965A', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 12, color: 'rgba(240,237,232,0.35)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: '#0F1210' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300, marginBottom: 16 }}>
          ¿Eres profesional?<br /><em style={{ color: '#C9965A' }}>Únete a TopSy</em>
        </h2>
        <p style={{ color: 'rgba(240,237,232,0.35)', fontSize: 14, marginBottom: 36, maxWidth: 400, margin: '0 auto 36px' }}>
          Gestiona tu agenda, recibe reservas online y haz crecer tu negocio.
        </p>
        <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #C9965A, #E8B97A)', border: 'none', borderRadius: 4, padding: '16px 48px', color: '#0A0806', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Registrar mi negocio
        </button>
      </section>
    </div>
  )
}