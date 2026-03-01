import { Link } from 'react-router-dom'

export default function WelcomePage() {
  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(201,150,90,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: '4rem', marginBottom: 24, animation: 'bounce 1s ease' }}>🎉</div>

        <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#F7F2EA' }}>
          TOP<span style={{ color: '#C9965A', fontStyle: 'italic' }}>sy</span>
        </Link>

        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 300, marginTop: 20, marginBottom: 12 }}>
          ¡Bienvenido a <em style={{ color: '#C9965A' }}>TopSy</em>!
        </h1>
        <p style={{ color: 'rgba(247,242,234,0.45)', fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
          Tu cuenta ha sido confirmada correctamente.<br />
          Ya puedes reservar citas con los mejores profesionales.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '0 auto 40px' }}>
          <Link to="/login" style={{ display: 'block', background: 'linear-gradient(135deg, #C9965A, #E8B97A)', color: '#0A0806', textDecoration: 'none', padding: '16px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15, fontFamily: 'Outfit, sans-serif' }}>
            Iniciar sesión →
          </Link>
          <Link to="/search" style={{ display: 'block', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(247,242,234,0.6)', textDecoration: 'none', padding: '14px 32px', borderRadius: 12, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>
            Explorar profesionales
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          {[
            { icon: '📅', text: 'Reservas instantáneas' },
            { icon: '⭐', text: 'Profesionales verificados' },
            { icon: '🔔', text: 'Recordatorios automáticos' },
          ].map(f => (
            <div key={f.text} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: 6 }}>{f.icon}</p>
              <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }`}</style>
    </div>
  )
}