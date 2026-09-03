/**
 * AdminLayout.jsx
 * Wraps every admin page. Renders:
 *   - Sidebar with logo + nav links (Dashboard, Listings, Reservations, Users)
 *   - Top header with greeting + dropdown menu (View Reservations, Back to Site, Log out)
 *   - <Outlet /> for child pages
 * Redirects to /admin/login if no admin session exists.
 */
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearSession, getStoredUser } from '../Lib/api'
import AirbnbLogo from '../components/AirbnbLogo'

const NAV_LINKS = [
  { to: '/admin',              label: 'Dashboard',    icon: '▦'  },
  { to: '/admin/listings',     label: 'Listings',     icon: '🏠' },
  { to: '/admin/reservations', label: 'Reservations', icon: '📅' },
  { to: '/admin/users',        label: 'Users',        icon: '👥' },
]

function AdminLayout() {
  const navigate        = useNavigate()
  const user            = getStoredUser()
  const [drop, setDrop] = useState(false)
  const dropRef         = useRef(null)

  // Guard: redirect guests; allow admins and hosts into the dashboard
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'host')) {
      navigate('/admin/login', { replace: true })
    }
  }, [user, navigate])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    clearSession()
    navigate('/admin/login', { replace: true })
  }

  if (!user || (user.role !== 'admin' && user.role !== 'host')) return null

  return (
    <div className="adm-shell">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <Link to="/admin" className="adm-brand-link">
            <AirbnbLogo className="admin-logo-image" />
            <span className="adm-brand-word">airbnb</span>
            <span className="adm-brand-pill">Admin</span>
          </Link>
        </div>

        <nav className="adm-sidebar-nav" aria-label="Admin navigation">
          {NAV_LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `adm-nav-link${isActive ? ' adm-nav-link--active' : ''}`
              }
            >
              <span className="adm-nav-icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <Link to="/" className="adm-back-site">
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────── */}
      <div className="adm-main">
        {/* Top header */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <h2 className="adm-topbar-title">Admin Dashboard</h2>
          </div>

          <div className="adm-topbar-right" ref={dropRef}>
            {/* Greeting + avatar button */}
            <button
              className="adm-profile-btn"
              onClick={() => setDrop(v => !v)}
              aria-expanded={drop}
              aria-haspopup="true"
            >
              <span className="adm-avatar" aria-hidden="true">
                {(user.name || 'A')[0].toUpperCase()}
              </span>
              <span className="adm-profile-name">
                {user.name || 'Admin'}
              </span>
              <span className="adm-chevron" aria-hidden="true">
                {drop ? '▲' : '▼'}
              </span>
            </button>

            {/* Dropdown menu */}
            {drop && (
              <div className="adm-dropdown" role="menu">
                <div className="adm-dropdown-header">
                  <strong>{user.name || 'Admin'}</strong>
                  <span>{user.email}</span>
                </div>
                <Link
                  to="/admin/reservations"
                  className="adm-dropdown-item"
                  role="menuitem"
                  onClick={() => setDrop(false)}
                >
                  📅 View Reservations
                </Link>
                <Link
                  to="/admin/listings"
                  className="adm-dropdown-item"
                  role="menuitem"
                  onClick={() => setDrop(false)}
                >
                  🏠 Manage Listings
                </Link>
                <Link
                  to="/"
                  className="adm-dropdown-item"
                  role="menuitem"
                  onClick={() => setDrop(false)}
                >
                  🌐 View public site
                </Link>
                <div className="adm-dropdown-divider" />
                <button
                  className="adm-dropdown-item adm-dropdown-logout"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  🚪 Log out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
