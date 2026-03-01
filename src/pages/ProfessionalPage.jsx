import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'

const DAY_MAP = {
  monday:'Lun', tuesday:'Mar', wednesday:'Mié',
  thursday:'Jue', friday:'Vie', saturday:'Sáb', sunday:'Dom',
}
const ORDER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

export default function ProfessionalPage() {
  const { id } = useParams()
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('servicios')

  const { data: prof, isLoading } = useQuery({
    queryKey: ['professional', id],
    queryFn: () => profApi.getOne(id).then(r => r.data.data),
  })

  if (isLoading) return (
    <div>
      <div className="skeleton" style={{ height: 260 }} />
      <div style={{ padding: '20px 16px' }}>
        <div className="skeleton" style={{ height: 28, width: '60%', marginBottom: 10, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 18, width: '40%', borderRadius: 8 }} />
      </div>
    </div>
  )

  if (!prof) return (
    <div style={{ textAlign: 'center', padding: '120px 24px', color: 'rgba(247,242,234,0.3)' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontStyle: 'italic' }}>Profesional no encontrado</p>
    </div>
  )

  const activeServices = prof.services?.filter(s => s.is_active) ?? []
  const activeDays = (prof.availability ?? [])
    .filter(a => a.is_available)
    .sort((a,b) => ORDER.indexOf(a.day_of_week) - ORDER.indexOf(b.day_of_week))
  const TABS = ['servicios', 'reseñas', 'detalles']

  return (
    <div style={{ background: '#0A0806', minHeight: '100vh', paddingBottom: 80 }}>
      <style>{`
        .tab-btn { transition: all 0.2s; border-bottom: 2px solid transparent; }
        .tab-btn.active { border-bottom-color: #C9965A; color: #C9965A !important; }
        .tab-btn:hover { color: rgba(247,242,234,0.8) !important; }
        .service-card { transition: transform 0.2s ease, background 0.2s ease; }
        .service-card:hover { transform: translateY(-3px); background: rgba(255,255,255,0.03); }
        .reservar-btn { transition: all 0.2s ease; }
        .reservar-btn:hover { background: #C9965A !important; color: #0A0806 !important; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      {/* Cover */}
      <div style={{ position: 'relative', height: 260, overflow: 'hidden', background: 'linear-gradient(135deg, rgba(201,150,90,0.2), #111009)' }}>
        {prof.cover_image_url ? (
          <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'fadeIn 0.6s ease' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' }}>✂️</div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(10,8,6,0.8) 100%)' }} />
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 14px', color: '#F7F2EA', fontSize: 13, cursor: 'pointer' }}>
          ← Volver
        </button>

        {/* Avatar circular */}
        <div style={{ position: 'absolute', bottom: -36, left: 20, width: 72, height: 72, borderRadius: '50%', border: '3px solid #0A0806', overflow: 'hidden', background: 'rgba(201,150,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          {prof.profiles?.avatar_url
            ? <img src={prof.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '1.8rem' }}>👤</span>
          }
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '48px 20px 0' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.5rem,4vw,2.2rem)', marginBottom: 4 }}>
          {prof.business_name}
          {prof.is_verified && <span style={{ fontSize: 11, background: 'rgba(201,150,90,0.15)', color: '#C9965A', padding: '2px 8px', borderRadius: 100, border: '1px solid rgba(201,150,90,0.2)', marginLeft: 10, verticalAlign: 'middle' }}>✓ Verificado</span>}
        </h1>
        {prof.address && <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.4)', marginBottom: 4 }}>📍 {prof.address}, {prof.city}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ color: '#C9965A', fontSize: 14 }}>★</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{prof.avg_rating ?? '—'}</span>
          <span style={{ fontSize: 13, color: 'rgba(201,150,90,0.7)' }}>({prof.total_reviews} reseñas)</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginTop: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`tab-btn${tab === t ? ' active' : ''}`} style={{
              background: 'none', border: 'none', padding: '12px 20px 10px',
              fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: tab === t ? '#C9965A' : 'rgba(247,242,234,0.35)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
            }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '24px 16px' }}>

        {/* SERVICIOS */}
        {tab === 'servicios' && (
          <div>
            {activeServices.length === 0 ? (
              <p style={{ opacity: 0.3, textAlign: 'center', padding: '40px 0' }}>Sin servicios disponibles</p>
            ) : (
              activeServices.map((service, i) => (
                <div key={service.id} className="service-card" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '18px 0', borderBottom: i < activeServices.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{service.name}</p>
                    {service.description && <p style={{ opacity: 0.35, fontSize: 13, marginBottom: 3 }}>{service.description}</p>}
                    <p style={{ opacity: 0.3, fontSize: 12 }}>{service.duration_minutes} min</p>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 16 }}>{service.price} €</p>
                    <button className="reservar-btn" onClick={() => {
                      if (!token) { navigate('/login', { state: { from: `/professional/${id}` } }); return }
                      navigate(`/booking/${prof.id}/${service.id}`)
                    }} style={{
                      background: 'rgba(201,150,90,0.1)', border: '1px solid rgba(201,150,90,0.3)',
                      borderRadius: 10, padding: '10px 18px', fontWeight: 700, color: '#C9965A', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                    }}>
                      Reservar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* RESEÑAS */}
        {tab === 'reseñas' && (
          <div>
            {!prof.reviews?.length ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: '2rem', marginBottom: 12 }}>⭐</p>
                <p style={{ color: 'rgba(247,242,234,0.25)', fontSize: 14, fontStyle: 'italic' }}>Sin reseñas aún</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {prof.reviews.map(r => (
                  <div key={r.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,150,90,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#C9965A', flexShrink: 0 }}>
                        {r.profiles?.full_name?.[0] ?? '?'}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{r.profiles?.full_name ?? 'Usuario'}</p>
                        <p style={{ color: '#C9965A', fontSize: 12 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                      </div>
                    </div>
                    {r.comment && <p style={{ color: 'rgba(247,242,234,0.5)', fontSize: 13, lineHeight: 1.5 }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DETALLES */}
        {tab === 'detalles' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {prof.description && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '18px 20px' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 10 }}>Sobre el negocio</p>
                <p style={{ color: 'rgba(247,242,234,0.55)', fontSize: 14, lineHeight: 1.7 }}>{prof.description}</p>
              </div>
            )}
            {activeDays.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '18px 20px' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 14 }}>Horario</p>
                {activeDays.map(a => (
                  <div key={a.day_of_week} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14 }}>
                    <span style={{ fontWeight: 500 }}>{DAY_MAP[a.day_of_week]}</span>
                    <span style={{ color: 'rgba(247,242,234,0.5)' }}>{a.start_time?.slice(0,5)} – {a.end_time?.slice(0,5)}</span>
                  </div>
                ))}
              </div>
            )}
            {prof.address && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '18px 20px' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 10 }}>Dirección</p>
                <p style={{ fontSize: 14, color: 'rgba(247,242,234,0.6)' }}>📍 {prof.address}, {prof.city}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}