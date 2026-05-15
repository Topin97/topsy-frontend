import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../services/api'

/**
 * Componente premium de autocomplete con Google Places.
 *
 * Props:
 *  - value:          string actual del input
 *  - onChange:       (text) => void  (cuando escribe el usuario)
 *  - onSelect:       ({address, city, lat, lng, postal_code, province, formatted_address}) => void
 *  - type:           'address' | 'city'  (default 'address')
 *  - placeholder:    string
 *  - autoFocus:      bool
 *  - label:          string (opcional, etiqueta encima)
 *  - helpText:       string (opcional, debajo)
 */
export default function GoogleAddressInput({
  value,
  onChange,
  onSelect,
  type = 'address',
  placeholder = type === 'city' ? 'Tu ciudad...' : 'Empieza a escribir tu dirección...',
  autoFocus = false,
  label,
  helpText,
}) {
  const [query, setQuery]                 = useState(value || '')
  const [predictions, setPredictions]     = useState([])
  const [loading, setLoading]             = useState(false)
  const [open, setOpen]                   = useState(false)
  const [activeIdx, setActiveIdx]         = useState(-1)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const containerRef = useRef(null)
  const inputRef     = useRef(null)
  const debounceRef  = useRef(null)
  const cacheRef     = useRef(new Map())

  // Sincronizar valor externo
  useEffect(() => { setQuery(value || '') }, [value])

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch con cache y debounce
  const fetchPredictions = useCallback(async (input) => {
    if (!input || input.length < 2) {
      setPredictions([])
      setOpen(false)
      return
    }
    const cacheKey = `${type}|${input.toLowerCase()}`
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)
      setPredictions(cached)
      setOpen(cached.length > 0)
      setActiveIdx(-1)
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/places/autocomplete', { input, type })
      const list = data?.predictions ?? []
      cacheRef.current.set(cacheKey, list)
      setPredictions(list)
      setOpen(list.length > 0)
      setActiveIdx(-1)
    } catch (err) {
      console.error('[GoogleAddressInput] autocomplete error:', err.message)
      setPredictions([])
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }, [type])

  const handleInput = (e) => {
    const val = e.target.value
    setQuery(val)
    onChange?.(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchPredictions(val), 250)
  }

  const handleSelect = async (p) => {
    setQuery(p.description)
    onChange?.(p.description)
    setOpen(false)
    setActiveIdx(-1)

    // type=city: con descripción y place_id basta, pero igualmente pedimos detalles para lat/lng
    setLoadingDetails(true)
    try {
      const { data } = await api.get(`/places/details/${encodeURIComponent(p.place_id)}`)
      const newAddress = type === 'city' ? p.primary || p.description : (data.address || p.description)
      setQuery(newAddress)
      onChange?.(newAddress)
      onSelect?.({
        address:           data.address || p.description,
        city:              data.city || p.primary || '',
        postal_code:       data.postal_code || '',
        province:          data.province || '',
        formatted_address: data.formatted_address || p.description,
        lat:               data.lat,
        lng:               data.lng,
      })
    } catch (err) {
      console.error('[GoogleAddressInput] details error:', err.message)
      // Aún así notificamos con la descripción cruda
      onSelect?.({
        address:           p.description,
        city:              p.primary || '',
        postal_code:       '',
        province:          '',
        formatted_address: p.description,
        lat:               null,
        lng:               null,
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleKeyDown = (e) => {
    if (!open || predictions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, predictions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0) handleSelect(predictions[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.32)', marginBottom: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => predictions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          autoFocus={autoFocus}
          className="input"
          style={{
            width: '100%',
            padding: '14px 44px 14px 16px',
            borderRadius: 12,
            border: '1.5px solid rgba(0,0,0,0.1)',
            fontSize: 15,
            fontFamily: 'Outfit, sans-serif',
            background: '#FFFFFF',
            color: '#1A1612',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocusCapture={(e) => { e.currentTarget.style.borderColor = '#B8833A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,131,58,0.12)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
        />
        {(loading || loadingDetails) && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, border: '2px solid rgba(184,131,58,0.25)', borderTopColor: '#B8833A', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
        )}
      </div>

      {helpText && !open && (
        <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.4)', marginTop: 6, fontFamily: 'Outfit, sans-serif' }}>{helpText}</p>
      )}

      {open && predictions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0, right: 0,
          background: '#FFFFFF',
          border: '1.5px solid rgba(0,0,0,0.07)',
          borderRadius: 14,
          listStyle: 'none',
          margin: 0,
          padding: 6,
          maxHeight: 320,
          overflowY: 'auto',
          boxShadow: '0 14px 40px rgba(0,0,0,0.10)',
          zIndex: 1000,
          fontFamily: 'Outfit, sans-serif',
        }}>
          {predictions.map((p, i) => (
            <li
              key={p.place_id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(p) }}
              onMouseEnter={() => setActiveIdx(i)}
              style={{
                padding: '12px 14px',
                cursor: 'pointer',
                borderRadius: 10,
                background: activeIdx === i ? 'rgba(184,131,58,0.08)' : 'transparent',
                transition: 'background 0.12s',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{
                fontSize: 14,
                color: '#B8833A',
                background: 'rgba(184,131,58,0.1)',
                width: 30, height: 30,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>📍</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, color: '#1A1612', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.primary || p.description}
                </p>
                {p.secondary && (
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(26,22,18,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.secondary}
                  </p>
                )}
              </div>
            </li>
          ))}
          <li style={{ padding: '10px 14px 6px', fontSize: 10, color: 'rgba(26,22,18,0.3)', textAlign: 'right', letterSpacing: '0.05em' }}>
            Powered by Google
          </li>
        </ul>
      )}

      <style>{`@keyframes spin { from { transform: translateY(-50%) rotate(0deg) } to { transform: translateY(-50%) rotate(360deg) } }`}</style>
    </div>
  )
}
