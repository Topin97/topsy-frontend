import { Link, useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#F8F5F0', position: 'relative', overflow: 'hidden', fontFamily: 'Outfit, sans-serif' }}>
      {/* Decoración fondo */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(184,131,58,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', position: 'relative', maxWidth: 460 }}>
        {/* Número grande decorativo */}
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(7rem, 22vw, 13rem)', fontWeight: 300, color: 'rgba(184,131,58,0.12)', lineHeight: 1, margin: 0, userSelect: 'none' }}>404</p>

        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 600, color: '#1A1612', marginTop: -16, marginBottom: 12 }}>
          Página no <em style={{ color: '#B8833A' }}>encontrada</em>
        </h1>

        <p style={{ color: 'rgba(24,21,18,0.45)', fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
          La página que buscas no existe o ha sido movida. Vuelve al inicio o prueba a buscar un profesional.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', textDecoration: 'none', padding: '13px 28px', borderRadius: 14, fontWeight: 700, fontSize: 14, boxShadow: '0 6px 18px rgba(184,131,58,0.3)' }}>
            Ir al inicio
          </Link>
          <button onClick={() => navigate(-1)} style={{ background: '#FFFFFF', border: '1.5px solid rgba(17,17,17,0.1)', color: 'rgba(24,21,18,0.6)', padding: '13px 28px', borderRadius: 14, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            ← Volver
          </button>
        </div>
      </div>
    </div>
  )
}
