/**
 * AdminDashboard.jsx
 * Route: /admin
 * Shows KPI stat cards and recent reservation activity feed.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminGetStats, formatCurrency } from '../Lib/api'

function StatCard({ icon, label, value, color, to }) {
  return (
    <Link to={to} className={`adm-stat-card adm-stat-card--${color}`}>
      <div className="adm-stat-icon" aria-hidden="true">{icon}</div>
      <div className="adm-stat-body">
        <span className="adm-stat-value">{value}</span>
        <span className="adm-stat-label">{label}</span>
      </div>
    </Link>
  )
}

const fmtDate = d => d
  ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—'

function AdminDashboard() {
  const [stats,  setStats]  = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    adminGetStats().then(({ data }) => {
      setStats(data)
      setStatus('ready')
    })
  }, [])

  const cards = stats
    ? [
        { icon: '🏠', label: 'Active Listings',   value: stats.totalListings,     color: 'blue',   to: '/admin/listings'     },
        { icon: '📅', label: 'Total Reservations', value: stats.totalReservations, color: 'green',  to: '/admin/reservations' },
        { icon: '👥', label: 'Registered Users',   value: stats.totalUsers,        color: 'purple', to: '/admin/users'        },
        { icon: '💰', label: 'Total Revenue (ZAR)',value: formatCurrency(stats.revenue), color: 'coral', to: '/admin/reservations' },
      ]
    : []

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <h1>Dashboard Overview</h1>
        <p className="adm-page-sub">Welcome back — here's what's happening on your platform.</p>
      </div>

      {/* ── Stats ─────────────────────────────────────── */}
      {status === 'loading' ? (
        <div className="adm-stat-grid">
          {[1,2,3,4].map(i => <div key={i} className="adm-stat-card adm-stat-card--skeleton" />)}
        </div>
      ) : (
        <div className="adm-stat-grid">
          {cards.map(c => <StatCard key={c.label} {...c} />)}
        </div>
      )}

      {/* ── Quick actions ─────────────────────────────── */}
      <div className="adm-quick-actions">
        <h2 className="adm-section-title">Quick Actions</h2>
        <div className="adm-quick-grid">
          <Link to="/admin/listings/new" className="adm-quick-btn adm-quick-btn--primary">
            + Add New Listing
          </Link>
          <Link to="/admin/listings" className="adm-quick-btn">
            Manage Listings
          </Link>
          <Link to="/admin/reservations" className="adm-quick-btn">
            View Reservations
          </Link>
          <Link to="/admin/users" className="adm-quick-btn">
            Manage Users
          </Link>
        </div>
      </div>

      {/* ── Recent reservations ───────────────────────── */}
      {stats?.recentReservations?.length > 0 && (
        <div className="adm-recent">
          <h2 className="adm-section-title">Recent Reservations</h2>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Property</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentReservations.map(r => (
                  <tr key={r._id}>
                    <td>{r.guest?.name || '—'}</td>
                    <td>{r.accommodation?.title || '—'}</td>
                    <td>{fmtDate(r.checkIn)}</td>
                    <td>{fmtDate(r.checkOut)}</td>
                    <td>{formatCurrency(r.totalPrice)}</td>
                    <td>
                      <span className={`adm-badge adm-badge--${r.status}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/admin/reservations" className="adm-view-all">
            View all reservations →
          </Link>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
