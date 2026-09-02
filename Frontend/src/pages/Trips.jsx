import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelBooking, formatCurrency, getMyBookings, getStoredUser, getToken } from '../Lib/api'

function Trips() {
  const [bookings, setBookings] = useState([])
  const [status,   setStatus]   = useState('loading')
  const [msg,      setMsg]      = useState('')
  const loggedIn = Boolean(getToken())
  const user     = getStoredUser()

  const load = async () => {
    setStatus('loading')
    const { data, demo } = await getMyBookings()
    setBookings(data)
    setStatus('success')
    if (demo) setMsg('Showing demo reservations — connect the backend to see real bookings.')
  }

  useEffect(() => { if (loggedIn) load() }, [loggedIn])  // eslint-disable-line

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return
    setBookings(prev => prev.map(b => b._id === id || b.id === id ? { ...b, status: 'cancelling…' } : b))
    const { data } = await cancelBooking(id)
    setBookings(prev => prev.map(b =>
      b._id === id || b.id === id ? { ...b, status: data?.status || 'cancelled' } : b
    ))
  }

  if (!loggedIn) return (
    <section className="section container">
      <div className="section-heading">
        <div><p className="eyebrow dark">Your account</p><h2>My Trips</h2></div>
      </div>
      <p className="listing-empty">
        Please <button className="text-link" style={{ verticalAlign: 'baseline' }} onClick={() => window.dispatchEvent(new CustomEvent('open-login'))}>log in</button> to see your reservations.
      </p>
    </section>
  )

  return (
    <section className="section container" style={{ paddingBottom: 80 }}>
      <div className="section-heading">
        <div>
          <p className="eyebrow dark">{user?.name ? `Welcome back, ${user.name}` : 'Your account'}</p>
          <h2>My Trips</h2>
        </div>
      </div>

      {msg && <p className="search-message success" style={{ marginBottom: 20 }}>{msg}</p>}

      {status === 'loading' && (
        <div className="listings-skeleton" style={{ gridTemplateColumns: '1fr' }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton-card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div className="skeleton-img" style={{ width: 80, height: 60, flexShrink: 0, borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton-line wide" style={{ height: 14, marginBottom: 8, borderRadius: 4 }} />
                <div className="skeleton-line narrow" style={{ height: 11, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === 'success' && bookings.length === 0 && (
        <div className="listing-empty-state">
          <p>No trips booked yet.</p>
          <Link className="gift-btn" to="/">Start exploring South Africa →</Link>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="trips-list">
          {bookings.map(b => {
            const accTitle  = b.accommodation?.title    || b.property || 'Stay'
            const accCity   = b.accommodation?.location?.city || b.accommodation?.location || ''
            const accImg    = Array.isArray(b.accommodation?.images) ? b.accommodation.images[0]
                              : typeof b.accommodation?.images === 'string' ? b.accommodation.images.split(' ')[0] : ''
            const checkIn   = b.checkIn  || b.check_in  || '—'
            const checkOut  = b.checkOut || b.check_out || '—'
            const isCancelled = b.status === 'cancelled' || b.status === 'cancelling…'
            return (
              <article key={b._id || b.id} className={`trip-item${isCancelled ? ' cancelled' : ''}`}>
                {accImg && (
                  <div className="trip-item-img" style={{ backgroundImage: `url(${accImg})` }} role="img" aria-label={accTitle} />
                )}
                <div className="trip-item-body">
                  <h3>{accTitle}</h3>
                  {accCity && <p className="trip-item-loc">📍 {accCity}, South Africa</p>}
                  <p className="trip-item-dates">
                    {new Date(checkIn).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' → '}
                    {new Date(checkOut).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{b.numGuests || b.guests || 1} guest{(b.numGuests || 1) !== 1 ? 's' : ''}
                  </p>
                  {b.totalPrice > 0 && (
                    <p className="trip-item-price">Total: {formatCurrency(b.totalPrice)}</p>
                  )}
                  <span className={`trip-status trip-status-${b.status?.replace(/[^a-z]/g, '') || 'pending'}`}>
                    {b.status || 'pending'}
                  </span>
                </div>
                <div className="trip-item-actions">
                  {!isCancelled && (
                    <button
                      className="table-action-button"
                      onClick={() => handleCancel(b._id || b.id)}
                      disabled={b.status === 'cancelling…'}
                    >
                      {b.status === 'cancelling…' ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Trips
