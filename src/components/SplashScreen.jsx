import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('enter') // enter → hold → exit

  useEffect(() => {
    // Ocultar el splash nativo inmediatamente, nosotros tomamos el control
    if (Capacitor.isNativePlatform()) {
      import('@capacitor/splash-screen').then(({ SplashScreen }) => {
        SplashScreen.hide({ fadeOutDuration: 0 })
      })
    }

    // Animación: entra en 600ms, espera 800ms, sale en 500ms
    const t1 = setTimeout(() => setPhase('hold'), 600)
    const t2 = setTimeout(() => setPhase('exit'), 1400)
    const t3 = setTimeout(() => onFinish(), 1900)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const opacity = phase === 'exit' ? 0 : 1
  const scale = phase === 'enter' ? 0.85 : 1
  const transition = phase === 'enter'
    ? 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)'
    : phase === 'exit'
    ? 'opacity 0.5s ease'
    : 'none'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#1A0F05',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity, transition: phase !== 'enter' ? 'opacity 0.5s ease' : undefined,
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        opacity: phase === 'enter' ? 1 : 1,
        transform: `scale(${scale})`,
        transition,
      }}>
        {/* Logo */}
        <div style={{ lineHeight: 1 }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '3.8rem', fontWeight: 700,
            letterSpacing: '4px', color: '#FFFFFF',
          }}>TOP</span>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '3.8rem', fontWeight: 400,
            fontStyle: 'italic', color: '#B8833A',
          }}>sy</span>
        </div>

        {/* Línea dorada */}
        <div style={{
          width: 80, height: 1,
          background: 'linear-gradient(90deg, transparent, #B8833A, transparent)',
          opacity: phase === 'enter' ? 0 : 1,
          transition: 'opacity 0.4s ease 0.3s',
        }} />
      </div>
    </div>
  )
}