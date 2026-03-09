import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../../services/api'
import toast from 'react-hot-toast'
import { useState, useEffect, useRef } from 'react'
import navHome     from '../../assets/icons/nav-home.png'
import navExplore  from '../../assets/icons/nav-explore.png'
import navBookings from '../../assets/icons/nav-bookings.png'
import navProfile  from '../../assets/icons/nav-profile.png'

export default function Layout() {
  const { user, token, logout, isProfessional } = useAuthStore()
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const location  = useLocation()
  const [scrolled, setScrolled]             = useState(false)
  const [dropdownOpen, setDropdownOpen]     = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.user),
    enabled: !!token,
  })

  const avatarUrl = me?.avatar_url
  const isAdmin   = user?.role === 'admin'

  const hideBottomNav = ['/login','/register','/welcome','/forgot-password','/reset-password']
    .some(p => location.pathname === p || location.pathname.startsWith('/register/'))

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setDropdownOpen(false); setProfileMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    const fn = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout(); qc.clear()
    toast.success('Sesión cerrada')
    navigate('/')
  }

  const isActive = path => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const profileLink  = isAdmin ? '/admin' : isProfessional() ? '/pro/profile' : '/profile'
  const bookingsLink = token ? (isProfessional() ? '/pro/dashboard' : '/dashboard') : '/login'

  const clientNav = [
    { to: '/',          img: navHome,     label: 'Inicio' },
    { to: '/search',    img: navExplore,  label: 'Explorar' },
    { to: bookingsLink, img: navBookings, label: 'Reservas' },
    { to: token ? profileLink : '/login', img: navProfile, label: 'Perfil', isProfile: true },
  ]
  const proNav = [
    { to: '/pro/dashboard',    img: navHome,     label: 'Panel' },
    { to: '/pro/services',     img: navExplore,  label: 'Servicios' },
    { to: '/pro/availability', img: navBookings, label: 'Horarios' },
    { to: '/pro/profile',      img: navProfile,  label: 'Perfil', isProfile: true },
  ]
  const bottomNav = token && isProfessional() ? proNav : clientNav

  const Avatar = ({ size = 30 }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(184,131,58,0.3)', background: 'rgba(184,131,58,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {avatarUrl
        ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: size * 0.4, color: '#B8833A', fontWeight: 700 }}>{user?.full_name?.[0]?.toUpperCase()}</span>
      }
    </div>
  )

  const NavItem = ({ item }) => {
    const { to, img, label, isProfile } = item
    const active = isActive(to)
    const on = isProfile ? (active || profileMenuOpen) : active

    const inner = (
      <>
        <div style={{
          width: 28, height: 28, borderRadius: 9,
          background: on ? 'rgba(184,131,58,0.12)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.22s',
        }}>
          {isProfile && avatarUrl
            ? <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${on ? '#B8833A' : 'rgba(0,0,0,0.15)'}`, transition: 'border-color 0.22s' }}>
                <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            : <img src={img} alt={label} style={{ width: 18, height: 18, objectFit: 'contain', transition: 'all 0.22s',
                opacity: on ? 1 : 0.4,
                filter: on
                  ? 'brightness(0) saturate(1) invert(48%) sepia(60%) saturate(500%) hue-rotate(10deg) brightness(0.85)'
                  : 'brightness(0)'
              }} />
          }
        </div>
        <span style={{ fontSize: 10, marginTop: 2, color: on ? '#B8833A' : 'rgba(26,22,18,0.4)', fontFamily: 'Outfit, sans-serif', fontWeight: on ? 600 : 400, transition: 'all 0.22s' }}>
          {label}
        </span>
        {on && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 16, height: 2, borderRadius: 2, background: '#B8833A' }} />}
      </>
    )

    const style = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1, padding: '6px 0', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', position: 'relative' }

    return isProfile && token
      ? <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} style={{ ...style, background: 'none', border: 'none' }}>{inner}</button>
      : <Link to={to} style={{ ...style, textDecoration: 'none' }}>{inner}</Link>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2' }}>
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .bottom-nav  { display: flex !important; }
        }
        @media (min-width: 769px) {
          .bottom-nav { display: none !important; }
        }
        .nav-link:hover { color: #B8833A !important; }
        .dd-item:hover  { background: #F7F5F2 !important; }
      `}</style>

      {/* ── TOP NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: scrolled ? 52 : 60,
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.25s ease',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '3px', color: '#1A1612', lineHeight: 1 }}>TOP</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 400, fontStyle: 'italic', color: '#B8833A', lineHeight: 1 }}>sy</span>
          </Link>

          {/* Desktop links */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
            <Link to="/search" className="nav-link" style={{ textDecoration: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: isActive('/search') ? '#B8833A' : 'rgba(26,22,18,0.45)', transition: 'color 0.2s' }}>Explorar</Link>
            {token && isProfessional() && <>
              <Link to="/pro/dashboard"    className="nav-link" style={{ textDecoration: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: isActive('/pro/dashboard') ? '#B8833A' : 'rgba(26,22,18,0.45)', transition: 'color 0.2s' }}>Panel</Link>
              <Link to="/pro/services"     className="nav-link" style={{ textDecoration: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: isActive('/pro/services') ? '#B8833A' : 'rgba(26,22,18,0.45)', transition: 'color 0.2s' }}>Servicios</Link>
              <Link to="/pro/availability" className="nav-link" style={{ textDecoration: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: isActive('/pro/availability') ? '#B8833A' : 'rgba(26,22,18,0.45)', transition: 'color 0.2s' }}>Horarios</Link>
            </>}
            {token && !isProfessional() && !isAdmin && (
              <Link to="/dashboard" className="nav-link" style={{ textDecoration: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: isActive('/dashboard') ? '#B8833A' : 'rgba(26,22,18,0.45)', transition: 'color 0.2s' }}>Mis citas</Link>
            )}
            {isAdmin && (
              <Link to="/admin" style={{ textDecoration: 'none', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: '#B8833A', background: 'rgba(184,131,58,0.1)', border: '1px solid rgba(184,131,58,0.25)', borderRadius: 100, padding: '4px 12px' }}>⚙️ Admin</Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {token ? (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{ background: dropdownOpen ? '#F7F5F2' : 'transparent', border: '1.5px solid rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', borderRadius: 100, transition: 'all 0.2s' }}>
                  <Avatar size={28} />
                  <span style={{ fontSize: 13, color: '#1A1612', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name?.split(' ')[0]}</span>
                  <span style={{ fontSize: 8, color: 'rgba(26,22,18,0.3)', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
                </button>

                {dropdownOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 16, minWidth: 210, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 200 }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar size={34} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1612', margin: 0 }}>{user?.full_name}</p>
                        <p style={{ fontSize: 10, color: '#A0917F', margin: '2px 0 0' }}>
                          {isAdmin ? '⚙️ Admin' : isProfessional() ? '✂️ Profesional' : '👤 Cliente'}
                        </p>
                      </div>
                    </div>
                    <div style={{ padding: 6 }}>
                      {isAdmin && <Link to="/admin" className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', color: '#B8833A', fontSize: 13, transition: 'background 0.15s' }}>⚙️ Panel admin</Link>}
                      {isProfessional() && <>
                        <Link to="/pro/dashboard"    className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', color: '#1A1612', fontSize: 13, transition: 'background 0.15s' }}>📊 Dashboard</Link>
                        <Link to="/pro/services"     className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', color: '#1A1612', fontSize: 13, transition: 'background 0.15s' }}>✂️ Servicios</Link>
                        <Link to="/pro/availability" className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', color: '#1A1612', fontSize: 13, transition: 'background 0.15s' }}>🕐 Horarios</Link>
                        <Link to="/pro/profile"      className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', color: '#1A1612', fontSize: 13, transition: 'background 0.15s' }}>✏️ Mi perfil</Link>
                      </>}
                      {!isProfessional() && !isAdmin && <>
                        <Link to="/dashboard" className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', color: '#1A1612', fontSize: 13, transition: 'background 0.15s' }}>📅 Mis citas</Link>
                        <Link to="/profile"   className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', color: '#1A1612', fontSize: 13, transition: 'background 0.15s' }}>👤 Mi perfil</Link>
                      </>}
                      <Link to="/search" className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', color: '#1A1612', fontSize: 13, transition: 'background 0.15s' }}>🔍 Explorar</Link>
                    </div>
                    <div style={{ padding: 6, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      <button onClick={handleLogout} className="dd-item" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, background: 'transparent', border: 'none', color: '#ef4444', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'background 0.15s' }}>🚪 Cerrar sesión</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/login" style={{ textDecoration: 'none', fontSize: 12, color: 'rgba(26,22,18,0.5)', fontWeight: 500 }}>Entrar</Link>
                <Link to="/register" style={{ textDecoration: 'none', fontSize: 12, fontWeight: 700, color: '#FFFFFF', background: 'linear-gradient(135deg,#B8833A,#D4A055)', padding: '8px 18px', borderRadius: 100, boxShadow: '0 2px 10px rgba(184,131,58,0.25)' }}>
                  Registro
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── BOTTOM NAV MÓVIL ── */}
      {!hideBottomNav && (
        <>
          {/* Profile sheet */}
          {profileMenuOpen && (
            <div onClick={() => setProfileMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 88, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
              <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 74, left: 10, right: 10, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 22, overflow: 'hidden', boxShadow: '0 -4px 40px rgba(0,0,0,0.12)' }}>
                {/* User row */}
                <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar size={42} />
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1612', margin: 0 }}>{user?.full_name}</p>
                    <p style={{ fontSize: 11, color: '#A0917F', margin: '2px 0 0' }}>
                      {isAdmin ? '⚙️ Administrador' : isProfessional() ? '✂️ Profesional' : '👤 Cliente'}
                    </p>
                  </div>
                </div>
                <div style={{ padding: '8px 8px 4px' }}>
                  {[
                    { to: profileLink, icon: '👤', label: 'Mi perfil' },
                    ...(isProfessional() ? [{ to: '/pro/dashboard', icon: '📊', label: 'Panel' }] : []),
                    ...(isAdmin ? [{ to: '/admin', icon: '⚙️', label: 'Admin', gold: true }] : []),
                    { to: '/search', icon: '🔍', label: 'Explorar' },
                  ].map(({ to, icon, label, gold }) => (
                    <Link key={to} to={to} onClick={() => setProfileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', borderRadius: 12, textDecoration: 'none', color: gold ? '#B8833A' : '#1A1612', fontSize: 15, marginBottom: 2 }}>
                      <span>{icon}</span>{label}
                    </Link>
                  ))}
                </div>
                <div style={{ padding: '4px 8px 12px', borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: 4 }}>
                  <button onClick={() => { setProfileMenuOpen(false); handleLogout() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', color: '#ef4444', fontSize: 15, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', textAlign: 'left', marginTop: 6 }}>
                    <span>🚪</span> Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom bar */}
          <div className="bottom-nav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 -2px 16px rgba(0,0,0,0.06)', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 80, justifyContent: 'space-around', alignItems: 'flex-start', paddingTop: 6 }}>
            {bottomNav.map(item => <NavItem key={item.to} item={item} />)}
          </div>
        </>
      )}

      <main style={{ paddingTop: '60px', paddingBottom: hideBottomNav ? 0 : 'calc(60px + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>
    </div>
  )
}