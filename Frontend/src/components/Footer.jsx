import { Link } from 'react-router-dom'
import AirbnbLogo from './AirbnbLogo'

const footerColumns = [
  {
    title: 'Support',
    links: [
      { label: 'Help Centre',           to: '/' },
      { label: 'AirCover',              to: '/' },
      { label: 'Anti-discrimination',   to: '/' },
      { label: 'Disability support',    to: '/' },
      { label: 'Cancellation options',  to: '/' },
      { label: 'Report a concern',      to: '/' },
    ],
  },
  {
    title: 'Hosting',
    links: [
      { label: 'Airbnb your home',      to: '/host' },
      { label: 'AirCover for Hosts',    to: '/host' },
      { label: 'Hosting resources',     to: '/host' },
      { label: 'Community forum',       to: '/' },
      { label: 'Hosting responsibly',   to: '/' },
      { label: 'Join a free class',     to: '/' },
    ],
  },
  {
    title: 'Airbnb',
    links: [
      { label: 'Newsroom',              to: '/' },
      { label: 'New features',          to: '/' },
      { label: 'Careers',               to: '/' },
      { label: 'Investors',             to: '/' },
      { label: 'Gift cards',            to: '/' },
      { label: 'Airbnb.org',            to: '/' },
    ],
  },
  {
    title: 'Destinations',
    links: [
      { label: 'Cape Town',             to: '/' },
      { label: 'Johannesburg',          to: '/' },
      { label: 'Durban',                to: '/' },
      { label: 'Garden Route',          to: '/' },
      { label: 'Kruger National Park',  to: '/' },
      { label: 'Stellenbosch',          to: '/' },
    ],
  },
]

function Footer() {
  return (
    <footer className="airbnb-footer">
      <div className="container footer-shell">
        <div className="footer-brand-row">
          <Link className="brand airbnb-brand" to="/" aria-label="Airbnb home">
            <AirbnbLogo />
            <span>airbnb</span>
          </Link>
        </div>

        <div className="footer-columns">
          {footerColumns.map((col) => (
            <div key={col.title} className="footer-column">
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container footer-bottom">
        <p style={{ margin: 0 }}>© 2026 Airbnb, Inc. · South Africa</p>
        <nav className="footer-meta" aria-label="Footer links">
          <Link to="/">Privacy</Link>
          <Link to="/">Terms</Link>
          <Link to="/">Sitemap</Link>
          <Link to="/">Your Privacy Choices</Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
