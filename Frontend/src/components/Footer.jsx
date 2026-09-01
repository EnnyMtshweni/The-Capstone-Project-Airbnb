import { Link, useLocation } from 'react-router-dom'

function Nav({ user, onOpenLogin, onLogout }) {
  const { pathname } = useLocation()
  const isActive = (path) => (path === '/' ? pathname === '/' : pathname.startsWith(path))

  return (
    <nav className="nav container" aria-label="Main navigation">
      <Link className="brand airbnb-brand" to="/" aria-label="Airbnb home"><span>⌂</span> airbnb</Link>
      <div className="nav-links">
        <Link className={isActive('/') && pathname === '/' ? 'nav-tab selected' : 'nav-tab'} to="/">Stays</Link>
        <Link className={isActive('/trips') ? 'nav-tab selected' : 'nav-tab'} to="/trips">Trips</Link>
        <Link className={isActive('/host') ? 'nav-tab selected' : 'nav-tab'} to="/host">Host</Link>
      </div>
      <div className="nav-actions">
        <Link className="host-link" to="/host">Airbnb your home</Link>
        <button className="icon-button" aria-label="Change language">◎</button>
        {user ? (
          <button className="profile-button" aria-label="Log out" onClick={onLogout} title={`Log out ${user.name || ''}`}>☰ <span>●</span></button>
        ) : (
          <button className="profile-button" aria-label="Open login menu" onClick={onOpenLogin}>☰ <span>●</span></button>
        )}
      </div>
    </nav>
  )
}

export default Nav