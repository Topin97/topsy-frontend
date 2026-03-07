import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { profApi } from '../services/api'

const CATEGORIES = [
  { value: '',             label: 'Todos',       icon: '🔍' },
  { value: 'hair',         label: 'Peluquería',  icon: '💇' },
  { value: 'nails',        label: 'Uñas',        icon: '💅' },
  { value: 'spa',          label: 'Spa',         icon: '🧖' },
  { value: 'barber',       label: 'Barbería',    icon: '🪒' },
  { value: 'aesthetic',    label: 'Estética',    icon: '✨' },
  { value: 'brows',        label: 'Cejas',       icon: '👁️' },
  { value: 'massage',      label: 'Masajes',     icon: '💆' },
  { value: 'dental',       label: 'Dental',      icon: '🦷' },
  { value: 'fitness',      label: 'Trainer',     icon: '🏋️' },
  { value: 'skincare',     label: 'Skincare',    icon: '🧴' },
  { value: 'makeup',       label: 'Maquillaje',  icon: '💋' },
  { value: 'yoga',         label: 'Yoga',        icon: '🧘' },
  { value: 'photography',  label: 'Fotografía',  icon: '📸' },
]

const SORT_OPTIONS = [
  { value: 'avg_rating',    label: 'Mejor valorados' },
  { value: 'total_reviews', label: 'Más reseñas' },
  { value: 'newest',        label: 'Más recientes' },
]

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 12 }) {
  const r = Math.round(rating ?? 0)
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= r ? '#C9965A' : 'rgba(201,150,90,0.18)', fontSize: size }}>★</span>
      ))}
    </span>
  )
}

// ── Prof card ─────────────────────────────────────────────────────────────────
function ProfCard({ prof }) {
  const minPrice = prof.services?.length
    ? Math.min(...prof.services.filter(s => s.is_active !== false).map(s => s.price))
    : null
  const topServices = prof.services?.filter(s => s.is_active !== false).slice(0, 3) ?? []

  return (
    <Link
      to={`/professional/${prof.id}`}
      style={{
        display: 'block', textDecoration: 'none',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(201,150,90,0.1)',
        borderRadius: 18, overflow: 'hidden',
        transition: 'all 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = '1px solid rgba(201,150,90,0.35)'
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.35)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid rgba(201,150,90,0.1)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Cover */}
      <div style={{ height: 170, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg,rgba(201,150,90,0.1),rgba(10,8,6,1))' }}>
        {prof.cover_image_url
          ? <img src={prof.cover_image_url} alt={prof.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>✂️</div>
        }
        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {prof.is_verified && (
            <span style={{ background: 'rgba(201,150,90,0.92)', borderRadius: 100, padding: '3px 10px', fontSize: 10, color: '#0A0806', fontWeight: 700, fontFamily: 'Outfit, sans-serif', backdropFilter: 'blur(4px)' }}>
              ✓ Verificado
            </span>
          )}
          {minPrice != null && (
            <span style={{ background: 'rgba(10,8,6,0.75)', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 100, padding: '3px 10px', fontSize: 11, color: '#E8B97A', fontFamily: 'Cormorant Garamond, serif', backdropFilter: 'blur(4px)', marginLeft: 'auto' }}>
              Desde {minPrice}€
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', fontWeight: 600, color: '#F7F2EA', margin: 0, flex: 1, paddingRight: 8 }}>
            {prof.business_name}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Stars rating={prof.avg_rating} />
          <span style={{ fontSize: 12, color: '#C9965A', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
            {prof.avg_rating ? Number(prof.avg_rating).toFixed(1) : '—'}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(247,242,234,0.25)', fontFamily: 'Outfit, sans-serif' }}>
            ({prof.total_reviews} reseñas)
          </span>
        </div>

        {/* City */}
        <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.35)', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>
          📍 {prof.city}
        </p>

        {/* Top services chips */}
        {topServices.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {topServices.map((s) => (
              <span key={s.id} style={{ fontSize: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100, padding: '3px 9px', color: 'rgba(247,242,234,0.4)', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                {s.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,150,90,0.06)', borderRadius: 18, overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 170 }} />
      <div style={{ padding: '14px 16px 16px' }}>
        <div className="skeleton" style={{ height: 18, borderRadius: 6, width: '70%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 12, borderRadius: 6, width: '45%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 12, borderRadius: 6, width: '55%' }} />
      </div>
    </div>
  )
}

// ── Filter sidebar ────────────────────────────────────────────────────────────
function FilterSidebar({ category, setCategory, sort, setSort, onlyVerified, setOnlyVerified, minRating, setMinRating, activeCount }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,150,90,0.1)', borderRadius: 18, padding: 20, position: 'sticky', top: 90 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', fontFamily: 'Outfit, sans-serif' }}>
          Filtros
        </span>
        {activeCount > 0 && (
          <span style={{ fontSize: 10, background: '#C9965A', color: '#0A0806', borderRadius: 100, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
            {activeCount}
          </span>
        )}
      </div>

      {/* Category */}
      <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.5)', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>
        Categoría
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 24 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 10,
              background: category === cat.value ? 'rgba(201,150,90,0.12)' : 'transparent',
              border: category === cat.value ? '1px solid rgba(201,150,90,0.25)' : '1px solid transparent',
              color: category === cat.value ? '#C9965A' : 'rgba(247,242,234,0.45)',
              fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 14 }}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.5)', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>
        Ordenar por
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 24 }}>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            style={{
              width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 10,
              background: sort === opt.value ? 'rgba(201,150,90,0.12)' : 'transparent',
              border: sort === opt.value ? '1px solid rgba(201,150,90,0.25)' : '1px solid transparent',
              color: sort === opt.value ? '#C9965A' : 'rgba(247,242,234,0.45)',
              fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Min rating */}
      <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.5)', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>
        Valoración mínima
      </p>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {[0, 3, 4, 5].map((r) => (
          <button
            key={r}
            onClick={() => setMinRating(r)}
            style={{
              flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 12,
              background: minRating === r ? 'rgba(201,150,90,0.15)' : 'rgba(255,255,255,0.03)',
              border: minRating === r ? '1px solid rgba(201,150,90,0.35)' : '1px solid rgba(255,255,255,0.07)',
              color: minRating === r ? '#C9965A' : 'rgba(247,242,234,0.35)',
              cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s',
            }}
          >
            {r === 0 ? 'Todo' : `${r}★+`}
          </button>
        ))}
      </div>

      {/* Verified toggle */}
      <button
        onClick={() => setOnlyVerified(!onlyVerified)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', borderRadius: 10,
          background: onlyVerified ? 'rgba(201,150,90,0.1)' : 'rgba(255,255,255,0.02)',
          border: onlyVerified ? '1px solid rgba(201,150,90,0.3)' : '1px solid rgba(255,255,255,0.07)',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: 13, color: onlyVerified ? '#C9965A' : 'rgba(247,242,234,0.45)', fontFamily: 'Outfit, sans-serif' }}>
          Solo verificados
        </span>
        <div style={{
          width: 36, height: 20, borderRadius: 100,
          background: onlyVerified ? 'linear-gradient(135deg,#C9965A,#E8B97A)' : 'rgba(255,255,255,0.1)',
          position: 'relative', transition: 'background 0.2s',
        }}>
          <div style={{
            position: 'absolute', top: 3, left: onlyVerified ? 18 : 3,
            width: 14, height: 14, borderRadius: '50%',
            background: onlyVerified ? '#0A0806' : 'rgba(255,255,255,0.4)',
            transition: 'left 0.2s',
          }} />
        </div>
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch]           = useState(searchParams.get('q') ?? '')
  const [city, setCity]               = useState(searchParams.get('city') ?? '')
  const [category, setCategory]       = useState(searchParams.get('category') ?? '')
  const [sort, setSort]               = useState('avg_rating')
  const [onlyVerified, setOnlyVerified] = useState(false)
  const [minRating, setMinRating]     = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['professionals', { search, city, category, sort, onlyVerified, minRating }],
    queryFn: () => profApi.getAll({
      search, city, category, sort, limit: 24,
      ...(onlyVerified && { verified: true }),
      ...(minRating > 0 && { min_rating: minRating }),
    }).then((r) => r.data),
    staleTime: 60 * 1000,
  })

  const handleSearch = (e) => {
    e?.preventDefault()
    setSearchParams({ q: search, city, category })
  }

  const activeFilterCount = [
    category !== '',
    sort !== 'avg_rating',
    onlyVerified,
    minRating > 0,
  ].filter(Boolean).length

  const clearFilters = () => {
    setCategory('')
    setSort('avg_rating')
    setOnlyVerified(false)
    setMinRating(0)
  }

  const results = data?.data ?? []
  const total   = data?.meta?.total ?? results.length

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Search bar ───────────────────────────────────────────── */}
      <div style={{ background: 'rgba(10,8,6,0.9)', borderBottom: '1px solid rgba(201,150,90,0.1)', backdropFilter: 'blur(12px)', position: 'sticky', top: 64, zIndex: 40, padding: '14px 0' }}>
        <div className="container-app">
          <form
            onSubmit={handleSearch}
            style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Servicio o profesional..."
              className="input"
              style={{ flex: '1 1 200px' }}
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ciudad"
              className="input"
              style={{ flex: '0 1 140px' }}
            />
            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Buscar
            </button>
            {/* Mobile filter toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'none', // shown via media query workaround below
                background: activeFilterCount > 0 ? 'rgba(201,150,90,0.15)' : 'rgba(255,255,255,0.04)',
                border: activeFilterCount > 0 ? '1px solid rgba(201,150,90,0.35)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '10px 14px', color: activeFilterCount > 0 ? '#C9965A' : 'rgba(247,242,234,0.5)',
                fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
              className="lg:hidden"
            >
              Filtros {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </form>
        </div>
      </div>

      <div className="container-app" style={{ paddingTop: 28, paddingBottom: 60 }}>

        {/* Active filters chips */}
        {activeFilterCount > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: 'rgba(247,242,234,0.3)', fontFamily: 'Outfit, sans-serif' }}>Filtros activos:</span>
            {category && (
              <span style={{ fontSize: 12, background: 'rgba(201,150,90,0.12)', border: '1px solid rgba(201,150,90,0.25)', borderRadius: 100, padding: '3px 10px', color: '#C9965A', fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }} onClick={() => setCategory('')}>
                {CATEGORIES.find(c => c.value === category)?.label} ×
              </span>
            )}
            {onlyVerified && (
              <span style={{ fontSize: 12, background: 'rgba(201,150,90,0.12)', border: '1px solid rgba(201,150,90,0.25)', borderRadius: 100, padding: '3px 10px', color: '#C9965A', fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }} onClick={() => setOnlyVerified(false)}>
                Verificados ×
              </span>
            )}
            {minRating > 0 && (
              <span style={{ fontSize: 12, background: 'rgba(201,150,90,0.12)', border: '1px solid rgba(201,150,90,0.25)', borderRadius: 100, padding: '3px 10px', color: '#C9965A', fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }} onClick={() => setMinRating(0)}>
                {minRating}★+ ×
              </span>
            )}
            <button onClick={clearFilters} style={{ fontSize: 12, color: 'rgba(247,242,234,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', textDecoration: 'underline' }}>
              Limpiar todo
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

          {/* ── Sidebar (desktop) ──────────────────────────────── */}
          <aside style={{ width: 220, flexShrink: 0 }} className="hidden lg:block">
            <FilterSidebar
              category={category} setCategory={setCategory}
              sort={sort} setSort={setSort}
              onlyVerified={onlyVerified} setOnlyVerified={setOnlyVerified}
              minRating={minRating} setMinRating={setMinRating}
              activeCount={activeFilterCount}
            />
          </aside>

          {/* ── Mobile filter drawer ───────────────────────────── */}
          {showFilters && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setShowFilters(false)}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#1C1C1E', borderRadius: '20px 20px 0 0', padding: 24, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#F7F2EA' }}>Filtros</span>
                  <button onClick={() => setShowFilters(false)} style={{ background: 'none', border: 'none', color: 'rgba(247,242,234,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
                </div>
                <FilterSidebar
                  category={category} setCategory={setCategory}
                  sort={sort} setSort={setSort}
                  onlyVerified={onlyVerified} setOnlyVerified={setOnlyVerified}
                  minRating={minRating} setMinRating={setMinRating}
                  activeCount={activeFilterCount}
                />
                <button onClick={() => setShowFilters(false)} className="btn-primary" style={{ width: '100%', marginTop: 16 }}>
                  Ver resultados
                </button>
              </div>
            </div>
          )}

          {/* ── Results ──────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Result count + sort (mobile) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.35)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                {isLoading ? 'Buscando...' : (
                  <>
                    <span style={{ color: '#C9965A', fontWeight: 600 }}>{total}</span>
                    {' '}profesional{total !== 1 ? 'es' : ''} encontrado{total !== 1 ? 's' : ''}
                    {search && <span style={{ color: 'rgba(247,242,234,0.25)' }}> · "{search}"</span>}
                    {city && <span style={{ color: 'rgba(247,242,234,0.25)' }}> en {city}</span>}
                  </>
                )}
              </p>

              {/* Sort select (visible on mobile too) */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="lg:hidden"
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '7px 12px', color: 'rgba(247,242,234,0.6)',
                  fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
                }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : results.map((p) => <ProfCard key={p.id} prof={p} />)
              }
            </div>

            {/* Empty state */}
            {!isLoading && results.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(247,242,234,0.25)' }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 300, marginBottom: 8 }}>Sin resultados</p>
                <p style={{ fontSize: 14, fontFamily: 'Outfit, sans-serif', marginBottom: 24 }}>Prueba con otros filtros o amplía la búsqueda</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="btn-outline" style={{ fontSize: 13 }}>
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}