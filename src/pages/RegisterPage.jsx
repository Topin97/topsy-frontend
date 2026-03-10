import { Link } from 'react-router-dom'

const FEATURES_CLIENT = ['Reserva en segundos', 'Recordatorios automáticos', 'Historial de citas']
const FEATURES_PRO    = ['Agenda online 24/7', 'Notificaciones de reservas', 'Panel de estadísticas']

export default function RegisterPage() {
  return (
    <div style={{ minHeight: '100dvh', background: '#F7F5F2', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .reg-card { transition: all 0.25s ease; }
        .reg-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(184,131,58,0.12) !important; }
        .reg-card:active { transform: scale(0.99); }
        .reg-card-pro:hover { border-color: rgba(184,131,58,0.45) !important; }
        .reg-card-client:hover { border-color: rgba(26,22,18,0.2) !important; }
        .reg-arrow { transition: transform 0.25s; }
        .reg-card:hover .reg-arrow { transform: translateX(4px); }
      `}</style>

      {/* Logo */}
      <div style={{ padding: '32px 24px 0', textAlign: 'center' }}>
        <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '3px', textDecoration: 'none', color: '#1A1612' }}>
          TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
        </Link>
      </div>

      {/* Headline */}
      <div style={{ padding: '28px 24px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(184,131,58,0.08)', border: '1px solid rgba(184,131,58,0.2)', borderRadius: 100, padding: '4px 14px', marginBottom: 16 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8833A', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Bienvenido</span>
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 300, lineHeight: 1.1, color: '#1A1612', margin: 0 }}>
          ¿Cómo vas<br />a usar <em style={{ color: '#B8833A' }}>TopSy?</em>
        </h1>
        <p style={{ color: 'rgba(26,22,18,0.4)', fontSize: 14, marginTop: 12, fontFamily: 'Outfit, sans-serif' }}>Elige tu perfil para empezar</p>
      </div>

      {/* Cards */}
      <div style={{ padding: '28px 20px 0', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480, margin: '0 auto', width: '100%' }}>

        {/* CLIENT */}
        <Link to="/register/client" style={{ textDecoration: 'none' }}>
          <div className="reg-card reg-card-client" style={{
            background: '#FFFFFF', borderRadius: 20, border: '1.5px solid rgba(0,0,0,0.08)',
            padding: '22px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.45rem', fontWeight: 600, color: '#1A1612', margin: 0 }}>Soy cliente</h2>
                  <span className="reg-arrow" style={{ fontSize: 16, color: 'rgba(26,22,18,0.25)' }}>→</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.5)', lineHeight: 1.6, margin: '0 0 14px', fontFamily: 'Outfit, sans-serif' }}>
                  Busca y reserva citas con los mejores profesionales cerca de ti.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {FEATURES_CLIENT.map(f => (
                    <span key={f} style={{ fontSize: 11, color: 'rgba(26,22,18,0.45)', background: '#F7F5F2', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 100, padding: '3px 10px', fontFamily: 'Outfit, sans-serif' }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* PRO */}
        <Link to="/register/pro" style={{ textDecoration: 'none' }}>
          <div className="reg-card reg-card-pro" style={{
            background: '#FFFFFF', borderRadius: 20, border: '1.5px solid rgba(184,131,58,0.25)',
            padding: '22px 20px', boxShadow: '0 2px 16px rgba(184,131,58,0.08)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #B8833A, #D4A055)' }} />
            <div style={{ position: 'absolute', top: 18, right: 18, background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', fontSize: 9, fontWeight: 800, padding: '4px 10px', borderRadius: 100, letterSpacing: '0.1em', fontFamily: 'Outfit, sans-serif' }}>GRATIS</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginTop: 6 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(184,131,58,0.08)', border: '1.5px solid rgba(184,131,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>✂️</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.45rem', fontWeight: 600, color: '#1A1612', margin: 0 }}>Soy profesional</h2>
                  <span className="reg-arrow" style={{ fontSize: 16, color: '#B8833A' }}>→</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.5)', lineHeight: 1.6, margin: '0 0 14px', fontFamily: 'Outfit, sans-serif' }}>
                  Gestiona tu negocio y recibe reservas online las 24h del día.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {FEATURES_PRO.map(f => (
                    <span key={f} style={{ fontSize: 11, color: '#B8833A', background: 'rgba(184,131,58,0.07)', border: '1px solid rgba(184,131,58,0.18)', borderRadius: 100, padding: '3px 10px', fontFamily: 'Outfit, sans-serif' }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <p style={{ textAlign: 'center', color: 'rgba(26,22,18,0.35)', fontSize: 14, marginTop: 28, marginBottom: 32, fontFamily: 'Outfit, sans-serif' }}>
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" style={{ color: '#B8833A', textDecoration: 'none', fontWeight: 600 }}>Inicia sesión</Link>
      </p>
    </div>
  )
}
