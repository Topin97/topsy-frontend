import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ob1 from '../assets/onboarding1.jpg'
import ob2 from '../assets/onboarding2.jpg'
import ob3 from '../assets/onboarding3.jpg'

const SLIDES = [
  {
    img: ob1,
    title: 'Descubre',
    subtitle: 'el salón que siempre quisiste',
    desc: 'Encuentra los mejores profesionales de belleza y bienestar cerca de ti.',
  },
  {
    img: ob2,
    title: 'Reserva',
    subtitle: 'en segundos, sin llamadas',
    desc: 'Elige tu servicio, selecciona horario y confirma tu cita al instante.',
  },
  {
    img: ob3,
    title: 'Disfruta',
    subtitle: 'la experiencia que mereces',
    desc: 'Relájate y déjate cuidar. Tu bienestar, siempre a un toque de distancia.',
  },
]

export default function OnboardingScreen({ onFinish }) {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()
  const touchStartX = useRef(null)

  const next = () => {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1)
    } else {
      finish()
    }
  }

  const finish = () => {
    localStorage.setItem('topsy_onboarding_done', '1')
    onFinish?.()
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 50 && current < SLIDES.length - 1) setCurrent(current + 1)
    if (diff < -50 && current > 0) setCurrent(current - 1)
    touchStartX.current = null
  }

  const slide = SLIDES[current]
  const isLast = current === SLIDES.length - 1

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        fontFamily: 'Outfit, sans-serif',
        overflow: 'hidden',
        background: '#1A0F05',
      }}
    >
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .ob-content { animation: fadeSlide 0.4s ease forwards; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      {/* Imagen de fondo */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <img
          key={current}
          src={slide.img}
          alt=""
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: 0.45,
            transition: 'opacity 0.4s ease',
          }}
        />
        {/* Gradiente oscuro desde abajo */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(26,15,5,0.2) 0%, rgba(26,15,5,0.6) 50%, rgba(26,15,5,0.97) 75%)',
        }} />
      </div>

      {/* Skip */}
      {!isLast && (
        <button
          onClick={finish}
          style={{
            position: 'absolute', top: 'calc(16px + env(safe-area-inset-top))', right: 20,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 999, padding: '6px 14px', color: 'rgba(255,255,255,0.6)',
            fontSize: 13, fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
          }}
        >
          Saltar
        </button>
      )}

      {/* Contenido */}
      <div
        key={current}
        className="ob-content"
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0 28px calc(48px + env(safe-area-inset-bottom)) 28px',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, color: '#F8F5F0', letterSpacing: '0.06em' }}>
            TOP<span style={{ color: '#D4A055', fontStyle: 'italic', fontWeight: 400 }}>sy</span>
          </span>
        </div>

        {/* Texto */}
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '3rem', fontWeight: 600, lineHeight: 1,
          color: '#F8F5F0', margin: '0 0 6px',
        }}>
          {slide.title}
        </h1>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.6rem', fontWeight: 400, fontStyle: 'italic',
          color: '#D4A055', margin: '0 0 16px', lineHeight: 1.2,
        }}>
          {slide.subtitle}
        </h2>
        <p style={{
          fontSize: 15, color: 'rgba(248,245,240,0.55)',
          lineHeight: 1.65, margin: '0 0 40px',
        }}>
          {slide.desc}
        </p>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, justifyContent: 'center' }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                height: 6, borderRadius: 3, cursor: 'pointer',
                width: i === current ? 28 : 6,
                background: i === current ? '#D4A055' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Botón */}
        <button
          onClick={next}
          style={{
            width: '100%', padding: '17px',
            background: 'linear-gradient(135deg,#B97830,#D19B52)',
            border: 'none', borderRadius: 16,
            color: '#FFFFFF', fontSize: 16, fontWeight: 700,
            fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
            boxShadow: '0 8px 28px rgba(185,120,48,0.4)',
            letterSpacing: '0.02em',
          }}
        >
          {isLast ? 'Empezar →' : 'Siguiente →'}
        </button>

        {/* Login link en última slide */}
        {isLast && (
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'rgba(248,245,240,0.4)' }}>
            ¿Ya tienes cuenta?{' '}
            <span
              onClick={() => { finish(); navigate('/login') }}
              style={{ color: '#D4A055', fontWeight: 600, cursor: 'pointer' }}
            >
              Iniciar sesión
            </span>
          </p>
        )}
      </div>
    </div>
  )
}