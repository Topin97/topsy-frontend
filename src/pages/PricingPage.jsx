import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Capacitor } from '@capacitor/core'

const FREE_FEATURES = [
  { icon: '👤', label: 'Perfil profesional completo' },
  { icon: '📅', label: 'Reservas ilimitadas' },
  { icon: '🗓️', label: 'Calendario con disponibilidad' },
  { icon: '🖼️', label: 'Galería de fotos (hasta 5)' },
  { icon: '⏳', label: 'Lista de espera para clientes' },
  { icon: '🚫', label: 'Auto-ban a clientes problemáticos' },
  { icon: '📧', label: 'Emails automáticos a clientes' },
  { icon: '🔔', label: 'Notificaciones push (próximamente)' },
  { icon: '⭐', label: 'Reseñas verificadas' },
  { icon: '🔗', label: 'Sincronización con Google Calendar' },
]

const PRO_FEATURES = [
  { icon: '✨', label: 'Todo lo del Plan Free' },
  { icon: '💳', label: 'Cobros con tarjeta y reserva anticipada' },
  { icon: '📊', label: 'Dashboard analítico avanzado' },
  { icon: '🎯', label: 'Promociones y descuentos personalizados' },
  { icon: '🤖', label: 'Asistente IA para responder clientes' },
  { icon: '🎨', label: 'Personalización avanzada del perfil' },
  { icon: '🏆', label: 'Mejor posicionamiento en búsquedas' },
  { icon: '🎁', label: 'Programa de fidelización para tus clientes' },
  { icon: '⚡', label: 'Soporte prioritario 24/7' },
  { icon: '📈', label: 'Marketing dirigido y promoción' },
]

export default function PricingPage() {
  // iOS nativo: ocultar planes/precios (Apple Guideline 3.1.1)
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
    if (typeof window !== 'undefined') window.location.replace('/')
    return null
  }
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)

  const handleStartFree = () => {
    if (user) {
      if (user.role === 'professional') {
        navigate('/pro/dashboard')
      } else {
        navigate('/register/pro')
      }
    } else {
      navigate('/register/pro')
    }
  }

  const handleNotifyPro = () => {
    // TODO: cuando esté lista la mutation de waitlist comercial, integrar aquí
    alert('¡Gracias por tu interés! Te avisaremos cuando esté disponible 💌')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', fontFamily: 'Outfit, sans-serif', paddingBottom: 60 }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 8px 32px rgba(184,131,58,0.25)}50%{box-shadow:0 8px 40px rgba(184,131,58,0.45),0 0 0 6px rgba(184,131,58,0.08)}}
        .fade-up{animation:fadeUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both}
        .slide-down{animation:slideDown 0.55s cubic-bezier(0.34,1.56,0.64,1) both}
        .plan-card{transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.3s}
        .plan-card:hover{transform:translateY(-6px)}
        .plan-pro{animation:pulseGlow 3s ease-in-out infinite 1.5s}
        .cta-btn{transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.2s,opacity 0.2s}
        .cta-btn:hover{transform:translateY(-2px)}
        .cta-btn:active{transform:translateY(0) scale(0.98)}
        .back-btn{transition:transform 0.2s,background 0.2s}
        .back-btn:hover{background:rgba(0,0,0,0.06);transform:translateX(-2px)}
        @media (max-width:760px){
          .plans-grid{grid-template-columns:1fr !important;gap:16px !important}
          .hero-h1{font-size:1.9rem !important}
          .hero-sub{font-size:0.95rem !important}
        }
        @media (prefers-reduced-motion:reduce){
          .fade-up,.slide-down,.plan-pro{animation:none !important;opacity:1 !important;transform:none !important}
          .plan-card,.cta-btn,.back-btn{transition:none !important}
        }
      `}</style>

      {/* Header */}
      <div className="slide-down" style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => navigate(-1)} className="back-btn"
          style={{ background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontSize: 14, fontFamily: 'Outfit, sans-serif', color: 'rgba(26,22,18,0.65)' }}>
          ←
        </button>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 600, margin: 0, color: '#1A1612' }}>Planes y precios</h2>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '48px 20px 24px', textAlign: 'center' }}>
        <p className="fade-up" style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#B8833A', fontWeight: 700, margin: 0 }}>
          ★ Para profesionales
        </p>
        <h1 className="fade-up hero-h1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 700, color: '#1A1612', margin: '14px 0 14px', lineHeight: 1.1, animationDelay: '0.05s' }}>
          Crece con TopSy
        </h1>
        <p className="fade-up hero-sub" style={{ fontSize: '1.05rem', color: 'rgba(26,22,18,0.55)', maxWidth: 540, margin: '0 auto', lineHeight: 1.6, animationDelay: '0.1s' }}>
          Empieza gratis hoy. Cuando lo necesites, pásate al Plan Pro y multiplica tus reservas con herramientas avanzadas.
        </p>
      </div>

      {/* Planes */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 20px' }}>
        <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'stretch' }}>

          {/* PLAN FREE */}
          <div className="plan-card fade-up" style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 22, padding: '32px 26px', display: 'flex', flexDirection: 'column', animationDelay: '0.2s', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.4)', fontWeight: 700, margin: 0 }}>
              ◯ Plan Free
            </p>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, color: '#1A1612', margin: '8px 0 6px' }}>
              Para empezar
            </h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem', color: '#1A1612', fontWeight: 700, lineHeight: 1 }}>0€</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.5)', marginBottom: 22, lineHeight: 1.5 }}>
              Todo lo que necesitas para gestionar tu negocio.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
              {FREE_FEATURES.map((f, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', fontSize: 13.5, color: '#1A1612', fontFamily: 'Outfit, sans-serif' }}>
                  <span style={{ fontSize: 14, opacity: 0.85, marginTop: 1, flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ lineHeight: 1.5 }}>{f.label}</span>
                </li>
              ))}
            </ul>

            <button onClick={handleStartFree} className="cta-btn"
              style={{ width: '100%', background: '#1A1612', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: '15px', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', letterSpacing: '0.02em', boxShadow: '0 6px 18px rgba(26,15,5,0.18)' }}>
              Empieza ahora →
            </button>
          </div>

          {/* PLAN PRO */}
          <div className="plan-card plan-pro fade-up" style={{ background: 'linear-gradient(165deg, #FFFFFF 0%, #FDF8F0 100%)', border: '2px solid #B8833A', borderRadius: 22, padding: '32px 26px', display: 'flex', flexDirection: 'column', animationDelay: '0.3s', position: 'relative', overflow: 'hidden' }}>
            {/* Badge esquina */}
            <div style={{ position: 'absolute', top: 14, right: 14, background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 11px', borderRadius: 999, boxShadow: '0 2px 8px rgba(184,131,58,0.3)' }}>
              ✦ Próximamente
            </div>

            <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8833A', fontWeight: 700, margin: 0 }}>
              ✦ Plan Pro
            </p>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, color: '#1A1612', margin: '8px 0 6px' }}>
              Para crecer
            </h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#B8833A', fontStyle: 'italic', fontWeight: 700, lineHeight: 1 }}>Pronto</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.5)', marginBottom: 22, lineHeight: 1.5 }}>
              Multiplica tus reservas con herramientas profesionales avanzadas.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
              {PRO_FEATURES.map((f, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', fontSize: 13.5, color: '#1A1612', fontFamily: 'Outfit, sans-serif' }}>
                  <span style={{ fontSize: 14, opacity: 0.95, marginTop: 1, flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ lineHeight: 1.5 }}>{f.label}</span>
                </li>
              ))}
            </ul>

            <button onClick={handleNotifyPro} className="cta-btn"
              style={{ width: '100%', background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: '15px', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', letterSpacing: '0.02em', boxShadow: '0 6px 18px rgba(184,131,58,0.3)' }}>
              💌 Avísame cuando salga
            </button>
          </div>

        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 20px 30px' }}>
        <h2 className="fade-up" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 700, color: '#1A1612', textAlign: 'center', marginBottom: 28, animationDelay: '0.4s' }}>
          Preguntas frecuentes
        </h2>

        {[
          {
            q: '¿El Plan Free es gratis siempre?',
            a: 'Por ahora sí, el Plan Free es totalmente gratuito y queremos que siga así mucho tiempo. Si algún día cambiamos algo, te avisaremos con antelación.',
          },
          {
            q: '¿Hay comisiones por reserva?',
            a: 'Actualmente no cobramos comisión sobre tus reservas. El cliente paga directamente a ti en tu local, como siempre.',
          },
          {
            q: '¿Cuándo estará disponible el Plan Pro?',
            a: 'Estamos terminando los últimos detalles. Apúntate a la lista de espera y serás de los primeros en saberlo, con un descuento de lanzamiento.',
          },
          {
            q: '¿Puedo cambiar de plan más adelante?',
            a: 'Sí. Cuando se lance el Plan Pro, podrás activarlo o desactivarlo desde tu panel sin perder ninguno de tus datos.',
          },
        ].map((faq, idx) => (
          <div key={idx} className="fade-up" style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.06)', borderRadius: 14, padding: '16px 20px', marginBottom: 10, animationDelay: `${0.45 + idx * 0.06}s` }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1612', margin: '0 0 6px', fontFamily: 'Outfit, sans-serif' }}>{faq.q}</p>
            <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.55)', margin: 0, lineHeight: 1.6, fontFamily: 'Outfit, sans-serif' }}>{faq.a}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="fade-up" style={{ textAlign: 'center', padding: '20px 20px 40px', animationDelay: '0.75s' }}>
        <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.4)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
          ¿Tienes alguna duda? Escríbenos a{' '}
          <a href="mailto:hola@topsy.es" style={{ color: '#B8833A', fontWeight: 600, textDecoration: 'none' }}>hola@topsy.es</a>
        </p>
      </div>
    </div>
  )
}
