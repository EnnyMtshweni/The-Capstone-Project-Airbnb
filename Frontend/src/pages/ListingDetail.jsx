import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getListing, createBooking, formatCurrency, getToken } from '../Lib/api'

const nightsBetween = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0
  const ms = new Date(checkOut) - new Date(checkIn)
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)))
}

function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loadState, setLoadState] = useState({ status: 'loading', message: '' })
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' })
  const [guests, setGuests] = useState(2)
  const [bookingState, setBookingState] = useState({ status: 'idle', message: '' })

  useEffect(() => {
    let cancelled = false
    setListing(null)
    setLoadState((current) => (current.status === 'loading' ? current : { status: 'loading', message: '' }))
    getListing(id).then(({ data, demo }) => {
      if (cancelled) return
      setListing(data)
      setLoadState({ status: 'success', message: demo ? 'Showing sample data — backend not connected yet.' : '' })
    })
    return () => { cancelled = true }
  }, [id])

  const nights = useMemo(() => nightsBetween(dates.checkIn, dates.checkOut), [dates])
  const currency = listing?.currency || 'ZAR'
  const nightlyRate = Number(listing?.price_per_night?.amount ?? listing?.price_per_night ?? 0)
  const cleaningFee = listing ? Math.round(nightlyRate * 0.15) : 0
  const serviceFee = listing ? Math.round(nightlyRate * (nights || 1) * 0.08) : 0
  const total = nights ? nightlyRate * nights + cleaningFee + serviceFee : nightlyRate + cleaningFee

  const handleReserve = async (event) => {
    event.preventDefault()
    if (!getToken()) {
      setBookingState({ status: 'error', message: 'Log in first, then come back to reserve this stay.' })
      return
    }
    if (!dates.checkIn || !dates.checkOut) {
      setBookingState({ status: 'error', message: 'Choose your check-in and check-out dates.' })
      return
    }
    setBookingState({ status: 'loading', message: '' })
    const { data, demo } = await createBooking({
      listing_id: id,
      check_in: dates.checkIn,
      check_out: dates.checkOut,
      guests: Number(guests) || 1,
      currency,
    })
    setBookingState({
      status: 'success',
      message: demo ? `Reserved locally as ${data.id} — connect the backend to send this to tapline.sh.` : `Booked! Confirmation ${data.id}.`,
    })
  }

  if (loadState.status === 'loading') {
    return <section className="section container"><p className="listing-empty">Loading listing…</p></section>
  }

  if (!listing) {
    return (
      <section className="section container">
        <p className="listing-empty">We couldn't find that listing.</p>
        <button className="text-link" onClick={() => navigate('/')}>Back to search <span>→</span></button>
      </section>
    )
  }

  const images = listing.images?.length ? listing.images : [listing.image_url].filter(Boolean)

  return (
    <section className="section container listing-detail">
      <button className="text-link back-link" onClick={() => navigate(-1)}>← Back to search</button>

      <div className="listing-detail-heading">
        <h1 className="listing-detail-title">{listing.title}</h1>
        <p className="listing-detail-sub">
          {listing.rating ? `★ ${listing.rating}` : ''}{listing.review_count ? ` · ${listing.review_count} reviews` : ''}{listing.location ? ` · ${listing.location}` : ''}
        </p>
      </div>

      {loadState.message && <p className="search-message success listing-demo-note">{loadState.message}</p>}

      {images.length > 0 && (
        <div className="listing-gallery">
          {images.slice(0, 3).map((src, index) => (
            <div className="listing-gallery-image" key={index} style={{ backgroundImage: `url(${src})` }} />
          ))}
        </div>
      )}

      <div className="listing-detail-grid">
        <div className="listing-detail-main">
          <h2 className="listing-detail-hosted-by">Hosted by {listing.host?.name || 'your host'}</h2>
          <p className="listing-detail-facts">{listing.guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.baths} bath</p>

          <p className="listing-detail-description">{listing.description}</p>

          {listing.amenities?.length > 0 && (
            <div className="amenities-block">
              <h3>What this place offers</h3>
              <ul className="amenities-list">
                {listing.amenities.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}

          {listing.reviews?.length > 0 && (
            <div className="reviews-block">
              <h3>Reviews</h3>
              <div className="reviews-grid">
                {listing.reviews.map((review, index) => (
                  <div className="review-card" key={index}>
                    <p className="review-author">{review.name} <span>{review.date}</span></p>
                    <p className="review-body">{review.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {listing.host && (
            <div className="host-block">
              <h3>Hosted by {listing.host.name}</h3>
              <p>Joined {listing.host.joined}{listing.host.reviews ? ` · ${listing.host.reviews} reviews` : ''}{listing.host.superhost ? ' · Superhost' : ''}</p>
            </div>
          )}
        </div>

        <form className="booking-card" onSubmit={handleReserve}>
          <p className="booking-price"><strong>{formatCurrency(nightlyRate, currency)}</strong> / night</p>
          <div className="booking-dates">
            <label className="search-field"><span className="field-label">Check in</span><input type="date" value={dates.checkIn} onChange={(event) => setDates((d) => ({ ...d, checkIn: event.target.value }))} required /></label>
            <label className="search-field"><span className="field-label">Check out</span><input type="date" value={dates.checkOut} onChange={(event) => setDates((d) => ({ ...d, checkOut: event.target.value }))} required /></label>
          </div>
          <label className="search-field"><span className="field-label">Guests</span><input type="number" min="1" max={listing.guests || 16} value={guests} onChange={(event) => setGuests(event.target.value)} /></label>

          <button className="login-submit reserve-button" type="submit" disabled={bookingState.status === 'loading'}>
            {bookingState.status === 'loading' ? 'Reserving…' : 'Reserve'}
          </button>

          {bookingState.message && <p className={`login-message ${bookingState.status}`}>{bookingState.message}</p>}

          <div className="booking-breakdown">
            {nights > 0 && <div><span>{formatCurrency(nightlyRate, currency)} × {nights} nights</span><span>{formatCurrency(nightlyRate * nights, currency)}</span></div>}
            <div><span>Cleaning fee</span><span>{formatCurrency(cleaningFee, currency)}</span></div>
            <div><span>Service fee</span><span>{formatCurrency(serviceFee, currency)}</span></div>
            <div className="booking-total"><span>Total</span><span>{formatCurrency(total, currency)}</span></div>
          </div>
        </form>
      </div>
    </section>
  )
}

export default ListingDetail