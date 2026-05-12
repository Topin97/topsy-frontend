import { Link, useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .fade-up{animation:fadeUp 0.4s ease forwards}
        .role-card{transition:all 0.2s ease}
        .role-card:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(184,131,58,0.18) !important;border-color:#B8833A !important}
      `}</style>

      {/* Header */}
      <header style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid rgba(26,22,18,0.06)', background: 'rgba(255,255,255,0.92)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,22,18,0.5)', fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>
          ← Volver
        </button>
        <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#1A1612' }}>
          TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
        </Link>
        <div style={{ width: 60 }} />
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 24px', maxWidth: 520, margin: '0 auto', width: '100%' }}>

        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 7vw, 3rem)', fontWeight: 400, lineHeight: 1.05, color: '#1A1612', margin: 0 }}>
            Únete a <em style={{ color: '#B8833A', fontStyle: 'italic' }}>TopSy</em>
          </h1>
          <p style={{ marginTop: 16, color: 'rgba(26,22,18,0.5)', fontSize: 15, lineHeight: 1.6, fontFamily: 'Outfit, sans-serif' }}>
            ¿Cómo quieres usar TopSy?
          </p>
        </div>

        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Cliente */}
          <Link to="/register/client" className="role-card" style={{
            display: 'flex', alignItems: 'center', gap: 18, padding: '22px 24px',
            background: '#FFFFFF', border: '1.5px solid rgba(26,22,18,0.1)', borderRadius: 18,
            textDecoration: 'none', boxShadow: '0 2px 12px rgba(26,22,18,0.04)',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(184,131,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
              ✨
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 700, color: '#1A1612', marginBottom: 4 }}>
                Soy cliente
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(26,22,18,0.5)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.5 }}>
                Reservar citas en salones de belleza y bienestar
              </p>
            </div>
            <span style={{ fontSize: 20, color: 'rgba(26,22,18,0.3)' }}>→</span>
          </Link>

          {/* Profesional */}
          <Link to="/register/pro" className="role-card" style={{
            display: 'flex', alignItems: 'center', gap: 18, padding: '22px 24px',
            background: 'linear-gradient(135deg, rgba(184,131,58,0.04) 0%, rgba(212,160,85,0.06) 100%)',
            border: '1.5px solid rgba(184,131,58,0.18)', borderRadius: 18,
            textDecoration: 'none', boxShadow: '0 2px 12px rgba(184,131,58,0.08)',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: 12, right: 14, background: 'linear-gradient(135deg, #B8833A, #D4A055)', color: '#FFFFFF', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, fontFamily: 'Outfit, sans-serif' }}>
              Pro
            </div>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #B8833A, #D4A055)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0, color: '#FFFFFF', boxShadow: '0 4px 14px rgba(184,131,58,0.3)' }}>
              ✂️
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 700, color: '#1A1612', marginBottom: 4 }}>
                Soy profesional
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(26,22,18,0.55)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.5 }}>
                Gestionar mi negocio y recibir reservas
              </p>
            </div>
            <span style={{ fontSize: 20, color: '#B8833A' }}>→</span>
          </Link>
        </div>

        {/* Login */}
        <p className="fade-up" style={{ textAlign: 'center', color: 'rgba(26,22,18,0.5)', fontSize: 14, marginTop: 36, fontFamily: 'Outfit, sans-serif' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#1A1612', fontWeight: 700, textDecoration: 'none' }}>Iniciar sesión</Link>
        </p>

      </main>
    </div>
  )
}
