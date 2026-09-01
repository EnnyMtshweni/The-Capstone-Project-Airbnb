import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyBookings, cancelBooking, getToken, getStoredUser } from '../Lib/api'

function Trips() {
  const [bookings, setBookings] = useState([])
  const [state, setState] = useState({ status: 'loading', message: '' })
  const loggedIn = Boolean(getToken())
  const user = getStoredUser()

  const load = async () => {
    setState({ status: 'loading', message: '' })
    const { data, demo } = await getMyBookings()
    setBookings(data)
    setState({ status: 'success', message: demo ? 'Showing sample reservations — backend not connected yet.' : '' })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCancel = async (id) => {
    setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status: 'cancelling…' } : booking)))
    const { data } = await cancelBooking(id)
    setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status: data.status || 'cancelled' } : booking)))
  }

  if (!loggedIn) {
    return (
      <section className="section container">
        <div className="section-heading"><div><p className="eyebrow dark">Your account</p><h2>Trips</h2></div></div>
        <p className="listing-empty">Log in to see your reservations. Use the profile button in the top-right corner.</p>
      </section>
    )
  }

  return (
    <section className="section container">
      <div className="section-heading">
        <div><p className="eyebrow dark">{user?.name ? `Welcome back, ${user.name}` : 'Your account'}</p><h2>My Reservations</h2></div>
      </div>

      {state.message && <p className="search-message success listing-demo-note">{state.message}</p>}

      {state.status === 'loading' && <p className="listing-empty">Loading your trips…</p>}

      {state.status === 'success' && bookings.length === 0 && (
        <p className="listing-empty">No trips booked yet — when you do, they'll show up here. <Link className="text-link" to="/">Start exploring <span>→</span></Link></p>
      )}

      {bookings.length > 0 && (
        <table className="reservations-table">
          <thead>
            <tr>
              <th>Booked by</th>
              <th>Property</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.guest_name || user?.name || '—'}</td>
                <td>{booking.property || booking.listing_title || 'Stay'}</td>
                <td>{booking.check_in}</td>
                <td>{booking.check_out}</td>
                <td>{booking.status}</td>
                <td>
                  <button className="table-action-button" onClick={() => handleCancel(booking.id)} disabled={String(booking.status).startsWith('cancel')}>
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default Trips