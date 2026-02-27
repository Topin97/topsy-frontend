import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../services/api'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'

export default function Layout() {
  const { user, token, logout, isProfessional } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    toast.success('Sesión cerrada')
    navigate('/')
  }

  const isActive = (path) => location.pathname.startsWith(path)

  const links = [
    { to: '/search', label: 'Explorar' },
    ...(token && isProfessional() ? [
      { to: '/pro/dashboard',    label: 'Dashboard' },
      { to: '/pro/services',     label: 'Servicios' },
      { to: '/pro/availability', label: 'Horarios' },
    ] : []),
    ...(token && !isProfessional() ? [
      { to: '/dashboard', label: 'Mis citas' },
    ] : []),
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0A0806' }}>
      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-right-desktop { display: none !important; }
          .hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled || menuOpen ? 'rgba(8,6,4,0.96)' : 'linear-gradient(180deg, rgba(8,6,4,0.85) 0%, transparent 100%)',
        backdropFilter: scrolled || menuOpen ? 'blur(24px)' : 'none',
        borderBottom: scrolled || menuOpen ? '1px solid rgba(201,150,90,0.1)' : 'none',
        transition: 'all 0.3s',
      }}>
        {/* Main bar */}
        <div className="container-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: scrolled ? 58 : 68, transition: 'height 0.3s' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.7rem', fontWeight: 700, letterSpacing: '3px', color: '#F7F2EA' }}>TOP</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.7rem', fontWeight: 400, fontStyle: 'italic', color: '#C9965A' }}>sy</span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            {links.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                textDecoration: 'none', fontSize: '12px', letterSpacing: '0.12em',
                textTransform: 'uppercase', fontWeight: 500,
                color: isActive(to) ? '#C9965A' : 'rgba(247,242,234,0.55)',
                position: 'relative', paddingBottom: '4px', transition: 'color 0.2s',
              }}>
                {label}
                {isActive(to) && (
                  <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #C9965A, transparent)' }} />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="nav-right-desktop" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {token ? (
              <>
                <Link to={isProfessional() ? '/pro/profile' : '/profile'} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,150,90,0.3), rgba(201,150,90,0.1))', border: '1.5px solid rgba(201,150,90,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#E8B97A' }}>
                    {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span style={{ fontSize: '13px', color: 'rgba(247,242,234,0.7)' }}>{user?.full_name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'rgba(247,242,234,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: 'none', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.55)', fontWeight: 500 }}>Entrar</Link>
                <Link to="/register" style={{ textDecoration: 'none', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, color: '#0A0806', background: 'linear-gradient(135deg, #C9965A, #E8B97A)', padding: '9px 20px', borderRadius: '2px', boxShadow: '0 4px 20px rgba(201,150,90,0.25)' }}>
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}
          >
            {[0,1,2].map((i) => (
              <span key={i} style={{
                display: 'block', width: 22, height: 1.5, background: '#C9965A', borderRadius: 2,
                transition: 'all 0.3s',
                transform: menuOpen
                  ? i === 0 ? 'rotate(45deg) translate(4px, 4px)' : i === 2 ? 'rotate(-45deg) translate(4px, -4px)' : 'scaleX(0)'
                  : 'none',
              }} />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        <div className="mobile-menu" style={{
          overflow: 'hidden', transition: 'max-height 0.35s ease',
          maxHeight: menuOpen ? '400px' : '0',
          borderTop: menuOpen ? '1px solid rgba(201,150,90,0.1)' : 'none',
        }}>
          <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {links.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                textDecoration: 'none', padding: '12px 0',
                fontSize: '14px', letterSpacing: '0.08em', textTransform: 'uppercase',
                color: isActive(to) ? '#C9965A' : 'rgba(247,242,234,0.6)',
                borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 500,
              }}>
                {label}
              </Link>
            ))}

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {token ? (
                <>
                  <Link to={isProfessional() ? '/pro/profile' : '/profile'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,150,90,0.2)', border: '1px solid rgba(201,150,90,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#C9965A' }}>
                      {user?.full_name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ color: 'rgba(247,242,234,0.7)', fontSize: 14 }}>{user?.full_name}</span>
                  </Link>
                  <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px', color: 'rgba(247,242,234,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px', color: 'rgba(247,242,234,0.7)', fontSize: 13, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                    Entrar
                  </Link>
                  <Link to="/register" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #C9965A, #E8B97A)', borderRadius: 8, padding: '12px', color: '#0A0806', fontSize: 13, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                    Crear cuenta gratis
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: '68px' }}>
        <Outlet />
      </main>
    </div>
  )
}