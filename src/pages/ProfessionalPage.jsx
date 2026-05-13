import { useState } from 'react'
import { useFavorites } from '../hooks/useFavorites'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '../services/api'
import toast from 'react-hot-toast'

const DAY_ORDER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAY_MAP   = { monday:'Lun', tuesday:'Mar', wednesday:'Mié', thursday:'Jue', friday:'Vie', saturday:'Sáb', sunday:'Dom' }

function Stars({ rating, size = 13 }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating ?? 0) ? '#B8833A' : 'rgba(26,22,18,0.12)', fontSize: size }}>★</span>
      ))}
    </span>
  )
}

function RatingBar({ star, count, total }) {
  const pct = total ? (count / total) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.5)', width: 10, textAlign: 'right', fontFamily: 'Outfit, sans-serif' }}>{star}</span>
      <span style={{ fontSize: 10, color: '#B8833A' }}>★</span>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#B8833A,#D4A055)', borderRadius: 3, transition: 'width 0.6s' }} />
      </div>
      <span style={{ fontSize: 10, color: 'rgba(26,22,18,0.3)', width: 18, fontFamily: 'Outfit, sans-serif' }}>{count}</span>
    </div>
  )
}

// ── Waitlist Sheet ────────────────────────────────────────────────────────────
function WaitlistSheet({ profId, profName, services, onClose }) {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('sv-SE'))
  const [selectedService, setSelectedService] = useState(services[0]?.id ?? '')
  const [timePreference, setTimePreference] = useState('')

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i + 1)
    return { iso: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE d', { locale: es }) }
  })

  const { data: checkData, refetch: refetchCheck } = useQuery({
    queryKey: ['waitlist-check', profId, selectedDate],
    queryFn: () => api.get('/waitlist/check', { params: { professional_id: profId, date: selectedDate } }).then(r => r.data.data),
  })

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots-check', profId, selectedService, selectedDate],
    queryFn: () => api.get('/bookings/available-slots', {
      params: { professional_id: profId, service_id: selectedService, date: selectedDate }
    }).then(r => r.data.data),
    enabled: !!selectedService && !!selectedDate,
  })

  const hasAvailableSlots = Array.isArray(slotsData) && slotsData.some(s => s.available)

  const alreadyIn = !!checkData?.id

  const { mutate: join, isPending: joining } = useMutation({
    mutationFn: () => api.post('/waitlist', {
      professional_id: profId,
      service_id: selectedService || null,
      date: selectedDate,
      time_preference: timePreference || null,
    }),
    onSuccess: () => {
      toast.success('¡Apuntado a la lista de espera! Te avisaremos si hay hueco ✓')
      refetchCheck()
    },
    onError: err => toast.error(err.response?.data?.error ?? 'Error al apuntarse'),
  })

  const { mutate: leave, isPending: leaving } = useMutation({
    mutationFn: () => api.delete('/waitlist', { data: { professional_id: profId, date: selectedDate } }),
    onSuccess: () => {
      toast.success('Eliminado de la lista de espera')
      refetchCheck()
    },
    onError: () => toast.error('Error al salir de la lista'),
  })

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflowX: 'hidden' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, maxHeight: '88dvh', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)', paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.08)', margin: '16px auto 0' }} />
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 2, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>⏳ Lista de espera</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1612', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>{profName}</p>
          <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.45)', marginBottom: 20, fontFamily: 'Outfit, sans-serif', lineHeight: 1.5 }}>
            Si se libera un hueco el día que elijas, te avisaremos por email.
          </p>

          {/* Selector de día */}
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,22,18,0.4)', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>¿Qué día te interesa?</p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
            {days.map(d => (
              <button key={d.iso} onClick={() => setSelectedDate(d.iso)}
                style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 12, border: `1.5px solid ${selectedDate === d.iso ? '#B8833A' : 'rgba(0,0,0,0.1)'}`, background: selectedDate === d.iso ? 'linear-gradient(135deg,#B8833A,#D4A055)' : '#FFFFFF', color: selectedDate === d.iso ? '#FFFFFF' : '#1A1612', fontSize: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                {d.label}
              </button>
            ))}
          </div>

          {/* Selector de servicio */}
          {services.length > 1 && (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,22,18,0.4)', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>Servicio</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {services.map(s => (
                  <button key={s.id} onClick={() => setSelectedService(s.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${selectedService === s.id ? '#B8833A' : 'rgba(0,0,0,0.1)'}`, background: selectedService === s.id ? 'rgba(184,131,58,0.06)' : '#FAFAF9', cursor: 'pointer' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1612', fontFamily: 'Outfit, sans-serif' }}>{s.name}</span>
                    <span style={{ fontSize: 13, color: '#B8833A', fontFamily: 'Cormorant Garamond, serif' }}>{s.price}€</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Preferencia horaria */}
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,22,18,0.4)', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>Preferencia horaria (opcional)</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { value: 'morning',   label: 'Mañana' },
              { value: 'afternoon', label: 'Tarde' },
              { value: 'any',       label: 'Cualquier hora' },
            ].map(({ value, label }) => (
              <button key={value} onClick={() => setTimePreference(timePreference === value ? '' : value)}
                style={{ padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${timePreference === value ? '#B8833A' : 'rgba(0,0,0,0.1)'}`, background: timePreference === value ? 'rgba(184,131,58,0.08)' : '#FAFAF9', color: timePreference === value ? '#B8833A' : 'rgba(26,22,18,0.6)', fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Banner: hay huecos libres → no tiene sentido apuntarse */}
          {!slotsLoading && hasAvailableSlots && !alreadyIn && (
            <div style={{ background: 'rgba(22,163,74,0.06)', border: '1.5px solid rgba(22,163,74,0.25)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#16a34a', fontFamily: 'Outfit, sans-serif', fontWeight: 700, margin: 0 }}>✓ Hay huecos disponibles este día</p>
              <p style={{ fontSize: 12, color: 'rgba(22,163,74,0.75)', margin: '4px 0 0', fontFamily: 'Outfit, sans-serif', lineHeight: 1.5 }}>
                Este día tiene horas libres. Reserva directamente en la sección de servicios en lugar de apuntarte a la lista de espera.
              </p>
            </div>
          )}

          {/* Estado actual para el día seleccionado */}
          {alreadyIn ? (
            <div style={{ background: 'rgba(22,163,74,0.06)', border: '1.5px solid rgba(22,163,74,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#16a34a', fontFamily: 'Outfit, sans-serif', fontWeight: 600, margin: 0 }}>✓ Ya estás en la lista para este día</p>
              <p style={{ fontSize: 12, color: 'rgba(22,163,74,0.7)', margin: '4px 0 0', fontFamily: 'Outfit, sans-serif' }}>Te avisaremos si se libera un hueco</p>
            </div>
          ) : null}

          {/* Botón */}
          {alreadyIn ? (
            <button onClick={() => leave()} disabled={leaving}
              style={{ width: '100%', padding: '14px', background: 'rgba(220,38,38,0.06)', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 14, color: '#dc2626', fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>
              {leaving ? 'Saliendo...' : 'Salir de la lista de espera'}
            </button>
          ) : hasAvailableSlots ? (
            <button
              onClick={() => {
                const svc = selectedService || services[0]?.id
                navigate(`/booking/${profId}/${svc}?date=${selectedDate}`)
              }}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', border: 'none', borderRadius: 14, color: '#FFFFFF', fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>
              Ver huecos disponibles →
            </button>
          ) : (
            <button onClick={() => join()} disabled={joining || slotsLoading}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#1A1612,#2C1810)', border: 'none', borderRadius: 14, color: '#FFFFFF', fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: (joining || slotsLoading) ? 'not-allowed' : 'pointer', opacity: (joining || slotsLoading) ? 0.7 : 1 }}>
              {joining ? 'Apuntando...' : slotsLoading ? 'Comprobando...' : '⏳ Apuntarme a la lista de espera'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProfessionalPage() {
  const { id } = useParams()
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('services')
  const [selectedService, setSelectedService] = useState(null)
  const [galleryOpen, setGalleryOpen] = useState(null)
  const [showWaitlist, setShowWaitlist] = useState(false)
  const { isFav, toggle: toggleFav } = useFavorites()

  const { data: prof, isLoading } = useQuery({
    queryKey: ['professional', id],
    queryFn: () => profApi.getOne(id).then(r => r.data.data),
  })

  if (isLoading) return (
    <div style={{ maxWidth: 700, margin: '0 auto', background: '#F7F5F2', minHeight: '100vh' }}>
      <style>{`
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        .sk{background:linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%);background-size:400px 100%;animation:shimmer 1.4s infinite;border-radius:8px;}
      `}</style>

      {/* Hero skeleton */}
      <div className="sk" style={{ height: 300, borderRadius: 0 }} />

      {/* Nombre + ciudad + precio */}
      <div style={{ padding: '20px 18px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="sk" style={{ height: 28, width: '60%' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="sk" style={{ height: 14, width: 80 }} />
          <div className="sk" style={{ height: 14, width: 50 }} />
        </div>
        {/* Disponibilidad chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {[60,70,55,65,58,52,60].map((w,i) => (
            <div key={i} className="sk" style={{ height: 28, width: w, borderRadius: 999 }} />
          ))}
        </div>
      </div>

      {/* Gallery skeleton */}
      <div style={{ padding: '18px 18px 0', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 6 }}>
        <div className="sk" style={{ height: 180, borderRadius: 14 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="sk" style={{ flex: 1, borderRadius: 14 }} />
          <div className="sk" style={{ flex: 1, borderRadius: 14 }} />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div style={{ display: 'flex', gap: 0, margin: '18px 0 0', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '0 18px' }}>
        {[80, 70, 65, 60].map((w, i) => (
          <div key={i} className="sk" style={{ height: 36, width: w, borderRadius: 6, marginRight: 4 }} />
        ))}
      </div>

      {/* Servicios skeleton */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 1, background: '#fff', borderRadius: 22, margin: '14px 18px', overflow: 'hidden' }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ padding: '18px 16px', borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="sk" style={{ height: 18, width: '45%' }} />
              <div className="sk" style={{ height: 18, width: 48 }} />
            </div>
            <div className="sk" style={{ height: 12, width: '70%', marginBottom: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="sk" style={{ height: 22, width: 72, borderRadius: 999 }} />
              <div className="sk" style={{ height: 34, width: 88, borderRadius: 10 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (!prof) return (
    <div style={{ textAlign: 'center', padding: '80px 16px' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontStyle: 'italic', color: 'rgba(26,22,18,0.3)' }}>Profesional no encontrado</p>
    </div>
  )

const activeServices = prof.services?.filter(s => s.is_active) ?? []
  const availability   = DAY_ORDER.map(d => prof.availability?.find(a => a.day_of_week === d)).filter(Boolean)
  const availableDays  = availability.filter(a => a.is_available)
  const gallery        = (() => {
    if (prof.gallery?.length) return prof.gallery
    if (prof.gallery_urls?.length) return prof.gallery_urls.filter(Boolean).map(url => ({ url, caption: '' }))
    return []
  })()
  const minPrice       = activeServices.length ? Math.min(...activeServices.map(s => s.price)) : null
  const waitlistEnabled = prof.waitlist_enabled ?? false

  const handleBook = (service) => {
    if (!token) { navigate('/login'); return }
    navigate(`/booking/${prof.id}/${service.id}`)
  }

  const handleWaitlist = () => {
    if (!token) { navigate('/login'); return }
    setShowWaitlist(true)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: 'Outfit, sans-serif', background: '#F7F5F2', minHeight: '100vh', paddingBottom: 'calc(90px + env(safe-area-inset-bottom))' }}>
      <style>{`
        .tab-btn:hover { color: #1A1612 !important; }
        .svc-row { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s, box-shadow 0.25s; }
        .svc-row:hover { transform: translateY(-2px); border-color: rgba(184,131,58,0.4) !important; box-shadow: 0 10px 28px rgba(184,131,58,0.15) !important; }
        .gallery-thumb { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease; cursor: pointer; }
        .gallery-thumb:hover { transform: scale(1.04); opacity: 0.93; }
        .book-btn { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, opacity 0.2s ease; }
        .book-btn:hover { opacity: 0.95; transform: translateY(-2px); box-shadow: 0 16px 32px rgba(184,131,58,0.32) !important; }
        .book-btn:active { transform: translateY(-1px) scale(0.99); }
        @keyframes fadeUp { from { opacity:0; transform: translateY(14px) } to { opacity:1; transform:none } }
        @keyframes scaleIn { from { opacity:0; transform: scale(0.96) } to { opacity:1; transform: scale(1) } }
        @keyframes pop { 0% { transform: scale(0.5); opacity:0 } 50% { transform: scale(1.05) } 100% { transform: scale(1); opacity:1 } }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .fade-up { animation: fadeUp 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
        .scale-in { animation: scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        .pop { animation: pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
        .skeleton { background: linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%); background-size:400px 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
        .day-chip { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s; }
        .day-chip:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(184,131,58,0.15); }
        .review-card { animation: fadeUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes slideUpCta { from { transform: translateY(100%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes pulseCta { 0%, 100% { box-shadow: 0 6px 22px rgba(184,131,58,0.38) } 50% { box-shadow: 0 6px 28px rgba(184,131,58,0.6), 0 0 0 4px rgba(184,131,58,0.08) } }
        .sticky-cta { animation: slideUpCta 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.55s both; }
        .pulse-cta { animation: pulseCta 2.4s ease-in-out infinite 2s; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .scale-in, .pop, .review-card, .sticky-cta, .pulse-cta { animation: none !important; opacity: 1 !important; transform: none !important; }
          .svc-row, .gallery-thumb, .book-btn, .day-chip { transition: none !important; }
          .skeleton { animation: none !important; }
        }
      `}</style>

      {/* Waitlist Sheet */}
      {showWaitlist && (
        <WaitlistSheet profId={prof.id} profName={prof.business_name} services={activeServices} onClose={() => setShowWaitlist(false)} />
      )}

      {/* ── GALLERY LIGHTBOX ── */}
      {galleryOpen !== null && (() => {
        const prev = () => setGalleryOpen((galleryOpen - 1 + gallery.length) % gallery.length)
        const next = () => setGalleryOpen((galleryOpen + 1) % gallery.length)
        let touchStartX = null
        return (
          <div onClick={() => setGalleryOpen(null)}
            onTouchStart={e => { touchStartX = e.touches[0].clientX }}
            onTouchEnd={e => { if (!touchStartX) return; const dx = e.changedTouches[0].clientX - touchStartX; touchStartX = null; if (Math.abs(dx) < 40) return; e.stopPropagation(); dx < 0 ? next() : prev() }}
            style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 56px', touchAction: 'pan-y' }}>
            <img src={gallery[galleryOpen].url} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 10, objectFit: 'contain', userSelect: 'none', pointerEvents: 'none' }} />
            {gallery[galleryOpen].caption && <p style={{ marginTop: 14, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontFamily: 'Outfit, sans-serif', textAlign: 'center' }}>{gallery[galleryOpen].caption}</p>}
            {gallery.length > 1 && <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>{gallery.map((_, i) => <div key={i} onClick={e => { e.stopPropagation(); setGalleryOpen(i) }} style={{ width: i === galleryOpen ? 20 : 6, height: 6, borderRadius: 3, background: i === galleryOpen ? '#D4A055' : 'rgba(255,255,255,0.25)', transition: 'all 0.25s', cursor: 'pointer' }} />)}</div>}
            <button onClick={() => setGalleryOpen(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: 40, height: 40, color: '#FFF', fontSize: 16, cursor: 'pointer' }}>✕</button>
            {gallery.length > 1 && <>
              <button onClick={e => { e.stopPropagation(); prev() }} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#FFF', fontSize: 24, cursor: 'pointer' }}>‹</button>
              <button onClick={e => { e.stopPropagation(); next() }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#FFF', fontSize: 24, cursor: 'pointer' }}>›</button>
            </>}
          </div>
        )
      })()}

      {/* ══ PORTADA ══ */}
      <div className="fade-up" style={{ position: 'relative', height: 300, overflow: 'hidden', background: 'linear-gradient(135deg,#1A0F05,#2C1A0A)' }}>
        {prof.cover_image_url
          ? <img
              src={prof.cover_image_url}
              alt={prof.business_name}
              loading="eager"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
              onError={e => { e.target.style.display = 'none' }}
            />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, opacity: 0.15 }}>✂️</div>
        }
        {/* Gradiente bottom más pronunciado */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 35%, rgba(26,15,5,0.85) 100%)' }} />

        {/* Botones superiores izquierda: volver + compartir */}
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, padding: '8px 16px', color: '#FFFFFF', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>← Volver</button>

          <button
            onClick={() => {
              const url = window.location.href
              const text = `${prof.business_name} — ${prof.city} | Reserva en TopSy`
              if (navigator.share) {
                navigator.share({ title: prof.business_name, text, url }).catch(() => {})
              } else {
                navigator.clipboard?.writeText(url)
                  .then(() => toast.success('Enlace copiado ✓'))
                  .catch(() => toast('Copia este enlace: ' + url))
              }
            }}
            style={{ background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: 999, width: 38, height: 38, color: '#1A1612', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', flexShrink: 0 }}
            title="Compartir"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>

        {/* Favorito + Badge verificado */}
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => { toggleFav(prof.id); toast(isFav(prof.id) ? 'Eliminado de favoritos' : '❤️ Guardado en favoritos') }}
            style={{ background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: 999, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
          >
            {isFav(prof.id) ? '❤️' : '🤍'}
          </button>
          {prof.is_verified && (
            <div style={{ background: 'linear-gradient(135deg,#B8833A,#D4A055)', borderRadius: 999, padding: '5px 13px', fontSize: 11, color: '#FFFFFF', fontWeight: 800, letterSpacing: '0.05em', boxShadow: '0 4px 14px rgba(184,131,58,0.45)' }}>✓ TOP</div>
          )}
        </div>

        {/* Info superpuesta en la portada */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 16px 18px' }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.7rem,5.5vw,2.4rem)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px', lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>{prof.business_name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Stars rating={prof.avg_rating} />
              <span style={{ fontSize: 13, color: '#D4A055', fontWeight: 700 }}>{prof.avg_rating ? Number(prof.avg_rating).toFixed(1) : '—'}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>({prof.total_reviews ?? 0})</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>·</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 3 }}>📍 {prof.city}</span>
            {minPrice != null && <>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>·</span>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#D4A055', fontStyle: 'italic' }}>desde {minPrice}€</span>
            </>}
          </div>
        </div>
      </div>

      {/* ══ CUERPO ══ */}
      <div style={{ background: '#F7F5F2' }}>

        {/* Descripción + horarios */}
        <div style={{ padding: '18px 16px 0' }}>
          {prof.description && (
            <p style={{ fontSize: 14, color: 'rgba(26,22,18,0.55)', lineHeight: 1.75, margin: '0 0 16px', fontFamily: 'Outfit, sans-serif' }}>{prof.description}</p>
          )}

          {/* Chips horario horizontal scroll */}
          {availableDays.length > 0 && (
            <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4, marginBottom: 4 }}>
              <style>{`.no-sb2::-webkit-scrollbar{display:none}.no-sb2{-ms-overflow-style:none;scrollbar-width:none}`}</style>
              {availableDays.map(a => (
                <div key={a.day_of_week} className="no-sb2" style={{ flexShrink: 0, fontSize: 11, background: '#FFFFFF', border: '1.5px solid rgba(184,131,58,0.22)', borderRadius: 12, padding: '6px 12px', color: '#B8833A', fontFamily: 'Outfit, sans-serif', boxShadow: '0 1px 4px rgba(184,131,58,0.08)' }}>
                  <span style={{ fontWeight: 800 }}>{DAY_MAP[a.day_of_week]}</span>
                  <span style={{ color: 'rgba(26,22,18,0.4)', marginLeft: 5 }}>{a.start_time.slice(0,5)}–{a.end_time.slice(0,5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Galería */}
        {gallery.length > 0 && (
          <div className="fade-up" style={{ padding: '16px 16px 0', animationDelay: '0.15s' }}>
            {gallery.length === 1 ? (
              <div className="gallery-thumb" onClick={() => setGalleryOpen(0)} style={{ borderRadius: 18, overflow: 'hidden', height: 220, background: '#EFEDE9' }}>
                <img src={gallery[0].url} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display='none' }} />
              </div>
            ) : gallery.length === 2 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {gallery.map((item, i) => (
                  <div key={i} className="gallery-thumb" onClick={() => setGalleryOpen(i)} style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '1', background: '#EFEDE9' }}>
                    <img src={item.url} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display='none' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: 'auto auto', gap: 8 }}>
                {/* Imagen grande a la izquierda */}
                <div className="gallery-thumb" onClick={() => setGalleryOpen(0)} style={{ gridRow: '1 / 3', borderRadius: 16, overflow: 'hidden', aspectRatio: '3/4', background: '#EFEDE9' }}>
                  <img src={gallery[0].url} alt="" loading="eager" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display='none' }} />
                </div>
                {/* Columna derecha */}
                {gallery.slice(1, 3).map((item, i) => (
                  <div key={i} className="gallery-thumb" onClick={() => setGalleryOpen(i + 1)} style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '1', background: '#EFEDE9', position: 'relative' }}>
                    <img src={item.url} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display='none' }} />
                    {i === 1 && gallery.length > 3 && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,15,5,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: '#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>+{gallery.length - 3}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TABS ── */}
        <div className="fade-up" style={{ display: 'flex', background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 16px', position: 'sticky', top: 60, zIndex: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginTop: 16, animationDelay: '0.25s' }}>
          {[
            { key: 'services', label: `Servicios`, count: activeServices.length },
            { key: 'reviews',  label: `Reseñas`,  count: prof.total_reviews ?? 0 },
            { key: 'info',     label: 'Info',      count: null },
          ].map(tab => (
            <button key={tab.key} className="tab-btn" onClick={() => setActiveTab(tab.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '15px 0', marginRight: 22, fontSize: 13, fontFamily: 'Outfit, sans-serif', color: activeTab === tab.key ? '#B8833A' : 'rgba(26,22,18,0.38)', fontWeight: activeTab === tab.key ? 700 : 500, borderBottom: `2.5px solid ${activeTab === tab.key ? '#B8833A' : 'transparent'}`, marginBottom: -1, transition: 'all 0.18s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
              {tab.label}
              {tab.count !== null && <span style={{ background: activeTab === tab.key ? 'rgba(184,131,58,0.12)' : 'rgba(0,0,0,0.05)', color: activeTab === tab.key ? '#B8833A' : 'rgba(26,22,18,0.35)', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* ── TAB: SERVICIOS ── */}
        {activeTab === 'services' && (
          <div style={{ padding: '16px 16px 24px', animation: 'fadeUp 0.22s ease' }}>
            {activeServices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>✂️</div>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontStyle: 'italic', color: 'rgba(26,22,18,0.4)' }}>Sin servicios publicados</p>
              </div>
            ) : (
              <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1.5px solid rgba(0,0,0,0.06)' }}>
                {activeServices.map((service, idx) => (
                  <div key={service.id} className="fade-up svc-row" style={{ borderBottom: idx < activeServices.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none', animationDelay: `${0.35 + idx * 0.06}s` }}>
                    {/* Fila principal */}
                    <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
                      {/* Acento dorado izquierda */}
                      <div style={{ width: 4, background: 'linear-gradient(180deg,#B8833A,#D4A055)', flexShrink: 0, opacity: 0.7 }} />

                      {/* Contenido */}
                      <div style={{ flex: 1, padding: '18px 16px', minWidth: 0 }}>
                        {/* Cabecera: nombre + precio */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 700, color: '#1A1612', margin: 0, lineHeight: 1.2 }}>{service.name}</h3>
                          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#B8833A', fontStyle: 'italic', flexShrink: 0, lineHeight: 1 }}>{service.price}€</span>
                        </div>

                        {/* Descripción */}
                        {service.description && (
                          <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.48)', lineHeight: 1.65, margin: '0 0 10px', fontFamily: 'Outfit, sans-serif' }}>{service.description}</p>
                        )}

                        {/* Footer: duración + botón */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: service.description ? 0 : 4 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(26,22,18,0.4)', background: 'rgba(0,0,0,0.04)', borderRadius: 999, padding: '4px 10px', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                            <span style={{ opacity: 0.6 }}>⏱</span> {service.duration_minutes} min
                          </span>
                          <button className="book-btn" onClick={() => handleBook(service)}
                            style={{ background: 'linear-gradient(135deg,#1A0F05,#2C1A0A)', border: 'none', borderRadius: 12, padding: '9px 18px', color: '#FFFFFF', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.02em', boxShadow: '0 4px 14px rgba(26,15,5,0.22)', whiteSpace: 'nowrap' }}>
                            Reservar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: RESEÑAS ── */}
        {activeTab === 'reviews' && (
          <div style={{ padding: '14px 16px 20px', animation: 'fadeUp 0.22s ease' }}>
            {prof.total_reviews > 0 ? (
              <>
                {/* Resumen de rating */}
                <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 20, padding: '20px', marginBottom: 14, display: 'flex', gap: 20, alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3.8rem', color: '#B8833A', fontWeight: 300, margin: 0, lineHeight: 1 }}>{Number(prof.avg_rating).toFixed(1)}</p>
                    <Stars rating={prof.avg_rating} size={15} />
                    <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', margin: '6px 0 0', fontFamily: 'Outfit, sans-serif' }}>{prof.total_reviews} reseñas</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5,4,3,2,1].map(star => {
                      const count = prof.reviews?.filter(r => r.rating === star).length ?? 0
                      return <RatingBar key={star} star={star} count={count} total={prof.total_reviews} />
                    })}
                  </div>
                </div>
                {/* Lista reseñas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...prof.reviews].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 15).map((r, idx) => {
                    const initials = r.profiles?.full_name ? r.profiles.full_name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() : '?'
                    return (
                      <div key={r.id} className="review-card" style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: '15px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', animationDelay: `${idx * 0.06}s` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: r.comment ? 10 : 0 }}>
                          {r.profiles?.avatar_url
                            ? <img src={r.profiles.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(184,131,58,0.15)' }} />
                            : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(184,131,58,0.15),rgba(184,131,58,0.05))', border: '1.5px solid rgba(184,131,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#B8833A', flexShrink: 0 }}>{initials}</div>
                          }
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                              <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1612', margin: 0 }}>{r.profiles?.full_name ?? 'Usuario'}</p>
                              {r.created_at && <span style={{ fontSize: 11, color: 'rgba(26,22,18,0.22)' }}>{format(new Date(r.created_at), "d MMM yyyy", { locale: es })}</span>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Stars rating={r.rating} size={12} />
                              <span style={{ fontSize: 12, color: '#B8833A', fontWeight: 700 }}>{r.rating}.0</span>
                            </div>
                          </div>
                        </div>
                        {r.comment && <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.58)', lineHeight: 1.7, margin: 0, paddingLeft: 50, fontStyle: 'italic', fontFamily: 'Outfit, sans-serif' }}>"{r.comment}"</p>}
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '56px 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>⭐</div>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontStyle: 'italic', color: '#1A1612', marginBottom: 6 }}>Sin reseñas aún</p>
                <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>Sé el primero en valorar</p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: INFO ── */}
        {activeTab === 'info' && (
          <div style={{ padding: '14px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp 0.22s ease' }}>
            {/* Horario completo */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 20, padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Horario</p>
              {DAY_ORDER.map((d, idx) => {
                const slot = prof.availability?.find(a => a.day_of_week === d)
                const open = slot?.is_available
                return (
                  <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: idx < 6 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: open ? '#1A1612' : 'rgba(26,22,18,0.25)', fontFamily: 'Outfit, sans-serif', width: 38 }}>{DAY_MAP[d]}</span>
                    <span style={{ flex: 1, fontSize: 13, color: open ? '#1A1612' : 'rgba(26,22,18,0.22)', fontFamily: 'Outfit, sans-serif' }}>
                      {open ? `${slot.start_time.slice(0,5)} – ${slot.end_time.slice(0,5)}` : 'Cerrado'}
                    </span>
                    <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 999, background: open ? 'rgba(22,163,74,0.08)' : 'rgba(0,0,0,0.04)', color: open ? '#16a34a' : 'rgba(26,22,18,0.25)', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                      {open ? '● Abierto' : '○ Cerrado'}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Mapa */}
            {(prof.address || prof.city) && (
              <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                {prof.latitude && prof.longitude
                  ? <div style={{ height: 190 }}><iframe title="mapa" src={`https://www.openstreetmap.org/export/embed.html?bbox=${prof.longitude-0.005},${prof.latitude-0.003},${prof.longitude+0.005},${prof.latitude+0.003}&layer=mapnik&marker=${prof.latitude},${prof.longitude}`} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} loading="lazy" /></div>
                  : <div style={{ height: 130, background: '#EFEDE9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, opacity: 0.5 }}>🗺️</div>
                }
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 4, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Ubicación</p>
                    {prof.address && <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1612', margin: '0 0 2px', fontFamily: 'Outfit, sans-serif' }}>{prof.address}</p>}
                    <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.4)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{prof.city}</p>
                  </div>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${prof.address ?? ''} ${prof.city}`)}`} target="_blank" rel="noopener noreferrer"
                    style={{ flexShrink: 0, background: 'linear-gradient(135deg,#1A0F05,#2C1A0A)', border: 'none', borderRadius: 12, padding: '10px 16px', fontSize: 12, color: '#FFFFFF', fontFamily: 'Outfit, sans-serif', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 4px 12px rgba(26,15,5,0.2)' }}>📍 Cómo llegar</a>
                </div>
              </div>
            )}

            {/* Redes sociales */}
            {(prof.instagram_url || prof.website_url) && (
              <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 20, padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 12, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Síguenos</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {prof.instagram_url && (() => {
                    const raw = prof.instagram_url.trim().replace(/^@/, '')
                    const href = raw.startsWith('http') ? raw : `https://instagram.com/${raw}`
                    const handle = raw.startsWith('http') ? raw.replace(/.*instagram\.com\//, '') : raw
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 16px', background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', borderRadius: 14, textDecoration: 'none', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 700 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        @{handle}
                      </a>
                    )
                  })()}
                  {prof.website_url && (() => {
                    const url = prof.website_url.trim()
                    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 16px', background: 'linear-gradient(135deg,#1A1612,#2C1A0A)', borderRadius: 14, textDecoration: 'none', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 700 }}>
                        🌐 Web
                      </a>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Profesional */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 20, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(184,131,58,0.2)', background: 'rgba(184,131,58,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {prof.profiles?.avatar_url ? <img src={prof.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#B8833A' }}>{prof.profiles?.full_name?.slice(0,2).toUpperCase()}</span>}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1612', margin: '0 0 3px', fontFamily: 'Outfit, sans-serif' }}>{prof.profiles?.full_name}</p>
                <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.4)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Profesional verificado en TopSy</p>
              </div>
              {prof.is_verified && <div style={{ marginLeft: 'auto', background: 'linear-gradient(135deg,rgba(184,131,58,0.1),rgba(184,131,58,0.06))', border: '1.5px solid rgba(184,131,58,0.25)', borderRadius: 999, padding: '4px 12px', fontSize: 11, color: '#B8833A', fontWeight: 800, fontFamily: 'Outfit, sans-serif', flexShrink: 0, letterSpacing: '0.04em' }}>✓ TOP</div>}
            </div>
          </div>
        )}
      </div>

      {/* ══ STICKY BOTTOM CTA ══ */}
      <div className="sticky-cta" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 700, margin: '0 auto', background: 'rgba(247,245,242,0.96)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid rgba(0,0,0,0.07)', padding: '10px 14px', paddingBottom: 'max(10px, env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 -8px 30px rgba(0,0,0,0.08)' }}>
          {/* Precio */}
          <div style={{ flexShrink: 0 }}>
            <p style={{ fontSize: 9, color: 'rgba(26,22,18,0.32)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 1px', fontFamily: 'Outfit, sans-serif' }}>desde</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#B8833A', fontStyle: 'italic', margin: 0, lineHeight: 1 }}>{minPrice != null ? `${minPrice}€` : '—'}</p>
          </div>
          {/* Botón reservar */}
          <button className="book-btn pulse-cta" onClick={() => { if (activeServices.length === 1) { handleBook(activeServices[0]) } else { setActiveTab('services'); window.scrollTo({ top: 0, behavior: 'smooth' }) } }}
            style={{ flex: 1, background: 'linear-gradient(135deg,#B8833A,#D4A055)', border: 'none', borderRadius: 15, padding: '14px', color: '#FFFFFF', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 6px 22px rgba(184,131,58,0.38)', letterSpacing: '0.02em' }}>
            {activeServices.length === 1 ? `Reservar · ${activeServices[0].name}` : 'Reservar cita'}
          </button>
          {/* Botón lista espera */}
          {waitlistEnabled && (
            <button onClick={handleWaitlist} style={{ width: 50, height: 50, borderRadius: 15, background: '#1A0F05', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 14px rgba(26,15,5,0.22)' }}>⏳</button>
          )}
        </div>
      </div>
    </div>
  )
}