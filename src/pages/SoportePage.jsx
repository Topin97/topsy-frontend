import { Link } from 'react-router-dom'
import { useState } from 'react'

const SECTIONS = [
  {
    id: 'contacto',
    title: 'Contactar con soporte',
    icon: '✉️',
    content: `Si tienes cualquier duda, problema o sugerencia sobre TopSy, estamos aquí para ayudarte.

**Email de soporte:** hola@topsy.es

Escríbenos a esa dirección y te responderemos lo antes posible, normalmente en menos de 48 horas.

Cuando nos escribas, intenta incluir:
- Una descripción del problema o la duda
- Tu dispositivo (iPhone, Android) si es un problema técnico
- Capturas de pantalla si pueden ayudar`,
  },
  {
    id: 'faq',
    title: 'Preguntas frecuentes',
    icon: '❓',
    content: `**¿Qué es TopSy?**
TopSy es un marketplace que conecta clientes con profesionales de belleza y bienestar (peluquerías, barberías, centros de estética) para reservar citas de forma rápida y sencilla.

**¿Cuánto cuesta usar TopSy?**
TopSy es gratuito para los clientes. Para los profesionales también es gratuito en el lanzamiento.

**¿Cómo reservo una cita?**
Busca un profesional, elige el servicio que quieres, selecciona día y hora disponible y confirma la reserva. Recibirás una confirmación.

**¿Cómo cancelo o reagendo una cita?**
Desde tu perfil, en el apartado de reservas, puedes cancelar o reagendar tus citas.

**¿Cómo me doy de baja?**
Puedes eliminar tu cuenta desde tu perfil, en la opción "Eliminar mi cuenta", o consultando la página de eliminación de cuenta.`,
  },
  {
    id: 'problemas',
    title: 'Problemas técnicos',
    icon: '🛠️',
    content: `Si la aplicación no funciona correctamente, prueba lo siguiente:

- Cierra la aplicación por completo y vuelve a abrirla
- Comprueba que tienes conexión a internet
- Asegúrate de tener la última versión de la app instalada
- Reinicia tu dispositivo

Si el problema continúa, escríbenos a hola@topsy.es describiendo qué ha ocurrido y desde qué dispositivo, y lo solucionaremos lo antes posible.`,
  },
]

export default function SoportePage() {
  const [activeSection, setActiveSection] = useState('contacto')

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif', background: '#F7F5F2', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }
        .section-card { animation: fadeUp 0.4s ease both; transition: all 0.2s; }
        .section-card:hover { border-color: rgba(184,131,58,0.3) !important; box-shadow: 0 6px 24px rgba(184,131,58,0.08) !important; }
        .prose h2 { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 600; color: #1A1612; margin: 16px 0 6px; }
        .prose p { margin: 0 0 10px; }
        .prose strong { color: #1A1612; font-weight: 700; }
      `}</style>

      <div style={{ background: 'linear-gradient(135deg, #1A0F05 0%, #2C1A08 100%)', padding: 'clamp(48px,8vw,80px) 20px clamp(40px,6vw,64px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(184,131,58,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(247,245,242,0.45)', textDecoration: 'none', fontSize: 13, fontFamily: 'Outfit, sans-serif', marginBottom: 24 }}>
            ← Volver a TopSy
          </Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(184,131,58,0.15)', border: '1px solid rgba(184,131,58,0.3)', borderRadius: 100, padding: '5px 16px', marginBottom: 20 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#D4A055', fontWeight: 700 }}>TopSy · Centro de ayuda</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.4rem,6vw,4rem)', fontWeight: 300, color: '#F7F5F2', margin: '0 0 14px', lineHeight: 1.05 }}>
            Soporte y <em style={{ color: '#D4A055' }}>ayuda</em>
          </h1>
          <p style={{ color: 'rgba(247,245,242,0.45)', fontSize: 15, lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
            ¿Necesitas ayuda con <strong style={{ color: 'rgba(247,245,242,0.7)' }}>TopSy</strong>? Aquí encontrarás respuestas a las preguntas más comunes y la forma de contactar con nuestro equipo.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(32px,5vw,56px) 20px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SECTIONS.map((section, i) => (
            <div
              key={section.id}
              id={section.id}
              className="section-card"
              style={{ animationDelay: `${i * 0.04}s`, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
            >
              <button
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(184,131,58,0.08)', border: '1.5px solid rgba(184,131,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    {section.icon}
                  </div>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 600, color: '#1A1612', lineHeight: 1.2 }}>
                    {section.title}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.3)', transition: 'transform 0.2s', transform: activeSection === section.id ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>▼</span>
              </button>

              {activeSection === section.id && (
                <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="prose" style={{ paddingTop: 18 }}>
                    {section.content.split('\n\n').map((block, j) => {
                      if (block.startsWith('**') && block.endsWith('**') && !block.slice(2).includes('**')) {
                        return <h2 key={j}>{block.slice(2, -2)}</h2>
                      }
                      const parts = block.split(/(\*\*[^*]+\*\*)/)
                      return (
                        <p key={j} style={{ fontSize: 14, color: 'rgba(26,22,18,0.65)', lineHeight: 1.75, margin: '0 0 12px', fontFamily: 'Outfit, sans-serif' }}>
                          {parts.map((part, k) =>
                            part.startsWith('**') && part.endsWith('**')
                              ? <strong key={k} style={{ color: '#1A1612', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
                              : part
                          )}
                        </p>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={{ background: 'linear-gradient(135deg, #1A0F05, #2C1A08)', borderRadius: 20, padding: 'clamp(28px,4vw,40px) clamp(24px,4vw,40px)', position: 'relative', overflow: 'hidden', marginTop: 8 }}>
            <div style={{ position: 'absolute', top: '50%', right: '-5%', transform: 'translateY(-50%)', width: 300, height: 300, background: 'radial-gradient(circle, rgba(184,131,58,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(212,160,85,0.7)', marginBottom: 12, fontWeight: 700 }}>Escribenos</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 300, color: '#F7F5F2', margin: '0 0 10px' }}>
                Estamos aqui para <em style={{ color: '#D4A055' }}>ayudarte</em>
              </h2>
              <p style={{ color: 'rgba(247,245,242,0.45)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px', maxWidth: 480 }}>
                Cualquier duda o problema con TopSy, escribenos y te responderemos lo antes posible.
              </p>
              <a href="mailto:hola@topsy.es" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', textDecoration: 'none', padding: '13px 26px', borderRadius: 13, fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', boxShadow: '0 6px 20px rgba(184,131,58,0.4)' }}>
                hola@topsy.es
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
