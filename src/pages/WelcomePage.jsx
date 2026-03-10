import { Link } from 'react-router-dom'

export default function WelcomePage() {
  return (
    <div style={{ minHeight: '100dvh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <style>{`
        @keyframes bounceIn { 0% { transform: scale(0.5) translateY(-20px); opacity: 0 } 60% { transform: scale(1.15) translateY(0); opacity: 1 } 80% { transform: scale(0.95) } 100% { transform: scale(1) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: none } }
        .welcome-emoji { animation: bounceIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .welcome-content { animation: fadeUp 0.5s 0.2s ease both; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <div className="welcome-emoji" style={{ fontSize: '4rem', marginBottom: 20 }}>🎉</div>

        <div className="welcome-content">
          <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#1A1612' }}>
            TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
          </Link>

          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 300, marginTop: 20, marginBottom: 12, color: '#1A1612' }}>
            ¡Bienvenido a <em style={{ color: '#B8833A' }}>TopSy</em>!
          </h1>
          <p style={{ color: 'rgba(26,22,18,0.45)', fontSize: 15, lineHeight: 1.7, marginBottom: 36, fontFamily: 'Outfit, sans-serif' }}>
            Tu cuenta ha sido confirmada correctamente.<br />
            Ya puedes reservar citas con los mejores profesionales.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
            {[
              { icon: '📅', text: 'Reservas instantáneas' },
              { icon: '⭐', text: 'Profesionales verificados' },
              { icon: '🔔', text: 'Recordatorios automáticos' },
            ].map(f => (
              <div key={f.text} style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 100, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.55)', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto' }}>
            <Link to="/login" style={{
              display: 'block', background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF',
              textDecoration: 'none', padding: '16px 32px', borderRadius: 14, fontWeight: 700,
              fontSize: 15, fontFamily: 'Outfit, sans-serif', boxShadow: '0 6px 20px rgba(184,131,58,0.3)',
            }}>
              Iniciar sesión →
            </Link>
            <Link to="/search" style={{
              display: 'block', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.1)',
              color: 'rgba(26,22,18,0.6)', textDecoration: 'none', padding: '14px 32px',
              borderRadius: 14, fontSize: 14, fontFamily: 'Outfit, sans-serif', fontWeight: 500,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              Explorar profesionales
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
