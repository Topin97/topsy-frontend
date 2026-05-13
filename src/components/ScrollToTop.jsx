import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Hace scroll al top en cada cambio de ruta.
 * Montado una vez en App.jsx, funciona globalmente.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
