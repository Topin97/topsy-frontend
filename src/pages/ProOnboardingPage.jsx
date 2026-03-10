import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'hair',        label: 'Peluquería',      icon: '💇' },
  { value: 'nails',       label: 'Uñas',            icon: '💅' },
  { value: 'spa',         label: 'Spa',             icon: '🧖' },
  { value: 'barber',      label: 'Barbería',        icon: '🪒' },
  { value: 'aesthetic',   label: 'Estética',        icon: '✨' },
  { value: 'brows',       label: 'Cejas',           icon: '👁️' },
  { value: 'massage',     label: 'Masajes',         icon: '💆' },
  { value: 'dental',      label: 'Dental',          icon: '🦷' },
  { value: 'fitness',     label: 'Personal trainer', icon: '🏋️' },
  { value: 'skincare',    label: 'Skincare',        icon: '🧴' },
  { value: 'makeup',      label: 'Maquillaje',      icon: '💋' },
  { value: 'yoga',        label: 'Yoga',            icon: '🧘' },
  { value: 'photography', label: 'Fotografía',      icon: '📸' },
]

// ── Nominatim address search ──────────────────────────────────────────────────
async function searchAddress(query) {
  if (!query || query.length < 3) return []
  const q = encodeURIComponent(query + ', Spain')
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&addressdetails=1`,
    { headers: { 'User-Agent': 'TopSy/1.0' } }
  )
  return res.json()
}

// ── Simple Leaflet map via CDN ────────────────────────────────────────────────
function MapPin({ lat, lng }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => initMap()
      document.head.appendChild(script)
    } else {
      initMap()
    }

    function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return
      const map = window.L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false })
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map)
      mapInstanceRef.current = map
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !window.L || !lat || !lng) return

    map.setView([lat, lng], 15)

    if (markerRef.current) markerRef.current.remove()
    const icon = window.L.divIcon({
      className: '',
      html: `<div style="
        width:36px;height:36px;border-radius:50% 50% 50% 0;
        background:linear-gradient(135deg,#B8833A,#D4A055);
        transform:rotate(-45deg);
        border:3px solid #fff;
        box-shadow:0 4px 16px rgba(0,0,0,0.4);
        margin:-18px 0 0 -18px;
      "></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    })
    markerRef.current = window.L.marker([lat, lng], { icon }).addTo(map)
  }, [lat, lng])

  return (
    <div
      ref={mapRef}
      style={{
        height: 220, borderRadius: 14,
        border: '1px solid rgba(201,150,90,0.2)',
        overflow: 'hidden', marginTop: 12,
        background: '#1a1a1a',
      }}
    />
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProOnboardingPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { setUser, user } = useAuthStore()

  const [step, setStep] = useState(1) // 1: info, 2: location, 3: done
  const [form, setForm] = useState({
    business_name: '',
    category: '',
    description: '',
    address: '',
    city: '',
    latitude: null,
    longitude: null,
  })

  // Address search state
  const [addressQuery, setAddressQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // Debounced address search
  const handleAddressInput = (val) => {
    setAddressQuery(val)
    set('address', val)
    set('latitude', null)
    set('longitude', null)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (val.length < 3) { setSuggestions([]); return }
      setSearching(true)
      const results = await searchAddress(val)
      setSuggestions(results)
      setSearching(false)
    }, 500)
  }

  const selectSuggestion = (s) => {
    const addr = s.address
    const street = [addr.road, addr.house_number].filter(Boolean).join(' ')
    const city = addr.city || addr.town || addr.village || addr.municipality || ''
    set('address', street || s.display_name.split(',')[0])
    set('city', city)
    set('latitude', parseFloat(s.lat))
    set('longitude', parseFloat(s.lon))
    setAddressQuery(street || s.display_name.split(',')[0])
    setSuggestions([])
  }

  const { mutate: createProfile, isPending } = useMutation({
    mutationFn: (data) => profApi.create(data),
    onSuccess: (res) => {
      toast.success('¡Perfil creado!')
      qc.invalidateQueries({ queryKey: ['me'] })
      setStep(3)
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al crear perfil'),
  })

  const handleSubmit = () => {
    if (!form.business_name || !form.category) {
      toast.error('Nombre y categoría son obligatorios')
      return
    }
    if (!form.latitude || !form.longitude) {
      toast.error('Selecciona una dirección del listado para fijar la ubicación')
      return
    }
    createProfile(form)
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(0,0,0,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '12px 16px',
    color: '#1A1612', fontSize: 14,
    fontFamily: 'Outfit, sans-serif',
    outline: 'none', transition: 'border 0.2s',
  }

  const labelStyle = {
    fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'rgba(201,150,90,0.6)', marginBottom: 8, display: 'block',
    fontFamily: 'Outfit, sans-serif',
  }

  // ── Step 3: Success ───────────────────────────────────────────
  if (step === 3) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, color: '#1A1612', marginBottom: 12 }}>
          ¡Todo listo!
        </h1>
        <p style={{ color: 'rgba(26,22,18,0.45)', fontFamily: 'Outfit, sans-serif', marginBottom: 32, lineHeight: 1.6 }}>
          Tu perfil profesional ha sido creado. Ahora configura tus servicios y tu disponibilidad.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
          style={{ width: '100%', padding: '14px 0', fontSize: 15 }}
        >
          Ir al panel de control →
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>
            Paso {step} de 2
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 300, color: '#1A1612', margin: 0 }}>
            {step === 1 ? 'Crea tu perfil profesional' : 'Ubicación de tu negocio'}
          </h1>
          <p style={{ color: 'rgba(26,22,18,0.36)', fontFamily: 'Outfit, sans-serif', marginTop: 8, fontSize: 14 }}>
            {step === 1 ? 'Información básica de tu negocio' : 'Los clientes te encontrarán cerca de ellos'}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(0,0,0,0.1)', borderRadius: 100, marginBottom: 32 }}>
          <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', background: 'linear-gradient(90deg,#B8833A,#D4A055)', borderRadius: 100, transition: 'width 0.4s' }} />
        </div>

        <div style={{ background: 'rgba(0,0,0,0.07)', border: '1px solid rgba(201,150,90,0.12)', borderRadius: 20, padding: 32 }}>

          {/* ── STEP 1: Basic info ──────────────────────────────── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Business name */}
              <div>
                <label style={labelStyle}>Nombre del negocio *</label>
                <input
                  value={form.business_name}
                  onChange={e => set('business_name', e.target.value)}
                  placeholder="Ej: Studio Belén"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,150,90,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>Categoría *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => set('category', cat.value)}
                      style={{
                        padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                        background: form.category === cat.value ? 'rgba(201,150,90,0.15)' : 'rgba(0,0,0,0.07)',
                        border: form.category === cat.value ? '1px solid rgba(201,150,90,0.4)' : '1px solid rgba(0,0,0,0.1)',
                        color: form.category === cat.value ? '#B8833A' : 'rgba(26,22,18,0.41)',
                        fontSize: 12, fontFamily: 'Outfit, sans-serif',
                        transition: 'all 0.15s', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Cuéntanos sobre tu negocio, especialidades, experiencia..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,150,90,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <button
                onClick={() => {
                  if (!form.business_name) { toast.error('El nombre es obligatorio'); return }
                  if (!form.category) { toast.error('Selecciona una categoría'); return }
                  setStep(2)
                }}
                className="btn-primary"
                style={{ width: '100%', padding: '14px 0', fontSize: 15, marginTop: 8 }}
              >
                Siguiente: Ubicación →
              </button>
            </div>
          )}

          {/* ── STEP 2: Location ────────────────────────────────── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Address search */}
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Dirección *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={addressQuery}
                    onChange={e => handleAddressInput(e.target.value)}
                    placeholder="Calle Mayor 10, Madrid..."
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(201,150,90,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    autoComplete="off"
                  />
                  {searching && (
                    <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'rgba(201,150,90,0.5)' }}>
                      Buscando...
                    </div>
                  )}
                </div>

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: '#FFFFFF', border: '1px solid rgba(201,150,90,0.2)',
                    borderRadius: 12, overflow: 'hidden', marginTop: 4,
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  }}>
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectSuggestion(s)}
                        style={{
                          width: '100%', textAlign: 'left', padding: '12px 16px',
                          background: 'none', border: 'none', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(0,0,0,0.07)' : 'none',
                          color: 'rgba(26,22,18,0.63)', fontSize: 13,
                          fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,150,90,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        📍 {s.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City (auto-filled) */}
              <div>
                <label style={labelStyle}>Ciudad</label>
                <input
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder="Se rellena automáticamente"
                  style={{ ...inputStyle, background: form.city ? 'rgba(201,150,90,0.06)' : 'rgba(0,0,0,0.07)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,150,90,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Map preview */}
              {form.latitude && form.longitude ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#B8833A', fontFamily: 'Outfit, sans-serif' }}>
                      ✓ Ubicación fijada · {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                    </span>
                  </div>
                  <MapPin lat={form.latitude} lng={form.longitude} />
                </div>
              ) : (
                <div style={{
                  height: 220, borderRadius: 14,
                  border: '1px dashed rgba(201,150,90,0.2)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(26,22,18,0.18)', gap: 8,
                }}>
                  <span style={{ fontSize: 32 }}>🗺️</span>
                  <span style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>
                    Escribe tu dirección para ver el mapa
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1, background: 'transparent',
                    border: '1px solid rgba(26,22,18,0.09)',
                    borderRadius: 12, padding: '13px 0',
                    color: 'rgba(26,22,18,0.36)', fontSize: 14,
                    fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
                  }}
                >
                  ← Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="btn-primary"
                  style={{ flex: 2, padding: '13px 0', fontSize: 15 }}
                >
                  {isPending ? 'Creando perfil...' : 'Crear perfil ✓'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}