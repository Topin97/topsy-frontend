import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [message, setMessage] = useState('Procesando...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase pone los tokens en el hash o en los params de la URL
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('[AuthCallback] error:', error.message)
          toast.error('Error al procesar la verificación')
          navigate('/login')
          return
        }

        if (session) {
          // Hay sesión activa — puede ser verificación de email o magic link
          // Verificar si el email ya está confirmado
          const { data: { user } } = await supabase.auth.getUser()

          if (user?.email_confirmed_at) {
            setMessage('¡Email verificado! ✓')
            toast.success('¡Email verificado correctamente! ✓')

            // Si el usuario ya tenía sesión activa en el store, solo redirigir al perfil
            if (token) {
              setTimeout(() => navigate('/profile'), 1500)
            } else {
              // Si no tenía sesión, ir al login
              setTimeout(() => navigate('/login'), 1500)
            }
          } else {
            navigate('/login')
          }
        } else {
          // Sin sesión — verificación de email completada, ir a login
          setMessage('Email verificado. Inicia sesión.')
          toast.success('¡Email verificado! Ya puedes iniciar sesión.')
          setTimeout(() => navigate('/login'), 1500)
        }
      } catch (err) {
        console.error('[AuthCallback] exception:', err)
        navigate('/login')
      }
    }

    handleCallback()
  }, []) // eslint-disable-line

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '3px', color: '#1A1612', marginBottom: 24 }}>
          TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
        </p>
        <div style={{ width: 44, height: 44, border: '3px solid rgba(26,22,18,0.08)', borderTopColor: '#1A1612', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, color: 'rgba(26,22,18,0.4)' }}>
          {message}
        </p>
      </div>
    </div>
  )
}