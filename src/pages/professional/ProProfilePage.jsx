import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { profApi, authApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { createClient } from '@supabase/supabase-js'
import Cropper from 'react-easy-crop'
import toast from 'react-hot-toast'
import { useState, useRef, useCallback, useEffect } from 'react'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
)

const CATEGORIES = [
  { value: 'hair',      label: '💇 Peluquería' },
  { value: 'nails',     label: '💅 Uñas' },
  { value: 'spa',       label: '🧖 Spa' },
  { value: 'barber',    label: '🪒 Barbería' },
  { value: 'aesthetic', label: '✨ Estética' },
  { value: 'brows',     label: '👁️ Cejas' },
]

async function getCroppedBlob(imageSrc, croppedAreaPixels) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = imageSrc
  })
  const canvas = document.createElement('canvas')
  canvas.width = croppedAreaPixels.width
  canvas.height = croppedAreaPixels.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height)
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9))
}

function CropModal({ src, aspect, onConfirm, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <Cropper image={src} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} />
      </div>
      <div style={{ padding: '20px 24px', background: '#212123', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(26,22,18,0.36)', minWidth: 50 }}>Zoom</span>
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ flex: 1, accentColor: '#B8833A' }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, background: 'rgba(0,0,0,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px', color: 'rgba(26,22,18,0.54)', fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Cancelar</button>
          <button onClick={() => onConfirm(croppedAreaPixels)} style={{ flex: 1, background: 'linear-gradient(135deg, #B8833A, #D4A055)', border: 'none', borderRadius: 12, padding: '12px', color: '#F7F5F2', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Aplicar recorte</button>
        </div>
      </div>
    </div>
  )
}

function ImageUpload({ label, currentUrl, bucket, onUploaded, aspect = 16/9, token }) {
  const [uploading, setUploading] = useState(false)
  const [srcForCrop, setSrcForCrop] = useState(null)
  const inputRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('La imagen no puede superar 10MB'); return }
    const reader = new FileReader()
    reader.onload = () => setSrcForCrop(reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleConfirm = useCallback(async (croppedAreaPixels) => {
    setSrcForCrop(null)
    setUploading(true)
    try {
      const blob = await getCroppedBlob(srcForCrop, croppedAreaPixels)
      const path = `${Date.now()}.jpg`
      await supabase.auth.setSession({ access_token: token, refresh_token: token })
      const { error } = await supabase.storage.from(bucket).upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
      onUploaded(publicUrl)
      toast.success('Foto subida ✓')
    } catch (err) {
      console.error(err)
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }, [srcForCrop, bucket, token, onUploaded])

  return (
    <>
      {srcForCrop && <CropModal src={srcForCrop} aspect={aspect} onConfirm={handleConfirm} onCancel={() => setSrcForCrop(null)} />}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.36)', marginBottom: 8 }}>{label}</label>
        <div onClick={() => !uploading && inputRef.current.click()} style={{ width: '100%', height: aspect > 1 ? 160 : 120, borderRadius: 14, border: '2px dashed rgba(201,150,90,0.25)', background: 'rgba(0,0,0,0.07)', cursor: 'pointer', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentUrl ? (
            <>
              <img src={currentUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>✏️ Cambiar foto</p>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <p style={{ fontSize: '2rem', marginBottom: 8 }}>{uploading ? '⏳' : '📸'}</p>
              <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.32)' }}>{uploading ? 'Subiendo...' : 'Pulsa para subir foto'}</p>
              <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.18)', marginTop: 4 }}>JPG, PNG · máx 10MB</p>
            </div>
          )}
          {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#B8833A', fontSize: 13 }}>Subiendo...</p></div>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>
    </>
  )
}

// ── Leaflet map ───────────────────────────────────────────────────────────────
function MapPin({ lat, lng }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'; link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    const init = () => {
      if (!mapRef.current || mapInstanceRef.current) return
      const map = window.L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false })
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
      mapInstanceRef.current = map
    }
    if (!window.L) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = init
      document.head.appendChild(script)
    } else { init() }
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null } }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !window.L || !lat || !lng) return
    map.setView([lat, lng], 15)
    if (markerRef.current) markerRef.current.remove()
    const icon = window.L.divIcon({
      className: '',
      html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#B8833A,#D4A055);transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 16px rgba(0,0,0,0.4);margin:-18px 0 0 -18px;"></div>`,
      iconSize: [36, 36], iconAnchor: [18, 36],
    })
    markerRef.current = window.L.marker([lat, lng], { icon }).addTo(map)
  }, [lat, lng])

  return <div ref={mapRef} style={{ height: 200, borderRadius: 14, border: '1px solid rgba(201,150,90,0.2)', overflow: 'hidden', marginTop: 12, background: '#1a1a1a' }} />
}

// ── Address autocomplete ──────────────────────────────────────────────────────
function AddressSearch({ initialAddress, initialCity, initialLat, initialLng, onChangeAddress, onChangeCity, onChangeCoords }) {
  const [query, setQuery] = useState(initialAddress || '')
  const [city, setCity] = useState(initialCity || '')
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const [coords, setCoords] = useState(initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null)
  const debounceRef = useRef(null)

  const handleInput = (val) => {
    setQuery(val)
    onChangeAddress(val)
    setCoords(null)
    onChangeCoords(null, null)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (val.length < 3) { setSuggestions([]); return }
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val + ', Spain')}&format=json&limit=5&addressdetails=1`,
          { headers: { 'User-Agent': 'TopSy/1.0' } }
        )
        setSuggestions(await res.json())
      } catch {}
      setSearching(false)
    }, 500)
  }

  const selectSuggestion = (s) => {
    const addr = s.address
    const street = [addr.road, addr.house_number].filter(Boolean).join(' ')
    const newCity = addr.city || addr.town || addr.village || addr.municipality || ''
    const newAddress = street || s.display_name.split(',')[0]
    const lat = parseFloat(s.lat)
    const lng = parseFloat(s.lon)
    setQuery(newAddress)
    setCity(newCity)
    setCoords({ lat, lng })
    setSuggestions([])
    onChangeAddress(newAddress)
    onChangeCity(newCity)
    onChangeCoords(lat, lng)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
      {/* Dirección con autocomplete */}
      <div style={{ position: 'relative', gridColumn: '1 / -1' }}>
        <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.32)', marginBottom: 8 }}>Dirección</label>
        <div style={{ position: 'relative' }}>
          <input
            value={query}
            onChange={e => handleInput(e.target.value)}
            placeholder="Calle Mayor 10, Madrid..."
            className="input"
            autoComplete="off"
          />
          {searching && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'rgba(201,150,90,0.5)' }}>Buscando...</span>}
        </div>
        {suggestions.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#FFFFFF', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 12, overflow: 'hidden', marginTop: 4, boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
            {suggestions.map((s, i) => (
              <button key={i} type="button" onClick={() => selectSuggestion(s)}
                style={{ width: '100%', textAlign: 'left', padding: '11px 14px', background: 'none', border: 'none', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(0,0,0,0.07)' : 'none', color: 'rgba(26,22,18,0.63)', fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,150,90,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >📍 {s.display_name}</button>
            ))}
          </div>
        )}
      </div>

      {/* Ciudad */}
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.32)', marginBottom: 8 }}>Ciudad *</label>
        <input
          value={city}
          onChange={e => { setCity(e.target.value); onChangeCity(e.target.value) }}
          placeholder="Madrid"
          className="input"
          style={{ background: city ? 'rgba(201,150,90,0.06)' : undefined }}
        />
      </div>

      {/* Mapa */}
      <div style={{ gridColumn: '1 / -1' }}>
        {coords ? (
          <>
            <p style={{ fontSize: 12, color: '#B8833A', marginBottom: 4 }}>✓ Ubicación fijada · {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>
            <MapPin lat={coords.lat} lng={coords.lng} />
          </>
        ) : (initialLat && initialLng) ? (
          <>
            <p style={{ fontSize: 12, color: 'rgba(201,150,90,0.5)', marginBottom: 4 }}>📍 Ubicación guardada</p>
            <MapPin lat={initialLat} lng={initialLng} />
          </>
        ) : (
          <div style={{ height: 160, borderRadius: 14, border: '1px dashed rgba(201,150,90,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(26,22,18,0.18)', gap: 8 }}>
            <span style={{ fontSize: 28 }}>🗺️</span>
            <span style={{ fontSize: 12, fontFamily: 'Outfit, sans-serif' }}>Escribe tu dirección para ver el mapa</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Gallery Upload ────────────────────────────────────────────────────────────
const MAX_GALLERY = 8

function GalleryUpload({ prof, token, onSaved }) {
  const [gallery, setGallery] = useState(prof?.gallery_urls ?? [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef()

  // Sync when prof loads
  useEffect(() => { setGallery(prof?.gallery_urls ?? []) }, [prof?.id])

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = MAX_GALLERY - gallery.length
    const toUpload = files.slice(0, remaining)
    if (files.length > remaining) toast.error(`Máximo ${MAX_GALLERY} fotos. Se subirán las primeras ${remaining}.`)

    setUploading(true)
    try {
      await supabase.auth.setSession({ access_token: token, refresh_token: token })
      const urls = await Promise.all(toUpload.map(async (file) => {
        if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} supera 10MB`); return null }
        const path = `gallery/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
        const { error } = await supabase.storage.from('covers').upload(path, file, { upsert: true, contentType: file.type })
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(path)
        return publicUrl
      }))
      const newGallery = [...gallery, ...urls.filter(Boolean)]
      setGallery(newGallery)
      // Auto-save
      setSaving(true)
      await profApi.update({ gallery_urls: newGallery })
      onSaved()
      toast.success(`${urls.filter(Boolean).length} foto${urls.filter(Boolean).length > 1 ? 's' : ''} añadida${urls.filter(Boolean).length > 1 ? 's' : ''} ✓`)
    } catch (err) {
      console.error(err)
      toast.error('Error al subir fotos')
    } finally {
      setUploading(false)
      setSaving(false)
      e.target.value = ''
    }
  }

  const removePhoto = async (idx) => {
    const newGallery = gallery.filter((_, i) => i !== idx)
    setGallery(newGallery)
    setSaving(true)
    try {
      await profApi.update({ gallery_urls: newGallery })
      onSaved()
      toast.success('Foto eliminada')
    } catch {
      toast.error('Error al eliminar')
      setGallery(gallery) // revert
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 3, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
            Portafolio
          </p>
          <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.4)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
            {gallery.length}/{MAX_GALLERY} fotos · Los clientes las verán en tu perfil
          </p>
        </div>
        {saving && (
          <span style={{ fontSize: 11, color: '#B8833A', fontFamily: 'Outfit, sans-serif' }}>Guardando...</span>
        )}
      </div>

      {/* Grid de fotos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: gallery.length > 0 ? 12 : 0 }}>
        {gallery.map((url, i) => (
          <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: '1.5px solid rgba(0,0,0,0.08)' }}>
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <button
              onClick={() => removePhoto(i)}
              style={{
                position: 'absolute', top: 5, right: 5,
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)', border: 'none',
                color: '#FFF', fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}
            >✕</button>
            {i === 0 && (
              <div style={{ position: 'absolute', bottom: 5, left: 5, background: 'rgba(184,131,58,0.9)', borderRadius: 6, padding: '2px 6px', fontSize: 9, color: '#FFF', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                Principal
              </div>
            )}
          </div>
        ))}

        {/* Botón añadir */}
        {gallery.length < MAX_GALLERY && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              aspectRatio: '1', borderRadius: 12,
              border: '2px dashed rgba(184,131,58,0.3)',
              background: uploading ? 'rgba(184,131,58,0.05)' : '#FAFAF9',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4, cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => !uploading && (e.currentTarget.style.borderColor = 'rgba(184,131,58,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(184,131,58,0.3)')}
          >
            {uploading
              ? <span style={{ fontSize: 20 }}>⏳</span>
              : <>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>+</span>
                  <span style={{ fontSize: 9, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif', fontWeight: 600, textAlign: 'center' }}>Añadir</span>
                </>
            }
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFiles}
      />

      {gallery.length === 0 && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            width: '100%', padding: '14px', borderRadius: 14,
            border: '2px dashed rgba(184,131,58,0.25)',
            background: 'rgba(184,131,58,0.03)',
            color: 'rgba(26,22,18,0.4)', fontSize: 13, cursor: 'pointer',
            fontFamily: 'Outfit, sans-serif', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <span style={{ fontSize: 20 }}>📸</span>
          Añadir fotos del portafolio
        </button>
      )}

      <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', marginTop: 10, fontFamily: 'Outfit, sans-serif', textAlign: 'center' }}>
        JPG, PNG · Máx 10MB por foto · Hasta {MAX_GALLERY} fotos
      </p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProProfilePage() {
  const { token } = useAuthStore()
  const qc = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [coverUrl, setCoverUrl] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)

  // location state — kept separate so react-hook-form doesn't fight with it
  const [locAddress, setLocAddress] = useState(null)
  const [locCity, setLocCity]       = useState(null)
  const [locLat, setLocLat]         = useState(null)
  const [locLng, setLocLng]         = useState(null)

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.user),
  })

  const hasProfile = !!me?.professional_profiles
  const prof = me?.professional_profiles

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    values: {
      business_name: prof?.business_name ?? '',
      description:   prof?.description   ?? '',
      category:      prof?.category      ?? 'hair',
    },
  })

  const selectedCategory = watch('category')

  const { mutate: save, isPending } = useMutation({
    mutationFn: async (data) => {
      // Merge location if user touched it
      if (locAddress !== null) data.address = locAddress
      if (locCity    !== null) data.city    = locCity
      if (locLat     !== null) data.latitude  = locLat
      if (locLng     !== null) data.longitude = locLng
      if (coverUrl) data.cover_image_url = coverUrl
      return hasProfile ? profApi.update(data) : profApi.create(data)
    },
    onSuccess: () => {
      toast.success(hasProfile ? 'Perfil actualizado ✓' : 'Perfil profesional creado ✓')
      qc.invalidateQueries({ queryKey: ['me'] })
      setCreating(false)
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al guardar'),
  })

  if (isLoading) return (
    <div className="container-app" style={{ padding: '40px 24px', maxWidth: 700 }}>
      <div className="skeleton" style={{ height: 400, borderRadius: 20 }} />
    </div>
  )

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', paddingBottom: 80 }}>
      <style>{`@media (max-width: 480px) { .cat-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
      <div className="container-app" style={{ padding: '32px 16px', maxWidth: 700 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 20, height: 1, background: '#B8833A' }} /> Panel profesional
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,5vw,2.8rem)', fontWeight: 300, marginBottom: 28 }}>
          Perfil del <em style={{ color: '#B8833A' }}>negocio</em>
        </h1>

        {!hasProfile && !creating && (
          <div style={{ background: 'rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 48, textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✂️</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 300, marginBottom: 8 }}>Crea tu perfil profesional</h2>
            <p style={{ color: 'rgba(26,22,18,0.36)', fontSize: 14, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>Los clientes verán tu perfil al buscar profesionales.</p>
            <button onClick={() => setCreating(true)} className="btn-primary" style={{ padding: '12px 32px' }}>Crear perfil ahora</button>
          </div>
        )}

        {(hasProfile || creating) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Fotos */}
            <div style={{ background: 'rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 16, height: 1, background: '#B8833A' }} /> Fotos
              </p>
              <ImageUpload label="Foto de portada (16:9)" currentUrl={coverUrl ?? prof?.cover_image_url} bucket="covers" aspect={16/9}
                onUploaded={(url) => { setCoverUrl(url); profApi.update({ cover_image_url: url }).then(() => qc.invalidateQueries({ queryKey: ['me'] })) }} token={token} />
              <ImageUpload label="Foto de perfil (1:1)" currentUrl={avatarUrl ?? me?.profiles?.avatar_url} bucket="avatars" aspect={1}
                onUploaded={(url) => { setAvatarUrl(url); authApi.updateProfile({ avatar_url: url }).then(() => qc.invalidateQueries({ queryKey: ['me'] })) }} token={token} />
            </div>

            {/* Galería / Portafolio */}
            <GalleryUpload prof={prof} token={token} onSaved={() => qc.invalidateQueries({ queryKey: ['me'] })} />

            {/* Información */}
            <div style={{ background: 'rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 16, height: 1, background: '#B8833A' }} /> Información
              </p>
              <form onSubmit={handleSubmit(d => save(d))}>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.32)', marginBottom: 8 }}>Nombre del negocio *</label>
                  <input {...register('business_name', { required: 'Campo requerido' })} placeholder="Ej: Salón Lucía García" className="input" />
                  {errors.business_name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.business_name.message}</p>}
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.32)', marginBottom: 10 }}>
                    Categoría {hasProfile && <span style={{ color: 'rgba(201,150,90,0.4)', fontSize: 10, marginLeft: 8 }}>— solo modificable por el admin</span>}
                  </label>
                  <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, opacity: hasProfile ? 0.5 : 1, pointerEvents: hasProfile ? 'none' : 'auto' }}>
                    {CATEGORIES.map(cat => {
                      const isSelected = selectedCategory === cat.value
                      return (
                        <label key={cat.value} style={{ cursor: hasProfile ? 'default' : 'pointer' }}>
                          <input {...register('category')} type="radio" value={cat.value} style={{ display: 'none' }} disabled={hasProfile} />
                          <div style={{ padding: '10px 12px', borderRadius: 10, fontSize: 13, textAlign: 'center', border: `1px solid ${isSelected ? '#B8833A' : 'rgba(0,0,0,0.1)'}`, background: isSelected ? 'rgba(201,150,90,0.12)' : 'rgba(0,0,0,0.07)', color: isSelected ? '#B8833A' : 'rgba(26,22,18,0.50)', fontWeight: isSelected ? 600 : 400, transition: 'all 0.2s' }}>
                            {cat.label}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.32)', marginBottom: 8 }}>Descripción</label>
                  <textarea {...register('description')} placeholder="Describe tu negocio, especialidades, experiencia..." className="input" style={{ height: 100, resize: 'none' }} />
                </div>

                {/* Ubicación con autocompletado y mapa */}
                <div style={{ marginBottom: 24, padding: 16, background: 'rgba(201,150,90,0.04)', border: '1px solid rgba(201,150,90,0.1)', borderRadius: 14 }}>
                  <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 14 }}>📍 Ubicación</p>
                  <AddressSearch
                    initialAddress={prof?.address ?? ''}
                    initialCity={prof?.city ?? ''}
                    initialLat={prof?.latitude}
                    initialLng={prof?.longitude}
                    onChangeAddress={setLocAddress}
                    onChangeCity={setLocCity}
                    onChangeCoords={(lat, lng) => { setLocLat(lat); setLocLng(lng) }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  {creating && !hasProfile && (
                    <button type="button" onClick={() => setCreating(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 24px', color: 'rgba(26,22,18,0.45)', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Cancelar</button>
                  )}
                  <button type="submit" disabled={isPending} className="btn-primary" style={{ padding: '12px 32px' }}>
                    {isPending ? 'Guardando...' : hasProfile ? 'Guardar cambios' : 'Crear perfil'}
                  </button>
                </div>
              </form>
            </div>

            {/* Estado del perfil */}
            {hasProfile && (
              <div style={{ background: 'rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, padding: '16px 20px' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,150,90,0.6)', marginBottom: 12 }}>Estado del perfil</p>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: prof?.is_active ? '#4ade80' : '#f87171' }} />
                    <span style={{ fontSize: 13, color: 'rgba(26,22,18,0.54)' }}>{prof?.is_active ? 'Perfil activo' : 'Perfil inactivo'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: prof?.is_verified ? '#B8833A' : 'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontSize: 13, color: 'rgba(26,22,18,0.54)' }}>{prof?.is_verified ? '✓ Verificado' : 'Pendiente de verificación'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
