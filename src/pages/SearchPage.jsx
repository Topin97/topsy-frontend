import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { profApi } from '../services/api'

const CATEGORIES = [
  { value: '',            label: 'Todo',        icon: '✦' },
  { value: 'hair',        label: 'Peluquería',  icon: '💇' },
  { value: 'nails',       label: 'Uñas',        icon: '💅' },
  { value: 'barber',      label: 'Barbería',    icon: '🪒' },
  { value: 'spa',         label: 'Spa',         icon: '🧖' },
  { value: 'massage',     label: 'Masajes',     icon: '💆' },
  { value: 'aesthetic',   label: 'Estética',    icon: '✨' },
  { value: 'brows',       label: 'Cejas',       icon: '👁️' },
  { value: 'skincare',    label: 'Skincare',    icon: '🧴' },
  { value: 'makeup',      label: 'Maquillaje',  icon: '💋' },
  { value: 'fitness',     label: 'Fitness',     icon: '🏋️' },
  { value: 'yoga',        label: 'Yoga',        icon: '🧘' },
  { value: 'photography', label: 'Fotografía',  icon: '📸' },
]

const SORT_OPTIONS = [
  { value: 'distance',      label: 'Más cercanos' },
  { value: 'avg_rating',    label: 'Mejor valorados' },
  { value: 'total_reviews', label: 'Más reseñas' },
  { value: 'newest',        label: 'Más recientes' },
]

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function Stars({ rating }) {
  const r = Math.round(rating ?? 0)
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= r ? '#B8833A' : 'rgba(201,150,90,0.2)', fontSize: 12 }}>★</span>
      ))}
    </span>
  )
}

// ── Card estilo Booksy: horizontal, foto izquierda ─────────────
function ProfCard({ prof, userCoords }) {
  const minPrice = prof.services?.length
    ? Math.min(...prof.services.filter(s => s.is_active !== false).map(s => s.price))
    : null
  const topServices = prof.services?.filter(s => s.is_active !== false).slice(0, 3) ?? []
  const distKm = userCoords && prof.latitude && prof.longitude
    ? haversine(userCoords.lat, userCoords.lng, prof.latitude, prof.longitude)
    : null

  return (
    <Link
      to={`/professional/${prof.id}`}
      style={{ display: 'flex', textDecoration: 'none', gap: 0,
        background: 'rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.04)',
        borderRadius: 16, overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,150,90,0.3)'; e.currentTarget.style.background = 'rgba(184,131,58,0.07)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)'; e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
    >
      {/* Foto cuadrada */}
      <div style={{ width: 110, minHeight: 110, flexShrink: 0, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(201,150,90,0.1), rgba(20,14,8,0.9))' }}>
        {prof.cover_image_url
          ? <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, position: 'absolute', inset: 0 }}>✂️</div>
        }
        {prof.is_verified && (
          <div style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(184,131,58,0.92)', borderRadius: 100, padding: '2px 7px', fontSize: 9, color: '#F7F5F2', fontWeight: 700 }}>✓ Ver</div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '12px 14px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 600, color: '#1A1612', margin: 0, lineHeight: 1.2 }}>
              {prof.business_name}
            </h3>
            {minPrice != null && (
              <span style={{ fontSize: 13, color: '#B8833A', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', whiteSpace: 'nowrap', flexShrink: 0 }}>desde {minPrice}€</span>
            )}
          </div>

          <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', margin: '0 0 6px' }}>
            📍 {prof.city}
            {distKm !== null && (
              <span style={{ marginLeft: 6, color: 'rgba(201,150,90,0.7)', fontWeight: 600 }}>
                · {distKm < 1 ? `${Math.round(distKm*1000)}m` : `${distKm.toFixed(1)}km`}
              </span>
            )}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
            <Stars rating={prof.avg_rating} />
            <span style={{ fontSize: 12, color: '#B8833A', fontWeight: 600 }}>
              {prof.avg_rating ? Number(prof.avg_rating).toFixed(1) : '—'}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.2)' }}>({prof.total_reviews})</span>
          </div>
        </div>

        {/* Servicios chips */}
        {topServices.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {topServices.map(s => (
              <span key={s.id} style={{ fontSize: 10, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 100, padding: '2px 8px', color: 'rgba(247,242,234,0.4)', whiteSpace: 'nowrap' }}>
                {s.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div style={{ display: 'flex', gap: 0, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 16, overflow: 'hidden', height: 110 }}>
      <div className="skeleton" style={{ width: 110, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 16, width: '60%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 11, width: '40%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 11, width: '50%', borderRadius: 6 }} />
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch]     = useState(searchParams.get('q') ?? '')
  const [city, setCity]         = useState(searchParams.get('city') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [sort, setSort]         = useState('distance')
  const [minRating, setMinRating] = useState(0)
  const [showSort, setShowSort] = useState(false)
  const [userCoords, setUserCoords] = useState(null)
  const [geoStatus, setGeoStatus]   = useState('idle')

  useEffect(() => {
    if (!navigator.geolocation) { setGeoStatus('denied'); return }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      pos => { setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoStatus('granted') },
      () => { setGeoStatus('denied'); setSort('avg_rating') },
      { timeout: 8000 }
    )
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['professionals', { search, city, category, sort, minRating }],
    queryFn: () => profApi.getAll({
      search, city, category,
      sort: sort === 'distance' ? 'avg_rating' : sort,
      limit: 48,
      ...(minRating > 0 && { min_rating: minRating }),
    }).then(r => r.data),
    staleTime: 60 * 1000,
  })

  const handleSearch = e => { e?.preventDefault(); setSearchParams({ q: search, city, category }) }

  const rawResults = data?.data ?? []
  const results = sort === 'distance' && userCoords
    ? [...rawResults].sort((a, b) => {
        const dA = a.latitude && a.longitude ? haversine(userCoords.lat, userCoords.lng, a.latitude, a.longitude) : 9999
        const dB = b.latitude && b.longitude ? haversine(userCoords.lat, userCoords.lng, b.latitude, b.longitude) : 9999
        return dA - dB
      })
    : rawResults
  const total = data?.meta?.total ?? rawResults.length

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        .scroll-cats::-webkit-scrollbar { display: none; }
        .scroll-cats { -ms-overflow-style: none; scrollbar-width: none; }
        .cat-chip:hover { background: rgba(201,150,90,0.1) !important; border-color: rgba(184,131,58,0.28) !important; color: #B8833A !important; }
        .search-input:focus { border-color: rgba(201,150,90,0.5) !important; background: rgba(184,131,58,0.07) !important; }
        .rating-btn:hover { border-color: rgba(201,150,90,0.4) !important; color: #B8833A !important; }
        .sort-opt:hover { background: rgba(184,131,58,0.07) !important; }
      `}</style>

      {/* ── Sticky top: barra de búsqueda + categorías ── */}
      <div style={{
        position: 'sticky', top: 52, zIndex: 40,
        background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        {/* Búsqueda */}
        <div style={{ padding: '10px 16px 0', maxWidth: 1200, margin: '0 auto' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'rgba(26,22,18,0.3)', pointerEvents: 'none' }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Servicio o profesional..."
                className="search-input"
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  borderRadius: 10, padding: '10px 12px 10px 34px',
                  color: '#1A1612', fontSize: 14, outline: 'none',
                  fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Ciudad"
              className="search-input"
              style={{
                width: 110, background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.04)',
                borderRadius: 10, padding: '10px 12px',
                color: '#1A1612', fontSize: 14, outline: 'none',
                fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
                boxSizing: 'border-box', flexShrink: 0,
              }}
            />
            <button type="submit" style={{
              background: 'linear-gradient(135deg, #B8833A, #D4A055)',
              border: 'none', borderRadius: 10, padding: '0 16px',
              color: '#F7F5F2', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', flexShrink: 0, fontFamily: 'Outfit, sans-serif',
            }}>Buscar</button>
          </form>
        </div>

        {/* Categorías scroll */}
        <div className="scroll-cats" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 16px', maxWidth: 1200, margin: '0 auto' }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.value
            return (
              <button
                key={cat.value}
                className="cat-chip"
                onClick={() => setCategory(cat.value)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 100,
                  background: active ? 'rgba(201,150,90,0.15)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${active ? 'rgba(184,131,58,0.5)' : 'rgba(0,0,0,0.12)'}`,
                  color: active ? '#B8833A' : 'rgba(26,22,18,0.55)',
                  fontSize: 13, cursor: 'pointer', transition: 'all 0.18s',
                  fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span style={{ fontSize: 14 }}>{cat.icon}</span>
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 16px 80px' }}>

        {/* Barra de resultados + ordenar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
          {/* Count + rating filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'rgba(26,22,18,0.5)', fontFamily: 'Outfit, sans-serif' }}>
              {isLoading ? 'Buscando...' : <><span style={{ color: '#B8833A', fontWeight: 600 }}>{total}</span> profesionales</>}
            </span>
            {/* Rating pills */}
            {[0,3,4,5].map(r => (
              <button
                key={r}
                className="rating-btn"
                onClick={() => setMinRating(r)}
                style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 100, cursor: 'pointer',
                  background: minRating === r ? 'rgba(184,131,58,0.1)' : 'transparent',
                  border: `1px solid ${minRating === r ? 'rgba(184,131,58,0.4)' : 'rgba(0,0,0,0.12)'}`,
                  color: minRating === r ? '#B8833A' : 'rgba(26,22,18,0.45)',
                  fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s',
                }}
              >
                {r === 0 ? 'Todo' : `${r}★+`}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSort(!showSort)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.12)',
                borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                color: 'rgba(26,22,18,0.6)', fontSize: 12, fontFamily: 'Outfit, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {SORT_OPTIONS.find(o => o.value === sort)?.label}
              <span style={{ fontSize: 9, opacity: 0.5 }}>▼</span>
            </button>
            {showSort && (
              <>
                {/* Overlay para cerrar al tocar fuera */}
                <div onClick={() => setShowSort(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                <div
                  style={{
                    position: 'fixed',
                    bottom: 80, left: 16, right: 16,
                    background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)',
                    borderRadius: 16, overflow: 'hidden', zIndex: 50,
                    boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
                  }}
                >
                  <p style={{ padding: '12px 16px 8px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8833A', fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid rgba(0,0,0,0.06)', margin: 0 }}>
                    Ordenar por
                  </p>
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setShowSort(false) }}
                      style={{
                        width: '100%', textAlign: 'left', padding: '13px 16px',
                        background: sort === opt.value ? 'rgba(184,131,58,0.08)' : 'transparent',
                        border: 'none', borderBottom: '1px solid rgba(0,0,0,0.04)',
                        color: sort === opt.value ? '#B8833A' : 'rgba(26,22,18,0.75)',
                        fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
                        fontWeight: sort === opt.value ? 600 : 400,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                    >
                      {opt.label}
                      {sort === opt.value && <span style={{ color: '#B8833A', fontSize: 16 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Lista vertical */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : results.map(p => <ProfCard key={p.id} prof={p} userCoords={userCoords} />)
          }
        </div>

        {/* Empty state */}
        {!isLoading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(26,22,18,0.2)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 300, marginBottom: 6 }}>Sin resultados</p>
            <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', marginBottom: 20 }}>Prueba con otros términos o cambia la categoría</p>
            <button
              onClick={() => { setCategory(''); setMinRating(0); setSearch(''); setCity('') }}
              className="btn-outline" style={{ fontSize: 13 }}>
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  )
}