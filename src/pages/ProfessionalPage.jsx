import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const DAY_MAP = {
  monday:'Lun', tuesday:'Mar', wednesday:'Mié',
  thursday:'Jue', friday:'Vie', saturday:'Sáb', sunday:'Dom',
}

function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating ?? 0) ? '#B8833A' : 'rgba(26,22,18,0.12)', fontSize: 13 }}>★</span>
      ))}
    </span>
  )
}

export default function ProfessionalPage() {
  const { id } = useParams()
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('services')

  const { data: prof, isLoading } = useQuery({
    queryKey: ['professional', id],
    queryFn: () => profApi.getOne(id).then(r => r.data.data),
  })

  if (isLoading) return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px' }}>
      <div className="skeleton" style={{ height: 220, borderRadius: 0, marginBottom: 0 }} />
      <div style={{ padding: '16px' }}>
        <div className="skeleton" style={{ height: 22, width: '55%', borderRadius: 8, marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 14, width: '35%', borderRadius: 6 }} />
      </div>
    </div>
  )

  if (!prof) return (
    <div style={{ textAlign: 'center', padding: '80px 16px', color: 'rgba(26,22,18,0.2)' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontStyle: 'italic' }}>Profesional no encontrado</p>
    </div>
  )

  const activeServices = prof.services?.filter(s => s.is_active) ?? []
  const availability = prof.availability?.filter(a => a.is_available) ?? []

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        .tab-btn:hover { color: #1A1612 !important; }
        .service-row:hover { background: rgba(184,131,58,0.06) !important; border-color: rgba(184,131,58,0.3) !important; }
        .book-btn:hover { opacity: 0.9; transform: scale(0.98); }
      `}</style>

      {/* ── Cover + back ── */}
      <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: 'linear-gradient(135deg, rgba(184,131,58,0.08), #EFEDE9)' }}>
        {prof.cover_image_url
          ? <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>✂️</div>
        }
        {/* Gradient overlay bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to bottom, transparent, rgba(247,245,242,0.95))' }} />

        {/* Back btn */}
        <button
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '7px 12px', color: '#1A1612', fontSize: 13, cursor: 'pointer' }}
        >← Volver</button>

        {/* Verified badge */}
        {prof.is_verified && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(201,150,90,0.9)', borderRadius: 100, padding: '4px 12px', fontSize: 11, color: '#F7F5F2', fontWeight: 700 }}>
            ✓ Verificado
          </div>
        )}
      </div>

      {/* ── Info principal ── */}
      <div style={{ padding: '16px 16px 0', marginTop: -2 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 600, color: '#1A1612', margin: '0 0 6px', lineHeight: 1.1 }}>
          {prof.business_name}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <Stars rating={prof.avg_rating} />
          <span style={{ fontSize: 14, color: '#B8833A', fontWeight: 700 }}>
            {prof.avg_rating ? Number(prof.avg_rating).toFixed(1) : '—'}
          </span>
          <span style={{ fontSize: 13, color: 'rgba(26,22,18,0.4)' }}>({prof.total_reviews} reseñas)</span>
        </div>

        <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.5)', margin: '0 0 10px' }}>📍 {prof.city}</p>

        {prof.description && (
          <p style={{ fontSize: 14, color: 'rgba(26,22,18,0.5)', lineHeight: 1.65, margin: '0 0 16px' }}>
            {prof.description}
          </p>
        )}

        {/* Horario resumen inline */}
        {availability.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {availability.map(a => (
              <div key={a.day_of_week} style={{ fontSize: 11, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '4px 10px', color: 'rgba(26,22,18,0.55)' }}>
                <span style={{ fontWeight: 600, color: 'rgba(26,22,18,0.75)' }}>{DAY_MAP[a.day_of_week]}</span>
                {' '}{a.start_time.slice(0,5)}–{a.end_time.slice(0,5)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.04)', padding: '0 16px', position: 'sticky', top: 52, background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', zIndex: 20 }}>
        {[
          { key: 'services', label: `Servicios (${activeServices.length})` },
          { key: 'reviews',  label: `Reseñas (${prof.total_reviews ?? 0})` },
        ].map(tab => (
          <button
            key={tab.key}
            className="tab-btn"
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '14px 0',
              marginRight: 28, fontSize: 14, fontFamily: 'Outfit, sans-serif',
              color: activeTab === tab.key ? '#B8833A' : 'rgba(26,22,18,0.3)',
              fontWeight: activeTab === tab.key ? 600 : 400,
              borderBottom: `2px solid ${activeTab === tab.key ? '#B8833A' : 'transparent'}`,
              marginBottom: -1, transition: 'all 0.2s',
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* ── Servicios ── */}
      {activeTab === 'services' && (
        <div style={{ padding: '12px 16px 80px' }}>
          {activeServices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(26,22,18,0.2)' }}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>✂️</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontStyle: 'italic' }}>Sin servicios publicados</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {activeServices.map((service, i) => (
                <div
                  key={service.id}
                  className="service-row"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 14px',
                    background: '#FFFFFF',
                    border: '1.5px solid rgba(0,0,0,0.08)',
                    borderRadius: 14,
                    transition: 'all 0.2s',
                    marginBottom: 8,
                  }}
                >
                  {/* Número */}
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(184,131,58,0.08)', border: '1.5px solid rgba(184,131,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#B8833A', fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1612', margin: '0 0 3px' }}>{service.name}</p>
                    {service.description && (
                      <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.45)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {service.description}
                      </p>
                    )}
                    <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.4)', margin: 0 }}>⏱ {service.duration_minutes} min</p>
                  </div>

                  {/* Precio + botón */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#B8833A', fontStyle: 'italic', lineHeight: 1 }}>
                      {service.price}€
                    </span>
                    <button
                      className="book-btn"
                      onClick={() => {
                        if (!token) { navigate('/login'); return }
                        navigate(`/booking/${prof.id}/${service.id}`)
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #B8833A, #D4A055)',
                        border: 'none', borderRadius: 10, padding: '9px 16px',
                        color: '#FFFFFF', fontWeight: 700, fontSize: 13,
                        cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                        transition: 'all 0.18s', whiteSpace: 'nowrap',
                      }}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Reseñas ── */}
      {activeTab === 'reviews' && (
        <div style={{ padding: '12px 16px 80px' }}>
          {/* Rating summary */}
          {prof.total_reviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 0 20px', borderBottom: '1px solid rgba(0,0,0,0.04)', marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem', color: '#B8833A', fontWeight: 300, margin: 0, lineHeight: 1 }}>
                  {Number(prof.avg_rating).toFixed(1)}
                </p>
                <Stars rating={prof.avg_rating} />
                <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', margin: '4px 0 0' }}>{prof.total_reviews} reseñas</p>
              </div>
              <div style={{ flex: 1 }}>
                {[5,4,3,2,1].map(star => {
                  const count = prof.reviews?.filter(r => r.rating === star).length ?? 0
                  const pct = prof.total_reviews ? (count / prof.total_reviews) * 100 : 0
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', width: 12, textAlign: 'right' }}>{star}</span>
                      <span style={{ fontSize: 10, color: '#B8833A' }}>★</span>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #B8833A, #D4A055)', borderRadius: 2, transition: 'width 0.5s' }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'rgba(26,22,18,0.2)', width: 16 }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Lista reseñas */}
          {!prof.reviews?.length ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(26,22,18,0.2)' }}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>⭐</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontStyle: 'italic', marginBottom: 4 }}>Sin reseñas aún</p>
              <p style={{ fontSize: 12 }}>Sé el primero en valorar</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {prof.reviews.slice(0, 10).map(r => {
                const initials = r.profiles?.full_name
                  ? r.profiles.full_name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
                  : '?'
                return (
                  <div key={r.id} style={{ padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      {r.profiles?.avatar_url ? (
                        <img src={r.profiles.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(184,131,58,0.1)', border: '1.5px solid rgba(184,131,58,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#B8833A', flexShrink: 0 }}>
                          {initials}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1612', margin: 0 }}>
                            {r.profiles?.full_name ?? 'Usuario'}
                          </p>
                          {r.created_at && (
                            <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.2)' }}>
                              {format(new Date(r.created_at), "d MMM yyyy", { locale: es })}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Stars rating={r.rating} />
                          <span style={{ fontSize: 12, color: '#B8833A', fontWeight: 600 }}>{r.rating}.0</span>
                        </div>
                      </div>
                    </div>
                    {r.comment && (
                      <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.6)', lineHeight: 1.6, margin: 0, paddingLeft: 46 }}>
                        {r.comment}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}