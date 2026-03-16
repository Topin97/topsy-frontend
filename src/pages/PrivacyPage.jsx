
import { Link } from 'react-router-dom'
import { useState } from 'react'

const SECTIONS = [
  {
    id: 'responsable',
    title: 'Responsable del tratamiento',
    icon: '🏢',
    content: `El responsable del tratamiento de los datos personales recogidos a través de la aplicación y web TopSy es:

**Denominación:** TopSy
**Dominio:** topsy.es
**Email de contacto:** privacidad@topsy.es
**Ámbito:** España

Para cualquier consulta relacionada con el tratamiento de tus datos personales, puedes contactarnos en cualquier momento a través del email indicado.`,
  },
  {
    id: 'datos',
    title: 'Datos que recopilamos',
    icon: '📋',
    content: `Recopilamos únicamente los datos necesarios para prestarte el servicio:

**Datos de registro:**
- Nombre completo
- Dirección de email
- Contraseña (cifrada, nunca almacenada en texto plano)
- Número de teléfono (opcional)
- Foto de perfil (opcional)

**Datos de uso del servicio:**
- Reservas realizadas (fecha, servicio, profesional)
- Valoraciones y reseñas que publicas
- Mensajes y notas asociados a reservas

**Datos técnicos:**
- Dirección IP
- Tipo de dispositivo y sistema operativo
- Datos de sesión y autenticación

**Datos de profesionales:**
- Nombre comercial y dirección del negocio
- Servicios ofertados y precios
- Horarios de disponibilidad
- Imágenes de portada y galería

**Inicio de sesión con Google:**
Si te registras mediante Google OAuth, recibimos tu nombre, email y foto de perfil públicos de tu cuenta de Google. No accedemos a ningún otro dato de tu cuenta de Google.`,
  },
  {
    id: 'finalidad',
    title: 'Finalidad del tratamiento',
    icon: '🎯',
    content: `Tratamos tus datos para las siguientes finalidades:

**Gestión de la cuenta:** Crear y mantener tu cuenta de usuario, autenticarte y permitirte acceder al servicio.

**Prestación del servicio:** Procesar reservas, conectar clientes con profesionales, gestionar el historial de citas y enviar confirmaciones.

**Comunicaciones del servicio:** Enviar emails transaccionales como confirmaciones de reserva, recordatorios 24h antes de la cita, y notificaciones de cambios o cancelaciones.

**Mejora del servicio:** Analizar el uso de la plataforma de forma agregada y anónima para mejorar la experiencia de usuario.

**Cumplimiento legal:** Conservar los datos que la ley nos exige mantener durante los plazos establecidos.

No utilizamos tus datos para publicidad de terceros ni los vendemos bajo ningún concepto.`,
  },
  {
    id: 'base',
    title: 'Base legal',
    icon: '⚖️',
    content: `El tratamiento de tus datos se basa en las siguientes bases legales conforme al RGPD:

**Ejecución de un contrato (Art. 6.1.b RGPD):** El tratamiento es necesario para la prestación del servicio que nos solicitas al registrarte y realizar reservas.

**Consentimiento (Art. 6.1.a RGPD):** Para el envío de comunicaciones opcionales como newsletters o notificaciones promocionales, solicitamos tu consentimiento expreso que puedes retirar en cualquier momento.

**Interés legítimo (Art. 6.1.f RGPD):** Para la mejora del servicio, la seguridad de la plataforma y la prevención del fraude.

**Obligación legal (Art. 6.1.c RGPD):** Para el cumplimiento de obligaciones fiscales y legales aplicables.`,
  },
  {
    id: 'conservacion',
    title: 'Conservación de datos',
    icon: '🗂️',
    content: `Conservamos tus datos durante el tiempo estrictamente necesario:

**Datos de cuenta activa:** Mientras mantengas tu cuenta en TopSy.

**Tras eliminar la cuenta:** Los datos se anonimizarán o eliminarán en un plazo máximo de 30 días, salvo los que debamos conservar por obligación legal.

**Reservas y transacciones:** Conservamos el historial durante 5 años por obligaciones fiscales y contables.

**Datos de seguridad (logs):** Se eliminan automáticamente a los 90 días.

**Consentimientos:** Se conservan como prueba del consentimiento durante el tiempo que sea necesario para acreditar el cumplimiento legal.`,
  },
  {
    id: 'destinatarios',
    title: 'Destinatarios y transferencias',
    icon: '🔗',
    content: `Tus datos pueden ser compartidos con los siguientes terceros, exclusivamente para la prestación del servicio:

**Supabase (supabase.com):** Plataforma de base de datos y autenticación. Servidores en la Unión Europea. Cumple con el RGPD.

**Resend (resend.com):** Servicio de envío de emails transaccionales. Cumple con el RGPD y el Privacy Shield.

**Google LLC:** Si usas el inicio de sesión con Google. Sujeto a la política de privacidad de Google y a las salvaguardas establecidas por la Comisión Europea.

**Profesionales de TopSy:** Cuando realizas una reserva, el profesional correspondiente accede a tu nombre y datos de contacto necesarios para gestionar la cita.

No realizamos transferencias internacionales de datos fuera del Espacio Económico Europeo salvo con las garantías adecuadas exigidas por el RGPD.

Nunca vendemos, alquilamos ni cedemos tus datos a terceros con fines comerciales.`,
  },
  {
    id: 'derechos',
    title: 'Tus derechos',
    icon: '🛡️',
    content: `Conforme al RGPD y la LOPDGDD, tienes los siguientes derechos sobre tus datos:

**Acceso:** Solicitar información sobre qué datos tenemos sobre ti.

**Rectificación:** Corregir datos inexactos o incompletos.

**Supresión ("derecho al olvido"):** Solicitar la eliminación de tus datos cuando ya no sean necesarios.

**Oposición:** Oponerte al tratamiento de tus datos en determinadas circunstancias.

**Limitación:** Solicitar la restricción del tratamiento en ciertos casos.

**Portabilidad:** Recibir tus datos en formato estructurado y legible por máquina.

**Retirar el consentimiento:** En cualquier momento, sin que ello afecte a la licitud del tratamiento previo.

**Cómo ejercerlos:** Envía un email a privacidad@topsy.es indicando el derecho que deseas ejercer y adjuntando una copia de tu documento de identidad.

Respondemos en un plazo máximo de 30 días. También puedes presentar una reclamación ante la **Agencia Española de Protección de Datos (AEPD)** en www.aepd.es.`,
  },
  {
    id: 'seguridad',
    title: 'Seguridad',
    icon: '🔒',
    content: `Aplicamos medidas técnicas y organizativas apropiadas para proteger tus datos:

- **Cifrado en tránsito:** Todas las comunicaciones se realizan mediante HTTPS/TLS.
- **Cifrado de contraseñas:** Las contraseñas se almacenan con hash seguro (bcrypt). Nunca las vemos en texto plano.
- **Autenticación segura:** Tokens JWT con expiración y sistema de refresh tokens.
- **Acceso restringido:** Solo el personal autorizado accede a los datos, bajo estrictos controles de acceso.
- **Infraestructura segura:** Servidores con firewall, actualizaciones de seguridad automáticas y monitorización.
- **Backups:** Copias de seguridad regulares para garantizar la disponibilidad del servicio.

En caso de brecha de seguridad que afecte a tus datos, te notificaremos en el plazo legalmente establecido.`,
  },
  {
    id: 'menores',
    title: 'Menores de edad',
    icon: '👶',
    content: `TopSy no está dirigido a menores de 14 años. No recopilamos conscientemente datos de menores de esa edad.

Si eres menor de 14 años, no debes registrarte ni utilizar nuestros servicios sin el consentimiento y supervisión de tus padres o tutores legales.

Si tenemos conocimiento de que hemos recopilado datos de un menor sin el consentimiento adecuado, procederemos a eliminarlos de inmediato. Si detectas esta situación, notifícanos en privacidad@topsy.es.`,
  },
  {
    id: 'cookies',
    title: 'Cookies',
    icon: '🍪',
    content: `TopSy utiliza cookies y tecnologías similares para el funcionamiento del servicio:

**Cookies estrictamente necesarias:** Imprescindibles para el funcionamiento de la plataforma, como las cookies de sesión y autenticación. No requieren tu consentimiento.

**Cookies de preferencias:** Almacenan tus preferencias de uso como el idioma o la configuración de la app. Requieren consentimiento.

**Almacenamiento local (localStorage/sessionStorage):** Usamos el almacenamiento local del navegador para mantener tu sesión activa y guardar preferencias temporales.

No utilizamos cookies de publicidad ni de seguimiento de terceros.

Puedes configurar tu navegador para rechazar o eliminar cookies, aunque esto puede afectar al funcionamiento del servicio.`,
  },
  {
    id: 'cambios',
    title: 'Cambios en esta política',
    icon: '📝',
    content: `Podemos actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas o por requerimientos legales.

Cuando realicemos cambios significativos, te lo comunicaremos mediante:
- Un aviso destacado en la aplicación
- Un email a la dirección registrada en tu cuenta

La fecha de última actualización siempre aparecerá al inicio de este documento. Te recomendamos revisarla periódicamente.

El uso continuado del servicio tras la publicación de cambios implica la aceptación de la nueva política.`,
  },
]

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState(null)

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif', background: '#F7F5F2', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }
        .section-card { animation: fadeUp 0.4s ease both; transition: all 0.2s; }
        .section-card:hover { border-color: rgba(184,131,58,0.3) !important; box-shadow: 0 6px 24px rgba(184,131,58,0.08) !important; }
        .toc-item:hover { color: #B8833A !important; padding-left: 20px !important; }
        .toc-item { transition: all 0.15s !important; }
        .prose h2 { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 600; color: #1A1612; margin: 16px 0 6px; }
        .prose p { margin: 0 0 10px; }
        .prose strong { color: #1A1612; font-weight: 700; }
        @media (min-width: 900px) {
          .privacy-layout { display: grid !important; grid-template-columns: 240px 1fr !important; gap: 32px !important; }
          .toc-sidebar { display: block !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg, #1A0F05 0%, #2C1A08 100%)', padding: 'clamp(48px,8vw,80px) 20px clamp(40px,6vw,64px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(184,131,58,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(247,245,242,0.45)', textDecoration: 'none', fontSize: 13, fontFamily: 'Outfit, sans-serif', marginBottom: 24 }}>
            ← Volver a TopSy
          </Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(184,131,58,0.15)', border: '1px solid rgba(184,131,58,0.3)', borderRadius: 100, padding: '5px 16px', marginBottom: 20 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#D4A055', fontWeight: 700 }}>Última actualización: Marzo 2026</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.4rem,6vw,4rem)', fontWeight: 300, color: '#F7F5F2', margin: '0 0 14px', lineHeight: 1.05 }}>
            Política de <em style={{ color: '#D4A055' }}>Privacidad</em>
          </h1>
          <p style={{ color: 'rgba(247,245,242,0.45)', fontSize: 15, lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
            En TopSy nos tomamos muy en serio la protección de tus datos personales. Esta política explica qué datos recopilamos, cómo los usamos y cuáles son tus derechos conforme al <strong style={{ color: 'rgba(247,245,242,0.7)' }}>Reglamento General de Protección de Datos (RGPD)</strong> y la legislación española vigente.
          </p>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(32px,5vw,56px) 20px 80px' }}>
        <div className="privacy-layout" style={{ display: 'block' }}>

          {/* Sidebar índice */}
          <aside className="toc-sidebar" style={{ display: 'none' }}>
            <div style={{ position: 'sticky', top: 80, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 18, padding: '20px 0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B8833A', fontWeight: 700, padding: '0 20px', marginBottom: 12 }}>Índice</p>
              {SECTIONS.map((s, i) => (
                <a key={s.id} href={`#${s.id}`} className="toc-item" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', textDecoration: 'none', color: 'rgba(26,22,18,0.5)', fontSize: 13, fontFamily: 'Outfit, sans-serif', borderLeft: '2px solid transparent' }}>
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  <span style={{ lineHeight: 1.3 }}>{s.title}</span>
                </a>
              ))}
            </div>
          </aside>

          {/* Secciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SECTIONS.map((section, i) => (
              <div
                key={section.id}
                id={section.id}
                className="section-card"
                style={{ animationDelay: `${i * 0.04}s`, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
              >
                {/* Header de sección */}
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

                {/* Contenido expandible */}
                {activeSection === section.id && (
                  <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="prose" style={{ paddingTop: 18 }}>
                      {section.content.split('\n\n').map((block, j) => {
                        if (block.startsWith('**') && block.endsWith('**') && !block.slice(2).includes('**')) {
                          return <h2 key={j}>{block.slice(2, -2)}</h2>
                        }
                        // Render inline bold
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

            {/* Card contacto */}
            <div style={{ background: 'linear-gradient(135deg, #1A0F05, #2C1A08)', borderRadius: 20, padding: 'clamp(28px,4vw,40px) clamp(24px,4vw,40px)', position: 'relative', overflow: 'hidden', marginTop: 8 }}>
              <div style={{ position: 'absolute', top: '50%', right: '-5%', transform: 'translateY(-50%)', width: 300, height: 300, background: 'radial-gradient(circle, rgba(184,131,58,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(212,160,85,0.7)', marginBottom: 12, fontWeight: 700 }}>¿Tienes preguntas?</p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 300, color: '#F7F5F2', margin: '0 0 10px' }}>
                  Contacta con nuestro <em style={{ color: '#D4A055' }}>equipo</em>
                </h2>
                <p style={{ color: 'rgba(247,245,242,0.45)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px', maxWidth: 480 }}>
                  Si tienes cualquier duda sobre cómo tratamos tus datos o quieres ejercer tus derechos, escríbenos. Respondemos en menos de 48 horas.
                </p>
                <a href="mailto:privacidad@topsy.es" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#B8833A,#D4A055)', color: '#FFFFFF', textDecoration: 'none', padding: '13px 26px', borderRadius: 13, fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', boxShadow: '0 6px 20px rgba(184,131,58,0.4)' }}>
                  ✉️ privacidad@topsy.es
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
