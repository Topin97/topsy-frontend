import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(201,150,90,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', position: 'relative' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(6rem, 20vw, 12rem)', fontWeight: 300, color: 'rgba(201,150,90,0.15)', lineHeight: 1, marginBottom: 0 }}>404</p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 300, marginTop: -20, marginBottom: 12 }}>
          Página no <em style={{ color: '#C9965A' }}>encontrada</em>
        </h1>
        <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 15, marginBottom: 40, maxWidth: 360, margin: '0 auto 40px' }}>
          La página que buscas no existe o ha sido movida.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ background: 'linear-gradient(135deg, #C9965A, #E8B97A)', color: '#0A0806', textDecoration: 'none', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>
            Ir al inicio
          </Link>
          <Link to="/search" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(247,242,234,0.6)', textDecoration: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>
            Buscar profesionales
          </Link>
        </div>
      </div>
    </div>
  )
}