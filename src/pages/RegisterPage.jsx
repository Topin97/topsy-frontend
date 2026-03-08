import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(201,150,90,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(201,150,90,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 580, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#F7F2EA' }}>
            TOP<span style={{ color: '#C9965A', fontStyle: 'italic' }}>sy</span>
          </Link>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 300, marginTop: 24, marginBottom: 10 }}>
            ¿Cómo quieres <em style={{ color: '#C9965A' }}>usar TopSy?</em>
          </h1>
          <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 15 }}>Elige tu perfil para crear tu cuenta</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Client card */}
          <Link to="/register/client" style={{ textDecoration: 'none' }}>
            <div className="register-card" style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24, padding: '36px 28px', cursor: 'pointer',
              transition: 'all 0.3s ease', height: '100%', boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>👤</div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 400, color: '#F7F2EA', marginBottom: 12 }}>Soy cliente</h2>
              <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.4)', lineHeight: 1.7, marginBottom: 24 }}>
                Busca profesionales cerca de ti y reserva citas en segundos.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                {['Reserva en segundos', 'Recordatorios automáticos', 'Historial de citas'].map(f => (
                  <li key={f} style={{ fontSize: 12, color: 'rgba(247,242,234,0.5)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#C9965A', fontSize: 10 }}>✦</span> {f}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#C9965A', fontSize: 13, fontWeight: 600 }}>
                Crear cuenta <span style={{ fontSize: 16 }}>→</span>
              </div>
            </div>
          </Link>

          {/* Pro card */}
          <Link to="/register/pro" style={{ textDecoration: 'none' }}>
            <div className="register-card-pro" style={{
              background: 'rgba(201,150,90,0.04)', border: '1px solid rgba(201,150,90,0.2)',
              borderRadius: 24, padding: '36px 28px', cursor: 'pointer',
              transition: 'all 0.3s ease', position: 'relative', height: '100%', boxSizing: 'border-box',
            }}>
              <div style={{ position: 'absolute', top: 20, right: 20, background: 'linear-gradient(135deg,#C9965A,#E8B97A)', color: '#0A0806', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100, letterSpacing: '0.05em' }}>GRATIS</div>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>✂️</div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 400, color: '#F7F2EA', marginBottom: 12 }}>Soy profesional</h2>
              <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.4)', lineHeight: 1.7, marginBottom: 24 }}>
                Gestiona tu negocio y recibe reservas online las 24h.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                {['Agenda online 24/7', 'Notificaciones de reservas', 'Panel de estadísticas'].map(f => (
                  <li key={f} style={{ fontSize: 12, color: 'rgba(247,242,234,0.5)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#C9965A', fontSize: 10 }}>✦</span> {f}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#C9965A', fontSize: 13, fontWeight: 600 }}>
                Registrar negocio <span style={{ fontSize: 16 }}>→</span>
              </div>
            </div>
          </Link>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(247,242,234,0.3)', fontSize: 14, marginTop: 32 }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#C9965A', textDecoration: 'none', fontWeight: 500 }}>Inicia sesión</Link>
        </p>
      </div>

      <style>{`
        .register-card:hover { border: 1px solid rgba(201,150,90,0.4) !important; background: rgba(201,150,90,0.05) !important; transform: translateY(-4px); }
        .register-card-pro:hover { border: 1px solid rgba(201,150,90,0.6) !important; background: rgba(201,150,90,0.08) !important; transform: translateY(-4px); }
      `}</style>
    </div>
  )
}