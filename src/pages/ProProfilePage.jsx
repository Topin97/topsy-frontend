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

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Modal para poner caption a una foto antes de subir
function CaptionModal({ file, previewUrl, onConfirm, onCancel }) {
  const [caption, setCaption] = useState('')
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 480, boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.1)', margin: '0 auto 20px' }} />
        
        {/* Preview cuadrada */}
        <div style={{ width: '100%', aspectRatio: '1', borderRadius: 16, overflow: 'hidden', marginBottom: 16, background: '#EFEDE9' }}>
          <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Caption input */}
        <div style={{ background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 14, padding: '12px 16px', marginBottom: 16, transition: 'all 0.2s' }}>
          <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.4)', marginBottom: 5, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            Descripción (opcional)
          </label>
          <input
            autoFocus
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Ej: Low fade, Balayage, Manicura gel..."
            maxLength={60}
            style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#1A1612', fontSize: 15, fontFamily: 'Outfit, sans-serif', padding: 0 }}
          />
        </div>
        <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.3)', textAlign: 'right', margin: '-8px 0 16px', fontFamily: 'Outfit, sans-serif' }}>{caption.length}/60</p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '13px', color: 'rgba(26,22,18,0.5)', fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            Cancelar
          </button>
          <button onClick={() => onConfirm(caption.trim())} style={{ flex: 2, background: 'linear-gradient(135deg,#B8833A,#D4A055)', border: 'none', borderRadius: 12, padding: '13px', color: '#FFFFFF', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 14px rgba(184,131,58,0.3)' }}>
            Subir foto
          </button>
        </div>
      </div>
    </div>
  )
}

function GalleryUpload({ prof, onSaved }) {
  // gallery: [{url, caption}]
  const [gallery, setGallery]         = useState(prof?.gallery ?? [])
  const [uploading, setUploading]     = useState(false)
  const [deletingIdx, setDeletingIdx] = useState(null)
  const [pendingFiles, setPendingFiles] = useState([]) // queue de archivos por procesar
  const [currentFile, setCurrentFile]   = useState(null) // {file, previewUrl} — el del modal
  const [progress, setProgress]         = useState(0)
  const inputRef    = useRef()
  const cameraRef   = useRef()

  useEffect(() => {
    setGallery(prof?.gallery ?? [])
  }, [prof?.id])

  // Cuando el usuario selecciona archivos, meterlos en cola y mostrar el modal del primero
  const handleFiles = (e) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = MAX_GALLERY - gallery.length
    const valid = files.slice(0, remaining)
    if (files.length > remaining) toast(`Solo quedan ${remaining} huecos.`)
    // Crear previews y meter en cola
    const withPreviews = valid.map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))
    setPendingFiles(withPreviews.slice(1))
    setCurrentFile(withPreviews[0])
    e.target.value = ''
  }

  const handleCaptionConfirm = async (caption) => {
    const { file, previewUrl } = currentFile
    // Si hay más en cola, mostrar el siguiente
    if (pendingFiles.length > 0) {
      setCurrentFile(pendingFiles[0])
      setPendingFiles(pendingFiles.slice(1))
    } else {
      setCurrentFile(null)
    }

    // Subir esta foto
    setUploading(true)
    try {
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} supera 10MB`); return }
      const base64 = await fileToBase64(file)
      const { data } = await profApi.uploadGalleryImage(base64, caption)
      setGallery(data.gallery)
      onSaved()
      toast.success(caption ? `"${caption}" subido ✓` : 'Foto añadida ✓')
    } catch (err) {
      console.error(err)
      toast.error('Error al subir la foto')
    } finally {
      setUploading(false)
      URL.revokeObjectURL(previewUrl)
    }
  }

  const handleCaptionCancel = () => {
    URL.revokeObjectURL(currentFile.previewUrl)
    // Si hay más en cola, continuar con la siguiente
    if (pendingFiles.length > 0) {
      setCurrentFile(pendingFiles[0])
      setPendingFiles(pendingFiles.slice(1))
    } else {
      setCurrentFile(null)
      setPendingFiles([])
    }
  }

  const removePhoto = async (idx) => {
    setDeletingIdx(idx)
    try {
      await profApi.deleteGalleryImage(gallery[idx].url)
      const newGallery = gallery.filter((_, i) => i !== idx)
      setGallery(newGallery)
      onSaved()
      toast.success('Foto eliminada')
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeletingIdx(null)
    }
  }

  const canAdd = gallery.length < MAX_GALLERY

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .gal-add:active{transform:scale(0.96)}`}</style>

      {/* Modal caption */}
      {currentFile && (
        <CaptionModal
          file={currentFile.file}
          previewUrl={currentFile.previewUrl}
          onConfirm={handleCaptionConfirm}
          onCancel={handleCaptionCancel}
        />
      )}

      <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 4, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>📸 Portafolio</p>
            <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.45)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
              {gallery.length}/{MAX_GALLERY} fotos · Visibles en tu perfil público
            </p>
          </div>
          {uploading && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#B8833A', fontFamily: 'Outfit, sans-serif' }}>
              <span style={{ width: 14, height: 14, border: '2px solid rgba(184,131,58,0.3)', borderTopColor: '#B8833A', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              Subiendo...
            </span>
          )}
        </div>

        {/* Botones de subida mobile-friendly */}
        {canAdd && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {/* Galería/archivo */}
            <button
              className="gal-add"
              onClick={() => inputRef.current?.click()}
              style={{ padding: '14px 12px', borderRadius: 14, border: '1.5px solid rgba(184,131,58,0.25)', background: 'rgba(184,131,58,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.18s' }}
            >
              <span style={{ fontSize: 28 }}>🖼️</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#B8833A', fontFamily: 'Outfit, sans-serif' }}>Galería</span>
              <span style={{ fontSize: 10, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>Elegir fotos</span>
            </button>
            {/* Cámara */}
            <button
              className="gal-add"
              onClick={() => cameraRef.current?.click()}
              style={{ padding: '14px 12px', borderRadius: 14, border: '1.5px solid rgba(0,0,0,0.1)', background: '#F7F5F2', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.18s' }}
            >
              <span style={{ fontSize: 28 }}>📷</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1612', fontFamily: 'Outfit, sans-serif' }}>Cámara</span>
              <span style={{ fontSize: 10, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>Hacer foto</span>
            </button>
          </div>
        )}

        {/* Grid cuadrado uniforme */}
        {gallery.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {gallery.map((item, i) => (
              <div key={item.url + i} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1.5px solid rgba(0,0,0,0.07)', aspectRatio: '1', background: '#EFEDE9' }}>
                <img src={item.url} alt={item.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

                {/* Caption overlay */}
                {item.caption && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.65))', padding: '20px 8px 7px' }}>
                    <p style={{ margin: 0, fontSize: 10, color: '#FFFFFF', fontFamily: 'Outfit, sans-serif', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {item.caption}
                    </p>
                  </div>
                )}

                {/* Badge principal */}
                {i === 0 && (
                  <div style={{ position: 'absolute', top: 6, left: 6, background: 'linear-gradient(135deg,#B8833A,#D4A055)', borderRadius: 6, padding: '2px 7px', fontSize: 9, color: '#FFF', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                    ★ Principal
                  </div>
                )}

                {/* Botón eliminar */}
                {deletingIdx === i ? (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: 22, height: 22, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                ) : (
                  <button
                    onClick={() => removePhoto(i)}
                    style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFF', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >✕</button>
                )}
              </div>
            ))}

            {/* Celda + inline */}
            {canAdd && (
              <button
                onClick={() => inputRef.current?.click()}
                style={{ aspectRatio: '1', borderRadius: 14, border: '2px dashed rgba(184,131,58,0.3)', background: '#FAFAF9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 24, color: 'rgba(184,131,58,0.5)' }}>+</span>
                <span style={{ fontSize: 9, color: 'rgba(26,22,18,0.3)', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Añadir</span>
              </button>
            )}
          </div>
        ) : (
          !canAdd ? null : (
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                Usa los botones de arriba para añadir tu primera foto
              </p>
            </div>
          )
        )}

        <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.28)', margin: '12px 0 0', fontFamily: 'Outfit, sans-serif', textAlign: 'center' }}>
          JPG · PNG · WebP · Máx 10MB · Hasta {MAX_GALLERY} fotos
        </p>
      </div>

      {/* Inputs ocultos */}
      <input ref={inputRef}  type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={handleFiles} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment"   style={{ display: 'none' }} onChange={handleFiles} />
    </>
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
            <GalleryUpload prof={prof} onSaved={() => qc.invalidateQueries({ queryKey: ['me'] })} />

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
