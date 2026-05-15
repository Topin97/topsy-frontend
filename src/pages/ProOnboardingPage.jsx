import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import GoogleAddressInput from '../components/GoogleAddressInput'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'hair',        label: 'Peluquería',       icon: '💇' },
  { value: 'nails',       label: 'Uñas',             icon: '💅' },
  { value: 'spa',         label: 'Spa',              icon: '🧖' },
  { value: 'barber',      label: 'Barbería',         icon: '🪒' },
  { value: 'aesthetic',   label: 'Estética',         icon: '✨' },
  { value: 'brows',       label: 'Cejas',            icon: '👁️' },
  { value: 'massage',     label: 'Masajes',          icon: '💆' },
  { value: 'dental',      label: 'Dental',           icon: '🦷' },
  { value: 'fitness',     label: 'Personal trainer', icon: '🏋️' },
  { value: 'skincare',    label: 'Skincare',         icon: '🧴' },
  { value: 'makeup',      label: 'Maquillaje',       icon: '💋' },
  { value: 'yoga',        label: 'Yoga',             icon: '🧘' },
  { value: 'photography', label: 'Fotografía',       icon: '📸' },
]

const DAYS = [
  { value: 'monday',    label: 'Lunes' },
  { value: 'tuesday',   label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday',  label: 'Jueves' },
  { value: 'friday',    label: 'Viernes' },
  { value: 'saturday',  label: 'Sábado' },
  { value: 'sunday',    label: 'Domingo' },
]

const TOTAL_STEPS = 6



// ── Simple Leaflet map via CDN ────────────────────────────────────────────────
function MapPin({ lat, lng }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    const initMap = () => {
      if (!window.L || !mapRef.current || lat == null || lng == null) return
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 16)
        if (markerRef.current) markerRef.current.setLatLng([lat, lng])
        return
      }
      mapInstanceRef.current = window.L.map(mapRef.current).setView([lat, lng], 16)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(mapInstanceRef.current)
      markerRef.current = window.L.marker([lat, lng]).addTo(mapInstanceRef.current)
    }
    if (window.L) initMap()
    else {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initMap
      document.body.appendChild(script)
    }
  }, [lat, lng])

  if (lat == null || lng == null) return null
  return (
    <div ref={mapRef} style={{ width: '100%', height: 180, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', marginTop: 10 }} />
  )
}

// ── Inputs ────────────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '12px 14px',
  border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12,
  fontSize: 15, fontFamily: 'Outfit, sans-serif', color: '#1A1612',
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  background: '#FFFFFF', boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block', fontSize: 11, letterSpacing: '0.15em',
  textTransform: 'uppercase', color: 'rgba(0,0,0,0.5)',
  marginBottom: 6, fontFamily: 'Outfit, sans-serif', fontWeight: 600,
}

// ── Estilos compartidos animaciones ──────────────────────────────────────────
const sharedStyles = `
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(30px) } to { opacity: 1; transform: translateX(0) } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.85) } to { opacity: 1; transform: scale(1) } }
  @keyframes successPop { 0% { transform: scale(0.5); opacity: 0 } 50% { transform: scale(1.1) } 100% { transform: scale(1); opacity: 1 } }

  .step-content { animation: slideInRight 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
  .fade-up { animation: fadeInUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
  .pop { animation: successPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both; }
  .scale-in { animation: scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }

  .primary-btn { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, opacity 0.25s ease; position: relative; overflow: hidden; }
  .primary-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(184,131,58,0.4) !important; }
  .primary-btn:not(:disabled):active { transform: translateY(-1px) scale(0.99); }

  .secondary-btn { transition: background 0.2s, transform 0.2s; }
  .secondary-btn:hover { background: rgba(0,0,0,0.04); transform: translateY(-1px); }
  .secondary-btn:active { transform: translateY(0) scale(0.98); }

  .cat-btn { transition: border-color 0.2s, background 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease; }
  .cat-btn:hover { transform: translateY(-2px); border-color: #B8833A !important; box-shadow: 0 8px 20px rgba(184,131,58,0.18); }
  .cat-btn:active { transform: translateY(-1px) scale(0.97); }

  .day-pill { transition: background 0.2s, color 0.2s, transform 0.2s; }
  .day-pill:hover { transform: translateY(-1px); }
  .day-pill:active { transform: translateY(0) scale(0.96); }

  .focusable input:focus, .focusable textarea:focus, .focusable select:focus {
    border-color: #B8833A !important;
    box-shadow: 0 0 0 4px rgba(184,131,58,0.08);
  }

  @media (prefers-reduced-motion: reduce) {
    .step-content, .fade-up, .pop, .scale-in { animation: none !important; opacity: 1 !important; transform: none !important; }
    .primary-btn, .secondary-btn, .cat-btn, .day-pill { transition: none !important; }
  }
`

export default function ProOnboardingPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuthStore()

  const [step, setStep] = useState(1)
  // step 1: negocio, 2: ubicación, 3: servicios, 4: horario, 5: galería, 6: listo

  // ── State step 1+2: Negocio + Ubicación ────────────────────────────────────
  const [form, setForm] = useState({
    business_name: '',
    category: '',
    description: '',
    address: '',
    city: '',
    latitude: null,
    longitude: null,
  })
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleAddressSelect = ({ address, city, lat, lng }) => {
    set('address', address)
    set('city', city)
    set('latitude', lat ?? null)
    set('longitude', lng ?? null)
  }

  // ── State step 3: Servicios ─────────────────────────────────────────────────
  const [services, setServices] = useState([
    { name: '', price: '', duration_minutes: '' },
  ])
  const addServiceRow = () => {
    if (services.length >= 5) return
    setServices(s => [...s, { name: '', price: '', duration_minutes: '' }])
  }
  const removeServiceRow = (idx) => {
    setServices(s => s.filter((_, i) => i !== idx))
  }
  const updateService = (idx, field, val) => {
    setServices(s => s.map((srv, i) => i === idx ? { ...srv, [field]: val } : srv))
  }

  // ── State step 4: Horario ───────────────────────────────────────────────────
  const [availability, setAvailability] = useState(() =>
    DAYS.map(d => ({
      day_of_week: d.value,
      is_available: ['monday','tuesday','wednesday','thursday','friday'].includes(d.value),
      start_time: '09:00',
      end_time:   '18:00',
    }))
  )
  const toggleDay = (idx) => {
    setAvailability(av => av.map((d, i) => i === idx ? { ...d, is_available: !d.is_available } : d))
  }
  const setDayTime = (idx, field, val) => {
    setAvailability(av => av.map((d, i) => i === idx ? { ...d, [field]: val } : d))
  }
  const copyToAll = () => {
    const first = availability.find(d => d.is_available)
    if (!first) return
    setAvailability(av => av.map(d => d.is_available
      ? { ...d, start_time: first.start_time, end_time: first.end_time }
      : d
    ))
    toast.success('Horario aplicado a todos los días activos')
  }

  // ── State step 5: Galería (opcional) ────────────────────────────────────────
  const [gallery, setGallery] = useState([]) // [{ file, preview, uploading, url }]
  const galleryRef = useRef(null)

  const handleGalleryFiles = (e) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = 5 - gallery.length
    const toAdd = files.slice(0, remaining)
    if (files.length > remaining) {
      toast.error(`Máximo 5 fotos. Se añadirán ${remaining}.`)
    }
    toAdd.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" no es una imagen`)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" supera los 5MB`)
        return
      }
      const reader = new FileReader()
      reader.onload = ev => {
        setGallery(g => [...g, { file, preview: ev.target.result, base64: ev.target.result }])
      }
      reader.readAsDataURL(file)
    })
    if (galleryRef.current) galleryRef.current.value = ''
  }

  const removeGalleryItem = (idx) => {
    setGallery(g => g.filter((_, i) => i !== idx))
  }

  // ── Mutations ──────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)

  const createProfile = useMutation({
    mutationFn: (data) => profApi.create(data),
  })

  // ── Validaciones por paso ──────────────────────────────────────────────────
  const validateStep = () => {
    if (step === 1) {
      if (!form.business_name.trim()) { toast.error('Pon el nombre de tu negocio'); return false }
      if (!form.category) { toast.error('Elige una categoría'); return false }
      return true
    }
    if (step === 2) {
      if (!form.address.trim() || form.latitude == null) {
        toast.error('Selecciona una dirección de la lista'); return false
      }
      return true
    }
    if (step === 3) {
      const valid = services.filter(s =>
        s.name.trim() && Number(s.price) > 0 && Number(s.duration_minutes) >= 5
      )
      if (valid.length === 0) {
        toast.error('Añade al menos 1 servicio con nombre, precio y duración')
        return false
      }
      return true
    }
    if (step === 4) {
      const active = availability.filter(d => d.is_available)
      if (active.length === 0) {
        toast.error('Selecciona al menos 1 día disponible')
        return false
      }
      for (const d of active) {
        if (d.start_time >= d.end_time) {
          const dayLabel = DAYS.find(x => x.value === d.day_of_week)?.label
          toast.error(`${dayLabel}: la hora de inicio debe ser anterior a la de fin`)
          return false
        }
      }
      return true
    }
    if (step === 5) {
      // opcional, siempre OK
      return true
    }
    return true
  }

  // ── Flujo principal ────────────────────────────────────────────────────────
  const goNext = async () => {
    if (!validateStep()) return

    // Step 2 → 3 : crear el perfil profesional en backend
    if (step === 2) {
      try {
        setSubmitting(true)
        await createProfile.mutateAsync({
          business_name: form.business_name,
          category:      form.category,
          description:   form.description,
          address:       form.address,
          city:          form.city,
          latitude:      form.latitude,
          longitude:     form.longitude,
        })
        qc.invalidateQueries({ queryKey: ['me'] })
        setStep(3)
      } catch (err) {
        toast.error(err.response?.data?.error ?? 'Error al crear perfil')
      } finally {
        setSubmitting(false)
      }
      return
    }

    // Step 3 → 4 : crear los servicios
    if (step === 3) {
      try {
        setSubmitting(true)
        const valid = services.filter(s =>
          s.name.trim() && Number(s.price) > 0 && Number(s.duration_minutes) >= 5
        )
        for (const s of valid) {
          await profApi.createService({
            name:             s.name.trim(),
            price:            Number(s.price),
            duration_minutes: Number(s.duration_minutes),
          })
        }
        setStep(4)
      } catch (err) {
        toast.error(err.response?.data?.error ?? 'Error al crear servicios')
      } finally {
        setSubmitting(false)
      }
      return
    }

    // Step 4 → 5 : guardar horario
    if (step === 4) {
      try {
        setSubmitting(true)
        const payload = availability
          .filter(d => d.is_available)
          .map(d => ({
            day_of_week: d.day_of_week,
            start_time:  d.start_time,
            end_time:    d.end_time,
            is_available: true,
          }))
        await profApi.setAvail({ availability: payload })
        setStep(5)
      } catch (err) {
        toast.error(err.response?.data?.error ?? 'Error al guardar horario')
      } finally {
        setSubmitting(false)
      }
      return
    }

    // Step 5 → 6 : subir galería (puede ir vacía)
    if (step === 5) {
      try {
        setSubmitting(true)
        for (const g of gallery) {
          if (g.base64) {
            await profApi.uploadGalleryImage(g.base64, null)
          }
        }
        setStep(6)
      } catch (err) {
        toast.error(err.response?.data?.error ?? 'Error al subir alguna imagen')
      } finally {
        setSubmitting(false)
      }
      return
    }

    setStep(step + 1)
  }

  const goBack = () => {
    if (step <= 1 || submitting) return
    // No se puede volver atrás una vez creado el perfil (steps 3+),
    // porque el backend ya tiene el negocio creado.
    if (step >= 3) {
      toast('No se puede volver al inicio una vez creado el negocio', { icon: 'ℹ️' })
      return
    }
    setStep(step - 1)
  }

  const goToDashboard = () => {
    qc.invalidateQueries({ queryKey: ['me'] })
    navigate('/pro/dashboard')
  }

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════

  // ── Step 6: Pantalla de éxito ───────────────────────────────────────────────
  if (step === 6) {
    return (
      <div style={{ minHeight: '100dvh', background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF7F2 100%)', display: 'flex', flexDirection: 'column', fontFamily: 'Outfit, sans-serif' }}>
        <style>{sharedStyles}</style>

        <header className="fade-up" style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(26,22,18,0.06)' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '3px', color: '#1A1612' }}>
            TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
          </span>
        </header>

        <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '36px 24px' }}>
          <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
            <div className="pop" style={{
              width: 110, height: 110, borderRadius: '50%',
              background: 'linear-gradient(135deg,#B8833A,#D4A055)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', margin: '0 auto 32px',
              boxShadow: '0 20px 60px rgba(184,131,58,0.4)',
            }}>
              🎉
            </div>

            <h1 className="fade-up" style={{ animationDelay: '0.2s', margin: 0, fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 7vw, 3rem)', fontWeight: 400, lineHeight: 1.08, color: '#1A1612' }}>
              ¡Tu negocio está <em style={{ color: '#B8833A' }}>listo</em>!
            </h1>

            <p className="fade-up" style={{ animationDelay: '0.3s', margin: '18px 0 0', color: 'rgba(26,22,18,0.55)', fontSize: 16, lineHeight: 1.6 }}>
              Ya puedes recibir reservas en {form.business_name}.<br />
              Comparte tu link con tus clientes y empieza a llenar tu agenda.
            </p>

            <div className="fade-up" style={{ animationDelay: '0.4s', marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={goToDashboard}
                className="primary-btn"
                style={{
                  width: '100%', height: 56, fontSize: 15, fontWeight: 700,
                  background: 'linear-gradient(135deg,#B8833A,#D4A055)',
                  color: '#FFFFFF', border: 'none', borderRadius: 16,
                  cursor: 'pointer', letterSpacing: '0.02em',
                  boxShadow: '0 8px 24px rgba(184,131,58,0.3)',
                }}
              >
                Ir a mi panel →
              </button>
            </div>

            <div className="fade-up" style={{ animationDelay: '0.5s', marginTop: 24, padding: '16px 18px', background: '#FFFFFF', border: '1px solid rgba(26,22,18,0.06)', borderRadius: 14, textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', fontWeight: 700 }}>
                Próximos pasos
              </p>
              <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', fontSize: 13, color: 'rgba(0,0,0,0.7)' }}>
                <li style={{ padding: '4px 0' }}>• Comparte tu enlace en redes sociales</li>
                <li style={{ padding: '4px 0' }}>• Conecta Google Calendar para sincronizar</li>
                <li style={{ padding: '4px 0' }}>• Revisa las reseñas tras cada cita</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── Header común a steps 1-5 ────────────────────────────────────────────────
  const stepTitles = {
    1: { title: 'Crea tu perfil profesional', subtitle: 'Información básica de tu negocio' },
    2: { title: 'Ubicación de tu negocio',    subtitle: 'Los clientes te encontrarán cerca de ellos' },
    3: { title: 'Añade tus servicios',         subtitle: 'Define lo que ofreces y a qué precio' },
    4: { title: 'Define tu horario',           subtitle: 'Cuándo estás disponible para citas' },
    5: { title: 'Sube fotos de tu trabajo',    subtitle: 'Opcional · Pueden esperar a más tarde' },
  }

  const current = stepTitles[step] ?? stepTitles[1]
  const progressPct = (step / TOTAL_STEPS) * 100

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF7F2 100%)', fontFamily: 'Outfit, sans-serif' }}>
      <style>{sharedStyles}</style>

      <main style={{ display: 'flex', justifyContent: 'center', padding: '32px 20px 80px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          {/* Logo */}
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '3px', color: '#1A1612' }}>
              TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
            </span>
          </div>

          {/* Step counter + título */}
          <div className="fade-up" style={{ animationDelay: '0.05s', textAlign: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#B8833A', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Paso {step} de {TOTAL_STEPS}
            </span>
          </div>
          <h1 className="fade-up" style={{ animationDelay: '0.1s', margin: '4px 0 6px', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.7rem, 5vw, 2.2rem)', fontWeight: 400, lineHeight: 1.12, color: '#1A1612', textAlign: 'center' }}>
            {current.title}
          </h1>
          <p className="fade-up" style={{ animationDelay: '0.15s', margin: 0, fontSize: 14, color: 'rgba(26,22,18,0.5)', textAlign: 'center', marginBottom: 22 }}>
            {current.subtitle}
          </p>

          {/* Progress bar */}
          <div className="fade-up" style={{ animationDelay: '0.2s', height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 100, overflow: 'hidden', marginBottom: 28 }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,#B8833A,#D4A055)', borderRadius: 100, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>

          {/* ─── STEP 1: NEGOCIO ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="step-content focusable" key="step-1">
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Nombre del negocio *</label>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={e => set('business_name', e.target.value)}
                  placeholder="Salón Pilar"
                  style={inputStyle}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={labelStyle}>Categoría *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {CATEGORIES.map(cat => {
                    const active = form.category === cat.value
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => set('category', cat.value)}
                        className="cat-btn"
                        style={{
                          padding: '12px 6px',
                          borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                          border: `1.5px solid ${active ? '#B8833A' : 'rgba(0,0,0,0.1)'}`,
                          background: active ? 'rgba(184,131,58,0.08)' : '#FFFFFF',
                          color: active ? '#B8833A' : 'rgba(0,0,0,0.7)',
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: active ? 700 : 500,
                          boxShadow: active ? '0 6px 16px rgba(184,131,58,0.18)' : 'none',
                        }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{cat.icon}</div>
                        <div style={{ fontSize: 11 }}>{cat.label}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 6 }}>
                <label style={labelStyle}>Descripción (opcional)</label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Cuéntanos qué te hace especial..."
                  rows={3}
                  maxLength={500}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }}
                />
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(0,0,0,0.35)', textAlign: 'right' }}>
                  {form.description.length}/500
                </p>
              </div>
            </div>
          )}

          {/* ─── STEP 2: UBICACIÓN ───────────────────────────────────────── */}
          {step === 2 && (
            <div className="step-content focusable" key="step-2">
              <div style={{ marginBottom: 16, position: 'relative' }}>
                <GoogleAddressInput
                  label="Dirección *"
                  value={form.address}
                  onChange={(val) => { set('address', val); set('latitude', null); set('longitude', null) }}
                  onSelect={handleAddressSelect}
                  placeholder="Calle Gran Vía 12, Madrid"
                  helpText="Empieza a escribir y selecciona tu dirección de la lista"
                  autoFocus
                />
              </div>

              {form.latitude != null && (
                <>
                  <div className="fade-up" style={{ padding: '10px 14px', background: 'rgba(184,131,58,0.06)', border: '1px solid rgba(184,131,58,0.2)', borderRadius: 12, fontSize: 13, color: '#1A1612', marginBottom: 6 }}>
                    <strong>📍 {form.address}</strong>
                    {form.city && <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>{form.city}</div>}
                  </div>
                  <MapPin lat={form.latitude} lng={form.longitude} />
                </>
              )}

              {form.latitude == null && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(0,0,0,0.4)' }}>
                  Empieza a escribir y selecciona tu dirección de la lista
                </p>
              )}
            </div>
          )}

          {/* ─── STEP 3: SERVICIOS ───────────────────────────────────────── */}
          {step === 3 && (
            <div className="step-content focusable" key="step-3">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {services.map((srv, idx) => (
                  <div key={idx} className="fade-up" style={{
                    animationDelay: `${idx * 0.05}s`,
                    background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)',
                    borderRadius: 14, padding: '14px 16px', position: 'relative',
                  }}>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeServiceRow(idx)}
                        aria-label="Eliminar servicio"
                        style={{
                          position: 'absolute', top: 10, right: 10,
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 18, color: 'rgba(0,0,0,0.3)', padding: 4, lineHeight: 1,
                        }}
                      >✕</button>
                    )}

                    <div style={{ marginBottom: 10 }}>
                      <label style={labelStyle}>Nombre del servicio</label>
                      <input
                        type="text"
                        value={srv.name}
                        onChange={e => updateService(idx, 'name', e.target.value)}
                        placeholder="Corte de pelo"
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={labelStyle}>Precio (€)</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={srv.price}
                          onChange={e => updateService(idx, 'price', e.target.value)}
                          placeholder="25"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Duración (min)</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="5"
                          step="5"
                          value={srv.duration_minutes}
                          onChange={e => updateService(idx, 'duration_minutes', e.target.value)}
                          placeholder="30"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {services.length < 5 && (
                  <button
                    type="button"
                    onClick={addServiceRow}
                    className="secondary-btn"
                    style={{
                      padding: '12px', background: 'rgba(184,131,58,0.05)',
                      border: '1.5px dashed rgba(184,131,58,0.4)', borderRadius: 12,
                      color: '#B8833A', fontWeight: 700, fontSize: 13,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    + Añadir otro servicio
                  </button>
                )}

                <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)', textAlign: 'center', margin: '4px 0 0' }}>
                  Podrás añadir y editar más desde tu panel.
                </p>
              </div>
            </div>
          )}

          {/* ─── STEP 4: HORARIO ─────────────────────────────────────────── */}
          {step === 4 && (
            <div className="step-content focusable" key="step-4">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {availability.map((d, idx) => {
                  const dayLabel = DAYS.find(x => x.value === d.day_of_week)?.label
                  return (
                    <div key={d.day_of_week} className="fade-up" style={{
                      animationDelay: `${idx * 0.04}s`,
                      background: '#FFFFFF',
                      border: `1.5px solid ${d.is_available ? 'rgba(184,131,58,0.3)' : 'rgba(0,0,0,0.08)'}`,
                      borderRadius: 12, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      flexWrap: 'wrap',
                    }}>
                      <button
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className="day-pill"
                        style={{
                          minWidth: 100, padding: '8px 12px',
                          background: d.is_available ? 'linear-gradient(135deg,#B8833A,#D4A055)' : 'rgba(0,0,0,0.04)',
                          color: d.is_available ? '#FFFFFF' : 'rgba(0,0,0,0.5)',
                          border: 'none', borderRadius: 8,
                          fontWeight: 700, fontSize: 13, cursor: 'pointer',
                          fontFamily: 'inherit',
                          boxShadow: d.is_available ? '0 4px 12px rgba(184,131,58,0.25)' : 'none',
                        }}
                      >
                        {dayLabel}
                      </button>

                      {d.is_available && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                          <input
                            type="time"
                            value={d.start_time}
                            onChange={e => setDayTime(idx, 'start_time', e.target.value)}
                            style={{ ...inputStyle, padding: '8px 10px', fontSize: 14, flex: 1, minWidth: 90 }}
                          />
                          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)' }}>—</span>
                          <input
                            type="time"
                            value={d.end_time}
                            onChange={e => setDayTime(idx, 'end_time', e.target.value)}
                            style={{ ...inputStyle, padding: '8px 10px', fontSize: 14, flex: 1, minWidth: 90 }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={copyToAll}
                className="secondary-btn"
                style={{
                  marginTop: 12, width: '100%',
                  padding: '10px', background: 'rgba(0,0,0,0.03)',
                  border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 12,
                  color: 'rgba(0,0,0,0.7)', fontWeight: 600, fontSize: 13,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ⏱ Aplicar el primer horario a todos los días activos
              </button>
            </div>
          )}

          {/* ─── STEP 5: GALERÍA ─────────────────────────────────────────── */}
          {step === 5 && (
            <div className="step-content" key="step-5">
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryFiles}
                style={{ display: 'none' }}
              />

              {gallery.length === 0 ? (
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className="secondary-btn"
                  style={{
                    width: '100%', minHeight: 200,
                    background: 'rgba(184,131,58,0.04)',
                    border: '2px dashed rgba(184,131,58,0.35)', borderRadius: 16,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: 36 }}>📷</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#B8833A' }}>Pulsa para subir fotos</span>
                  <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Hasta 5 imágenes · Máx. 5MB cada una</span>
                </button>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
                    {gallery.map((g, idx) => (
                      <div key={idx} className="scale-in" style={{
                        position: 'relative', aspectRatio: '1',
                        borderRadius: 12, overflow: 'hidden',
                        border: '1.5px solid rgba(0,0,0,0.06)',
                      }}>
                        <img src={g.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(idx)}
                          aria-label="Eliminar foto"
                          style={{
                            position: 'absolute', top: 6, right: 6,
                            width: 24, height: 24, borderRadius: '50%',
                            background: 'rgba(0,0,0,0.6)', color: '#FFFFFF',
                            border: 'none', cursor: 'pointer',
                            fontSize: 12, lineHeight: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >✕</button>
                      </div>
                    ))}
                    {gallery.length < 5 && (
                      <button
                        type="button"
                        onClick={() => galleryRef.current?.click()}
                        className="secondary-btn"
                        style={{
                          aspectRatio: '1',
                          background: 'rgba(184,131,58,0.04)',
                          border: '2px dashed rgba(184,131,58,0.35)', borderRadius: 12,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                          cursor: 'pointer', fontFamily: 'inherit',
                          color: '#B8833A', fontSize: 24, fontWeight: 700,
                        }}
                      >+</button>
                    )}
                  </div>
                </>
              )}

              <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)', textAlign: 'center', marginTop: 14 }}>
                Las fotos atraen un 60% más de reservas. Pero puedes subirlas más tarde.
              </p>
            </div>
          )}

          {/* ─── BOTONES DE NAVEGACIÓN ──────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            {step <= 2 && step > 1 && (
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className="secondary-btn"
                style={{
                  flex: 1, height: 54,
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 14,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: 14, color: '#1A1612',
                  fontFamily: 'inherit', opacity: submitting ? 0.5 : 1,
                }}
              >
                ← Atrás
              </button>
            )}

            {step === 5 && gallery.length === 0 && (
              <button
                type="button"
                onClick={() => { setStep(6) }}
                disabled={submitting}
                className="secondary-btn"
                style={{
                  flex: 1, height: 54,
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 14,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: 14, color: '#1A1612',
                  fontFamily: 'inherit',
                }}
              >
                Saltar
              </button>
            )}

            <button
              type="button"
              onClick={goNext}
              disabled={submitting}
              className="primary-btn"
              style={{
                flex: 2, height: 54,
                background: submitting ? 'rgba(184,131,58,0.4)' : 'linear-gradient(135deg,#B8833A,#D4A055)',
                color: '#FFFFFF', border: 'none', borderRadius: 14,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 14, letterSpacing: '0.02em',
                fontFamily: 'inherit',
                boxShadow: submitting ? 'none' : '0 10px 28px rgba(184,131,58,0.3)',
              }}
            >
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Guardando...
                </span>
              ) : (
                step === 5 ? 'Subir y continuar →' : 'Continuar →'
              )}
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
