/**
 * AdminReservations.jsx
 * Route: /admin/reservations
 * Full reservations table with guest, property, dates, total, status and
 * inline status-change dropdown + cancel action.
 */
import { useEffect, useState } from 'react'
import {
  adminGetAllReservations,
  adminUpdateReservationStatus,
  formatCurrency,
} from '../Lib/api'

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled']

const fmtDate = d =>
  d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

function AdminReservations() {
  const [reservations, setReservations] = useState([])
  const [status,       setStatus]       = useState('loading')
  const [filter,       setFilter]       = useState('all')
  const [search,       setSearch]       = useState('')

  useEffect(() => {
    adminGetAllReservations().then(({ data }) => {
      setReservations(data)
      setStatus('ready')
    })
  }, [])

  const handleStatusChange = async (id, newStatus) => {
    setReservations(prev =>
      prev.map(r => r._id === id ? { ...r, _updating: true } : r)
    )
    const { data } = await adminUpdateReservationStatus(id, newStatus)
    setReservations(prev =>
      prev.map(r => r._id === id ? { ...r, status: data?.status || newStatus, _updating: false } : r)
    )
  }

  const filtered = reservations.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        r.guest?.name?.toLowerCase().includes(q) ||
        r.accommodation?.title?.toLowerCase().includes(q) ||
        r.accommodation?.location?.city?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const counts = reservations.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1>Reservations</h1>
          <p className="adm-page-sub">{reservations.length} total reservations</p>
        </div>
      </div>

      {/* ── Filter tabs ───────────────────── */}
      <div className="adm-filter-tabs">
        {['all', ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            className={`adm-filter-tab${filter === s ? ' adm-filter-tab--active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="adm-filter-count">
              {s === 'all' ? reservations.length : (counts[s] || 0)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search ───────────────────────── */}
      <div className="adm-search-bar">
        <input
          type="search"
          placeholder="Search guest or property…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="adm-search-input"
        />
      </div>

      {status === 'loading' && <p className="adm-loading">Loading reservations…</p>}

      {status === 'ready' && filtered.length === 0 && (
        <div className="adm-empty">
          <p>No reservations {filter !== 'all' ? `with status "${filter}"` : ''} found.</p>
        </div>
      )}

      {status === 'ready' && filtered.length > 0 && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Email</th>
                <th>Property</th>
                <th>City</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Nights</th>
                <th>Guests</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const nights = r.checkIn && r.checkOut
                  ? Math.round((new Date(r.checkOut) - new Date(r.checkIn)) / 86400000)
                  : '—'
                return (
                  <tr key={r._id} style={{ opacity: r._updating ? 0.5 : 1 }}>
                    <td className="adm-table-name">{r.guest?.name || '—'}</td>
                    <td>{r.guest?.email || '—'}</td>
                    <td className="adm-table-title">{r.accommodation?.title || '—'}</td>
                    <td>{r.accommodation?.location?.city || '—'}</td>
                    <td>{fmtDate(r.checkIn)}</td>
                    <td>{fmtDate(r.checkOut)}</td>
                    <td>{nights}</td>
                    <td>{r.numGuests ?? '—'}</td>
                    <td className="adm-table-price">{formatCurrency(r.totalPrice)}</td>
                    <td>
                      <span className={`adm-badge adm-badge--${r.status}`}>{r.status}</span>
                    </td>
                    <td>
                      <div className="adm-action-group">
                        <select
                          className="adm-status-select"
                          value={r.status}
                          disabled={r._updating}
                          onChange={e => handleStatusChange(r._id, e.target.value)}
                          aria-label="Change status"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        {r.status !== 'cancelled' && (
                          <button
                            className="adm-action-btn adm-action-btn--danger"
                            disabled={r._updating}
                            onClick={() => handleStatusChange(r._id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminReservations
