import { useState, useEffect, useCallback } from 'react'

const KEY = 'topsy_favorite_pros'

function getStored() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favs, setFavs] = useState(getStored)

  // Sync across tabs
  useEffect(() => {
    const onStorage = () => setFavs(getStored())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const toggle = useCallback((proId) => {
    setFavs(prev => {
      const next = prev.includes(proId)
        ? prev.filter(id => id !== proId)
        : [...prev, proId]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFav = useCallback((proId) => favs.includes(proId), [favs])

  return { favs, toggle, isFav }
}
