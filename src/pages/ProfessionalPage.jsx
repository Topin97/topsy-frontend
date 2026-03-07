import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const DAY_MAP = {
  monday:'Lun', tuesday:'Mar', wednesday:'Mié',
  thursday:'Jue', friday:'Vie', saturday:'Sáb', sunday:'Dom',
}

function StarDisplay({ rating, max = 5 }) {
  return (
    <span style={{ letterSpacing: 1 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ color: i < rating ? '#C9965A' : 'rgba(201,150,90,0.18)', fontSize: 13 }}>★</span>
      ))}
    </span>
  )
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
    <div className="container-app py-16 space-y-6">
      <div className="h-64 skeleton rounded-2xl" />
      <div className="h-8 skeleton rounded w-1/2" />
      <div className="h-4 skeleton rounded w-1/3" />
    </div>
  )

  if (!prof) return (
    <div className="container-app py-32 text-center text-cream/30">
      <p className="font-display text-3xl italic">Profesional no encontrado</p>
    </div>
  )

  return (
    <div className="container-app py-10 max-w-5xl">

      {/* Header card */}
      <div className="card overflow-hidden mb-8">
        <div className="h-56 bg-linear-to-br from-gold/15 to-bg2 flex items-center justify-center text-8xl border-b border-gold/10 overflow-hidden">
          {prof.cover_image_url
            ? <img src={prof.cover_image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : '✂️'}
        </div>
        <div className="p-8 flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-4xl font-semibold">{prof.business_name}</h1>
              {prof.is_verified && (
                <span className="text-xs bg-gold/20 text-gold px-3 py-1 rounded-full">✓ Verificado</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-cream/50 text-sm mb-4 flex-wrap">
              <StarDisplay rating={Math.round(prof.avg_rating ?? 0)} />
              <span className="text-gold font-medium">{prof.avg_rating ? Number(prof.avg_rating).toFixed(1) : '—'}</span>
              <span className="text-cream/30">({prof.total_reviews} reseñas)</span>
              <span className="text-cream/20">·</span>
              <span>📍 {prof.city}</span>
            </div>
            <p className="text-cream/60 leading-relaxed">{prof.description}</p>
          </div>

          {prof.availability?.length > 0 && (
            <div className="card p-4 min-w-50">
              <p className="section-tag mb-3 text-xs">Horario</p>
              {prof.availability
                .filter((a) => a.is_available)
                .map((a) => (
                  <div key={a.day_of_week} className="flex justify-between text-xs text-cream/60 py-1 border-b border-white/5 last:border-0">
                    <span className="font-medium">{DAY_MAP[a.day_of_week]}</span>
                    <span>{a.start_time.slice(0,5)} – {a.end_time.slice(0,5)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Services */}
        <div className="lg:col-span-2">
          <h2 className="section-tag mb-6">Servicios</h2>
          <div className="space-y-3">
            {prof.services?.filter((s) => s.is_active).map((service) => (
              <div key={service.id} className="card-gold p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">{service.name}</h3>
                  {service.description && (
                    <p className="text-cream/40 text-sm">{service.description}</p>
                  )}
                  <p className="text-cream/40 text-xs mt-1">⏱ {service.duration_minutes} min</p>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="font-display text-2xl text-gold italic">{service.price}€</span>
                  <button
                    onClick={() => {
                      if (!token) { navigate('/login'); return }
                      navigate(`/booking/${prof.id}/${service.id}`)
                    }}
                    className="btn-outline text-xs py-2 px-4"
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
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 24 }}>
            <h2 className="section-tag">Reseñas</h2>
            {prof.total_reviews > 0 && (
              <span style={{ fontSize:12, color:'rgba(247,242,234,0.3)' }}>{prof.total_reviews} en total</span>
            )}
          </div>

          {!prof.reviews?.length ? (
            <div className="card p-6 text-center">
              <p style={{ fontSize: 28, marginBottom: 8 }}>⭐</p>
              <p className="text-cream/30 text-sm italic">Sin reseñas aún</p>
              <p className="text-cream/20 text-xs mt-1">Sé el primero en valorar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prof.reviews.slice(0, 6).map((r) => {
                const initials = r.profiles?.full_name
                  ? r.profiles.full_name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
                  : '?'
                return (
                  <div key={r.id} className="card p-4">
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      {r.profiles?.avatar_url ? (
                        <img
                          src={r.profiles.avatar_url}
                          alt=""
                          style={{ width:34, height:34, borderRadius:'50%', objectFit:'cover', flexShrink:0 }}
                        />
                      ) : (
                        <div style={{
                          width:34, height:34, borderRadius:'50%',
                          background:'linear-gradient(135deg,rgba(201,150,90,0.2),rgba(232,185,122,0.1))',
                          border:'1px solid rgba(201,150,90,0.2)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:12, fontWeight:700, color:'#C9965A', flexShrink:0,
                        }}>
                          {initials}
                        </div>
                      )}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:'#F7F2EA', marginBottom:2 }}>
                          {r.profiles?.full_name ?? 'Usuario'}
                        </p>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <StarDisplay rating={r.rating} />
                          {r.created_at && (
                            <span style={{ fontSize:11, color:'rgba(247,242,234,0.25)' }}>
                              {format(new Date(r.created_at), "d MMM yyyy", { locale: es })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {r.comment && (
                      <p style={{ fontSize:13, color:'rgba(247,242,234,0.5)', lineHeight:1.5, margin:0 }}>
                        "{r.comment}"
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}