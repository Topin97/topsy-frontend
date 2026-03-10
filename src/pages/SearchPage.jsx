import { useState, useEffect, useRef } from 'react'
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
const DAY_SHORT = { monday:'L', tuesday:'M', wednesday:'X', thursday:'J', friday:'V', saturday:'S', sunday:'D' }

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

function worksOnDate(prof, date) {
  if (!prof.availability?.length) return true
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

// ── PRO CARD ────────────────────────────────────────────────────────────────
function ProfCard({ prof, userCoords }) {
  const minPrice = prof.services?.length
    ? Math.min(...prof.services.filter(s => s.is_active !== false).map(s => s.price))
    : null
  const topServices = prof.services?.filter(s => s.is_active !== false).slice(0, 3) ?? []
  const distKm = userCoords && prof.latitude && prof.longitude
    ? haversine(userCoords.lat, userCoords.lng, prof.latitude, prof.longitude)
    : null
  const activeDays = prof.availability?.filter(a => a.is_available).map(a => a.day_of_week) ?? []

  return (
    <Link
      to={`/professional/${prof.id}`}
      style={{ display: 'flex', textDecoration: 'none', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 20, overflow: 'hidden', transition: 'all 0.22s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,131,58,0.35)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(184,131,58,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none' }}
    >
      {/* Foto */}
      <div style={{ width: 110, minHeight: 110, flexShrink: 0, position: 'relative', overflow: 'hidden', background: '#EFEDE9' }}>
        {prof.cover_image_url
          ? <img src={prof.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, position: 'absolute', inset: 0 }}>✂️</div>
        }
        {prof.is_verified && (
          <div style={{ position: 'absolute', bottom: 6, left: 6, background: 'linear-gradient(135deg,#B8833A,#D4A055)', borderRadius: 100, padding: '2px 7px', fontSize: 8, color: '#FFFFFF', fontWeight: 800, letterSpacing: '0.04em' }}>✓ TOP</div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '12px 14px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 4 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 1 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1A1612', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {prof.business_name}
            </h3>
            {minPrice != null && (
              <span style={{ fontSize: 12, color: '#B8833A', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600 }}>desde {minPrice}€</span>
            )}
          </div>

          <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.45)', margin: '0 0 4px', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
            📍 {prof.city}
            {distKm !== null && (
              <span style={{ color: '#B8833A', fontWeight: 700 }}>· {distKm < 1 ? `${Math.round(distKm*1000)}m` : `${distKm.toFixed(1)}km`}</span>
            )}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Stars rating={prof.avg_rating} />
            <span style={{ fontSize: 12, color: '#B8833A', fontWeight: 700 }}>{prof.avg_rating ? Number(prof.avg_rating).toFixed(1) : '—'}</span>
            <span style={{ fontSize: 10, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>({prof.total_reviews})</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {/* Días disponibles */}
          {activeDays.length > 0 && (
            <div style={{ display: 'flex', gap: 3 }}>
              {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
                <span key={d} style={{
                  width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 700,
                  background: activeDays.includes(d) ? 'rgba(184,131,58,0.1)' : 'rgba(0,0,0,0.04)',
                  color: activeDays.includes(d) ? '#B8833A' : 'rgba(26,22,18,0.2)',
                  border: `1px solid ${activeDays.includes(d) ? 'rgba(184,131,58,0.2)' : 'transparent'}`,
                }}>{DAY_SHORT[d]}</span>
              ))}
            </div>
          )}

          {topServices.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {topServices.map(s => (
                <span key={s.id} style={{ fontSize: 10, background: '#F7F5F2', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 100, padding: '2px 8px', color: 'rgba(26,22,18,0.5)', whiteSpace: 'nowrap', fontFamily: 'Outfit, sans-serif' }}>
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div style={{ display: 'flex', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 20, overflow: 'hidden', height: 110 }}>
      <div className="skeleton" style={{ width: 110, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 16, width: '55%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 11, width: '35%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 11, width: '45%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 18, width: '60%', borderRadius: 100 }} />
      </div>
    </div>
  )
}

// ── DATE BAR ────────────────────────────────────────────────────────────────
function DateBar({ selectedDate, onSelect }) {
  const today = new Date(); today.setHours(0,0,0,0)
  const days = Array.from({ length: 8 }, (_, i) => addDays(today, i))
  return (
    <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
      <button onClick={() => onSelect(null)} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '7px 13px', borderRadius: 13, cursor: 'pointer', transition: 'all 0.18s', background: selectedDate === null ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#FFFFFF', border: `1.5px solid ${selectedDate === null ? 'transparent' : 'rgba(0,0,0,0.1)'}`, color: selectedDate === null ? '#FFFFFF' : 'rgba(26,22,18,0.5)', boxShadow: selectedDate === null ? '0 4px 14px rgba(184,131,58,0.3)' : '0 1px 4px rgba(0,0,0,0.04)', fontFamily: 'Outfit, sans-serif', minWidth: 48 }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>📅</span>
        <span style={{ fontSize: 9, fontWeight: 700, marginTop: 4, letterSpacing: '0.02em' }}>Todos</span>
      </button>
      {days.map(date => {
        const active = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        return (
          <button key={date.toISOString()} onClick={() => onSelect(date)} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '7px 12px', borderRadius: 13, cursor: 'pointer', transition: 'all 0.18s', background: active ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#FFFFFF', border: `1.5px solid ${active ? 'transparent' : isToday(date) ? 'rgba(184,131,58,0.3)' : 'rgba(0,0,0,0.1)'}`, color: active ? '#FFFFFF' : isToday(date) ? '#B8833A' : 'rgba(26,22,18,0.55)', boxShadow: active ? '0 4px 14px rgba(184,131,58,0.3)' : '0 1px 4px rgba(0,0,0,0.04)', fontFamily: 'Outfit, sans-serif', minWidth: 46 }}>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'capitalize', letterSpacing: '0.02em' }}>{isToday(date) ? 'Hoy' : isTomorrow(date) ? 'Mañ' : format(date, 'EEE', { locale: es })}</span>
            <span style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{format(date, 'd')}</span>
            <span style={{ fontSize: 8, opacity: active ? 0.85 : 0.5, textTransform: 'capitalize' }}>{format(date, 'MMM', { locale: es })}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── FILTER BOTTOM SHEET ─────────────────────────────────────────────────────
function FilterSheet({ onClose, sort, setSort, minRating, setMinRating, selectedDate, setSelectedDate, activeFilters }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#FFFFFF', borderRadius: '24px 24px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)', maxHeight: '85vh', overflowY: 'auto', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.08)', margin: '14px auto 0' }} />

        {/* Ordenar */}
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#B8833A', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Ordenar por</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setSort(opt.value)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '13px 16px', borderRadius: 14, border: `1.5px solid ${sort === opt.value ? 'rgba(184,131,58,0.4)' : 'rgba(0,0,0,0.08)'}`, background: sort === opt.value ? 'rgba(184,131,58,0.06)' : '#F7F5F2', color: sort === opt.value ? '#B8833A' : '#1A1612', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', fontWeight: sort === opt.value ? 700 : 400 }}>
                {opt.label}
                {sort === opt.value && <span style={{ color: '#B8833A', fontSize: 18 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Valoración mínima */}
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#B8833A', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Valoración mínima</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[0,3,4,5].map(r => (
              <button key={r} onClick={() => setMinRating(r)} style={{ flex: 1, padding: '11px 0', borderRadius: 13, border: `1.5px solid ${minRating === r ? 'rgba(184,131,58,0.4)' : 'rgba(0,0,0,0.1)'}`, background: minRating === r ? 'rgba(184,131,58,0.08)' : '#F7F5F2', color: minRating === r ? '#B8833A' : 'rgba(26,22,18,0.5)', fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', fontWeight: minRating === r ? 700 : 400 }}>
                {r === 0 ? 'Todo' : `${r}★+`}
              </button>
            ))}
          </div>
        </div>

        {/* Día */}
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#B8833A', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Disponibilidad</p>
          <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
            <DateBar selectedDate={selectedDate} onSelect={setSelectedDate} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 20px 0', display: 'flex', gap: 10 }}>
          {activeFilters > 0 && (
            <button onClick={() => { setMinRating(0); setSelectedDate(null); setSort('distance') }} style={{ flex: 1, background: 'rgba(220,38,38,0.06)', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 14, padding: '13px 0', color: '#dc2626', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', fontWeight: 600 }}>
              ✕ Limpiar ({activeFilters})
            </button>
          )}
          <button onClick={onClose} style={{ flex: 2, background: 'linear-gradient(135deg,#B8833A,#D4A055)', border: 'none', borderRadius: 14, padding: '13px 0', color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 14px rgba(184,131,58,0.3)' }}>
            Ver resultados
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MAIN ────────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch]       = useState(searchParams.get('q') ?? '')
  const [city, setCity]           = useState(searchParams.get('city') ?? '')
  const [category, setCategory]   = useState(searchParams.get('category') ?? '')
  const [sort, setSort]           = useState('distance')
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [userCoords, setUserCoords]     = useState(null)
  const [geoStatus, setGeoStatus]       = useState('idle')
  const inputRef = useRef(null)

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

  const rawResults  = data?.data ?? []
  const dateFiltered = selectedDate ? rawResults.filter(p => worksOnDate(p, selectedDate)) : rawResults
  const results = sort === 'distance' && userCoords
    ? [...dateFiltered].sort((a, b) => {
        const dA = a.latitude && a.longitude ? haversine(userCoords.lat, userCoords.lng, a.latitude, a.longitude) : 9999
        const dB = b.latitude && b.longitude ? haversine(userCoords.lat, userCoords.lng, b.latitude, b.longitude) : 9999
        return dA - dB
      })
    : dateFiltered

  const total = results.length
  const activeFilters = [minRating > 0, selectedDate, sort !== 'distance'].filter(Boolean).length

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2' }}>
      <style>{`
        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .search-inp:focus { border-color: #B8833A !important; box-shadow: 0 0 0 3px rgba(184,131,58,0.1) !important; }
        .cat-chip { transition: all 0.15s !important; }
        .cat-chip:active { transform: scale(0.96) !important; }
        .pro-card:hover { border-color: rgba(184,131,58,0.3) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
      `}</style>

      {/* ── STICKY HEADER ── */}
      <div style={{ position: 'sticky', top: 52, zIndex: 40, background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

        {/* Barra búsqueda */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, padding: '10px 14px 0', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none', opacity: 0.35 }}>🔍</span>
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Servicio o profesional..."
              className="search-inp"
              style={{ width: '100%', background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.09)', borderRadius: 12, padding: '10px 10px 10px 34px', color: '#1A1612', fontSize: 14, outline: 'none', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', boxSizing: 'border-box' }}
            />
          </div>
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="Ciudad"
            className="search-inp"
            style={{ width: 90, background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.09)', borderRadius: 12, padding: '10px 10px', color: '#1A1612', fontSize: 14, outline: 'none', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', flexShrink: 0, boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ background: 'linear-gradient(135deg,#B8833A,#D4A055)', border: 'none', borderRadius: 12, padding: '0 14px', color: '#FFFFFF', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0, fontFamily: 'Outfit, sans-serif', boxShadow: '0 3px 10px rgba(184,131,58,0.3)' }}>
            Buscar
          </button>
        </form>

        {/* Categorías chips */}
        <div className="no-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '9px 14px 0', maxWidth: 800, margin: '0 auto' }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.value
            return (
              <button key={cat.value} className="cat-chip" onClick={() => setCategory(cat.value)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 100, background: active ? 'rgba(184,131,58,0.1)' : '#F7F5F2', border: `1.5px solid ${active ? 'rgba(184,131,58,0.4)' : 'rgba(0,0,0,0.09)'}`, color: active ? '#B8833A' : 'rgba(26,22,18,0.55)', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', fontWeight: active ? 700 : 400 }}>
                <span style={{ fontSize: 13 }}>{cat.icon}</span>{cat.label}
              </button>
            )
          })}
        </div>

        {/* Date bar + botón filtros */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px 10px', maxWidth: 800, margin: '0 auto' }}>
          <div className="no-scroll" style={{ flex: 1, overflowX: 'auto' }}>
            <DateBar selectedDate={selectedDate} onSelect={setSelectedDate} />
          </div>
          {/* Botón filtros (móvil) */}
          <button onClick={() => setShowFilters(true)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, background: activeFilters > 0 ? 'rgba(184,131,58,0.1)' : '#F7F5F2', border: `1.5px solid ${activeFilters > 0 ? 'rgba(184,131,58,0.35)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 12, padding: '8px 13px', cursor: 'pointer', color: activeFilters > 0 ? '#B8833A' : 'rgba(26,22,18,0.5)', fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: activeFilters > 0 ? 700 : 400, whiteSpace: 'nowrap' }}>
            ⚙️ Filtros{activeFilters > 0 && <span style={{ background: '#B8833A', color: '#FFFFFF', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800 }}>{activeFilters}</span>}
          </button>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '12px 14px 100px' }}>

        {/* Barra resultados + sort rápido */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
          <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.5)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
            {isLoading ? 'Buscando...' : (
              <><span style={{ color: '#1A1612', fontWeight: 700 }}>{total}</span> profesionales{selectedDate && <span style={{ color: '#B8833A' }}> · {dayLabel(selectedDate)}</span>}</>
            )}
          </p>

          {/* Sort rápido desktop */}
          <div style={{ display: 'flex', gap: 6 }}>
            {SORT_OPTIONS.slice(0, 2).map(opt => (
              <button key={opt.value} onClick={() => setSort(opt.value)} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 100, cursor: 'pointer', background: sort === opt.value ? 'rgba(184,131,58,0.1)' : 'transparent', border: `1.5px solid ${sort === opt.value ? 'rgba(184,131,58,0.35)' : 'rgba(0,0,0,0.09)'}`, color: sort === opt.value ? '#B8833A' : 'rgba(26,22,18,0.45)', fontFamily: 'Outfit, sans-serif', fontWeight: sort === opt.value ? 700 : 400, whiteSpace: 'nowrap' }}>
                {opt.label}
              </button>
            ))}
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
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              {selectedDate ? '📅' : '🔍'}
            </div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 300, color: '#1A1612', marginBottom: 8 }}>Sin resultados</p>
            <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif', color: 'rgba(26,22,18,0.4)', marginBottom: 20 }}>
              {selectedDate ? `Ningún profesional trabaja el ${dayLabel(selectedDate)}` : 'Prueba con otros términos o categoría'}
            </p>
            <button onClick={() => { setCategory(''); setMinRating(0); setSelectedDate(null); setSearch(''); setCity('') }} style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '10px 24px', fontSize: 13, cursor: 'pointer', color: 'rgba(26,22,18,0.6)', fontFamily: 'Outfit, sans-serif', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>

      {/* ── FILTER SHEET ── */}
      {showFilters && (
        <FilterSheet
          onClose={() => setShowFilters(false)}
          sort={sort} setSort={setSort}
          minRating={minRating} setMinRating={setMinRating}
          selectedDate={selectedDate} setSelectedDate={setSelectedDate}
          activeFilters={activeFilters}
        />
      )}
    </div>
  )
}
