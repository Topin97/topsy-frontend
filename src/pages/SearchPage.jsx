import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { profApi } from '../services/api'
import { format, addDays, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

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
  { value: 'distance',      label: '📍 Más cercanos' },
  { value: 'avg_rating',    label: '⭐ Mejor valorados' },
  { value: 'total_reviews', label: '💬 Más reseñas' },
  { value: 'newest',        label: '🆕 Más recientes' },
]

const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function dayLabel(date) {
  if (isToday(date)) return 'Hoy'
  if (isTomorrow(date)) return 'Mañana'
  return format(date, 'EEE d', { locale: es })
}

// Checks if a professional works on a given date
function worksOnDate(prof, date) {
  if (!prof.availability?.length) return true // sin datos, mostrar siempre
  const dayName = DAY_NAMES[date.getDay()]
  return prof.availability.some(a => a.day_of_week === dayName && a.is_available)
}

function Stars({ rating }) {
  const r = Math.round(rating ?? 0)
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= r ? '#B8833A' : 'rgba(184,131,58,0.2)', fontSize: 12 }}>★</span>
      ))}
    </span>
  )
}

function ProfCard({ prof, userCoords }) {
  const minPrice = prof.services?.length
    ? Math.min(...prof.services.filter(s => s.is_active !== false).map(s => s.price))
    : null
  const topServices = prof.services?.filter(s => s.is_active !== false).slice(0, 3) ?? []
  const distKm = userCoords && prof.latitude && prof.longitude
    ? haversine(userCoords.lat, userCoords.lng, prof.latitude, prof.longitude)
    : null

  // Días con disponibilidad
  const activeDays = prof.availability?.filter(a => a.is_available).map(a => a.day_of_week) ?? []
  const DAY_SHORT = { monday:'L', tuesday:'M', wednesday:'X', thursday:'J', friday:'V', saturday:'S', sunday:'D' }

  return (
    <Link
      to={`/professional/${prof.id}`}
      style={{
        display: 'flex', textDecoration: 'none',
        background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)',
        borderRadius: 18, overflow: 'hidden', transition: 'all 0.22s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,131,58,0.35)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(184,131,58,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none' }}
    >
      {/* Foto */}
      <div style={{ width: 114, minHeight: 114, flexShrink: 0, position: 'relative', overflow: 'hidden', background: '#EFEDE9' }}>
        {prof.cover_image_url
          ? <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, position: 'absolute', inset: 0 }}>✂️</div>
        }
        {prof.is_verified && (
          <div style={{ position: 'absolute', bottom: 6, left: 6, background: 'linear-gradient(135deg,#B8833A,#D4A055)', borderRadius: 100, padding: '2px 8px', fontSize: 9, color: '#FFFFFF', fontWeight: 800 }}>✓ TOP</div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '13px 15px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1A1612', margin: 0, lineHeight: 1.2 }}>
              {prof.business_name}
            </h3>
            {minPrice != null && (
              <span style={{ fontSize: 13, color: '#B8833A', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600 }}>desde {minPrice}€</span>
            )}
          </div>

          <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.45)', margin: '0 0 5px', fontFamily: 'Outfit, sans-serif' }}>
            📍 {prof.city}
            {distKm !== null && (
              <span style={{ marginLeft: 6, color: '#B8833A', fontWeight: 600 }}>
                · {distKm < 1 ? `${Math.round(distKm*1000)}m` : `${distKm.toFixed(1)}km`}
              </span>
            )}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
            <Stars rating={prof.avg_rating} />
            <span style={{ fontSize: 12, color: '#B8833A', fontWeight: 600 }}>
              {prof.avg_rating ? Number(prof.avg_rating).toFixed(1) : '—'}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>({prof.total_reviews})</span>
          </div>
        </div>

        {/* Días disponibles */}
        {activeDays.length > 0 && (
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
              <span key={d} style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
                background: activeDays.includes(d) ? 'rgba(184,131,58,0.1)' : 'rgba(0,0,0,0.04)',
                color: activeDays.includes(d) ? '#B8833A' : 'rgba(26,22,18,0.2)',
                border: `1px solid ${activeDays.includes(d) ? 'rgba(184,131,58,0.25)' : 'transparent'}`,
              }}>{DAY_SHORT[d]}</span>
            ))}
          </div>
        )}

        {/* Servicios chips */}
        {topServices.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {topServices.map(s => (
              <span key={s.id} style={{ fontSize: 10, background: '#F7F5F2', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 100, padding: '2px 9px', color: 'rgba(26,22,18,0.5)', whiteSpace: 'nowrap', fontFamily: 'Outfit, sans-serif' }}>
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
    <div style={{ display: 'flex', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 18, overflow: 'hidden', height: 114 }}>
      <div className="skeleton" style={{ width: 114, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '13px 15px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 16, width: '55%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 11, width: '35%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 11, width: '45%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 20, width: '70%', borderRadius: 100 }} />
      </div>
    </div>
  )
}

// ── DATE PICKER BAR ──────────────────────────────────────────────
function DateBar({ selectedDate, onSelect }) {
  const today = new Date()
  today.setHours(0,0,0,0)
  const days = Array.from({ length: 8 }, (_, i) => addDays(today, i))

  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 0 2px' }}>
      <style>{`.datebar::-webkit-scrollbar{display:none}`}</style>
      {/* "Cualquier día" */}
      <button
        onClick={() => onSelect(null)}
        style={{
          flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '8px 14px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.18s',
          background: selectedDate === null ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#FFFFFF',
          border: `1.5px solid ${selectedDate === null ? 'transparent' : 'rgba(0,0,0,0.1)'}`,
          color: selectedDate === null ? '#FFFFFF' : 'rgba(26,22,18,0.5)',
          boxShadow: selectedDate === null ? '0 4px 14px rgba(184,131,58,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
          fontFamily: 'Outfit, sans-serif',
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>📅</span>
        <span style={{ fontSize: 10, fontWeight: 700, marginTop: 4, letterSpacing: '0.02em' }}>Todos</span>
      </button>

      {days.map(date => {
        const active = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        return (
          <button
            key={date.toISOString()}
            onClick={() => onSelect(date)}
            style={{
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '8px 14px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.18s',
              background: active ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#FFFFFF',
              border: `1.5px solid ${active ? 'transparent' : isToday(date) ? 'rgba(184,131,58,0.3)' : 'rgba(0,0,0,0.1)'}`,
              color: active ? '#FFFFFF' : isToday(date) ? '#B8833A' : 'rgba(26,22,18,0.55)',
              boxShadow: active ? '0 4px 14px rgba(184,131,58,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
              fontFamily: 'Outfit, sans-serif', minWidth: 52,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 600, textTransform: 'capitalize', letterSpacing: '0.02em' }}>
              {isToday(date) ? 'Hoy' : isTomorrow(date) ? 'Mañana' : format(date, 'EEE', { locale: es })}
            </span>
            <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>{format(date, 'd')}</span>
            <span style={{ fontSize: 9, opacity: active ? 0.8 : 0.5, textTransform: 'capitalize' }}>{format(date, 'MMM', { locale: es })}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch]       = useState(searchParams.get('q') ?? '')
  const [city, setCity]           = useState(searchParams.get('city') ?? '')
  const [category, setCategory]   = useState(searchParams.get('category') ?? '')
  const [sort, setSort]           = useState('distance')
  const [minRating, setMinRating] = useState(0)
  const [showSort, setShowSort]   = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [userCoords, setUserCoords]     = useState(null)
  const [geoStatus, setGeoStatus]       = useState('idle')

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

  // Filtrar por día seleccionado
  const dateFiltered = selectedDate
    ? rawResults.filter(p => worksOnDate(p, selectedDate))
    : rawResults

  // Ordenar
  const results = sort === 'distance' && userCoords
    ? [...dateFiltered].sort((a, b) => {
        const dA = a.latitude && a.longitude ? haversine(userCoords.lat, userCoords.lng, a.latitude, a.longitude) : 9999
        const dB = b.latitude && b.longitude ? haversine(userCoords.lat, userCoords.lng, b.latitude, b.longitude) : 9999
        return dA - dB
      })
    : dateFiltered

  const total = results.length
  const activeFilters = [category, minRating > 0, selectedDate].filter(Boolean).length

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2' }}>
      <style>{`
        .scroll-cats::-webkit-scrollbar { display: none; }
        .scroll-cats { -ms-overflow-style: none; scrollbar-width: none; }
        .cat-chip:hover { background: rgba(184,131,58,0.1) !important; border-color: rgba(184,131,58,0.3) !important; color: #B8833A !important; }
        .search-input:focus { border-color: #B8833A !important; box-shadow: 0 0 0 3px rgba(184,131,58,0.1) !important; }
        .rating-btn:hover { border-color: rgba(184,131,58,0.4) !important; color: #B8833A !important; }
        .sort-opt:hover { background: rgba(184,131,58,0.07) !important; }
      `}</style>

      {/* ── STICKY HEADER ── */}
      <div style={{ position: 'sticky', top: 52, zIndex: 40, background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>

        {/* Barra búsqueda */}
        <div style={{ padding: '10px 16px 0', maxWidth: 800, margin: '0 auto' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none', opacity: 0.4 }}>🔍</span>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Servicio o profesional..."
                className="search-input"
                style={{ width: '100%', background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '10px 12px 10px 36px', color: '#1A1612', fontSize: 14, outline: 'none', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', boxSizing: 'border-box' }}
              />
            </div>
            <input
              value={city} onChange={e => setCity(e.target.value)}
              placeholder="Ciudad"
              className="search-input"
              style={{ width: 100, background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '10px 12px', color: '#1A1612', fontSize: 14, outline: 'none', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', boxSizing: 'border-box', flexShrink: 0 }}
            />
            <button type="submit" style={{ background: 'linear-gradient(135deg,#B8833A,#D4A055)', border: 'none', borderRadius: 12, padding: '0 16px', color: '#FFFFFF', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0, fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 12px rgba(184,131,58,0.25)' }}>Buscar</button>
          </form>
        </div>

        {/* Categorías */}
        <div className="scroll-cats" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 16px 4px', maxWidth: 800, margin: '0 auto' }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.value
            return (
              <button key={cat.value} className="cat-chip" onClick={() => setCategory(cat.value)} style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 100,
                background: active ? 'rgba(184,131,58,0.12)' : '#F7F5F2',
                border: `1.5px solid ${active ? 'rgba(184,131,58,0.45)' : 'rgba(0,0,0,0.1)'}`,
                color: active ? '#B8833A' : 'rgba(26,22,18,0.55)',
                fontSize: 13, cursor: 'pointer', transition: 'all 0.18s',
                fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', fontWeight: active ? 700 : 400,
              }}>
                <span style={{ fontSize: 14 }}>{cat.icon}</span>
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* DATE BAR */}
        <div className="scroll-cats" style={{ overflowX: 'auto', padding: '8px 16px 10px', maxWidth: 800, margin: '0 auto' }}>
          <DateBar selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '14px 16px 100px' }}>

        {/* Barra resultados */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'rgba(26,22,18,0.5)', fontFamily: 'Outfit, sans-serif' }}>
              {isLoading ? 'Buscando...' : (
                <><span style={{ color: '#B8833A', fontWeight: 700 }}>{total}</span> profesionales{selectedDate && <span style={{ color: 'rgba(26,22,18,0.4)' }}> · {dayLabel(selectedDate)}</span>}</>
              )}
            </span>
            {/* Rating pills */}
            {[0,3,4,5].map(r => (
              <button key={r} className="rating-btn" onClick={() => setMinRating(r)} style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 100, cursor: 'pointer',
                background: minRating === r ? 'rgba(184,131,58,0.1)' : '#FFFFFF',
                border: `1.5px solid ${minRating === r ? 'rgba(184,131,58,0.4)' : 'rgba(0,0,0,0.1)'}`,
                color: minRating === r ? '#B8833A' : 'rgba(26,22,18,0.45)',
                fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s', fontWeight: minRating === r ? 700 : 400,
              }}>
                {r === 0 ? 'Todo' : `${r}★+`}
              </button>
            ))}
            {activeFilters > 0 && (
              <button onClick={() => { setCategory(''); setMinRating(0); setSelectedDate(null) }} style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 100, cursor: 'pointer',
                background: 'rgba(220,38,38,0.06)', border: '1.5px solid rgba(220,38,38,0.2)',
                color: '#dc2626', fontFamily: 'Outfit, sans-serif', fontWeight: 600,
              }}>
                ✕ Limpiar ({activeFilters})
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowSort(!showSort)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.1)',
              borderRadius: 10, padding: '7px 12px', cursor: 'pointer',
              color: 'rgba(26,22,18,0.6)', fontSize: 12, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              {SORT_OPTIONS.find(o => o.value === sort)?.label}
              <span style={{ fontSize: 8, opacity: 0.4 }}>▼</span>
            </button>
            {showSort && (
              <>
                <div onClick={() => setShowSort(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                <div style={{ position: 'fixed', bottom: 80, left: 16, right: 16, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 18, overflow: 'hidden', zIndex: 50, boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }}>
                  <p style={{ padding: '14px 16px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8833A', fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid rgba(0,0,0,0.06)', margin: 0 }}>
                    Ordenar por
                  </p>
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => { setSort(opt.value); setShowSort(false) }} style={{
                      width: '100%', textAlign: 'left', padding: '14px 16px',
                      background: sort === opt.value ? 'rgba(184,131,58,0.08)' : 'transparent',
                      border: 'none', borderBottom: '1px solid rgba(0,0,0,0.04)',
                      color: sort === opt.value ? '#B8833A' : 'rgba(26,22,18,0.75)',
                      fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
                      fontWeight: sort === opt.value ? 700 : 400,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      {opt.label}
                      {sort === opt.value && <span style={{ color: '#B8833A', fontSize: 16 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : results.map(p => <ProfCard key={p.id} prof={p} userCoords={userCoords} />)
          }
        </div>

        {/* Empty state */}
        {!isLoading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>
              {selectedDate ? '📅' : '🔍'}
            </div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 300, color: '#1A1612', marginBottom: 8 }}>Sin resultados</p>
            <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'rgba(26,22,18,0.4)', marginBottom: 20 }}>
              {selectedDate
                ? `Ningún profesional trabaja el ${dayLabel(selectedDate)}. Prueba otro día.`
                : 'Prueba con otros términos o cambia la categoría'
              }
            </p>
            <button onClick={() => { setCategory(''); setMinRating(0); setSelectedDate(null); setSearch(''); setCity('') }} style={{
              background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12,
              padding: '10px 24px', fontSize: 13, cursor: 'pointer', color: 'rgba(26,22,18,0.6)',
              fontFamily: 'Outfit, sans-serif', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
