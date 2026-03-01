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
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontStyle: 'italic' }}>
        Profesional no encontrado
      </p>
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

        .tab-content { animation: fadeSlide 0.35s ease; }

        .service-card {
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .service-card:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.03);
        }

        .reservar-btn {
          transition: all 0.2s ease;
        }
        .reservar-btn:hover {
          background: #C9965A !important;
          color: #0A0806 !important;
          transform: scale(1.05);
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
      `}</style>

      {/* Cover */}
      <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
        {prof.cover_image_url ? (
          <img
            src={prof.cover_image_url}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              animation: 'fadeIn 0.6s ease'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '6rem'
          }}>
            ✂️
          </div>
        )}

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(10,8,6,0.8) 100%)'
        }} />

        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: '8px 14px',
            color: '#F7F2EA',
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          ← Volver
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '20px 20px 0' }}>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(1.5rem,4vw,2.2rem)'
        }}>
          {prof.business_name}
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', marginTop: 8 }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tab-btn${tab === t ? ' active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 20px 10px',
                fontSize: 12,
                textTransform: 'uppercase',
                color: tab === t ? '#C9965A' : 'rgba(247,242,234,0.35)',
                cursor: 'pointer'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 16px' }}>

        {tab === 'servicios' && (
          <div className="tab-content">
            {activeServices.length === 0 ? (
              <p style={{ opacity: 0.3 }}>Sin servicios disponibles</p>
            ) : (
              activeServices.map((service, i) => (
                <div
                  key={service.id}
                  className="service-card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '18px 0',
                    borderBottom: i < activeServices.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600 }}>{service.name}</p>
                    <p style={{ opacity: 0.4, fontSize: 13 }}>
                      {service.duration_minutes} min
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <p style={{ fontWeight: 700 }}>{service.price} €</p>

                    <button
                      className="reservar-btn"
                      onClick={() => {
                        if (!token) {
                          navigate('/login', { state: { from: `/professional/${id}` } })
                          return
                        }
                        navigate(`/booking/${prof.id}/${service.id}`)
                      }}
                      style={{
                        background: 'rgba(201,150,90,0.1)',
                        border: '1px solid rgba(201,150,90,0.3)',
                        borderRadius: 10,
                        padding: '10px 18px',
                        fontWeight: 700,
                        color: '#C9965A',
                        cursor: 'pointer',
                      }}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'detalles' && (
          <div className="tab-content">
            {activeDays.map(a => (
              <div key={a.day_of_week} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0'
              }}>
                <span>{DAY_MAP[a.day_of_week]}</span>
                <span>
                  {a.start_time?.slice(0,5)} – {a.end_time?.slice(0,5)}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}