import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

const DAY_MAP = {
  monday:'Lun', tuesday:'Mar', wednesday:'Mié',
  thursday:'Jue', friday:'Vie', saturday:'Sáb', sunday:'Dom',
}

export default function ProfessionalPage() {
  const { id } = useParams()
  const { token } = useAuthStore()
  const navigate = useNavigate()

  const { data: prof, isLoading } = useQuery({
    queryKey: ['professional', id],
    queryFn: () => profApi.getOne(id).then(r => r.data.data),
  })

  if (isLoading) return (
    <div className="container-app" style={{ padding: '24px 16px' }}>
      <div className="skeleton" style={{ height: 240, borderRadius: 20, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 32, width: '60%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 20, width: '40%' }} />
    </div>
  )

  if (!prof) return (
    <div style={{ textAlign: 'center', padding: '120px 24px', color: 'rgba(247,242,234,0.3)' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontStyle: 'italic' }}>Profesional no encontrado</p>
    </div>
  )

  const activeServices = prof.services?.filter(s => s.is_active) ?? []
  const activeDays = prof.availability?.filter(a => a.is_available) ?? []

  return (
    <div style={{ background: '#0A0806', minHeight: '100vh', paddingBottom: 100 }}>
      <style>{`
        .service-card:hover { border-color: rgba(201,150,90,0.3) !important; }
        .service-card { transition: border-color 0.2s; }
        .reservar-btn:hover { background: linear-gradient(135deg, #C9965A, #E8B97A) !important; color: #0A0806 !important; }
        @media (max-width: 768px) {
          .prof-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Cover */}
      <div style={{ position: 'relative', height: 220, background: 'linear-gradient(135deg, rgba(201,150,90,0.15), #111009)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', overflow: 'hidden' }}>
        {prof.cover_image_url
          ? <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '✂️'}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, #0A0806)' }} />
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 14px', color: 'rgba(247,242,234,0.7)', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
          ← Volver
        </button>
      </div>

      <div className="container-app" style={{ maxWidth: 800, padding: '0 16px' }}>

        {/* Info header */}
        <div style={{ marginTop: -20, marginBottom: 28, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 600, lineHeight: 1.1 }}>
                  {prof.business_name}
                </h1>
                {prof.is_verified && (
                  <span style={{ fontSize: 11, background: 'rgba(201,150,90,0.15)', color: '#C9965A', padding: '3px 10px', borderRadius: 100, border: '1px solid rgba(201,150,90,0.2)', flexShrink: 0 }}>✓ Verificado</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#C9965A', fontSize: 13 }}>{'★'.repeat(Math.round(prof.avg_rating ?? 0))}{'☆'.repeat(5 - Math.round(prof.avg_rating ?? 0))}</span>
                  <span style={{ color: 'rgba(247,242,234,0.4)', fontSize: 13 }}>{prof.avg_rating ? `${prof.avg_rating} · ` : ''}{prof.total_reviews} reseñas</span>
                </div>
                <span style={{ color: 'rgba(247,242,234,0.2)' }}>·</span>
                <span style={{ color: 'rgba(247,242,234,0.4)', fontSize: 13 }}>📍 {prof.city}</span>
              </div>
              {prof.description && (
                <p style={{ color: 'rgba(247,242,234,0.45)', fontSize: 14, lineHeight: 1.6, marginTop: 10, maxWidth: 500 }}>{prof.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Horario */}
        {activeDays.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '18px 20px', marginBottom: 28 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.7)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 16, height: 1, background: '#C9965A' }} /> Horario
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {activeDays.map(a => (
                <div key={a.day_of_week} style={{ background: 'rgba(201,150,90,0.06)', border: '1px solid rgba(201,150,90,0.15)', borderRadius: 10, padding: '6px 12px', fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: '#C9965A' }}>{DAY_MAP[a.day_of_week]}</span>
                  <span style={{ color: 'rgba(247,242,234,0.45)', marginLeft: 6 }}>{a.start_time.slice(0,5)} – {a.end_time.slice(0,5)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicios */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.7)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 16, height: 1, background: '#C9965A' }} /> Servicios
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeServices.length === 0 && (
              <p style={{ color: 'rgba(247,242,234,0.25)', fontSize: 14, fontStyle: 'italic' }}>Sin servicios disponibles</p>
            )}
            {activeServices.map(service => (
              <div key={service.id} className="service-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{service.name}</p>
                  {service.description && (
                    <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 13, marginBottom: 4 }}>{service.description}</p>
                  )}
                  <p style={{ color: 'rgba(247,242,234,0.3)', fontSize: 12 }}>⏱ {service.duration_minutes} min</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#C9965A', fontStyle: 'italic' }}>{service.price}€</span>
                  <button className="reservar-btn" onClick={() => { if (!token) { navigate('/login'); return } navigate(`/booking/${prof.id}/${service.id}`) }} style={{
                    background: 'transparent', border: '1px solid rgba(201,150,90,0.4)', borderRadius: 10,
                    padding: '10px 18px', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                    color: '#C9965A', cursor: 'pointer', letterSpacing: '0.05em', transition: 'all 0.2s',
                  }}>
                    Reservar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reseñas */}
        <div>
          <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.7)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 16, height: 1, background: '#C9965A' }} /> Reseñas
          </p>
          {!prof.reviews?.length ? (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '32px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>⭐</p>
              <p style={{ color: 'rgba(247,242,234,0.25)', fontSize: 14, fontStyle: 'italic' }}>Sin reseñas aún</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {prof.reviews.slice(0, 6).map(r => (
                <div key={r.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(201,150,90,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#C9965A', flexShrink: 0 }}>
                      {r.profiles?.full_name?.[0] ?? '?'}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>{r.profiles?.full_name ?? 'Usuario'}</p>
                      <p style={{ color: '#C9965A', fontSize: 11 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                    </div>
                  </div>
                  {r.comment && <p style={{ color: 'rgba(247,242,234,0.45)', fontSize: 13, lineHeight: 1.5 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}