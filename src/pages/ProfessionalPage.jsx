import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const DAY_ORDER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAY_MAP   = { monday:'Lun', tuesday:'Mar', wednesday:'Mié', thursday:'Jue', friday:'Vie', saturday:'Sáb', sunday:'Dom' }

function Stars({ rating, size = 13 }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating ?? 0) ? '#B8833A' : 'rgba(26,22,18,0.12)', fontSize: size }}>★</span>
      ))}
    </span>
  )
}

function RatingBar({ star, count, total }) {
  const pct = total ? (count / total) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.5)', width: 10, textAlign: 'right', fontFamily: 'Outfit, sans-serif' }}>{star}</span>
      <span style={{ fontSize: 10, color: '#B8833A' }}>★</span>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#B8833A,#D4A055)', borderRadius: 3, transition: 'width 0.6s' }} />
      </div>
      <span style={{ fontSize: 10, color: 'rgba(26,22,18,0.3)', width: 18, fontFamily: 'Outfit, sans-serif' }}>{count}</span>
    </div>
  )
}

export default function ProfessionalPage() {
  const { id } = useParams()
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('services')
  const [selectedService, setSelectedService] = useState(null)
  const [galleryOpen, setGalleryOpen] = useState(null)

  const { data: prof, isLoading } = useQuery({
    queryKey: ['professional', id],
    queryFn: () => profApi.getOne(id).then(r => r.data.data),
  })

  if (isLoading) return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="skeleton" style={{ height: 260, borderRadius: 0 }} />
      <div style={{ padding: '16px' }}>
        <div className="skeleton" style={{ height: 24, width: '50%', borderRadius: 8, marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 14, width: '30%', borderRadius: 6 }} />
      </div>
    </div>
  )

  if (!prof) return (
    <div style={{ textAlign: 'center', padding: '80px 16px' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontStyle: 'italic', color: 'rgba(26,22,18,0.3)' }}>Profesional no encontrado</p>
    </div>
  )

  const activeServices = prof.services?.filter(s => s.is_active) ?? []
  const availability   = DAY_ORDER.map(d => prof.availability?.find(a => a.day_of_week === d)).filter(Boolean)
  const availableDays  = availability.filter(a => a.is_available)
  const gallery        = prof.gallery_urls?.filter(Boolean) ?? []
  const minPrice       = activeServices.length ? Math.min(...activeServices.map(s => s.price)) : null

  const handleBook = (service) => {
    if (!token) { navigate('/login'); return }
    navigate(`/booking/${prof.id}/${service.id}`)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: 'Outfit, sans-serif', background: '#F7F5F2', minHeight: '100vh', paddingBottom: 100 }}>
      <style>{`
        .tab-btn:hover { color: #1A1612 !important; }
        .service-row:hover { border-color: rgba(184,131,58,0.35) !important; box-shadow: 0 4px 16px rgba(184,131,58,0.08) !important; }
        .service-row { transition: all 0.2s !important; }
        .gallery-thumb:hover { opacity: 0.88; transform: scale(1.02); }
        .gallery-thumb { transition: all 0.2s; cursor: pointer; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform:none } }
      `}</style>

      {/* ── GALLERY LIGHTBOX ── */}
      {galleryOpen !== null && (
        <div onClick={() => setGalleryOpen(null)} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <img src={gallery[galleryOpen]} alt="" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
          <button onClick={() => setGalleryOpen(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: '#FFF', fontSize: 18, cursor: 'pointer' }}>✕</button>
          {gallery.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setGalleryOpen((galleryOpen - 1 + gallery.length) % gallery.length) }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#FFF', fontSize: 20, cursor: 'pointer' }}>‹</button>
              <button onClick={e => { e.stopPropagation(); setGalleryOpen((galleryOpen + 1) % gallery.length) }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#FFF', fontSize: 20, cursor: 'pointer' }}>›</button>
            </>
          )}
        </div>
      )}

      {/* ── COVER ── */}
      <div style={{ position: 'relative', height: 260, overflow: 'hidden', background: 'linear-gradient(135deg,rgba(184,131,58,0.1),#EFEDE9)' }}>
        {prof.cover_image_url
          ? <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, opacity: 0.4 }}>✂️</div>
        }
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(247,245,242,0.9) 100%)' }} />

        {/* Back btn */}
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#1A1612', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
          ← Volver
        </button>

        {/* Verified badge */}
        {prof.is_verified && (
          <div style={{ position: 'absolute', top: 14, right: 14, background: 'linear-gradient(135deg,#B8833A,#D4A055)', borderRadius: 100, padding: '5px 12px', fontSize: 11, color: '#FFFFFF', fontWeight: 800, letterSpacing: '0.04em', boxShadow: '0 4px 12px rgba(184,131,58,0.4)' }}>
            ✓ Verificado
          </div>
        )}
      </div>

      {/* ── AVATAR + INFO ── */}
      <div style={{ padding: '0 16px', marginTop: -36, position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 12 }}>
          {/* Avatar */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '3px solid #FFFFFF', background: 'rgba(184,131,58,0.1)', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {prof.profiles?.avatar_url
              ? <img src={prof.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#B8833A' }}>
                  {prof.profiles?.full_name?.slice(0,2).toUpperCase() ?? '✂️'}
                </span>
            }
          </div>

          {/* Rating inline */}
          <div style={{ paddingBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Stars rating={prof.avg_rating} />
              <span style={{ fontSize: 14, color: '#B8833A', fontWeight: 700 }}>
                {prof.avg_rating ? Number(prof.avg_rating).toFixed(1) : '—'}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)' }}>({prof.total_reviews})</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.4)', margin: 0 }}>📍 {prof.city}</p>
          </div>

          {/* Precio mínimo */}
          {minPrice != null && (
            <div style={{ marginLeft: 'auto', paddingBottom: 6, textAlign: 'right' }}>
              <p style={{ fontSize: 10, color: 'rgba(26,22,18,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px', fontFamily: 'Outfit, sans-serif' }}>Desde</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#B8833A', fontStyle: 'italic', margin: 0, lineHeight: 1 }}>{minPrice}€</p>
            </div>
          )}
        </div>

        {/* Nombre */}
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem,5vw,2.2rem)', fontWeight: 600, color: '#1A1612', margin: '0 0 6px', lineHeight: 1.1 }}>
          {prof.business_name}
        </h1>

        {/* Bio */}
        {prof.description && (
          <p style={{ fontSize: 14, color: 'rgba(26,22,18,0.5)', lineHeight: 1.7, margin: '0 0 14px', maxWidth: 560 }}>
            {prof.description}
          </p>
        )}

        {/* Días disponibles pills */}
        {availableDays.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            {availableDays.map(a => (
              <div key={a.day_of_week} style={{ fontSize: 11, background: 'rgba(184,131,58,0.08)', border: '1.5px solid rgba(184,131,58,0.2)', borderRadius: 10, padding: '4px 10px', color: '#B8833A', fontFamily: 'Outfit, sans-serif' }}>
                <span style={{ fontWeight: 700 }}>{DAY_MAP[a.day_of_week]}</span>
                {' '}{a.start_time.slice(0,5)}–{a.end_time.slice(0,5)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── GALERÍA ── */}
      {gallery.length > 0 && (
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            <style>{`.gallery-scroll::-webkit-scrollbar{display:none}`}</style>
            {gallery.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="gallery-thumb"
                onClick={() => setGalleryOpen(i)}
                style={{ width: i === 0 ? 180 : 120, height: 90, objectFit: 'cover', borderRadius: 12, flexShrink: 0, border: '1.5px solid rgba(0,0,0,0.07)' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── TABS ── */}
      <div style={{ display: 'flex', background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 16px', position: 'sticky', top: 52, zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginTop: 8 }}>
        {[
          { key: 'services', label: `Servicios (${activeServices.length})` },
          { key: 'reviews',  label: `Reseñas (${prof.total_reviews ?? 0})` },
          { key: 'info',     label: 'Info' },
        ].map(tab => (
          <button
            key={tab.key}
            className="tab-btn"
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '14px 0', marginRight: 24, fontSize: 14, fontFamily: 'Outfit, sans-serif',
              color: activeTab === tab.key ? '#B8833A' : 'rgba(26,22,18,0.35)',
              fontWeight: activeTab === tab.key ? 700 : 400,
              borderBottom: `2.5px solid ${activeTab === tab.key ? '#B8833A' : 'transparent'}`,
              marginBottom: -1, transition: 'all 0.18s', whiteSpace: 'nowrap',
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* ── TAB: SERVICIOS ── */}
      {activeTab === 'services' && (
        <div style={{ padding: '14px 16px 20px', animation: 'fadeIn 0.25s ease' }}>
          {activeServices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(26,22,18,0.2)' }}>
              <p style={{ fontSize: 36 }}>✂️</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontStyle: 'italic' }}>Sin servicios publicados</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeServices.map((service) => (
                <div
                  key={service.id}
                  className="service-row"
                  onClick={() => setSelectedService(selectedService?.id === service.id ? null : service)}
                  style={{
                    background: '#FFFFFF', border: `1.5px solid ${selectedService?.id === service.id ? '#B8833A' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: 16, padding: '16px', cursor: 'pointer',
                    boxShadow: selectedService?.id === service.id ? '0 4px 16px rgba(184,131,58,0.12)' : '0 1px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Icon circle */}
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(184,131,58,0.08)', border: '1.5px solid rgba(184,131,58,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      ✂️
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1612', margin: '0 0 3px', fontFamily: 'Outfit, sans-serif' }}>{service.name}</p>
                      <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.4)', margin: 0 }}>⏱ {service.duration_minutes} min</p>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#B8833A', fontStyle: 'italic', margin: '0 0 2px', lineHeight: 1 }}>{service.price}€</p>
                      <p style={{ fontSize: 10, color: selectedService?.id === service.id ? '#B8833A' : 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                        {selectedService?.id === service.id ? '▲ Ocultar' : '▼ Reservar'}
                      </p>
                    </div>
                  </div>

                  {/* Expandable: descripción + botón */}
                  {selectedService?.id === service.id && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(184,131,58,0.12)', animation: 'fadeIn 0.2s ease' }}>
                      {service.description && (
                        <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.55)', lineHeight: 1.65, margin: '0 0 14px', fontFamily: 'Outfit, sans-serif' }}>{service.description}</p>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); handleBook(service) }}
                        style={{
                          width: '100%', background: 'linear-gradient(135deg,#B8833A,#D4A055)',
                          border: 'none', borderRadius: 12, padding: '14px',
                          color: '#FFFFFF', fontWeight: 700, fontSize: 15,
                          cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                          boxShadow: '0 6px 20px rgba(184,131,58,0.3)',
                        }}
                      >
                        Reservar · {service.duration_minutes} min · {service.price}€
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: RESEÑAS ── */}
      {activeTab === 'reviews' && (
        <div style={{ padding: '14px 16px 20px', animation: 'fadeIn 0.25s ease' }}>
          {prof.total_reviews > 0 ? (
            <>
              {/* Summary card */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 18, padding: '20px', marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3.5rem', color: '#B8833A', fontWeight: 300, margin: 0, lineHeight: 1 }}>
                    {Number(prof.avg_rating).toFixed(1)}
                  </p>
                  <Stars rating={prof.avg_rating} size={16} />
                  <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.35)', margin: '6px 0 0', fontFamily: 'Outfit, sans-serif' }}>{prof.total_reviews} reseñas</p>
                </div>
                <div style={{ flex: 1 }}>
                  {[5,4,3,2,1].map(star => {
                    const count = prof.reviews?.filter(r => r.rating === star).length ?? 0
                    return <RatingBar key={star} star={star} count={count} total={prof.total_reviews} />
                  })}
                </div>
              </div>

              {/* Reviews list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {prof.reviews.slice(0, 15).map(r => {
                  const initials = r.profiles?.full_name
                    ? r.profiles.full_name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
                    : '?'
                  return (
                    <div key={r.id} style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: r.comment ? 10 : 0 }}>
                        {r.profiles?.avatar_url ? (
                          <img src={r.profiles.avatar_url} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(184,131,58,0.1)', border: '1.5px solid rgba(184,131,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#B8833A', flexShrink: 0 }}>
                            {initials}
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1612', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                              {r.profiles?.full_name ?? 'Usuario'}
                            </p>
                            {r.created_at && (
                              <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.25)', fontFamily: 'Outfit, sans-serif' }}>
                                {format(new Date(r.created_at), "d MMM yyyy", { locale: es })}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Stars rating={r.rating} />
                            <span style={{ fontSize: 12, color: '#B8833A', fontWeight: 700 }}>{r.rating}.0</span>
                          </div>
                        </div>
                      </div>
                      {r.comment && (
                        <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.6)', lineHeight: 1.65, margin: 0, paddingLeft: 48, fontFamily: 'Outfit, sans-serif' }}>
                          "{r.comment}"
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 14px' }}>⭐</div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontStyle: 'italic', color: '#1A1612', marginBottom: 4 }}>Sin reseñas aún</p>
              <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>Sé el primero en valorar</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: INFO ── */}
      {activeTab === 'info' && (
        <div style={{ padding: '14px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn 0.25s ease' }}>

          {/* Horario completo */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 18, padding: '18px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 14, fontWeight: 700 }}>Horario</p>
            {DAY_ORDER.map(d => {
              const slot = prof.availability?.find(a => a.day_of_week === d)
              const open = slot?.is_available
              return (
                <div key={d} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: open ? '#1A1612' : 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif', width: 44 }}>{DAY_MAP[d]}</span>
                  {open
                    ? <span style={{ fontSize: 13, color: '#1A1612', fontFamily: 'Outfit, sans-serif' }}>{slot.start_time.slice(0,5)} – {slot.end_time.slice(0,5)}</span>
                    : <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.25)', fontFamily: 'Outfit, sans-serif' }}>Cerrado</span>
                  }
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: open ? 'rgba(22,163,74,0.08)' : 'rgba(0,0,0,0.04)', color: open ? '#16a34a' : 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                    {open ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Ubicación con mapa */}
          {(prof.address || prof.city) && (
            <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {/* Mapa OpenStreetMap */}
              {prof.latitude && prof.longitude ? (
                <div style={{ position: 'relative', height: 180 }}>
                  <iframe
                    title="mapa"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${prof.longitude - 0.005},${prof.latitude - 0.003},${prof.longitude + 0.005},${prof.latitude + 0.003}&layer=mapnik&marker=${prof.latitude},${prof.longitude}`}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div style={{ height: 120, background: '#EFEDE9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🗺️</div>
              )}
              {/* Dirección */}
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 5, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Ubicación</p>
                  {prof.address && <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1612', margin: '0 0 2px', fontFamily: 'Outfit, sans-serif' }}>{prof.address}</p>}
                  <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.45)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{prof.city}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${prof.address ?? ''} ${prof.city}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ flexShrink: 0, background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 10, padding: '8px 14px', fontSize: 12, color: '#1A1612', fontFamily: 'Outfit, sans-serif', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  📍 Cómo llegar
                </a>
              </div>
            </div>
          )}

          {/* Pro info */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 18, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(184,131,58,0.25)', background: 'rgba(184,131,58,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {prof.profiles?.avatar_url
                ? <img src={prof.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#B8833A' }}>{prof.profiles?.full_name?.slice(0,2).toUpperCase()}</span>
              }
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1612', margin: '0 0 2px', fontFamily: 'Outfit, sans-serif' }}>{prof.profiles?.full_name}</p>
              <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.4)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Profesional verificado en TopSy</p>
            </div>
            {prof.is_verified && (
              <div style={{ marginLeft: 'auto', background: 'rgba(184,131,58,0.08)', border: '1.5px solid rgba(184,131,58,0.2)', borderRadius: 100, padding: '4px 10px', fontSize: 11, color: '#B8833A', fontWeight: 700, fontFamily: 'Outfit, sans-serif', flexShrink: 0 }}>✓ TOP</div>
            )}
          </div>
        </div>
      )}

      {/* ── STICKY BOTTOM CTA ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(247,245,242,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,0,0,0.08)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, maxWidth: 700, margin: '0 auto' }}>
        {/* Precio */}
        <div>
          <p style={{ fontSize: 10, color: 'rgba(26,22,18,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, fontFamily: 'Outfit, sans-serif' }}>desde</p>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#B8833A', fontStyle: 'italic', margin: 0, lineHeight: 1 }}>
            {minPrice != null ? `${minPrice}€` : '—'}
          </p>
        </div>

        {/* Botón principal */}
        <button
          onClick={() => {
            if (activeServices.length === 1) {
              handleBook(activeServices[0])
            } else {
              setActiveTab('services')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
          style={{
            flex: 1, background: 'linear-gradient(135deg,#B8833A,#D4A055)',
            border: 'none', borderRadius: 14, padding: '14px',
            color: '#FFFFFF', fontWeight: 700, fontSize: 16,
            cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
            boxShadow: '0 6px 20px rgba(184,131,58,0.35)',
          }}
        >
          {activeServices.length === 1 ? `Reservar · ${activeServices[0].name}` : `Reservar cita`}
        </button>
      </div>
    </div>
  )
}
