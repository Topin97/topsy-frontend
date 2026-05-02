import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../../services/api'
import toast from 'react-hot-toast'
import { useState, useEffect, useRef } from 'react'
import navHome from '../../assets/icons/nav-home.png'
import navExplore from '../../assets/icons/nav-explore.png'
import navBookings from '../../assets/icons/nav-bookings.png'
import navProfile from '../../assets/icons/nav-profile.png'

const ddStyle = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '10px 12px', borderRadius: 12,
  textDecoration: 'none', color: '#181512', fontSize: 14,
}

export default function Layout() {
  const { user, token, logout, isProfessional } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const location = useLocation()

  const [scrollY, setScrollY] = useState(0)
  const [navVisible, setNavVisible] = useState(true)
  const lastScrollRef = useRef(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  const isHome = location.pathname === '/'
  const scrolled = scrollY > 10
  const transparent = isHome && !scrolled
  const homeScrolled = isHome && scrollY > 60

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.user),
    enabled: !!token,
  })

  const avatarUrl = me?.avatar_url
  const isAdmin = user?.role === 'admin'

  const hideBottomNav =
    ['/login', '/register', '/welcome', '/forgot-password', '/reset-password', '/pro/onboarding', '/complete-profile'].includes(location.pathname) ||
    location.pathname.startsWith('/register/') ||
    location.pathname.startsWith('/booking/') ||
    location.pathname.startsWith('/professional/')

  useEffect(() => {
    const fn = (e) => {
      const target = e?.target
      const current = target?.scrollTop || window.scrollY || 0
      setScrollY(current)
      if (isHome) {
        if (current < 10) {
          setNavVisible(true)
        } else if (current > lastScrollRef.current + 8) {
          setNavVisible(false)
        } else if (current < lastScrollRef.current - 8) {
          setNavVisible(true)
        }
      } else {
        setNavVisible(true)
      }
      lastScrollRef.current = current
    }
    const mainEl = document.querySelector('main')
    window.addEventListener('scroll', fn, { passive: true })
    document.addEventListener('scroll', fn, { passive: true, capture: true })
    mainEl?.addEventListener('scroll', fn, { passive: true })
    return () => {
      window.removeEventListener('scroll', fn)
      document.removeEventListener('scroll', fn, { capture: true })
      mainEl?.removeEventListener('scroll', fn)
    }
  }, [isHome])

  useEffect(() => {
    setDropdownOpen(false)
    setProfileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const fn = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
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

  const isActive = path => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const profileLink = isAdmin ? '/admin' : isProfessional() ? '/pro/profile' : '/profile'
  const bookingsLink = token ? (isProfessional() ? '/pro/dashboard' : '/dashboard') : '/login'

  const clientNav = [
    { to: '/',           img: navHome,     label: 'Inicio' },
    { to: '/search',     img: navExplore,  label: 'Explorar' },
    { to: bookingsLink,  img: navBookings, label: 'Reservas' },
    { to: token ? profileLink : '/login', img: navProfile, label: 'Perfil', isProfile: true },
  ]

  const proNav = [
    { to: '/pro/dashboard',    img: navHome,     label: 'Panel' },
    { to: '/pro/services',     img: navExplore,  label: 'Servicios' },
    { to: '/pro/availability', img: navBookings, label: 'Horarios' },
    { to: '/pro/profile',      img: navProfile,  label: 'Perfil', isProfile: true },
  ]

  const bottomNav = token && isProfessional() ? proNav : clientNav

  // Colores del navbar según estado
  const navBg = (() => {
    if (transparent) return 'transparent'
    if (homeScrolled) return 'rgba(20,10,3,0.92)' // oscuro premium en home scrolleada
    return 'rgba(255,255,255,0.94)' // blanco en otras páginas
  })()

  const navBorder = (() => {
    if (transparent) return 'none'
    if (homeScrolled) return '1px solid rgba(197,138,61,0.15)'
    return '1px solid rgba(17,17,17,0.06)'
  })()

  const navShadow = (() => {
    if (transparent) return 'none'
    if (homeScrolled) return '0 8px 32px rgba(0,0,0,0.3)'
    return '0 4px 20px rgba(17,17,17,0.07)'
  })()

  const logoColor = (transparent || homeScrolled) ? '#FFFFFF' : '#181512'
  const logoAccent = (transparent || homeScrolled) ? '#D4A055' : '#B57932'

  const Avatar = ({ size = 32 }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden',
      border: '1.5px solid rgba(197,138,61,0.25)', background: 'rgba(197,138,61,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {avatarUrl
        ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: size * 0.42, color: '#B57932', fontWeight: 700, lineHeight: 1 }}>
            {user?.full_name?.[0]?.toUpperCase() || 'T'}
          </span>
      }
    </div>
  )

  const DesktopNavLink = ({ to, children }) => {
    const active = isActive(to)
    return (
      <Link to={to} style={{
        textDecoration: 'none', fontSize: 12,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        fontWeight: active ? 700 : 600,
        color: (transparent || homeScrolled)
          ? active ? '#D4A055' : 'rgba(255,255,255,0.75)'
          : active ? '#B57932' : 'rgba(24,21,18,0.50)',
        transition: 'color .18s ease',
      }}>
        {children}
      </Link>
    )
  }

  const NavItem = ({ item }) => {
    const { to, img, label, isProfile } = item
    const active = isActive(to)
    const on = isProfile ? active || profileMenuOpen : active

    const inner = (
      <>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: on ? 'rgba(197,138,61,0.12)' : 'transparent',
          border: on ? '1px solid rgba(197,138,61,0.18)' : '1px solid transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .2s ease',
        }}>
          {isProfile && avatarUrl
            ? <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', border: `1.5px solid ${on ? '#B57932' : 'rgba(0,0,0,0.14)'}` }}>
                <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            : <img src={img} alt={label} style={{
                width: 18, height: 18, objectFit: 'contain',
                opacity: on ? 1 : 0.4,
                filter: on
                  ? 'brightness(0) saturate(1) invert(48%) sepia(47%) saturate(705%) hue-rotate(356deg) brightness(93%) contrast(89%)'
                  : 'brightness(0)',
              }} />
          }
        </div>
        <span style={{ fontSize: 10, color: on ? '#B57932' : 'rgba(24,21,18,0.38)', fontWeight: on ? 700 : 500, marginTop: 2 }}>
          {label}
        </span>
      </>
    )

    const btnStyle = {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      flex: 1, padding: '7px 0 5px', cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent', position: 'relative',
      userSelect: 'none', textDecoration: 'none', background: 'none', border: 'none',
    }

    return isProfile && token
      ? <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} style={btnStyle}>{inner}</button>
      : <Link to={to} style={btnStyle}>{inner}</Link>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F5F0', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .bottom-nav  { display: flex !important; }
        }
        @media (min-width: 769px) {
          .bottom-nav { display: none !important; }
        }
        .dd-item:hover { background: #F8F5F0 !important; }
        .nav-link-hover:hover { opacity: 1 !important; }

        /* Línea dorada decorativa bajo el logo cuando está scrolleado en home */
        .logo-line {
          display: block;
          width: 0;
          height: 1.5px;
          background: linear-gradient(90deg, #B97830, #D4A055);
          transition: width 0.4s ease;
          border-radius: 2px;
          margin-top: 2px;
        }
        .logo-line.visible { width: 100%; }
      `}</style>

      {/* ══ NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: scrolled ? 60 : 68,
        background: navBg,
        backdropFilter: transparent ? 'none' : 'blur(20px)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(20px)',
        borderBottom: navBorder,
        boxShadow: navShadow,
        transition: 'all .3s cubic-bezier(0.22,1,0.36,1)',
        transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          width: '100%', maxWidth: 1280, margin: '0 auto',
          padding: '0 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 18,
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem',
                fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1,
                color: logoColor,
                transition: 'color .3s ease',
              }}>TOP</span>
              <span style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem',
                fontWeight: 400, fontStyle: 'italic', lineHeight: 1,
                color: logoAccent,
                transition: 'color .3s ease',
              }}>sy</span>
            </div>
            {/* Línea dorada decorativa — solo visible al scrollear en home */}
            <span className={`logo-line ${homeScrolled ? 'visible' : ''}`} />
          </Link>

          {/* Nav links centro */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1.6rem' }}>
            <DesktopNavLink to="/search">Explorar</DesktopNavLink>

            {token && isProfessional() && <>
              <DesktopNavLink to="/pro/dashboard">Panel</DesktopNavLink>
              <DesktopNavLink to="/pro/services">Servicios</DesktopNavLink>
              <DesktopNavLink to="/pro/availability">Horarios</DesktopNavLink>
              <DesktopNavLink to="/pro/waitlist">Lista de espera</DesktopNavLink>
            </>}

            {token && !isProfessional() && !isAdmin && (
              <DesktopNavLink to="/dashboard">Mis citas</DesktopNavLink>
            )}

            {isAdmin && (
              <Link to="/admin" style={{
                textDecoration: 'none', fontSize: 11, letterSpacing: '0.12em',
                textTransform: 'uppercase', fontWeight: 700, color: '#B57932',
                background: 'rgba(197,138,61,0.10)', border: '1px solid rgba(197,138,61,0.22)',
                borderRadius: 999, padding: '7px 13px',
              }}>Admin</Link>
            )}
          </div>

          {/* Derecha */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {token ? (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
                  background: (transparent || homeScrolled)
                    ? dropdownOpen ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)'
                    : dropdownOpen ? '#F8F5F0' : 'rgba(255,255,255,0.82)',
                  border: (transparent || homeScrolled) ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(17,17,17,0.08)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9,
                  padding: '6px 10px 6px 6px', borderRadius: 999,
                  transition: 'all .2s ease',
                  boxShadow: dropdownOpen ? '0 10px 24px rgba(17,17,17,0.08)' : 'none',
                }}>
                  <Avatar size={30} />
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: (transparent || homeScrolled) ? '#FFFFFF' : '#181512',
                    maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    transition: 'color .25s ease',
                  }}>
                    {user?.full_name?.split(' ')[0]}
                  </span>
                  <span style={{
                    fontSize: 9, transition: 'all .2s ease',
                    color: (transparent || homeScrolled) ? 'rgba(255,255,255,0.5)' : 'rgba(24,21,18,0.36)',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                  }}>▼</span>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                    width: 230, background: '#FFFFFF',
                    border: '1px solid rgba(17,17,17,0.07)', borderRadius: 20,
                    boxShadow: '0 22px 48px rgba(17,17,17,0.12)',
                    overflow: 'hidden', zIndex: 200,
                  }}>
                    <div style={{ padding: 16, borderBottom: '1px solid rgba(17,17,17,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar size={38} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#181512', margin: 0 }}>{user?.full_name}</p>
                        <p style={{ fontSize: 11, color: 'rgba(24,21,18,0.46)', margin: '3px 0 0' }}>
                          {isAdmin ? 'Administrador' : isProfessional() ? 'Profesional' : 'Cliente'}
                        </p>
                      </div>
                    </div>

                    <div style={{ padding: 8 }}>
                      {isAdmin && (
                        <Link to="/admin" className="dd-item" onClick={() => setDropdownOpen(false)} style={{ ...ddStyle, color: '#B57932' }}>⚙️ Panel admin</Link>
                      )}
                      {isProfessional() ? <>
                        <Link to="/pro/dashboard"    className="dd-item" onClick={() => setDropdownOpen(false)} style={ddStyle}>📊 Dashboard</Link>
                        <Link to="/pro/services"     className="dd-item" onClick={() => setDropdownOpen(false)} style={ddStyle}>✂️ Servicios</Link>
                        <Link to="/pro/availability" className="dd-item" onClick={() => setDropdownOpen(false)} style={ddStyle}>🕐 Horarios</Link>
                        <Link to="/pro/waitlist"     className="dd-item" onClick={() => setDropdownOpen(false)} style={ddStyle}>⏳ Lista de espera</Link>
                        <Link to="/pro/profile"      className="dd-item" onClick={() => setDropdownOpen(false)} style={ddStyle}>👤 Mi perfil</Link>
                      </> : !isAdmin ? <>
                        <Link to="/dashboard" className="dd-item" onClick={() => setDropdownOpen(false)} style={ddStyle}>📅 Mis citas</Link>
                        <Link to="/profile"   className="dd-item" onClick={() => setDropdownOpen(false)} style={ddStyle}>👤 Mi perfil</Link>
                      </> : null}
                      <Link to="/search" className="dd-item" onClick={() => setDropdownOpen(false)} style={ddStyle}>🔍 Explorar</Link>
                    </div>

                    <div style={{ padding: 8, borderTop: '1px solid rgba(17,17,17,0.05)' }}>
                      <button onClick={handleLogout} className="dd-item" style={{
                        width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
                        gap: 10, padding: '10px 12px', borderRadius: 12,
                        background: 'transparent', border: 'none', color: '#ef4444',
                        fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                      }}>🚪 Cerrar sesión</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/login" style={{
                  textDecoration: 'none', fontSize: 13, fontWeight: 600, padding: '8px 10px',
                  color: (transparent || homeScrolled) ? 'rgba(255,255,255,0.8)' : 'rgba(24,21,18,0.56)',
                  transition: 'color .25s ease',
                }}>Entrar</Link>
                <Link to="/register" style={{
                  textDecoration: 'none', fontSize: 13, fontWeight: 700, color: '#FFFFFF',
                  background: 'linear-gradient(135deg,#B97830,#D19B52)',
                  padding: '10px 18px', borderRadius: 999,
                  boxShadow: '0 8px 20px rgba(197,138,61,0.3)',
                }}>Registro</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ══ PROFILE MENU MÓVIL */}
      {!hideBottomNav && profileMenuOpen && (
        <div onClick={() => setProfileMenuOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 88,
          background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position: 'absolute', bottom: 78, left: 10, right: 10,
            background: '#FFFFFF', border: '1px solid rgba(17,17,17,0.08)',
            borderRadius: 24, overflow: 'hidden',
            boxShadow: '0 -8px 40px rgba(17,17,17,0.14)',
          }}>
            <div style={{ padding: 18, borderBottom: '1px solid rgba(17,17,17,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar size={44} />
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#181512', margin: 0 }}>{user?.full_name}</p>
                <p style={{ fontSize: 12, color: 'rgba(24,21,18,0.46)', margin: '3px 0 0' }}>
                  {isAdmin ? 'Administrador' : isProfessional() ? 'Profesional' : 'Cliente'}
                </p>
              </div>
            </div>
            <div style={{ padding: '8px 8px 4px' }}>
              {[
                { to: profileLink, icon: '👤', label: 'Mi perfil' },
                ...(isProfessional() ? [
                  { to: '/pro/dashboard',    icon: '📊', label: 'Panel' },
                  { to: '/pro/services',     icon: '✂️', label: 'Servicios' },
                  { to: '/pro/availability', icon: '🕐', label: 'Horarios' },
                  { to: '/pro/waitlist',     icon: '⏳', label: 'Lista de espera' },
                ] : []),
                ...(isAdmin ? [{ to: '/admin', icon: '⚙️', label: 'Admin', gold: true }] : []),
                { to: '/search', icon: '🔍', label: 'Explorar' },
              ].map(({ to, icon, label, gold }) => (
                <Link key={to} to={to} onClick={() => setProfileMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px',
                  borderRadius: 14, textDecoration: 'none',
                  color: gold ? '#B57932' : '#181512', fontSize: 15, marginBottom: 2,
                }}>
                  <span>{icon}</span>{label}
                </Link>
              ))}
            </div>
            <div style={{ padding: '4px 8px 12px', borderTop: '1px solid rgba(17,17,17,0.05)', marginTop: 4 }}>
              <button onClick={() => { setProfileMenuOpen(false); handleLogout() }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 12px', borderRadius: 14,
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)',
                color: '#ef4444', fontSize: 15, fontFamily: 'Outfit, sans-serif',
                cursor: 'pointer', textAlign: 'left', marginTop: 6,
              }}>
                <span>🚪</span> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ BOTTOM NAV MÓVIL */}
      {!hideBottomNav && (
        <div className="bottom-nav" style={{
          display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(17,17,17,0.06)',
          boxShadow: '0 -6px 26px rgba(17,17,17,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          zIndex: 80, justifyContent: 'space-around',
          alignItems: 'flex-start', paddingTop: 5,
        }}>
          {bottomNav.map(item => <NavItem key={item.to} item={item} />)}
        </div>
      )}

      {/* ══ MAIN CONTENT */}
      <main style={{
        paddingTop: isHome ? '0' : '68px',
        paddingBottom: hideBottomNav ? 0 : 'calc(64px + env(safe-area-inset-bottom))',
      }}>
        <Outlet />

        {!hideBottomNav && (
          <div style={{
            borderTop: '1px solid rgba(17,17,17,0.06)', padding: '18px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 18, flexWrap: 'wrap', background: '#FFFFFF',
          }}>
            <Link to="/privacy" style={{ fontSize: 11, color: 'rgba(24,21,18,0.38)', textDecoration: 'none', letterSpacing: '0.03em' }}>
              Política de Privacidad
            </Link>
            <span style={{ fontSize: 11, color: 'rgba(24,21,18,0.18)' }}>·</span>
            <span style={{ fontSize: 11, color: 'rgba(24,21,18,0.28)' }}>© 2026 TopSy</span>
          </div>
        )}
      </main>
    </div>
  )
}