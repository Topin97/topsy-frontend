import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { profApi } from '../services/api'

const CATEGORIES = [
  { value: '',           label: 'Todos',       icon: '✦' },
  { value: 'hair',       label: 'Peluquería',  icon: '💇' },
  { value: 'nails',      label: 'Uñas',        icon: '💅' },
  { value: 'spa',        label: 'Spa',         icon: '🧖' },
  { value: 'barber',     label: 'Barbería',    icon: '🪒' },
  { value: 'aesthetic',  label: 'Estética',    icon: '✨' },
  { value: 'brows',      label: 'Cejas',       icon: '👁️' },
]

function ProfCard({ prof }) {
  const minPrice = prof.services?.length
    ? Math.min(...prof.services.map((s) => s.price))
    : null

  return (
    <Link to={`/professional/${prof.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}>
      <div
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)', cursor: 'pointer', width: '100%' }}
        onMouseEnter={e => {
          e.currentTarget.style.border = '1px solid rgba(201,150,90,0.35)'
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Image */}
        <div style={{ height: 200, background: 'linear-gradient(135deg, rgba(201,150,90,0.12) 0%, rgba(17,16,9,1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', position: 'relative', overflow: 'hidden', width: '100%' }}>
          {prof.cover_image_url
            ? <img src={prof.cover_image_url} alt={prof.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <span style={{ opacity: 0.4 }}>✂️</span>
          }
          {prof.is_verified && (
            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(10,8,6,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(201,150,90,0.3)', borderRadius: 100, padding: '3px 10px', fontSize: 11, color: '#C9965A' }}>
              ✓ Verificado
            </div>
          )}
          {minPrice != null && (
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(10,8,6,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 12px' }}>
              <span style={{ fontSize: 11, color: 'rgba(247,242,234,0.5)' }}>Desde </span>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#C9965A', fontStyle: 'italic' }}>{minPrice}€</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 600, marginBottom: 6 }}>{prof.business_name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 1 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ color: i < Math.round(prof.avg_rating ?? 0) ? '#C9965A' : 'rgba(255,255,255,0.1)', fontSize: 11 }}>★</span>
              ))}
            </div>
            <span style={{ fontSize: 12, color: 'rgba(247,242,234,0.5)' }}>{prof.avg_rating ?? '—'}</span>
            <span style={{ fontSize: 12, color: 'rgba(247,242,234,0.25)' }}>({prof.total_reviews})</span>
          </div>
          <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 12, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
            {prof.description || 'Profesional de belleza y bienestar'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'rgba(247,242,234,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10 }}>📍</span> {prof.city}
            </span>
            <span style={{ fontSize: 11, color: '#C9965A', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>Ver perfil →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', width: '100%' }}>
      <div className="skeleton" style={{ height: 200 }} />
      <div style={{ padding: 20 }}>
        <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 10, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 10, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 12, width: '100%', marginBottom: 6, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 6 }} />
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch]     = useState(searchParams.get('q') ?? '')
  const [city, setCity]         = useState(searchParams.get('city') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [sort, setSort]         = useState('avg_rating')

  const { data, isLoading } = useQuery({
    queryKey: ['professionals', { search, city, category, sort }],
    queryFn: () => profApi.getAll({ search, city, category, sort, limit: 24 }).then((r) => r.data),
    staleTime: 1000 * 60,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ q: search, city, category })
  }

  return (
    <div style={{ background: '#0A0806', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 768px) {
          .search-layout { flex-direction: column !important; }
          .search-sidebar { display: none !important; }
          .search-bar-inner { flex-wrap: wrap !important; }
          .search-city-input { width: 100% !important; }
          .search-submit-btn { width: 100% !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, rgba(13,11,8,1) 0%, rgba(10,8,6,0) 100%)', padding: '40px 0 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="container-app">
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, marginBottom: 24 }}>
            Encuentra tu <em style={{ color: '#C9965A' }}>profesional</em>
          </h1>

          {/* Search bar */}
          <form onSubmit={handleSearch}>
            <div className="search-bar-inner" style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,90,0.15)', borderRadius: 14, padding: 8, marginBottom: 24, maxWidth: 700 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Servicio, profesional..."
                style={{ flex: 1, minWidth: 120, background: 'transparent', border: 'none', outline: 'none', color: '#F7F2EA', fontSize: 14, fontFamily: 'Outfit, sans-serif', padding: '8px 12px' }}
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ciudad..."
                className="search-city-input"
                style={{ width: 140, background: 'transparent', border: 'none', outline: 'none', color: '#F7F2EA', fontSize: 14, fontFamily: 'Outfit, sans-serif', padding: '8px 12px', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
              />
              <button type="submit" className="search-submit-btn" style={{ background: 'linear-gradient(135deg, #C9965A, #E8B97A)', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#0A0806', fontWeight: 700, fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>
                Buscar
              </button>
            </div>
          </form>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, paddingBottom: 20, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 100, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: 500,
                  transition: 'all 0.2s',
                  background: category === cat.value ? 'linear-gradient(135deg, #C9965A, #E8B97A)' : 'rgba(255,255,255,0.05)',
                  color: category === cat.value ? '#0A0806' : 'rgba(247,242,234,0.6)',
                  boxShadow: category === cat.value ? '0 4px 16px rgba(201,150,90,0.3)' : 'none',
                }}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-app" style={{ padding: '32px 16px' }}>
        <div className="search-layout" style={{ display: 'flex', gap: 32 }}>
          {/* Sidebar */}
          <aside className="search-sidebar" style={{ width: 220, flexShrink: 0 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, position: 'sticky', top: 80 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.3)', marginBottom: 16 }}>Ordenar por</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { value: 'avg_rating',    label: '⭐ Mejor valorados' },
                  { value: 'total_reviews', label: '💬 Más reseñas' },
                  { value: 'newest',        label: '🆕 Más recientes' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    style={{
                      textAlign: 'left', padding: '10px 12px', borderRadius: 10,
                      border: `1px solid ${sort === opt.value ? 'rgba(201,150,90,0.3)' : 'transparent'}`,
                      background: sort === opt.value ? 'rgba(201,150,90,0.08)' : 'transparent',
                      color: sort === opt.value ? '#C9965A' : 'rgba(247,242,234,0.45)',
                      fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {(search || city || category) && (
                <>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />
                  <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.3)', marginBottom: 12 }}>Filtros activos</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {search && <span style={{ fontSize: 12, color: '#C9965A', background: 'rgba(201,150,90,0.1)', padding: '4px 10px', borderRadius: 100 }}>"{search}"</span>}
                    {city && <span style={{ fontSize: 12, color: '#C9965A', background: 'rgba(201,150,90,0.1)', padding: '4px 10px', borderRadius: 100 }}>📍 {city}</span>}
                    {category && <span style={{ fontSize: 12, color: '#C9965A', background: 'rgba(201,150,90,0.1)', padding: '4px 10px', borderRadius: 100 }}>{CATEGORIES.find(c => c.value === category)?.label}</span>}
                  </div>
                  <button
                    onClick={() => { setSearch(''); setCity(''); setCategory('') }}
                    style={{ marginTop: 12, width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px', color: 'rgba(247,242,234,0.35)', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                  >
                    Limpiar filtros
                  </button>
                </>
              )}
            </div>
          </aside>

          {/* Grid */}
          <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <p style={{ color: 'rgba(247,242,234,0.35)', fontSize: 13 }}>
                {isLoading ? 'Buscando...' : `${data?.meta?.total ?? 0} profesionales encontrados`}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : data?.data?.map((p) => <ProfCard key={p.id} prof={p} />)
              }
            </div>

            {!isLoading && data?.data?.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(247,242,234,0.2)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 16, opacity: 0.5 }}>🔍</div>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontStyle: 'italic', marginBottom: 8 }}>Sin resultados</p>
                <p style={{ fontSize: 14 }}>Prueba con otros filtros o una ciudad diferente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}