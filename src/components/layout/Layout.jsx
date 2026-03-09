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
  const [scrolled, setScrolled]           = useState(false)
  const [dropdownOpen, setDropdownOpen]   = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.user),
    enabled: !!token,
  })

  const avatarUrl = me?.avatar_url
  const isAdmin   = user?.role === 'admin'

  const hideBottomNav = [
    '/login', '/register', '/register/client', '/register/pro',
    '/welcome', '/forgot-password', '/reset-password',
  ].some(p => location.pathname === p || location.pathname.startsWith('/register/'))

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setDropdownOpen(false); setProfileMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    const fn = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    qc.clear()
    toast.success('Sesión cerrada')
    navigate('/')
  }

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const profileLink   = isAdmin ? '/admin' : isProfessional() ? '/pro/profile' : '/profile'
  const bookingsLink  = token ? (isProfessional() ? '/pro/dashboard' : '/dashboard') : '/login'

  const clientBottomNav = [
    { to: '/',          img: navHome,     label: 'Inicio' },
    { to: '/search',    img: navExplore,  label: 'Explorar' },
    { to: bookingsLink, img: navBookings, label: 'Reservas' },
    { to: token ? profileLink : '/login', img: navProfile, label: 'Perfil', isProfile: true },
  ]

  const proBottomNav = [
    { to: '/pro/dashboard',    img: navHome,     label: 'Panel' },
    { to: '/pro/services',     img: navExplore,  label: 'Servicios' },
    { to: '/pro/availability', img: navBookings, label: 'Horarios' },
    { to: '/pro/profile',      img: navProfile,  label: 'Perfil', isProfile: true },
  ]

  const bottomNav = token && isProfessional() ? proBottomNav : clientBottomNav

  const NavItem = ({ item }) => {
    const { to, img, label, isProfile } = item
    const active = isActive(to)
    const isProfileActive = isProfile && (active || profileMenuOpen)

    const inner = (
      <>
        {/* Active dot */}
        <div style={{
          width: 4, height: 4, borderRadius: '50%',
          background: (isProfileActive || active) ? '#C9965A' : 'transparent',
          marginBottom: 5, transition: 'all 0.25s',
          boxShadow: (isProfileActive || active) ? '0 0 8px rgba(201,150,90,0.8)' : 'none',
        }} />

        {/* Icon / Avatar */}
        {isProfile && avatarUrl ? (
          <div style={{
            width: 28, height: 28, borderRadius: '50%', overflow: 'hidden',
            border: `2px solid ${isProfileActive ? '#C9965A' : 'rgba(255,255,255,0.15)'}`,
            transition: 'border-color 0.25s', flexShrink: 0,
          }}>
            <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{
            width: 28, height: 28, borderRadius: 10,
            background: (isProfileActive || active) ? 'rgba(201,150,90,0.15)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.25s',
          }}>
            <img src={img} alt={label} style={{
              width: 20, height: 20, objectFit: 'contain',
              opacity: (isProfileActive || active) ? 1 : 0.35,
              filter: (isProfileActive || active)
                ? 'brightness(1.6) drop-shadow(0 0 4px rgba(201,150,90,0.6))'
                : 'brightness(0.6)',
              transition: 'all 0.25s',
            }} />
          </div>
        )}

        {/* Label */}
        <span style={{
          fontSize: 10, marginTop: 3,
          color: (isProfileActive || active) ? '#C9965A' : 'rgba(247,242,234,0.3)',
          fontFamily: 'Outfit, sans-serif', letterSpacing: '0.03em',
          fontWeight: (isProfileActive || active) ? 600 : 400,
          transition: 'all 0.25s',
        }}>{label}</span>
      </>
    )

    const itemStyle = {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      flex: 1, padding: '4px 0', cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
    }

    if (isProfile && token) {
      return (
        <button onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          style={{ ...itemStyle, background: 'none', border: 'none' }}>
          {inner}
        </button>
      )
    }

    return (
      <Link to={to} style={{ ...itemStyle, textDecoration: 'none' }}>
        {inner}
      </Link>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#16120E' }}>
      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop, .nav-right-desktop { display: none !important; }
          .bottom-nav { display: flex !important; }
        }
        @media (min-width: 769px) {
          .bottom-nav { display: none !important; }
        }
        .nav-link-item:hover { color: #C9965A !important; }
        .dd-item:hover { background: rgba(255,255,255,0.05) !important; color: #F7F2EA !important; }
        .dd-item { transition: background 0.15s; }
      `}</style>

      {/* ── TOP NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: scrolled ? 52 : 60,
        background: scrolled ? 'rgba(20,16,10,0.96)' : 'rgba(20,16,10,0.75)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(201,150,90,0.1)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 0, flexShrink: 0 }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '3px', color: '#F7F2EA', lineHeight: 1 }}>TOP</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 400, fontStyle: 'italic', color: '#C9965A', lineHeight: 1 }}>sy</span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to="/search" className="nav-link-item" style={{ textDecoration: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: isActive('/search') ? '#C9965A' : 'rgba(247,242,234,0.45)', transition: 'color 0.2s' }}>Explorar</Link>
            {token && isProfessional() && <>
              <Link to="/pro/dashboard"    className="nav-link-item" style={{ textDecoration: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: isActive('/pro/dashboard') ? '#C9965A' : 'rgba(247,242,234,0.45)', transition: 'color 0.2s' }}>Panel</Link>
              <Link to="/pro/services"     className="nav-link-item" style={{ textDecoration: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: isActive('/pro/services') ? '#C9965A' : 'rgba(247,242,234,0.45)', transition: 'color 0.2s' }}>Servicios</Link>
              <Link to="/pro/availability" className="nav-link-item" style={{ textDecoration: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: isActive('/pro/availability') ? '#C9965A' : 'rgba(247,242,234,0.45)', transition: 'color 0.2s' }}>Horarios</Link>
            </>}
            {token && !isProfessional() && !isAdmin && (
              <Link to="/dashboard" className="nav-link-item" style={{ textDecoration: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: isActive('/dashboard') ? '#C9965A' : 'rgba(247,242,234,0.45)', transition: 'color 0.2s' }}>Mis citas</Link>
            )}
            {isAdmin && (
              <Link to="/admin" style={{ textDecoration: 'none', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: '#C9965A', background: 'rgba(201,150,90,0.1)', border: '1px solid rgba(201,150,90,0.2)', borderRadius: 100, padding: '4px 12px' }}>⚙️ Admin</Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="nav-right-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {token ? (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
                  background: dropdownOpen ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 10px 5px 5px', borderRadius: 100, transition: 'all 0.2s',
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(201,150,90,0.4)', background: 'rgba(201,150,90,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.9rem', color: '#C9965A', fontWeight: 700 }}>{user?.full_name?.[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(247,242,234,0.65)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Outfit, sans-serif' }}>{user?.full_name?.split(' ')[0]}</span>
                  <span style={{ fontSize: 8, color: 'rgba(247,242,234,0.25)', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
                </button>

                {dropdownOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#1F1A14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, minWidth: 210, boxShadow: '0 16px 48px rgba(0,0,0,0.7)', overflow: 'hidden', zIndex: 200 }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(201,150,90,0.3)', background: 'rgba(201,150,90,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.9rem', color: '#C9965A', fontWeight: 700 }}>{user?.full_name?.[0]?.toUpperCase()}</span>}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#F7F2EA', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{user?.full_name}</p>
                        <p style={{ fontSize: 10, color: 'rgba(247,242,234,0.3)', margin: '2px 0 0', fontFamily: 'Outfit, sans-serif' }}>
                          {isAdmin ? '⚙️ Admin' : isProfessional() ? '✂️ Profesional' : '👤 Cliente'}
                        </p>
                      </div>
                    </div>
                    <div style={{ padding: 6 }}>
                      {isAdmin && <Link to="/admin" className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', color: '#C9965A', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>⚙️ Panel admin</Link>}
                      {isProfessional() && <>
                        <Link to="/pro/dashboard"    className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', color: 'rgba(247,242,234,0.65)', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>📊 Dashboard</Link>
                        <Link to="/pro/services"     className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', color: 'rgba(247,242,234,0.65)', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>✂️ Servicios</Link>
                        <Link to="/pro/availability" className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', color: 'rgba(247,242,234,0.65)', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>🕐 Horarios</Link>
                        <Link to="/pro/profile"      className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', color: 'rgba(247,242,234,0.65)', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>✏️ Mi perfil</Link>
                      </>}
                      {!isProfessional() && !isAdmin && <>
                        <Link to="/dashboard" className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', color: 'rgba(247,242,234,0.65)', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>📅 Mis citas</Link>
                        <Link to="/profile"   className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', color: 'rgba(247,242,234,0.65)', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>👤 Mi perfil</Link>
                      </>}
                      <Link to="/search" className="dd-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', color: 'rgba(247,242,234,0.65)', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>🔍 Explorar</Link>
                    </div>
                    <div style={{ padding: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <button onClick={handleLogout} className="dd-item" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: 'transparent', border: 'none', color: 'rgba(248,113,113,0.7)', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>🚪 Cerrar sesión</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/login" style={{ textDecoration: 'none', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', fontWeight: 500, fontFamily: 'Outfit, sans-serif' }}>Entrar</Link>
                <Link to="/register" style={{ textDecoration: 'none', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: '#16120E', background: 'linear-gradient(135deg,#C9965A,#E8B97A)', padding: '8px 18px', borderRadius: 100, fontFamily: 'Outfit, sans-serif' }}>
                  Registro
                </Link>
              </div>
            )}
          </div>

          {/* Mobile top-right: show login btn if not logged in */}
          {!token && (
            <div style={{ display: 'none' }} className="mobile-auth-btn">
              <Link to="/login" style={{ textDecoration: 'none', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: '#16120E', background: 'linear-gradient(135deg,#C9965A,#E8B97A)', padding: '7px 16px', borderRadius: 100, fontFamily: 'Outfit, sans-serif' }}>
                Entrar
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── BOTTOM NAV ── */}
      {!hideBottomNav && (
        <>
          {/* Profile sheet */}
          {profileMenuOpen && (
            <div onClick={() => setProfileMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 88, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
              <div onClick={e => e.stopPropagation()} style={{
                position: 'absolute', bottom: 80, left: 12, right: 12,
                background: '#1C1710', border: '1px solid rgba(201,150,90,0.2)',
                borderRadius: 24, overflow: 'hidden',
                boxShadow: '0 -4px 60px rgba(0,0,0,0.8)',
              }}>
                {/* User row */}
                <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(201,150,90,0.35)', background: 'rgba(201,150,90,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#C9965A', fontWeight: 700 }}>{user?.full_name?.[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#F7F2EA', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{user?.full_name}</p>
                    <p style={{ fontSize: 11, color: 'rgba(247,242,234,0.3)', margin: '3px 0 0', fontFamily: 'Outfit, sans-serif' }}>
                      {isAdmin ? '⚙️ Administrador' : isProfessional() ? '✂️ Profesional' : '👤 Cliente'}
                    </p>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: '10px 10px 4px' }}>
                  {[
                    { to: profileLink, icon: '👤', label: 'Mi perfil' },
                    ...(isProfessional() ? [{ to: '/pro/dashboard', icon: '📊', label: 'Panel' }] : []),
                    ...(isAdmin ? [{ to: '/admin', icon: '⚙️', label: 'Admin', gold: true }] : []),
                    { to: '/search', icon: '🔍', label: 'Explorar' },
                  ].map(({ to, icon, label, gold }) => (
                    <Link key={to} to={to} onClick={() => setProfileMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '13px 14px', borderRadius: 14,
                      textDecoration: 'none',
                      color: gold ? '#C9965A' : 'rgba(247,242,234,0.7)',
                      fontSize: 15, fontFamily: 'Outfit, sans-serif',
                      marginBottom: 2,
                    }}>
                      <span style={{ width: 20, textAlign: 'center' }}>{icon}</span>
                      {label}
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <div style={{ padding: '4px 10px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 4 }}>
                  <button onClick={() => { setProfileMenuOpen(false); handleLogout() }} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 14px', borderRadius: 14,
                    background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.1)',
                    color: 'rgba(248,113,113,0.8)', fontSize: 15, fontFamily: 'Outfit, sans-serif',
                    cursor: 'pointer', textAlign: 'left', marginTop: 8,
                  }}>
                    <span style={{ width: 20, textAlign: 'center' }}>🚪</span>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom bar */}
          <div className="bottom-nav" style={{
            display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'rgba(20,16,10,0.97)', backdropFilter: 'blur(24px)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            zIndex: 80, justifyContent: 'space-around', alignItems: 'flex-start',
            paddingTop: 8,
          }}>
            {bottomNav.map(item => <NavItem key={item.to} item={item} />)}
          </div>
        </>
      )}

      <main style={{
        paddingTop: '60px',
        paddingBottom: hideBottomNav ? 0 : 'calc(62px + env(safe-area-inset-bottom))',
      }}>
        <Outlet />
      </main>
    </div>
  )
}