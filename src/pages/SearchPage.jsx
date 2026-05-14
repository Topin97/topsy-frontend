import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useFavorites } from '../hooks/useFavorites'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { profApi } from '../services/api'
import { format, addDays, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

function CityAutocomplete({ value, onChange, placeholder = 'Ciudad', inputStyle = {}, className = '' }) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const debounceRef = useRef(null)
  const wrapRef = useRef(null)

  // Sync external value changes
  useEffect(() => { setQuery(value) }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchCities = useCallback((q) => {
    if (!q || q.length < 2) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&countrycodes=es&featuretype=city`,
      { headers: { 'Accept-Language': 'es', 'User-Agent': 'Topsy/1.0' } }
    )
      .then(r => r.json())
      .then(data => {
        const seen = new Set()
        const cities = data
          .filter(item => {
            const city = item.address?.city || item.address?.town || item.address?.village || item.address?.municipality || item.name
            if (!city || seen.has(city.toLowerCase())) return false
            seen.add(city.toLowerCase())
            return true
          })
          .map(item => ({
            name: item.address?.city || item.address?.town || item.address?.village || item.address?.municipality || item.name,
            province: item.address?.state || '',
          }))
        setSuggestions(cities)
        setOpen(cities.length > 0)
        setActiveIdx(-1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    onChange(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchCities(val), 320)
  }

  const handleSelect = (city) => {
    setQuery(city.name)
    onChange(city.name)
    setSuggestions([])
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); handleSelect(suggestions[activeIdx]) }
    else if (e.key === 'Escape') { setOpen(false) }
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={className}
          style={inputStyle}
          autoComplete="off"
        />
        {loading && (
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, border: '2px solid rgba(197,138,61,0.3)', borderTopColor: '#B57932', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 300,
          background: '#FFFFFF', borderRadius: 14, boxShadow: '0 8px 32px rgba(17,17,17,0.14)',
          border: '1.5px solid rgba(17,17,17,0.07)', overflow: 'hidden',
        }}>
          {suggestions.map((city, i) => (
            <button
              key={i}
              onMouseDown={() => handleSelect(city)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '11px 14px', background: activeIdx === i ? 'rgba(197,138,61,0.07)' : 'transparent',
                border: 'none', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(17,17,17,0.05)' : 'none',
                cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
              }}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <span style={{ fontSize: 13, opacity: 0.4, flexShrink: 0 }}>📍</span>
              <div>
                <span style={{ fontSize: 14, color: '#181512', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{city.name}</span>
                {city.province && <span style={{ fontSize: 11, color: 'rgba(24,21,18,0.35)', fontFamily: 'Outfit, sans-serif', marginLeft: 6 }}>{city.province}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const CATEGORIES = [
  { value: '',            label: 'Todo',       icon: '✦' },
  { value: 'hair',        label: 'Peluquería', icon: '💇' },
  { value: 'nails',       label: 'Uñas',       icon: '💅' },
  { value: 'barber',      label: 'Barbería',   icon: '🪒' },
  { value: 'spa',         label: 'Spa',        icon: '🧖' },
  { value: 'massage',     label: 'Masajes',    icon: '💆' },
  { value: 'aesthetic',   label: 'Estética',   icon: '✨' },
  { value: 'brows',       label: 'Cejas',      icon: '👁️' },
  { value: 'skincare',    label: 'Skincare',   icon: '🧴' },
  { value: 'makeup',      label: 'Maquillaje', icon: '💋' },
  { value: 'fitness',     label: 'Fitness',    icon: '🏋️' },
  { value: 'yoga',        label: 'Yoga',       icon: '🧘' },
]

const SORT_OPTIONS = [
  { value: 'distance',      label: 'Más cercanos' },
  { value: 'avg_rating',    label: 'Mejor valorados' },
  { value: 'total_reviews', label: 'Más reseñas' },
  { value: 'newest',        label: 'Más recientes' },
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
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= r ? '#C58A3D' : 'rgba(197,138,61,0.2)', fontSize: 12 }}>★</span>
      ))}
    </span>
  )
}

function ProfCard({ prof, userCoords }) {
  const [hov, setHov] = useState(false)
  const { isFav, toggle } = useFavorites()

  const minPrice = prof.services?.length
    ? Math.min(...prof.services.filter(s => s.is_active !== false).map(s => s.price))
    : null
  const topServices = prof.services?.filter(s => s.is_active !== false).slice(0, 3) ?? []
  const distKm = userCoords && prof.latitude && prof.longitude
    ? haversine(userCoords.lat, userCoords.lng, prof.latitude, prof.longitude)
    : null
  const activeDays = prof.availability?.filter(a => a.is_available).map(a => a.day_of_week) ?? []
  const isNew = prof.created_at && (Date.now() - new Date(prof.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000

  return (
    <Link
      to={`/professional/${prof.id}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', textDecoration: 'none',
        background: '#FFFFFF',
        border: `1.5px solid ${hov ? 'rgba(197,138,61,0.35)' : 'rgba(17,17,17,0.07)'}`,
        borderRadius: 20, overflow: 'hidden',
        boxShadow: hov ? '0 12px 32px rgba(17,17,17,0.10)' : '0 2px 8px rgba(17,17,17,0.05)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Imagen */}
      <div style={{ width: 120, minHeight: 120, flexShrink: 0, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#F4EEE6,#EDE4D4)' }}>
        {prof.cover_image_url
          ? <img src={prof.cover_image_url} alt={prof.business_name} loading="lazy" decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.4s ease' }}
              onError={e => { e.target.style.display = 'none' }}
            />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, position: 'absolute', inset: 0 }}>✨</div>
        }
        {prof.is_verified && (
          <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'linear-gradient(135deg,#B97830,#D19B52)', borderRadius: 999, padding: '3px 8px', fontSize: 9, color: '#FFF', fontWeight: 800, letterSpacing: '0.05em' }}>✓ TOP</div>
        )}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(prof.id) }}
          style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.15)', transition: 'transform 0.15s' }}
        >
          {isFav(prof.id) ? '❤️' : '🤍'}
        </button>
        {isNew && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'linear-gradient(135deg,#B8833A,#D4A055)',
            color: '#FFFFFF', fontSize: 9, fontWeight: 800,
            padding: '3px 8px', borderRadius: 999,
            fontFamily: 'Outfit, sans-serif', letterSpacing: '0.08em',
            boxShadow: '0 3px 8px rgba(184,131,58,0.45)',
            textTransform: 'uppercase',
          }}>✨ Nuevo</div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '14px 16px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6 }}>
        <div>
          {/* Nombre + precio */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', fontWeight: 700, color: '#181512', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {prof.business_name}
            </h3>
            {minPrice != null && (
              <span style={{ fontSize: 13, color: '#B57932', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600 }}>
                desde {minPrice}€
              </span>
            )}
          </div>

          {/* Ciudad + distancia */}
          <p style={{ fontSize: 12, color: 'rgba(24,21,18,0.45)', margin: '0 0 5px', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
            📍 {prof.city}
            {distKm !== null && (
              <span style={{ color: '#B57932', fontWeight: 700 }}>
                · {distKm < 1 ? `${Math.round(distKm*1000)}m` : `${distKm.toFixed(1)}km`}
              </span>
            )}
          </p>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Stars rating={prof.avg_rating} />
            <span style={{ fontSize: 12, color: '#B57932', fontWeight: 700 }}>
              {prof.avg_rating ? Number(prof.avg_rating).toFixed(1) : '—'}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(24,21,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>
              ({prof.total_reviews || 0})
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Días disponibles */}
          {activeDays.length > 0 && (
            <div style={{ display: 'flex', gap: 3 }}>
              {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
                <span key={d} style={{
                  width: 20, height: 20, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 700,
                  background: activeDays.includes(d) ? 'rgba(197,138,61,0.1)' : 'rgba(17,17,17,0.04)',
                  color: activeDays.includes(d) ? '#B57932' : 'rgba(24,21,18,0.2)',
                  border: `1px solid ${activeDays.includes(d) ? 'rgba(197,138,61,0.2)' : 'transparent'}`,
                }}>{DAY_SHORT[d]}</span>
              ))}
            </div>
          )}

          {/* Servicios estilo Treatwell — duración + precio destacado */}
          {topServices.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {topServices.slice(0, 2).map(s => (
                <div key={s.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: 8,
                  paddingTop: 4,
                  borderTop: '1px solid rgba(17,17,17,0.05)',
                }}>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <p style={{
                      fontSize: 11.5, fontWeight: 600, color: '#1A1612',
                      margin: 0, fontFamily: 'Outfit, sans-serif',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{s.name}</p>
                    {s.duration_minutes && (
                      <p style={{
                        fontSize: 10, color: 'rgba(24,21,18,0.4)',
                        margin: '1px 0 0', fontFamily: 'Outfit, sans-serif',
                      }}>{s.duration_minutes} min</p>
                    )}
                  </div>
                  <p style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 14, color: '#B8833A', fontWeight: 700,
                    margin: 0, whiteSpace: 'nowrap',
                  }}>{s.price}€</p>
                </div>
              ))}
              {topServices.length > 2 && (
                <p style={{
                  fontSize: 10, color: '#B8833A',
                  margin: '2px 0 0', fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                }}>
                  + {topServices.length - 2} servicio{topServices.length - 2 > 1 ? 's' : ''} más
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div style={{ display: 'flex', background: '#fff', border: '1.5px solid rgba(17,17,17,0.07)', borderRadius: 20, overflow: 'hidden', height: 120 }}>
      <div className="skel" style={{ width: 120, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skel" style={{ height: 16, width: '55%', borderRadius: 6 }} />
        <div className="skel" style={{ height: 11, width: '35%', borderRadius: 6 }} />
        <div className="skel" style={{ height: 11, width: '45%', borderRadius: 6 }} />
        <div className="skel" style={{ height: 18, width: '60%', borderRadius: 999 }} />
      </div>
    </div>
  )
}

function DateBar({ selectedDate, onSelect }) {
  const today = new Date(); today.setHours(0,0,0,0)
  const days = Array.from({ length: 8 }, (_, i) => addDays(today, i))
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
      {/* Todos */}
      <button onClick={() => onSelect(null)} style={{
        flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '6px 12px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.18s',
        background: selectedDate === null ? 'linear-gradient(135deg,#B97830,#D19B52)' : '#fff',
        border: `1.5px solid ${selectedDate === null ? 'transparent' : 'rgba(17,17,17,0.1)'}`,
        color: selectedDate === null ? '#fff' : 'rgba(24,21,18,0.5)',
        boxShadow: selectedDate === null ? '0 4px 12px rgba(185,120,48,0.3)' : '0 1px 4px rgba(17,17,17,0.04)',
        fontFamily: 'Outfit, sans-serif', minWidth: 46,
      }}>
        <span style={{ fontSize: 13, lineHeight: 1 }}>📅</span>
        <span style={{ fontSize: 9, fontWeight: 700, marginTop: 3 }}>Todos</span>
      </button>
      {days.map(date => {
        const active = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        return (
          <button key={date.toISOString()} onClick={() => onSelect(date)} style={{
            flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '6px 11px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.18s',
            background: active ? 'linear-gradient(135deg,#B97830,#D19B52)' : '#fff',
            border: `1.5px solid ${active ? 'transparent' : isToday(date) ? 'rgba(197,138,61,0.3)' : 'rgba(17,17,17,0.1)'}`,
            color: active ? '#fff' : isToday(date) ? '#B57932' : 'rgba(24,21,18,0.55)',
            boxShadow: active ? '0 4px 12px rgba(185,120,48,0.3)' : '0 1px 4px rgba(17,17,17,0.04)',
            fontFamily: 'Outfit, sans-serif', minWidth: 44,
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'capitalize' }}>
              {isToday(date) ? 'Hoy' : isTomorrow(date) ? 'Mañ' : format(date, 'EEE', { locale: es })}
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{format(date, 'd')}</span>
            <span style={{ fontSize: 8, opacity: active ? 0.85 : 0.45, textTransform: 'capitalize' }}>
              {format(date, 'MMM', { locale: es })}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function FilterSheet({ onClose, sort, setSort, minRating, setMinRating, maxPrice, setMaxPrice, selectedDate, setSelectedDate, activeFilters, city, setCity }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#FFFFFF', borderRadius: '24px 24px 0 0',
        boxShadow: '0 -8px 40px rgba(17,17,17,0.15)',
        maxHeight: '85vh', overflowY: 'auto',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(17,17,17,0.08)', margin: '14px auto 0' }} />

        <div style={{ padding: '20px 20px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#B57932', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Ciudad</p>
          <CityAutocomplete
            value={city} onChange={setCity}
            placeholder="Ej: Madrid, Barcelona..."
            inputStyle={{
              width: '100%', background: '#F8F5F0', border: '1.5px solid rgba(17,17,17,0.09)',
              borderRadius: 14, padding: '12px 14px', color: '#181512', fontSize: 14,
              outline: 'none', fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ padding: '20px 20px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#B57932', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Ordenar por</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setSort(opt.value)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '13px 16px', borderRadius: 14,
                border: `1.5px solid ${sort === opt.value ? 'rgba(197,138,61,0.4)' : 'rgba(17,17,17,0.08)'}`,
                background: sort === opt.value ? 'rgba(197,138,61,0.06)' : '#F8F5F0',
                color: sort === opt.value ? '#B57932' : '#181512',
                fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
                fontWeight: sort === opt.value ? 700 : 400,
              }}>
                {opt.label}
                {sort === opt.value && <span style={{ color: '#B57932', fontSize: 16 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px 20px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#B57932', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Valoración mínima</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[0,3,4,5].map(r => (
              <button key={r} onClick={() => setMinRating(r)} style={{
                flex: 1, padding: '11px 0', borderRadius: 13,
                border: `1.5px solid ${minRating === r ? 'rgba(197,138,61,0.4)' : 'rgba(17,17,17,0.1)'}`,
                background: minRating === r ? 'rgba(197,138,61,0.08)' : '#F8F5F0',
                color: minRating === r ? '#B57932' : 'rgba(24,21,18,0.5)',
                fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
                fontWeight: minRating === r ? 700 : 400,
              }}>
                {r === 0 ? 'Todo' : `${r}★+`}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#B57932', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Precio máximo</p>
            <span style={{ fontSize: 14, fontWeight: 700, color: maxPrice > 0 ? '#B57932' : 'rgba(24,21,18,0.3)', fontFamily: 'Outfit, sans-serif' }}>
              {maxPrice > 0 ? `hasta ${maxPrice}€` : 'Sin límite'}
            </span>
          </div>
          <input type="range" min={0} max={200} step={5} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#B57932', cursor: 'pointer', marginBottom: 8 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(24,21,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>
            <span>Sin límite</span><span>50€</span><span>100€</span><span>150€</span><span>200€+</span>
          </div>
        </div>

        <div style={{ padding: '20px 20px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#B57932', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Disponibilidad</p>
          <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
            <DateBar selectedDate={selectedDate} onSelect={setSelectedDate} />
          </div>
        </div>

        <div style={{ padding: '20px 20px 0', display: 'flex', gap: 10 }}>
          {activeFilters > 0 && (
            <button onClick={() => { setMinRating(0); setSelectedDate(null); setSort('distance'); setCity(''); setMaxPrice(0) }} style={{
              flex: 1, background: 'rgba(220,38,38,0.06)', border: '1.5px solid rgba(220,38,38,0.2)',
              borderRadius: 14, padding: '13px 0', color: '#dc2626',
              fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', fontWeight: 600,
            }}>
              ✕ Limpiar ({activeFilters})
            </button>
          )}
          <button onClick={onClose} style={{
            flex: 2, background: 'linear-gradient(135deg,#B97830,#D19B52)', border: 'none',
            borderRadius: 14, padding: '13px 0', color: '#fff',
            fontSize: 14, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', fontWeight: 700,
            boxShadow: '0 4px 14px rgba(185,120,48,0.3)',
          }}>
            Ver resultados
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch]         = useState(searchParams.get('q') ?? '')
  const [city, setCity]             = useState(searchParams.get('city') ?? '')
  const [category, setCategory]     = useState(searchParams.get('category') ?? '')
  const [sort, setSort]             = useState('distance')
  const [minRating, setMinRating]   = useState(0)
  const [maxPrice, setMaxPrice]     = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [userCoords, setUserCoords]     = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!navigator.geolocation) { setSort('avg_rating'); return }
    navigator.geolocation.getCurrentPosition(
      pos => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setSort('avg_rating'),
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

  const rawResults   = data?.data ?? []
  const dateFiltered = selectedDate ? rawResults.filter(p => worksOnDate(p, selectedDate)) : rawResults
  const priceFiltered = maxPrice > 0
    ? dateFiltered.filter(p => {
        const min = p.services?.filter(s => s.is_active !== false).reduce((acc, s) => Math.min(acc, s.price), Infinity)
        return min !== Infinity && min <= maxPrice
      })
    : dateFiltered
  const results = sort === 'distance' && userCoords
    ? [...priceFiltered].sort((a, b) => {
        const dA = a.latitude && a.longitude ? haversine(userCoords.lat, userCoords.lng, a.latitude, a.longitude) : 9999
        const dB = b.latitude && b.longitude ? haversine(userCoords.lat, userCoords.lng, b.latitude, b.longitude) : 9999
        return dA - dB
      })
    : priceFiltered

  const total = results.length
  const activeFilters = [minRating > 0, selectedDate, sort !== 'distance', city !== '', maxPrice > 0].filter(Boolean).length

  return (
    <div style={{ minHeight: '100vh', background: '#F8F5F0', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        .no-sb::-webkit-scrollbar{display:none}
        .no-sb{-ms-overflow-style:none;scrollbar-width:none}
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .skel{background:linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%);background-size:400px 100%;animation:shimmer 1.4s infinite;}
        .search-inp:focus{border-color:#C58A3D !important;box-shadow:0 0 0 3px rgba(197,138,61,0.1) !important;}
        .cat-chip:hover{transform:translateY(-1px);}
        .city-input-desktop{display:none}
        @media(min-width:500px){.city-input-desktop{display:block !important}}
      `}</style>

      {/* ══ STICKY HEADER */}
      <div style={{
        position: 'sticky', top: 60, zIndex: 40,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(17,17,17,0.07)',
        boxShadow: '0 2px 16px rgba(17,17,17,0.06)',
      }}>
        {/* Barra búsqueda */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, padding: '12px 16px 0', maxWidth: 860, margin: '0 auto' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none', opacity: 0.3 }}>⌕</span>
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Servicio o profesional..."
              className="search-inp"
              style={{ width: '100%', background: '#F8F5F0', border: '1.5px solid rgba(17,17,17,0.09)', borderRadius: 14, padding: '11px 12px 11px 36px', color: '#181512', fontSize: 14, outline: 'none', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', boxSizing: 'border-box' }}
            />
          </div>
          <div className="city-input-desktop" style={{ flexShrink: 0 }}>
            <CityAutocomplete
              value={city} onChange={setCity}
              placeholder="Ciudad"
              inputStyle={{ width: 110, background: '#F8F5F0', border: '1.5px solid rgba(17,17,17,0.09)', borderRadius: 14, padding: '11px 12px', color: '#181512', fontSize: 14, outline: 'none', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', boxSizing: 'border-box' }}
              className="search-inp"
            />
          </div>
          <button type="submit" style={{
            background: 'linear-gradient(135deg,#B97830,#D19B52)', border: 'none',
            borderRadius: 14, padding: '0 16px', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0,
            fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 12px rgba(185,120,48,0.3)',
          }}>Buscar</button>
        </form>

        {/* Categorías chips */}
        <div className="no-sb" style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '10px 16px 0', maxWidth: 860, margin: '0 auto' }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.value
            return (
              <button key={cat.value} className="cat-chip"
                onClick={() => setCategory(cat.value)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 999,
                  background: active ? 'rgba(197,138,61,0.1)' : '#fff',
                  border: `1.5px solid ${active ? 'rgba(197,138,61,0.4)' : 'rgba(17,17,17,0.08)'}`,
                  color: active ? '#B57932' : 'rgba(24,21,18,0.55)',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  whiteSpace: 'nowrap', fontWeight: active ? 700 : 400,
                  transition: 'all 0.18s ease',
                  boxShadow: active ? '0 2px 8px rgba(197,138,61,0.15)' : 'none',
                }}>
                <span style={{ fontSize: 13 }}>{cat.icon}</span>{cat.label}
              </button>
            )
          })}
        </div>

        {/* Date bar + filtros */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px 12px', maxWidth: 860, margin: '0 auto' }}>
          <div className="no-sb" style={{ flex: 1, overflowX: 'auto' }}>
            <DateBar selectedDate={selectedDate} onSelect={setSelectedDate} />
          </div>
          <button onClick={() => setShowFilters(true)} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
            background: activeFilters > 0 ? 'rgba(197,138,61,0.1)' : '#fff',
            border: `1.5px solid ${activeFilters > 0 ? 'rgba(197,138,61,0.35)' : 'rgba(17,17,17,0.1)'}`,
            borderRadius: 12, padding: '8px 14px', cursor: 'pointer',
            color: activeFilters > 0 ? '#B57932' : 'rgba(24,21,18,0.5)',
            fontSize: 13, fontFamily: 'Outfit, sans-serif',
            fontWeight: activeFilters > 0 ? 700 : 400, whiteSpace: 'nowrap',
          }}>
            ⚙ Filtros
            {activeFilters > 0 && (
              <span style={{ background: '#B57932', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800 }}>
                {activeFilters}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ══ CONTENIDO */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '16px 16px 100px' }}>

        {/* Info + sort rápido */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
          <p style={{ fontSize: 13, color: 'rgba(24,21,18,0.5)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
            {isLoading ? 'Buscando...' : (
              <>
                <span style={{ color: '#181512', fontWeight: 700 }}>{total}</span> profesionales
                {selectedDate && <span style={{ color: '#B57932' }}> · {dayLabel(selectedDate)}</span>}
              </>
            )}
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {SORT_OPTIONS.slice(0, 2).map(opt => (
              <button key={opt.value} onClick={() => setSort(opt.value)} style={{
                fontSize: 11, padding: '5px 11px', borderRadius: 999, cursor: 'pointer',
                background: sort === opt.value ? 'rgba(197,138,61,0.1)' : 'transparent',
                border: `1.5px solid ${sort === opt.value ? 'rgba(197,138,61,0.35)' : 'rgba(17,17,17,0.09)'}`,
                color: sort === opt.value ? '#B57932' : 'rgba(24,21,18,0.45)',
                fontFamily: 'Outfit, sans-serif', fontWeight: sort === opt.value ? 700 : 400,
                whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : results.map(p => <ProfCard key={p.id} prof={p} userCoords={userCoords} />)
          }
        </div>

        {/* Empty state */}
        {!isLoading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff', border: '1.5px solid rgba(17,17,17,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px', boxShadow: '0 4px 20px rgba(17,17,17,0.06)' }}>
              {selectedDate ? '📅' : '🔍'}
            </div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 600, color: '#181512', margin: '0 0 8px' }}>
              Sin resultados
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(24,21,18,0.45)', marginBottom: 24, lineHeight: 1.6 }}>
              {selectedDate
                ? `Ningún profesional trabaja el ${dayLabel(selectedDate)}`
                : 'Prueba con otros términos o categoría'
              }
            </p>
            <button onClick={() => { setCategory(''); setMinRating(0); setSelectedDate(null); setSearch(''); setCity('') }}
              style={{ background: '#fff', border: '1.5px solid rgba(17,17,17,0.1)', borderRadius: 14, padding: '11px 26px', fontSize: 14, cursor: 'pointer', color: 'rgba(24,21,18,0.6)', fontFamily: 'Outfit, sans-serif', fontWeight: 600, boxShadow: '0 2px 8px rgba(17,17,17,0.05)' }}>
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>

      {/* Filter sheet */}
      {showFilters && (
        <FilterSheet
          onClose={() => setShowFilters(false)}
          sort={sort} setSort={setSort}
          minRating={minRating} setMinRating={setMinRating}
          maxPrice={maxPrice} setMaxPrice={setMaxPrice}
          selectedDate={selectedDate} setSelectedDate={setSelectedDate}
          activeFilters={activeFilters}
          city={city} setCity={setCity}
        />
      )}
    </div>
  )
}