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
    queryFn: () => profApi.getOne(id).then((r) => r.data.data),
  })

  if (isLoading) return (
    <div className="container-app" style={{ padding: '40px 24px' }}>
      <div className="skeleton" style={{ height: 280, borderRadius: 20, marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 32, width: '50%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 20, width: '30%' }} />
    </div>
  )

  if (!prof) return (
    <div style={{ textAlign: 'center', padding: '120px 24px', color: 'rgba(247,242,234,0.3)' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontStyle: 'italic' }}>Profesional no encontrado</p>
    </div>
  )

  return (
    <div className="container-app" style={{ padding: '40px 24px', maxWidth: 1000 }}>
      {/* Header card */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ height: 220, background: 'linear-gradient(135deg, rgba(201,150,90,0.15), #111009)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', borderBottom: '1px solid rgba(201,150,90,0.1)' }}>
          {prof.cover_image_url
            ? <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '✂️'}
        </div>
        <div style={{ padding: 32, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 600 }}>{prof.business_name}</h1>
              {prof.is_verified && (
                <span style={{ fontSize: 12, background: 'rgba(201,150,90,0.2)', color: '#C9965A', padding: '3px 10px', borderRadius: 100 }}>✓ Verificado</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(247,242,234,0.5)', fontSize: 14, marginBottom: 16 }}>
              <span style={{ color: '#C9965A' }}>{'★'.repeat(Math.round(prof.avg_rating ?? 0))}</span>
              <span>{prof.avg_rating ?? '—'} ({prof.total_reviews} reseñas)</span>
              <span>·</span>
              <span>📍 {prof.city}</span>
            </div>
            <p style={{ color: 'rgba(247,242,234,0.55)', lineHeight: 1.7 }}>{prof.description}</p>
          </div>

          {/* Schedule */}
          {prof.availability?.some((a) => a.is_available) && (
            <div className="card" style={{ padding: 20, minWidth: 200 }}>
              <p className="section-tag" style={{ marginBottom: 16, fontSize: 10 }}>Horario</p>
              {prof.availability.filter((a) => a.is_available).map((a) => (
                <div key={a.day_of_week} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(247,242,234,0.6)', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontWeight: 500 }}>{DAY_MAP[a.day_of_week]}</span>
                  <span>{a.start_time.slice(0,5)} – {a.end_time.slice(0,5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, flexWrap: 'wrap' }}>
        {/* Services */}
        <div>
          <p className="section-tag" style={{ marginBottom: 24 }}>Servicios</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {prof.services?.filter((s) => s.is_active).map((service) => (
              <div key={service.id} className="card-gold" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{service.name}</h3>
                  {service.description && (
                    <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: 13, marginBottom: 4 }}>{service.description}</p>
                  )}
                  <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 12 }}>⏱ {service.duration_minutes} min</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#C9965A', fontStyle: 'italic' }}>{service.price}€</span>
                  <button
                    onClick={() => {
                      if (!token) { navigate('/login'); return }
                      navigate(`/booking/${prof.id}/${service.id}`)
                    }}
                    className="btn-outline"
                    style={{ padding: '8px 16px', fontSize: 12 }}
                  >
                    Reservar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <p className="section-tag" style={{ marginBottom: 24 }}>Reseñas</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {prof.reviews?.length === 0 && (
              <p style={{ color: 'rgba(247,242,234,0.25)', fontSize: 14, fontStyle: 'italic' }}>Sin reseñas aún</p>
            )}
            {prof.reviews?.slice(0, 6).map((r) => (
              <div key={r.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,150,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#C9965A' }}>
                    {r.profiles?.full_name?.[0] ?? '?'}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{r.profiles?.full_name ?? 'Usuario'}</p>
                    <p style={{ color: '#C9965A', fontSize: 11 }}>{'★'.repeat(r.rating)}</p>
                  </div>
                </div>
                {r.comment && <p style={{ color: 'rgba(247,242,234,0.5)', fontSize: 13 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}