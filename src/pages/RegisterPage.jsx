import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [transitioning, setTransitioning] = useState(null) // 'client' | 'pro' | null

  const handleSelect = (type) => {
    setTransitioning(type)
    setTimeout(() => {
      navigate(type === 'client' ? '/register/client' : '/register/pro')
    }, 900)
  }

  const isClientTransition = transitioning === 'client'
  const isProTransition = transitioning === 'pro'

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes flashIn{0%{opacity:0}30%{opacity:1}100%{opacity:1}}
        @keyframes zoomCard{0%{transform:scale(1);border-radius:18px}100%{transform:scale(20);border-radius:0}}
        @keyframes fadeOutContent{0%{opacity:1}100%{opacity:0}}
        @keyframes floatUp{0%{transform:translateY(100vh) scale(0);opacity:0}50%{opacity:1}100%{transform:translateY(-20vh) scale(1.2);opacity:0}}
        @keyframes rotateGlow{0%{transform:rotate(0deg) scale(0)}50%{transform:rotate(180deg) scale(1.5);opacity:1}100%{transform:rotate(360deg) scale(3);opacity:0}}

        .fade-up{animation:fadeUp 0.4s ease forwards}
        .role-card{transition:all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);position:relative;overflow:hidden}
        .role-card:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(184,131,58,0.18) !important;border-color:#B8833A !important}
        .role-card::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(184,131,58,0.1),transparent);transition:left 0.6s}
        .role-card:hover::before{left:100%}

        .transition-overlay{
          position:fixed;
          inset:0;
          z-index:1000;
          pointer-events:none;
        }

        .transition-zoom-client{
          position:absolute;
          inset:0;
          background:linear-gradient(135deg,#FFFFFF 0%,#FAF7F2 100%);
          animation:flashIn 0.4s ease forwards;
        }

        .transition-zoom-pro{
          position:absolute;
          inset:0;
          background:linear-gradient(180deg,#1A1612 0%,#0F0A06 100%);
          animation:flashIn 0.4s ease forwards;
        }

        .transition-icon{
          position:absolute;
          top:50%;
          left:50%;
          transform:translate(-50%,-50%);
          font-size:80px;
          animation:rotateGlow 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .transition-particle{
          position:absolute;
          width:6px;
          height:6px;
          background:radial-gradient(circle, #D4A055 0%, transparent 70%);
          border-radius:50%;
          box-shadow:0 0 10px #D4A055;
          animation:floatUp 1s ease forwards;
        }

        .content-fadeout{
          animation:fadeOutContent 0.3s ease forwards;
        }
      `}</style>

      {/* Overlay de transición */}
      {transitioning && (
        <div className="transition-overlay">
          <div className={transitioning === 'client' ? 'transition-zoom-client' : 'transition-zoom-pro'} />
          <div className="transition-icon" style={{ filter: 'drop-shadow(0 0 30px rgba(212,160,85,0.8))' }}>
            {transitioning === 'client' ? '✨' : '✂️'}
          </div>
          {/* Partículas explotando hacia arriba */}
          {transitioning === 'pro' && Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="transition-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${50 + Math.random() * 30}%`,
                animationDelay: `${Math.random() * 0.3}s`,
                animationDuration: `${0.8 + Math.random() * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid rgba(26,22,18,0.06)', background: 'rgba(255,255,255,0.92)' }} className={transitioning ? 'content-fadeout' : ''}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,22,18,0.5)', fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>
          ← Volver
        </button>
        <Link to="/" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', color: '#1A1612' }}>
          TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
        </Link>
        <div style={{ width: 60 }} />
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 24px', maxWidth: 520, margin: '0 auto', width: '100%' }} className={transitioning ? 'content-fadeout' : ''}>

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
          <button onClick={() => handleSelect('client')} className="role-card" style={{
            display: 'flex', alignItems: 'center', gap: 18, padding: '22px 24px',
            background: '#FFFFFF', border: '1.5px solid rgba(26,22,18,0.1)', borderRadius: 18,
            cursor: 'pointer', boxShadow: '0 2px 12px rgba(26,22,18,0.04)',
            fontFamily: 'inherit', textAlign: 'left', width: '100%',
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
          </button>

          {/* Profesional */}
          <button onClick={() => handleSelect('pro')} className="role-card" style={{
            display: 'flex', alignItems: 'center', gap: 18, padding: '22px 24px',
            background: 'linear-gradient(135deg, rgba(184,131,58,0.04) 0%, rgba(212,160,85,0.06) 100%)',
            border: '1.5px solid rgba(184,131,58,0.18)', borderRadius: 18,
            cursor: 'pointer', boxShadow: '0 2px 12px rgba(184,131,58,0.08)',
            fontFamily: 'inherit', textAlign: 'left', width: '100%', position: 'relative',
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
          </button>
        </div>

        <p className="fade-up" style={{ textAlign: 'center', color: 'rgba(26,22,18,0.5)', fontSize: 14, marginTop: 36, fontFamily: 'Outfit, sans-serif' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#1A1612', fontWeight: 700, textDecoration: 'none' }}>Iniciar sesión</Link>
        </p>

      </main>
    </div>
  )
}
