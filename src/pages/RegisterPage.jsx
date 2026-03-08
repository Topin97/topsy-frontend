import { Link } from 'react-router-dom'

const FEATURES_CLIENT = ['Reserva en segundos', 'Recordatorios automáticos', 'Historial de citas']
const FEATURES_PRO    = ['Agenda online 24/7', 'Notificaciones de reservas', 'Panel de estadísticas']

export default function RegisterPage() {
  return (
    <div style={{ minHeight: '100dvh', background: '#0A0806', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* ── Decorative background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Grain overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")', opacity: 0.4 }} />
        {/* Gold glow top */}
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(201,150,90,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        {/* Gold glow bottom left */}
        <div style={{ position: 'absolute', bottom: 0, left: -100, width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(201,150,90,0.06) 0%, transparent 70%)' }} />
        {/* Horizontal line */}
        <div style={{ position: 'absolute', top: '42%', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,150,90,0.08), transparent)' }} />
      </div>

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: '0 0 40px' }}>

        {/* Logo */}
        <div style={{ padding: '32px 24px 0', textAlign: 'center' }}>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '3px', textDecoration: 'none', color: '#F7F2EA' }}>
            TOP<span style={{ color: '#C9965A', fontStyle: 'italic' }}>sy</span>
          </Link>
        </div>

        {/* Headline */}
        <div style={{ padding: '28px 24px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Bienvenido</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 300, lineHeight: 1.1, color: '#F7F2EA', margin: 0 }}>
            ¿Cómo vas<br />a usar <em style={{ color: '#C9965A', fontStyle: 'italic' }}>TopSy?</em>
          </h1>
          <p style={{ color: 'rgba(247,242,234,0.3)', fontSize: 14, marginTop: 12, fontFamily: 'Outfit, sans-serif' }}>Elige tu perfil para empezar</p>
        </div>

        {/* Cards */}
        <div style={{ padding: '32px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* CLIENT card */}
          <Link to="/register/client" style={{ textDecoration: 'none' }}>
            <div className="reg-card reg-card-client" style={{
              position: 'relative', borderRadius: 24, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.025)',
              padding: '28px 24px', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}>
              {/* Subtle left accent */}
              <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2, background: 'linear-gradient(180deg, transparent, rgba(247,242,234,0.15), transparent)', borderRadius: 2 }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
                  👤
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 500, color: '#F7F2EA', margin: 0 }}>Soy cliente</h2>
                    <span style={{ fontSize: 18, color: 'rgba(247,242,234,0.2)', transition: 'all 0.3s' }} className="reg-arrow">→</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.4)', lineHeight: 1.6, margin: '0 0 16px', fontFamily: 'Outfit, sans-serif' }}>
                    Busca y reserva citas con los mejores profesionales cerca de ti.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {FEATURES_CLIENT.map(f => (
                      <span key={f} style={{ fontSize: 11, color: 'rgba(247,242,234,0.4)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 100, padding: '3px 10px', fontFamily: 'Outfit, sans-serif' }}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* PRO card */}
          <Link to="/register/pro" style={{ textDecoration: 'none' }}>
            <div className="reg-card reg-card-pro" style={{
              position: 'relative', borderRadius: 24, overflow: 'hidden',
              border: '1px solid rgba(201,150,90,0.25)',
              background: 'linear-gradient(135deg, rgba(201,150,90,0.07) 0%, rgba(201,150,90,0.02) 100%)',
              padding: '28px 24px', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}>
              {/* Gold left accent */}
              <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2, background: 'linear-gradient(180deg, transparent, #C9965A, transparent)', borderRadius: 2 }} />
              {/* GRATIS badge */}
              <div style={{ position: 'absolute', top: 20, right: 20, background: 'linear-gradient(135deg,#C9965A,#E8B97A)', color: '#0A0806', fontSize: 9, fontWeight: 800, padding: '4px 10px', borderRadius: 100, letterSpacing: '0.1em', fontFamily: 'Outfit, sans-serif' }}>GRATIS</div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(201,150,90,0.1)', border: '1px solid rgba(201,150,90,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
                  ✂️
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 500, color: '#F7F2EA', margin: 0 }}>Soy profesional</h2>
                    <span style={{ fontSize: 18, color: '#C9965A', transition: 'all 0.3s' }} className="reg-arrow">→</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.4)', lineHeight: 1.6, margin: '0 0 16px', fontFamily: 'Outfit, sans-serif' }}>
                    Gestiona tu negocio y recibe reservas online las 24h del día.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {FEATURES_PRO.map(f => (
                      <span key={f} style={{ fontSize: 11, color: 'rgba(201,150,90,0.6)', background: 'rgba(201,150,90,0.07)', border: '1px solid rgba(201,150,90,0.15)', borderRadius: 100, padding: '3px 10px', fontFamily: 'Outfit, sans-serif' }}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Login link */}
        <p style={{ textAlign: 'center', color: 'rgba(247,242,234,0.25)', fontSize: 14, marginTop: 32, fontFamily: 'Outfit, sans-serif' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#C9965A', textDecoration: 'none', fontWeight: 500 }}>Inicia sesión</Link>
        </p>
      </div>

      <style>{`
        .reg-card-client:hover, .reg-card-client:active {
          border-color: rgba(247,242,234,0.2) !important;
          background: rgba(255,255,255,0.04) !important;
          transform: scale(1.01);
        }
        .reg-card-pro:hover, .reg-card-pro:active {
          border-color: rgba(201,150,90,0.5) !important;
          background: linear-gradient(135deg, rgba(201,150,90,0.12) 0%, rgba(201,150,90,0.04) 100%) !important;
          transform: scale(1.01);
        }
        .reg-card:hover .reg-arrow { color: #C9965A !important; transform: translateX(4px); }
      `}</style>
    </div>
  )
}
