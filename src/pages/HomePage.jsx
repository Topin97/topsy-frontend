import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profApi } from '../services/api'

const CATEGORIES = [
  { icon: '💇‍♀️', label: 'Peluquería', value: 'hair' },
  { icon: '🪒', label: 'Barbería', value: 'barber' },
  { icon: '✨', label: 'Estética', value: 'aesthetic' },
  { icon: '💅', label: 'Uñas', value: 'nails' },
  { icon: '🧖', label: 'Spa', value: 'spa' },
  { icon: '👁️', label: 'Cejas', value: 'brows' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')

  const { data } = useQuery({
    queryKey: ['featured-pros'],
    queryFn: () =>
      profApi.getAll({ sort: 'avg_rating', limit: 6 }).then(r => r.data),
  })

  const featured = data?.data ?? []

  return (
    <div
      style={{
        background: '#12100D',
        color: '#F7F2EA',
        minHeight: '100vh',
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      {/* ═════════ HERO ═════════ */}
      <section
        style={{
          background: 'linear-gradient(180deg,#13100A 0%,#0A0806 100%)',
          padding: '90px 24px 60px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.2rem,5vw,3.5rem)',
            fontWeight: 300,
            marginBottom: 16,
          }}
        >
          Descubre y reserva con los mejores<br />
          <em style={{ color: '#C9965A' }}>
            profesionales cerca de ti
          </em>
        </h1>

        <p
          style={{
            color: 'rgba(247,242,234,0.4)',
            marginBottom: 40,
          }}
        >
          Sin llamadas. Sin esperas. Confirmación instantánea.
        </p>

        {/* SEARCH */}
        <div
          style={{
            maxWidth: 700,
            margin: '0 auto',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(201,150,90,0.25)',
            borderRadius: 16,
            padding: 6,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar servicios o negocios..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#F7F2EA',
              padding: '14px 16px',
              fontSize: 15,
            }}
          />

          <button
            onClick={() =>
              navigate(`/search?q=${search}&city=${city}`)
            }
            style={{
              background:
                'linear-gradient(135deg,#C9965A,#E8B97A)',
              border: 'none',
              borderRadius: 10,
              padding: '12px 28px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Buscar
          </button>
          {city && (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(201,150,90,0.1)', border: '1px solid rgba(201,150,90,0.3)', borderRadius: 8, padding: '6px 10px', flexShrink: 0 }}>
    <span style={{ fontSize: 11 }}>📍</span>
    <span style={{ fontSize: 12, color: '#C9965A', fontWeight: 600 }}>{city}</span>
    <button onClick={() => setCity('')} style={{ background: 'none', border: 'none', color: 'rgba(201,150,90,0.5)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
  </div>
)}
        </div>
      </section>

      {/* ═════════ CATEGORÍAS ═════════ */}
      <section
        style={{
          padding: '30px 0 50px',
          overflowX: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 20,
            padding: '0 24px',
            width: 'max-content',
          }}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() =>
                navigate(`/search?category=${cat.value}`)
              }
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                minWidth: 90,
              }}
            >
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.03)',
                  border:
                    '1px solid rgba(201,150,90,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  transition: 'all .25s',
                }}
              >
                {cat.icon}
              </div>

              <span
                style={{
                  fontSize: 13,
                  color: 'rgba(247,242,234,0.7)',
                }}
              >
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ═════════ CERCA DE TI ═════════ */}
      <section style={{ padding: '0 24px 80px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontFamily:
                'Cormorant Garamond, serif',
              fontSize: '1.8rem',
              fontWeight: 400,
            }}
          >
            Cerca de ti
          </h2>

          <Link
            to="/search"
            style={{
              color: '#C9965A',
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            Ver todos →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill,minmax(260px,1fr))',
            gap: 20,
          }}
        >
          {featured.map(p => (
            <Link
              key={p.id}
              to={`/professional/${p.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  background:
                    'rgba(255,255,255,0.02)',
                  border:
                    '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  transition: '.3s',
                }}
              >
                <div
                  style={{
                    height: 180,
                    position: 'relative',
                    background:
                      'linear-gradient(135deg,rgba(201,150,90,0.1),#111009)',
                  }}
                >
                  {p.cover_image_url && (
                    <img
                      src={p.cover_image_url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}

                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background:
                        'rgba(10,8,6,0.85)',
                      borderRadius: 100,
                      padding: '4px 10px',
                      fontSize: 12,
                    }}
                  >
                    <span
                      style={{ color: '#C9965A' }}
                    >
                      ★
                    </span>{' '}
                    {p.avg_rating ?? '—'}
                  </div>
                </div>

                <div style={{ padding: 16 }}>
                  <h3
                    style={{
                      fontFamily:
                        'Cormorant Garamond, serif',
                      fontSize: '1.2rem',
                      marginBottom: 4,
                    }}
                  >
                    {p.business_name}
                  </h3>

                  <p
                    style={{
                      fontSize: 13,
                      color:
                        'rgba(247,242,234,0.35)',
                    }}
                  >
                    📍 {p.city}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}