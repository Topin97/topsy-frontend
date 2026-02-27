import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function MapView({ professionals, center = [40.4168, -3.7038], zoom = 6 }) {
  return (
    <div style={{ height: '100%', width: '100%', borderRadius: 16, overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {professionals?.map((prof) => {
          if (!prof.latitude || !prof.longitude) return null
          return (
            <Marker
              key={prof.id}
              position={[prof.latitude, prof.longitude]}
              icon={goldIcon}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <p style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{prof.business_name}</p>
                  <p style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>📍 {prof.city}</p>
                  {prof.avg_rating && <p style={{ fontSize: 12, marginBottom: 6 }}>⭐ {prof.avg_rating}</p>}
                  <a href={`/professional/${prof.id}`} style={{ fontSize: 12, color: '#C9965A', fontWeight: 600 }}>Ver perfil →</a>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}