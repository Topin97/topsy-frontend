import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const CATEGORIES = [
  { icon: '💇‍♀️', label: 'Peluquería',  value: 'hair',      desc: 'Cortes, tintes, peinados' },
  { icon: '💅',    label: 'Uñas',        value: 'nails',     desc: 'Manicura y pedicura' },
  { icon: '🧖‍♀️', label: 'Spa',         value: 'spa',       desc: 'Masajes y relajación' },
  { icon: '🪒',    label: 'Barbería',    value: 'barber',    desc: 'Corte y afeitado' },
  { icon: '✨',    label: 'Estética',    value: 'aesthetic', desc: 'Tratamientos faciales' },
  { icon: '👁️',   label: 'Cejas',       value: 'brows',     desc: 'Diseño y laminado' },
]

const TESTIMONIALS = [
  { name: 'Sofía M.',    role: 'Cliente desde 2023', text: 'Reservé mi cita en menos de 2 minutos. El mejor servicio que he encontrado.', rating: 5 },
  { name: 'Carlos R.',   role: 'Profesional',        text: 'Desde que uso TopSy mi agenda está siempre llena. Increíble plataforma.', rating: 5 },
  { name: 'Ana García',  role: 'Cliente desde 2024', text: 'Encontré a mi estilista perfecta gracias a las reseñas. ¡100% recomendable!', rating: 5 },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [city, setCity]     = useState('')

  return (
    <div style={{ background: '#0A0806' }}>
      <style>{`
  @media (max-width: 768px) {
    .hero-card { display: none !important; }
  }
`}</style>

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section style={{ minHeight: 'auto', display: 'flex', alignItems: 'flex-start', position: 'relative', overflow: 'hidden', paddingTop: '20px' }}>

        {/* Background layers */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {/* Grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,150,90,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,150,90,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
          {/* Orbs */}
          <div style={{ position: 'absolute', top: '10%', right: '5%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(201,150,90,0.14) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', left: '0%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(201,150,90,0.07) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(80px)' }} />
          {/* Vignette */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,8,6,0.6) 100%)' }} />
        </div>

        <div className="container-app" style={{ position: 'relative', zIndex: 1, paddingTop: 0, paddingBottom: 48 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center' }}>

            {/* Left: Text */}
            <div>
              {/* Pill badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(201,150,90,0.08)', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 100, padding: '6px 14px 6px 8px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: 'rgba(247,242,234,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>2.000+ profesionales activos</span>
                </div>
              </div>

              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, lineHeight: 1.0, marginBottom: 28 }}>
                <span style={{ display: 'block', fontSize: 'clamp(3rem,5.5vw,6rem)', color: '#F7F2EA' }}>El bienestar</span>
                <span style={{ display: 'block', fontSize: 'clamp(3rem,5.5vw,6rem)', color: '#F7F2EA' }}>que mereces,</span>
                <span style={{ display: 'block', fontSize: 'clamp(3rem,5.5vw,6rem)', fontStyle: 'italic', color: '#C9965A' }}>cuando quieras.</span>
              </h1>

              <p style={{ color: 'rgba(247,242,234,0.45)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 44, maxWidth: 440 }}>
                Descubre y reserva con los mejores profesionales de belleza y bienestar. Sin llamadas, sin esperas.
              </p>

              {/* Search box */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 14, padding: 8, display: 'flex', gap: 8, marginBottom: 28, backdropFilter: 'blur(10px)', flexWrap: 'wrap', flexWrap: 'wrap' }}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${search}&city=${city}`)}
                  placeholder="¿Qué servicio buscas?"
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#F7F2EA', fontSize: 14, fontFamily: 'Outfit, sans-serif', padding: '8px 12px' }}
                />
                <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ciudad"
                  style={{ width: 'min(130px, 100%)', background: 'transparent', border: 'none', outline: 'none', color: '#F7F2EA', fontSize: 14, fontFamily: 'Outfit, sans-serif', padding: '8px 12px' }}
                />
                <button
                  onClick={() => navigate(`/search?q=${search}&city=${city}`)}
                  style={{ background: 'linear-gradient(135deg, #C9965A, #E8B97A)', border: 'none', borderRadius: 8, padding: '10px 24px', color: '#0A0806', fontWeight: 700, fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}
                >
                  Buscar →
                </button>
              </div>

              {/* Social proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex' }}>
                  {['S','M','A','L'].map((l, i) => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${30 + i * 15},40%,${25 + i * 5}%)`, border: '2px solid #0A0806', marginLeft: i ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#C9965A' }}>{l}</div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#C9965A', fontSize: 12 }}>{s}</span>)}
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)' }}>+50.000 citas reservadas este mes</p>
                </div>
              </div>
            </div>

            {/* Right: Visual card */}
            <div className="hero-card" style={{ position: 'relative', minWidth: 0 }}>
              {/* Main card */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,150,90,0.15)', borderRadius: 24, padding: 32, backdropFilter: 'blur(20px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #C9965A, #E8B97A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>✂️</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>Salón Elena</p>
                    <p style={{ color: '#C9965A', fontSize: 12 }}>★★★★★ 4.9 · Madrid</p>
                  </div>
                  <div style={{ marginLeft: 'auto', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 100, padding: '4px 12px', fontSize: 11, color: '#4ade80' }}>Disponible</div>
                </div>

                <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)', marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Horas disponibles · Hoy</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
                  {['10:00','11:00','12:00','15:00','16:00','17:00','18:00','19:00'].map((t, i) => (
                    <div key={t} style={{ padding: '8px', borderRadius: 8, textAlign: 'center', fontSize: 13, border: `1px solid ${i === 2 ? '#C9965A' : 'rgba(255,255,255,0.08)'}`, background: i === 2 ? 'rgba(201,150,90,0.15)' : 'transparent', color: i === 2 ? '#C9965A' : 'rgba(247,242,234,0.5)', cursor: 'pointer' }}>{t}</div>
                  ))}
                </div>

                <div style={{ background: 'rgba(201,150,90,0.08)', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 12, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Corte + Peinado</p>
                    <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.4)' }}>60 min · 12:00h</p>
                  </div>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#C9965A', fontStyle: 'italic' }}>45€</span>
                </div>

                <button style={{ width: '100%', background: 'linear-gradient(135deg, #C9965A, #E8B97A)', border: 'none', borderRadius: 10, padding: '14px', color: '#0A0806', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', letterSpacing: '0.05em' }}>
                  Confirmar reserva
                </button>
              </div>

              {/* Floating badge */}
              <div style={{ position: 'absolute', top: -12, right: 0, background: 'linear-gradient(135deg, #1a1408, #0f0d08)', border: '1px solid rgba(201,150,90,0.3)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Cita confirmada</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>✓ Hoy a las 12:00h</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid rgba(201,150,90,0.1)', borderBottom: '1px solid rgba(201,150,90,0.1)', overflow: 'hidden', padding: '14px 0', background: 'rgba(201,150,90,0.03)' }}>
        <style>{`@keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
        <div style={{ display: 'flex', animation: 'marquee 20s linear infinite', width: 'max-content' }}>
          {[...Array(2)].map((_, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 48, paddingRight: 48 }}>
              {['Peluquería','Uñas','Spa','Barbería','Estética','Cejas','Masajes','Depilación','Maquillaje','Bronceado'].map((s) => (
                <span key={s} style={{ fontSize: 12, color: 'rgba(201,150,90,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {s} <span style={{ color: 'rgba(201,150,90,0.25)' }}>◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ CATEGORIES ════════════════════════════════════════════ */}
      <section style={{ padding: '100px 0', background: '#0D0B08' }}>
        <div className="container-app">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56 }}>
            <div>
              <p className="section-tag" style={{ marginBottom: 12 }}>Servicios</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem,4vw,3.8rem)', fontWeight: 300, lineHeight: 1.1 }}>
                Explora por<br /><em style={{ color: '#C9965A' }}>categoría</em>
              </h2>
            </div>
            <button onClick={() => navigate('/search')} style={{ background: 'none', border: '1px solid rgba(201,150,90,0.3)', borderRadius: 2, padding: '10px 20px', color: '#C9965A', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
              Ver todos →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16 }}>
            {CATEGORIES.map((cat, i) => (
              <button key={cat.value} onClick={() => navigate(`/search?category=${cat.value}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '28px 20px', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = '1px solid rgba(201,150,90,0.4)'
                    e.currentTarget.style.background = 'rgba(201,150,90,0.06)'
                    e.currentTarget.style.transform = 'translateY(-6px)'
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.4)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{cat.icon}</div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#F7F2EA', marginBottom: 4 }}>{cat.label}</p>
                  <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.35)', lineHeight: 1.4 }}>{cat.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', background: '#0A0806', borderTop: '1px solid rgba(201,150,90,0.08)' }}>
        <div className="container-app">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', border: '1px solid rgba(201,150,90,0.1)', borderRadius: 20, overflow: 'hidden' }}>
            {[
              { num: '2.000+', label: 'Profesionales', sub: 'verificados' },
              { num: '50.000+', label: 'Citas al mes', sub: 'confirmadas' },
              { num: '4.9/5', label: 'Valoración', sub: 'media global' },
              { num: '120+', label: 'Ciudades', sub: 'disponibles' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '48px 32px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(201,150,90,0.1)' : 'none', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem,4vw,3.5rem)', fontWeight: 300, color: '#C9965A', lineHeight: 1, marginBottom: 8 }}>{s.num}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#F7F2EA', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(247,242,234,0.3)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════ */}
      <section style={{ padding: '100px 0', background: '#0D0B08' }}>
        <div className="container-app">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p className="section-tag" style={{ justifyContent: 'center', marginBottom: 12 }}>Testimonios</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem,4vw,3.5rem)', fontWeight: 300 }}>
              Lo que dicen <em style={{ color: '#C9965A' }}>nuestros usuarios</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 32 }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
                  {Array.from({ length: t.rating }).map((_, j) => <span key={j} style={{ color: '#C9965A', fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ color: 'rgba(247,242,234,0.7)', fontSize: 15, lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,150,90,0.3), rgba(201,150,90,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#C9965A', fontSize: 14 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.35)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 0', background: '#0A0806' }}>
        <div className="container-app">
          <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', background: 'linear-gradient(135deg, #1A1106 0%, #0F0D08 50%, #1A1008 100%)', border: '1px solid rgba(201,150,90,0.2)', padding: '80px 64px', textAlign: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(201,150,90,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <p className="section-tag" style={{ justifyContent: 'center', marginBottom: 16 }}>Empieza hoy</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem,5vw,5rem)', fontWeight: 300, marginBottom: 20, lineHeight: 1.1 }}>
                Tu bienestar,<br /><em style={{ color: '#C9965A' }}>siempre disponible</em>
              </h2>
              <p style={{ color: 'rgba(247,242,234,0.45)', fontSize: '1rem', marginBottom: 48, maxWidth: 440, margin: '0 auto 48px' }}>
                Únete a miles de personas que ya reservan sus citas en segundos con TopSy.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #C9965A, #E8B97A)', border: 'none', borderRadius: 2, padding: '16px 48px', color: '#0A0806', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: '0 8px 32px rgba(201,150,90,0.3)' }}>
                  Crear cuenta gratis
                </button>
                <button onClick={() => navigate('/search')} style={{ background: 'transparent', border: '1px solid rgba(201,150,90,0.4)', borderRadius: 2, padding: '16px 48px', color: '#C9965A', fontWeight: 500, fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
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