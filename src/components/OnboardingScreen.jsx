import { useState } from 'react'

import slide1 from '../assets/onboarding1.webp'
import slide2 from '../assets/onboarding2.webp'
import slide3 from '../assets/onboarding3.webp'

const slides = [
  {
    image: slide1,
    title: 'Encuentra profesionales cerca de ti',
    subtitle: 'Peluquerías, barberías, masajes, estética y mucho más. Todos verificados y con reseñas reales.',
  },
  {
    image: slide2,
    title: 'Reserva en segundos, sin llamadas',
    subtitle: 'Elige el servicio, el día y la hora. Confirmación instantánea directo en tu móvil.',
  },
  {
    image: slide3,
    title: 'Gestiona tus citas desde un solo lugar',
    subtitle: 'Consulta, cancela o reprograma cuando quieras. Todo el control en tu bolsillo.',
  },
]

export default function OnboardingScreen({ onFinish }) {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState(1)

  const goTo = (index) => {
    if (animating || index === current) return
    setDirection(index > current ? 1 : -1)
    setAnimating(true)
    setTimeout(() => {
      setCurrent(index)
      setAnimating(false)
    }, 280)
  }

  const next = () => {
    if (current < slides.length - 1) goTo(current + 1)
    else onFinish()
  }

  const slide = slides[current]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: '#1A0F05',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(${direction > 0 ? '40px' : '-40px'}) }
          to   { opacity: 1; transform: none }
        }
        .onboarding-slide { animation: fadeSlideIn 0.28s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* Imagen — ocupa la mitad superior */}
      <div
        key={current}
        className="onboarding-slide"
        style={{ width: '100%', flex: '0 0 58%', position: 'relative', overflow: 'hidden' }}
      >
        <img
          src={slide.image}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        {/* Degradado hacia abajo para fundir con el fondo */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(to bottom, transparent, #1A0F05)',
        }} />
      </div>

      {/* Contenido inferior */}
      <div
        key={`text-${current}`}
        className="onboarding-slide"
        style={{
          flex: 1, width: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 32px 48px',
          textAlign: 'center',
        }}
      >
        {/* Texto */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {/* Logo pequeño */}
          <div>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,0.25)' }}>TOP</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 400, fontStyle: 'italic', color: 'rgba(184,131,58,0.4)' }}>sy</span>
          </div>

          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(1.7rem, 6vw, 2.2rem)',
            fontWeight: 600, lineHeight: 1.2,
            color: '#FFFFFF', margin: 0,
          }}>
            {slide.title}
          </h2>

          <p style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 15, lineHeight: 1.6,
            color: 'rgba(255,255,255,0.5)',
            margin: 0, maxWidth: 300,
          }}>
            {slide.subtitle}
          </p>
        </div>

        {/* Bottom: dots + botón */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 8 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                width: i === current ? 24 : 8,
                height: 8, borderRadius: 4,
                background: i === current ? '#B8833A' : 'rgba(255,255,255,0.2)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>

          {/* Botón */}
          <button onClick={next} style={{
            width: '100%', padding: '16px',
            background: 'linear-gradient(135deg, #B8833A, #D4A055)',
            border: 'none', borderRadius: 16,
            color: '#FFFFFF', fontSize: 16, fontWeight: 700,
            fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(184,131,58,0.4)',
            letterSpacing: '0.03em',
          }}>
            {current === slides.length - 1 ? 'Empezar →' : 'Siguiente →'}
          </button>

          {/* Omitir */}
          {current < slides.length - 1 && (
            <button onClick={onFinish} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', fontSize: 13,
              fontFamily: 'Outfit, sans-serif', padding: '4px 0',
            }}>
              Omitir
            </button>
          )}
        </div>
      </div>
    </div>
  )
}