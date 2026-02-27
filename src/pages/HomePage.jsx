import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = [
  { icon: '💇‍♀️', label: 'Peluquería',  value: 'hair',      desc: 'Cortes, tintes, peinados' },
  { icon: '💅',    label: 'Uñas',        value: 'nails',     desc: 'Manicura y pedicura' },
  { icon: '🧖‍♀️', label: 'Spa',         value: 'spa',       desc: 'Masajes y relajación' },
  { icon: '🪒',    label: 'Barbería',    value: 'barber',    desc: 'Corte y afeitado' },
  { icon: '✨',    label: 'Estética',    value: 'aesthetic', desc: 'Tratamientos faciales' },
  { icon: '👁️',   label: 'Cejas',       value: 'brows',     desc: 'Diseño y laminado' },
]

const TESTIMONIALS = [
  { name: 'Sofía M.',   role: 'Cliente desde 2023', text: 'Reservé mi cita en menos de 2 minutos. El mejor servicio que he encontrado.', rating: 5, avatar: 'S' },
  { name: 'Carlos R.',  role: 'Profesional',        text: 'Desde que uso TopSy mi agenda está siempre llena. Increíble plataforma.',     rating: 5, avatar: 'C' },
  { name: 'Ana García', role: 'Cliente desde 2024', text: 'Encontré a mi estilista perfecta gracias a las reseñas. ¡100% recomendable!', rating: 5, avatar: 'A' },
]

const WORDS = ['Peluquería', 'Belleza', 'Bienestar', 'Estética', 'Relajación']

export default function HomePage() {
  const navigate  = useNavigate()
  const [search, setSearch]     = useState('')
  const [city, setCity]         = useState('')
  const [wordIdx, setWordIdx]   = useState(0)
  const [visible, setVisible]   = useState(true)
  const canvasRef = useRef(null)

  // Rotating word
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setWordIdx(i => (i + 1) % WORDS.length)
        setVisible(true)
      }, 400)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.4 + 0.1,
    }))

    let animId
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,150,90,${p.o})`
        ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div style={{ background: '#080604', color: '#F7F2EA', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
        @keyframes wordIn   { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes wordOut  { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(-12px) } }
        @keyframes shimmer  { from { background-position: -200% center } to { background-position: 200% center } }
        @keyframes marquee  { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        @keyframes float    { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
        @keyframes pulse    { 0%,100% { opacity:0.4 } 50% { opacity:1 } }

        .hero-word { display:inline-block; animation: wordIn 0.4s ease forwards; }
        .hero-word.out { animation: wordOut 0.4s ease forwards; }

        .cat-card:hover { transform:translateY(-8px) scale(1.02) !important; border-color:rgba(201,150,90,0.5) !important; background:rgba(201,150,90,0.08) !important; box-shadow: 0 24px 48px rgba(0,0,0,0.5) !important; }
        .cat-card { transition: all 0.35s cubic-bezier(0.4,0,0.2,1) !important; }

        .stat-card:hover { background: rgba(201,150,90,0.06) !important; }
        .stat-card { transition: background 0.3s; }

        .test-card:hover { border-color: rgba(201,150,90,0.25) !important; transform: translateY(-4px); }
        .test-card { transition: all 0.3s; }

        .search-input::placeholder { color: rgba(247,242,234,0.3); }
        .search-input:focus { outline: none; }

        .btn-gold { background: linear-gradient(135deg, #C9965A 0%, #E8B97A 50%, #C9965A 100%); background-size: 200% auto; transition: background-position 0.4s, transform 0.2s, box-shadow 0.2s; }
        .btn-gold:hover { background-position: right center; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201,150,90,0.4) !important; }

        .gradient-text { background: linear-gradient(135deg, #C9965A, #F0D090, #C9965A); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 4s linear infinite; }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-card-demo { display: none !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .cats-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .test-grid { grid-template-columns: 1fr !important; }
          .cta-pad { padding: 48px 24px !important; }
          .cta-btns { flex-direction: column !important; }
        }
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 0 }}>
        {/* Canvas particles */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

        {/* BG layers */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,150,90,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(201,150,90,0.025) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
          <div style={{ position: 'absolute', top: '5%', right: '-5%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(201,150,90,0.12) 0%, transparent 65%)', borderRadius: '50%', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(201,150,90,0.06) 0%, transparent 65%)', borderRadius: '50%', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(8,6,4,0.7) 100%)' }} />
        </div>

        <div className="container-app" style={{ position: 'relative', zIndex: 1, paddingTop: 20, paddingBottom: 60 }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

            {/* Left */}
            <div style={{ animation: 'fadeUp 0.8s ease forwards' }}>
              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,150,90,0.06)', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 100, padding: '6px 16px 6px 10px', marginBottom: 40 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
                <span style={{ fontSize: 11, color: 'rgba(247,242,234,0.55)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>2.000+ profesionales activos</span>
              </div>

              {/* Headline */}
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, lineHeight: 1.0, marginBottom: 12 }}>
                <span style={{ display: 'block', fontSize: 'clamp(2.8rem,5vw,5.5rem)', color: '#F7F2EA', letterSpacing: '-0.01em' }}>Tu espacio</span>
                <span style={{ display: 'block', fontSize: 'clamp(2.8rem,5vw,5.5rem)', color: '#F7F2EA', letterSpacing: '-0.01em' }}>de</span>
              </h1>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.8rem,5vw,5.5rem)', fontStyle: 'italic', marginBottom: 28, height: 'clamp(3rem,5.5vw,6rem)', overflow: 'hidden' }}>
                <span className={`hero-word${visible ? '' : ' out'}`} style={{ color: '#C9965A' }}>
                  {WORDS[wordIdx]}
                </span>
              </div>

              <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: '1.05rem', lineHeight: 1.9, marginBottom: 48, maxWidth: 420, animation: 'fadeUp 0.8s 0.2s ease both' }}>
                Descubre y reserva con los mejores profesionales. Sin llamadas, sin esperas, solo tú y tu bienestar.
              </p>

              {/* Search */}
              <div style={{ marginBottom: 36, animation: 'fadeUp 0.8s 0.3s ease both' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 16, padding: '6px 6px 6px 16px', display: 'flex', gap: 8, alignItems: 'center', backdropFilter: 'blur(12px)', flexWrap: 'wrap' }}>
                  <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && navigate(`/search?q=${search}&city=${city}`)} placeholder="¿Qué servicio buscas?" style={{ flex: 1, minWidth: 120, background: 'transparent', border: 'none', color: '#F7F2EA', fontSize: 14, fontFamily: 'Outfit, sans-serif', padding: '8px 0' }} />
                  <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                  <input className="search-input" value={city} onChange={e => setCity(e.target.value)} placeholder="Ciudad" style={{ width: 110, background: 'transparent', border: 'none', color: '#F7F2EA', fontSize: 14, fontFamily: 'Outfit, sans-serif', padding: '8px 8px' }} />
                  <button onClick={() => navigate(`/search?q=${search}&city=${city}`)} className="btn-gold" style={{ border: 'none', borderRadius: 10, padding: '12px 28px', color: '#0A0806', fontWeight: 700, fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    Buscar →
                  </button>
                </div>
              </div>

              {/* Social proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, animation: 'fadeUp 0.8s 0.4s ease both' }}>
                <div style={{ display: 'flex' }}>
                  {['S','M','A','L','R'].map((l, i) => (
                    <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, hsl(${30+i*12},50%,${20+i*4}%), hsl(${35+i*12},40%,${15+i*4}%))`, border: '2px solid #080604', marginLeft: i ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#C9965A' }}>{l}</div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 3 }}>
                    {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#C9965A', fontSize: 13 }}>{s}</span>)}
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.35)' }}>+50.000 citas reservadas este mes</p>
                </div>
              </div>
            </div>

            {/* Right: Demo card */}
            <div className="hero-card-demo" style={{ position: 'relative', animation: 'fadeUp 0.8s 0.2s ease both' }}>
              <div style={{ background: 'rgba(18,14,10,0.8)', border: '1px solid rgba(201,150,90,0.15)', borderRadius: 28, padding: 28, backdropFilter: 'blur(24px)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #C9965A, #E8B97A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>✂️</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Salón Elena</p>
                    <div style={{ display: 'flex', gap: 2 }}>{'★★★★★'.split('').map((s,i) => <span key={i} style={{ color: '#C9965A', fontSize: 11 }}>{s}</span>)}</div>
                  </div>
                  <div style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 100, padding: '4px 12px', fontSize: 11, color: '#4ade80', animation: 'float 3s ease infinite' }}>● Disponible</div>
                </div>

                {/* Slots */}
                <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Horas disponibles hoy</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
                  {['10:00','11:00','12:00','15:00','16:00','17:00','18:00','19:00'].map((t, i) => (
                    <div key={t} style={{ padding: '9px 4px', borderRadius: 10, textAlign: 'center', fontSize: 13, fontWeight: i===2?700:400, border: `1px solid ${i===2?'rgba(201,150,90,0.6)':'rgba(255,255,255,0.06)'}`, background: i===2?'rgba(201,150,90,0.12)':'rgba(255,255,255,0.02)', color: i===2?'#E8B97A':'rgba(247,242,234,0.4)', transition: 'all 0.2s', cursor: 'pointer' }}>{t}</div>
                  ))}
                </div>

                {/* Service */}
                <div style={{ background: 'rgba(201,150,90,0.06)', border: '1px solid rgba(201,150,90,0.15)', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Corte + Peinado</p>
                    <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.35)' }}>⏱ 60 min · 12:00h</p>
                  </div>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontStyle: 'italic', color: '#C9965A' }}>45€</span>
                </div>

                <button className="btn-gold" style={{ width: '100%', border: 'none', borderRadius: 12, padding: '14px', color: '#0A0806', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', letterSpacing: '0.05em' }}>
                  Confirmar reserva ✓
                </button>
              </div>

              {/* Floating badge */}
              <div style={{ position: 'absolute', top: -14, right: 16, background: 'linear-gradient(135deg, #1a1408, #120e08)', border: '1px solid rgba(201,150,90,0.25)', borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', animation: 'float 4s ease infinite' }}>
                <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 3 }}>Cita confirmada</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>✓ Hoy a las 12:00h</p>
              </div>

              {/* Floating review */}
              <div style={{ position: 'absolute', bottom: -20, left: -16, background: 'linear-gradient(135deg, #1a1408, #120e08)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', maxWidth: 200, animation: 'float 3.5s 0.5s ease infinite' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>{'★★★★★'.split('').map((s,i)=><span key={i} style={{color:'#C9965A',fontSize:10}}>{s}</span>)}</div>
                <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.6)', lineHeight: 1.4, fontStyle: 'italic' }}>"Servicio increíble, muy profesional"</p>
                <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', marginTop: 4 }}>— María G.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ══════════════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid rgba(201,150,90,0.08)', borderBottom: '1px solid rgba(201,150,90,0.08)', overflow: 'hidden', padding: '12px 0', background: 'rgba(201,150,90,0.02)' }}>
        <div style={{ display: 'flex', animation: 'marquee 25s linear infinite', width: 'max-content' }}>
          {[...Array(2)].map((_, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 56, paddingRight: 56 }}>
              {['Peluquería','Uñas','Spa','Barbería','Estética','Cejas','Masajes','Depilación','Maquillaje','Bronceado'].map((s) => (
                <span key={s} style={{ fontSize: 11, color: 'rgba(201,150,90,0.4)', letterSpacing: '0.22em', textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 14 }}>
                  {s} <span style={{ color: 'rgba(201,150,90,0.2)', fontSize: 8 }}>◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ CATEGORIES ══════════════════════════════════════════ */}
      <section style={{ padding: '110px 0', background: '#0A0806' }}>
        <div className="container-app">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 24, height: 1, background: '#C9965A' }} /> Servicios
              </p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem,4vw,4rem)', fontWeight: 300, lineHeight: 1.05 }}>
                Explora por<br /><em className="gradient-text">categoría</em>
              </h2>
            </div>
            <button onClick={() => navigate('/search')} style={{ background: 'none', border: '1px solid rgba(201,150,90,0.25)', borderRadius: 2, padding: '11px 22px', color: '#C9965A', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,150,90,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,150,90,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(201,150,90,0.25)' }}
            >
              Ver todos →
            </button>
          </div>

          <div className="cats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
            {CATEGORIES.map((cat) => (
              <button key={cat.value} onClick={() => navigate(`/search?category=${cat.value}`)} className="cat-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 22, padding: '28px 16px', cursor: 'pointer', textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>
                <div style={{ fontSize: '2.4rem', marginBottom: 14 }}>{cat.icon}</div>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#F7F2EA', marginBottom: 4 }}>{cat.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.3)', lineHeight: 1.4 }}>{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS ═══════════════════════════════════════════════ */}
      <section style={{ padding: '0 0 110px', background: '#0A0806' }}>
        <div className="container-app">
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid rgba(201,150,90,0.08)', borderRadius: 24, overflow: 'hidden' }}>
            {[
              { num: '2.000+', label: 'Profesionales', sub: 'verificados',  icon: '✦' },
              { num: '50K+',   label: 'Citas al mes',  sub: 'confirmadas',  icon: '📅' },
              { num: '4.9',    label: 'Valoración',    sub: 'media global', icon: '⭐' },
              { num: '120+',   label: 'Ciudades',      sub: 'disponibles',  icon: '📍' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ padding: '48px 24px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(201,150,90,0.08)' : 'none', background: 'rgba(255,255,255,0.01)', cursor: 'default' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 12, opacity: 0.6 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem,3.5vw,3.2rem)', fontWeight: 300, color: '#C9965A', lineHeight: 1, marginBottom: 8 }}>{s.num}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#F7F2EA', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(247,242,234,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
      <section style={{ padding: '110px 0', background: '#0D0B08', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container-app">
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 14 }}>Proceso</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem,4vw,4rem)', fontWeight: 300 }}>
              Reserva en <em className="gradient-text">3 pasos</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2 }}>
            {[
              { n: '01', title: 'Busca', desc: 'Explora cientos de profesionales filtrados por servicio, ciudad y valoración.' },
              { n: '02', title: 'Elige', desc: 'Consulta perfiles, lee reseñas y selecciona el profesional perfecto para ti.' },
              { n: '03', title: 'Reserva', desc: 'Elige fecha y hora en segundos. Sin llamadas, confirmación instantánea.' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '48px 40px', background: i===1 ? 'rgba(201,150,90,0.04)' : 'transparent', border: `1px solid ${i===1?'rgba(201,150,90,0.15)':'rgba(255,255,255,0.04)'}`, borderRadius: 20, position: 'relative' }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '5rem', fontWeight: 300, color: 'rgba(201,150,90,0.1)', lineHeight: 1, marginBottom: 20, letterSpacing: '-0.02em' }}>{s.n}</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 400, marginBottom: 12, color: i===1?'#C9965A':'#F7F2EA' }}>{s.title}</h3>
                <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: 14, lineHeight: 1.8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════ */}
      <section style={{ padding: '110px 0', background: '#0A0806' }}>
        <div className="container-app">
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 14 }}>Testimonios</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem,4vw,4rem)', fontWeight: 300 }}>
              Lo que dicen <em className="gradient-text">nuestros usuarios</em>
            </h2>
          </div>
          <div className="test-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="test-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 32 }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
                  {Array.from({ length: t.rating }).map((_, j) => <span key={j} style={{ color: '#C9965A', fontSize: 13 }}>★</span>)}
                </div>
                <p style={{ color: 'rgba(247,242,234,0.65)', fontSize: 15, lineHeight: 1.8, marginBottom: 28, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,150,90,0.25), rgba(201,150,90,0.08))', border: '1px solid rgba(201,150,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#C9965A', fontSize: 15 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.3)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════ */}
      <section style={{ padding: '110px 0', background: '#0D0B08', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container-app">
          <div className="cta-pad" style={{ position: 'relative', borderRadius: 32, overflow: 'hidden', background: 'linear-gradient(135deg, #1A1106 0%, #0F0D08 40%, #16120A 100%)', border: '1px solid rgba(201,150,90,0.15)', padding: '96px 80px', textAlign: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -20%, rgba(201,150,90,0.14) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,150,90,0.4), transparent)' }} />
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 20 }}>Empieza hoy</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem,5vw,5.5rem)', fontWeight: 300, marginBottom: 20, lineHeight: 1.05 }}>
                Tu bienestar,<br /><em className="gradient-text">siempre disponible</em>
              </h2>
              <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: '1rem', marginBottom: 52, maxWidth: 400, margin: '0 auto 52px' }}>
                Únete a miles de personas que ya reservan sus citas en segundos.
              </p>
              <div className="cta-btns" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/register')} className="btn-gold" style={{ border: 'none', borderRadius: 4, padding: '16px 52px', color: '#0A0806', fontWeight: 700, fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Crear cuenta gratis
                </button>
                <button onClick={() => navigate('/search')} style={{ background: 'transparent', border: '1px solid rgba(201,150,90,0.3)', borderRadius: 4, padding: '16px 52px', color: '#C9965A', fontWeight: 500, fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,150,90,0.06)'; e.currentTarget.style.borderColor = 'rgba(201,150,90,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,150,90,0.3)' }}
                >
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