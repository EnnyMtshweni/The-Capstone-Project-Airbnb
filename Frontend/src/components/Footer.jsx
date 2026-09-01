import { Link } from 'react-router-dom'

const footerColumns = [
  {
    title: 'Support',
    links: ['Help Centre', 'AirCover', 'Anti-discrimination', 'Disability support', 'Cancellation options'],
  },
  {
    title: 'Hosting',
    links: ['Airbnb your home', 'AirCover for Hosts', 'Hosting resources', 'Community forum'],
  },
  {
    title: 'Airbnb',
    links: ['Newsroom', 'New features', 'Careers', 'Investors', 'Gift cards'],
  },
]

function Footer() {
  return (
    <footer className="airbnb-footer">
      <div className="container footer-shell">
        <div className="footer-brand-row">
          <Link className="brand airbnb-brand" to="/" aria-label="Airbnb home">airbnb</Link>
        </div>

        <div className="footer-columns">
          {footerColumns.map((column) => (
            <div key={column.title} className="footer-column">
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link}><Link to="/">{link}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© 2026 Airbnb, Inc.</p>
        <div className="footer-meta">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Sitemap</span>
          <span>South Africa</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer