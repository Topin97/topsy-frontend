import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '../../services/api'
import toast from 'react-hot-toast'
import { useState, useEffect, useRef } from 'react'

export default function Layout() {
  const { user, token, logout, isProfessional } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.user),
    enabled: !!token,
  })

  const avatarUrl = me?.avatar_url
  const isAdmin = user?.role === 'admin'

  const hideBottomNav = ['/login', '/register', '/welcome', '/forgot-password', '/reset-password'].includes(location.pathname)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setDropdownOpen(false) }, [location.pathname])

  useEffect(() => {
    const fn = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    toast.success('Sesión cerrada')
    navigate('/')
  }

  const isActive = (path) => location.pathname.startsWith(path)

  const navLinks = [
    { to: '/search', label: 'Explorar' },
    ...(token && isProfessional() ? [
      { to: '/pro/dashboard',    label: 'Dashboard' },
      { to: '/pro/services',     label: 'Servicios' },
      { to: '/pro/availability', label: 'Horarios' },
    ] : []),
    ...(token && !isProfessional() && !isAdmin ? [
      { to: '/dashboard', label: 'Mis citas' },
    ] : []),
  ]

  const profileLink = isAdmin ? '/admin' : isProfessional() ? '/pro/profile' : '/profile'
  const bookingsLink = token ? (isProfessional() ? '/pro/dashboard' : '/dashboard') : '/login'

  const bottomNav = [
    { to: '/',          icon: '❤️', label: 'TopSy' },
    { to: '/search',    icon: '🔍', label: 'Explorar' },
    { to: bookingsLink, icon: '📅', label: 'Reservas' },
    { to: token ? profileLink : '/login', icon: '👤', label: 'Perfil', avatar: avatarUrl },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#1C1C1E' }}>
      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop, .nav-right-desktop { display: none !important; }
          .bottom-nav { display: flex !important; }
        }
        @media (min-width: 769px) {
          .bottom-nav { display: none !important; }
        }
        .nav-link:hover { color: #C9965A !important; }
        .dropdown-item:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>

      {/* ── TOP NAV ─────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(8,6,4,0.97)' : 'linear-gradient(180deg, rgba(8,6,4,0.85) 0%, transparent 100%)',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,150,90,0.1)' : 'none',
        transition: 'all 0.3s',
      }}>
        <div className="container-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: scrolled ? 56 : 66, transition: 'height 0.3s' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.7rem', fontWeight: 700, letterSpacing: '3px', color: '#F7F2EA' }}>TOP</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.7rem', fontWeight: 400, fontStyle: 'italic', color: '#C9965A' }}>sy</span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className="nav-link" style={{
                textDecoration: 'none', fontSize: '12px', letterSpacing: '0.12em',
                textTransform: 'uppercase', fontWeight: 500, transition: 'color 0.2s',
                color: isActive(to) ? '#C9965A' : 'rgba(247,242,234,0.5)',
                position: 'relative', paddingBottom: '4px',
              }}>
                {label}
                {isActive(to) && <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #C9965A, transparent)' }} />}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="nav-link" style={{
                textDecoration: 'none', fontSize: '11px', letterSpacing: '0.12em',
                textTransform: 'uppercase', fontWeight: 600, transition: 'color 0.2s',
                color: isActive('/admin') ? '#C9965A' : 'rgba(201,150,90,0.5)',
                background: 'rgba(201,150,90,0.08)', border: '1px solid rgba(201,150,90,0.2)',
                borderRadius: 100, padding: '4px 12px',
              }}>⚙️ Admin</Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="nav-right-desktop" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {token ? (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{ background: dropdownOpen ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 4px 4px', borderRadius: 100, transition: 'background 0.2s' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(201,150,90,0.4)', flexShrink: 0, background: 'rgba(201,150,90,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#C9965A', fontWeight: 700 }}>{user?.full_name?.[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(247,242,234,0.7)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name?.split(' ')[0]}</span>
                  <span style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
                </button>

                {dropdownOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: '#2A2A2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', overflow: 'hidden', zIndex: 200 }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{user?.full_name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.3)' }}>
                        {isAdmin ? '⚙️ Administrador' : isProfessional() ? '✂️ Profesional' : '👤 Cliente'}
                      </p>
                    </div>
                    <div style={{ padding: '8px' }}>
                      {isAdmin && (
                        <Link to="/admin" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#C9965A', fontSize: 13, transition: 'background 0.15s' }}>⚙️ Panel admin</Link>
                      )}
                      {isProfessional() && (
                        <>
                          <Link to="/pro/dashboard" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: 'rgba(247,242,234,0.7)', fontSize: 13, transition: 'background 0.15s' }}>📊 Dashboard</Link>
                          <Link to="/pro/profile" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: 'rgba(247,242,234,0.7)', fontSize: 13, transition: 'background 0.15s' }}>✏️ Mi perfil</Link>
                        </>
                      )}
                      {!isProfessional() && !isAdmin && (
                        <>
                          <Link to="/dashboard" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: 'rgba(247,242,234,0.7)', fontSize: 13, transition: 'background 0.15s' }}>📅 Mis citas</Link>
                          <Link to="/profile" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: 'rgba(247,242,234,0.7)', fontSize: 13, transition: 'background 0.15s' }}>👤 Mi perfil</Link>
                        </>
                      )}
                      <Link to="/search" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: 'rgba(247,242,234,0.7)', fontSize: 13, transition: 'background 0.15s' }}>🔍 Explorar</Link>
                    </div>
                    <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button onClick={handleLogout} className="dropdown-item" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'transparent', border: 'none', color: 'rgba(248,113,113,0.7)', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'background 0.15s' }}>🚪 Cerrar sesión</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: 'none', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.5)', fontWeight: 500 }}>Entrar</Link>
                <Link to="/register" style={{ textDecoration: 'none', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: '#0A0806', background: 'linear-gradient(135deg, #C9965A, #E8B97A)', padding: '9px 20px', borderRadius: 8, boxShadow: '0 4px 20px rgba(201,150,90,0.2)' }}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── BOTTOM NAV MÓVIL ────────────────────────────────── */}
      {!hideBottomNav && (
        <div className="bottom-nav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(8,6,4,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 0 18px', zIndex: 80, justifyContent: 'space-around', alignItems: 'center' }}>
          {bottomNav.map(({ to, icon, label, avatar }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <Link key={to} to={to} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1, padding: '4px 0', position: 'relative' }}>
                {active && (
                  <span style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, background: '#C9965A', borderRadius: 2 }} />
                )}
                {avatar ? (
                  <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', border: `1.5px solid ${active ? '#C9965A' : 'rgba(255,255,255,0.2)'}` }}>
                    <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{icon}</span>
                )}
                <span style={{ fontSize: 10, color: active ? '#C9965A' : 'rgba(247,242,234,0.35)', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.04em' }}>{label}</span>
              </Link>
            )
          })}
        </div>
      )}

      <main style={{ paddingTop: '68px', paddingBottom: hideBottomNav ? 0 : 70 }}>
        <Outlet />
      </main>
    </div>
  )
}