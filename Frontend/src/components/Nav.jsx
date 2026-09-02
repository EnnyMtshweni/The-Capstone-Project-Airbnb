import { Link, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { id: 'all',         label: 'All',         icon: 'globe'    },
  { id: 'homes',       label: 'Homes',       icon: 'home'     },
  { id: 'experiences', label: 'Experiences', icon: 'balloon'  },
  { id: 'services',    label: 'Services',    icon: 'hotel'    },
]

function Icon({ type }) {
  const props = {
    viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': 'true',
  }
  if (type === 'globe') return (
    <svg {...props}><circle cx="12" cy="12" r="8" /><path d="M3 12h18M12 4a14 14 0 0 1 0 16M12 4a14 14 0 0 0 0 16" /></svg>
  )
  if (type === 'home') return (
    <svg {...props}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10.5V20h14v-9.5" /><path d="M9 20v-6h6v6" /></svg>
  )
  if (type === 'balloon') return (
    <svg {...props}><path d="M12 2c4.4 0 8 3.4 8 7.5S16.4 17 12 17 4 13.6 4 9.5 7.6 2 12 2Z" /><path d="M12 17v4M9.5 21h5" /><path d="M10.5 9c.8-.8 1.7-1.2 2.7-1.2" /></svg>
  )
  return (
    <svg {...props}><path d="M5 9V7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5V9" /><path d="M4 10h16v7.5A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5V10Z" /><path d="M9 13h6" /></svg>
  )
}

function Nav({ user, onOpenLogin, onLogout, darkMode, onToggleDarkMode, onSearch, searchValues, onSearchChange }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pathname !== '/') navigate('/')
    onSearch?.()
  }

  return (
    <header className="top-header">
      <nav className="nav container" aria-label="Main navigation">
        <Link className="brand airbnb-brand" to="/" aria-label="Airbnb home">airbnb</Link>

        <div className="nav-links" role="tablist" aria-label="Navigation categories">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${item.id === 'all' && pathname === '/' ? 'active' : ''}`}
              onClick={() => { if (item.id === 'all') navigate('/') }}
            >
              <Icon type={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="nav-actions">
          <Link className="host-link" to="/host">Become a host</Link>
          <button type="button" className="icon-button" aria-label="Toggle dark mode" onClick={onToggleDarkMode}>
            {darkMode ? '☀' : '☾'}
          </button>
          {user ? (
            <button className="profile-button" aria-label="Log out" onClick={onLogout} title={`Log out ${user.name || ''}`}>
              <span className="menu-bars"><span /><span /><span /></span>
              <span className="user-avatar">{(user.name || 'U')[0].toUpperCase()}</span>
            </button>
          ) : (
            <button className="profile-button" aria-label="Open login menu" onClick={onOpenLogin}>
              <span className="menu-bars"><span /><span /><span /></span>
              <span className="user-dot">●</span>
            </button>
          )}
        </div>
      </nav>

      <div className="search-wrap container">
        <form className="search-panel" aria-label="Search for a stay" onSubmit={handleSubmit}>
          <label className="search-field">
            <span className="field-label">Where</span>
            <input
              type="text"
              placeholder="Search destinations"
              value={searchValues?.destination ?? 'South Africa'}
              onChange={(e) => onSearchChange?.('destination', e.target.value)}
            />
          </label>
          <label className="search-field">
            <span className="field-label">Check in</span>
            <input
              type="date"
              value={searchValues?.checkIn ?? ''}
              onChange={(e) => onSearchChange?.('checkIn', e.target.value)}
            />
          </label>
          <label className="search-field">
            <span className="field-label">Check out</span>
            <input
              type="date"
              value={searchValues?.checkOut ?? ''}
              onChange={(e) => onSearchChange?.('checkOut', e.target.value)}
            />
          </label>
          <label className="search-field guests-field">
            <span className="field-label">Who</span>
            <input
              type="number"
              min="1"
              max="16"
              placeholder="Add guests"
              value={searchValues?.guests ?? '2'}
              onChange={(e) => onSearchChange?.('guests', e.target.value)}
            />
          </label>
          <button type="submit" className="search-button" aria-label="Search stays">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="5.5" />
              <path d="M16 16l4.5 4.5" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  )
}

export default Nav
