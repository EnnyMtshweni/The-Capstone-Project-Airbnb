import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createBooking, formatCurrency, getListing, getStoredUser, getToken } from '../Lib/api'

const nights = (ci, co) => {
  if (!ci || !co) return 0
  return Math.max(0, Math.round((new Date(co) - new Date(ci)) / 86400000))
}

const imgList = (listing) => {
  const imgs = listing?.images
  if (Array.isArray(imgs) && imgs.length) return imgs
  if (typeof imgs === 'string') return imgs.split(' ').filter(Boolean)
  if (listing?.image_url) return [listing.image_url]
  return ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85']
}

const reviewsFor = listing => [
  { author: 'Thandi M.', date: 'August 2026', body: `Beautiful stay in ${listing?.location?.city || 'South Africa'} with everything we needed.`, rating: 5 },
  { author: 'Michael R.', date: 'July 2026', body: 'The home was clean, comfortable and exactly as shown in the photos.', rating: 5 },
  { author: 'Lerato K.', date: 'June 2026', body: 'Great location and a very helpful host. We would happily return.', rating: 4 },
  { author: 'James P.', date: 'May 2026', body: 'A relaxing base for exploring the area. Highly recommended.', rating: 5 },
]

function ListingDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [listing,    setListing]    = useState(null)
  const [loadState,  setLoadState]  = useState('loading')
  const [demoNote,   setDemoNote]   = useState('')
  const [dates,      setDates]      = useState({ checkIn: '', checkOut: '' })
  const [guests,     setGuests]     = useState(2)
  const [booking,    setBooking]    = useState({ status: 'idle', msg: '' })
  const [shareMsg,   setShareMsg]   = useState('')
  const [saved,      setSaved]      = useState(() => {
    try { return JSON.parse(localStorage.getItem('saved') || '[]') } catch { return [] }
  })
  const user = getStoredUser()
  const canReserve = !user || user.role === 'guest'

  useEffect(() => {
    let live = true
    setListing(null); setLoadState('loading')
    getListing(id).then(({ data, demo }) => {
      if (!live) return
      setListing(data)
      setLoadState('success')
      if (demo) setDemoNote('Showing sample data — backend not connected.')
    })
    return () => { live = false }
  }, [id])

  const n         = useMemo(() => nights(dates.checkIn, dates.checkOut), [dates])
  const price     = listing?.pricePerNight || listing?.price_per_night || 0
  const cleaning  = listing ? Math.round(price * 0.15) : 0
  const service   = listing ? Math.round(price * (n || 1) * 0.08) : 0
  const total     = n ? price * n + cleaning + service : price + cleaning

  const handleReserve = async (e) => {
    e.preventDefault()
    if (!getToken()) { setBooking({ status: 'error', msg: 'Please log in first to reserve this stay.' }); return }
    if (!dates.checkIn || !dates.checkOut) { setBooking({ status: 'error', msg: 'Choose your check-in and check-out dates.' }); return }
    setBooking({ status: 'loading', msg: '' })
    const { data, demo } = await createBooking({
      accommodationId: id,
      checkIn:  dates.checkIn,
      checkOut: dates.checkOut,
      numGuests: Number(guests) || 1,
    })
    setBooking({
      status: 'success',
      msg: demo
        ? `Booking saved locally (demo). ID: ${data._id || data.id}`
        : `🎉 Booked! Confirmation #${data._id || data.id}. Check My Trips for details.`,
    })
  }

  const handleShare = async () => {
    const shareData = { title: listing.title, text: `Check out ${listing.title}`, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(shareData)
      else await navigator.clipboard.writeText(window.location.href)
      setShareMsg('Link copied.')
    } catch (error) {
      if (error.name !== 'AbortError') setShareMsg('Unable to share this listing.')
    }
  }

  const toggleSave = () => {
    setSaved(current => {
      const next = current.includes(id) ? current.filter(value => value !== id) : [...current, id]
      localStorage.setItem('saved', JSON.stringify(next))
      return next
    })
  }

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [listing?.location?.address, listing?.location?.city, listing?.location?.country || 'South Africa'].filter(Boolean).join(', ')
  )}`

  if (loadState === 'loading') return (
    <section className="section container"><SkeletonDetail /></section>
  )
  if (!listing) return (
    <section className="section container">
      <p className="listing-empty">Listing not found.</p>
      <button className="text-link" onClick={() => navigate('/')}>← Back to search</button>
    </section>
  )

  const images   = imgList(listing)
  const city     = listing.location?.city || listing.location || 'South Africa'
  const country  = listing.location?.country || 'South Africa'
  const amenList = Array.isArray(listing.amenities) ? listing.amenities
                 : typeof listing.amenities === 'string' ? listing.amenities.split(' ').filter(Boolean) : []
  const hostName = listing.host?.name || 'your host'
  const reviews = reviewsFor(listing)

  return (
    <section className="section container listing-detail">
      <button className="text-link back-link" onClick={() => navigate(-1)}>← Back</button>

      <div className="listing-detail-heading">
        <h1 className="listing-detail-title">{listing.title}</h1>
        <div className="listing-detail-actions">
          <a className="listing-action" href={mapUrl} target="_blank" rel="noreferrer">Map</a>
          <button className="listing-action" type="button" onClick={handleShare}>Share</button>
          <button className={`listing-action save-action${saved.includes(id) ? ' saved' : ''}`} type="button" onClick={toggleSave}>
            {saved.includes(id) ? 'Saved' : 'Save'}
          </button>
        </div>
        <p className="listing-detail-sub">
          {city}, {country} ·{' '}
          {listing.maxGuests} guests · {listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''} · {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
        </p>
      </div>
      {shareMsg && <p className="search-message success listing-share-note">{shareMsg}</p>}

      {demoNote && <p className="search-message success listing-demo-note">{demoNote}</p>}

      {/* Gallery */}
      <div className="listing-gallery">
        {images.slice(0, 3).map((src, i) => (
          <div key={i} className="listing-gallery-image" style={{ backgroundImage: `url(${src})` }} role="img" aria-label={`Photo ${i + 1} of ${listing.title}`} />
        ))}
        {images.length === 1 && <div className="listing-gallery-image" style={{ backgroundImage: `url(${images[0]})` }} />}
        {images.length === 2 && <div className="listing-gallery-image" style={{ backgroundImage: `url(${images[1]})` }} />}
      </div>

      <div className="listing-detail-grid">
        {/* Main content */}
        <div className="listing-detail-main">
          <h2 className="listing-detail-hosted-by">Hosted by {hostName}</h2>
          <p className="listing-detail-facts">
            {listing.maxGuests} guests · {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''} · {listing.bathrooms} bathroom{listing.bathrooms !== 1 ? 's' : ''}
          </p>

          {listing.description && (
            <p className="listing-detail-description">{listing.description}</p>
          )}

          {amenList.length > 0 && (
            <div className="amenities-block">
              <h3>What this place offers</h3>
              <ul className="amenities-list">
                {amenList.map(a => <li key={a}>✓ {a}</li>)}
              </ul>
            </div>
          )}

          {/* SA location highlight */}
          <div className="location-block">
            <h3>Location</h3>
            <p>{listing.location?.address ? `${listing.location.address}, ` : ''}{city}, {country}</p>
            <p className="listing-detail-facts" style={{ marginTop: 6 }}>
              All prices in South African Rand (ZAR)
            </p>
          </div>

          <div className="reviews-block">
            <h3>Guest reviews <span className="review-summary">★ 4.8 · 24 reviews</span></h3>
            <div className="reviews-grid">
              {reviews.map(review => (
                <article key={`${review.author}-${review.date}`} className="review-item">
                  <p className="review-author">{review.author}<span>{review.date}</span></p>
                  <p className="review-stars" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                  <p className="review-body">{review.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Booking card */}
        {canReserve ? <form className="booking-card" onSubmit={handleReserve}>
          <p className="booking-price">
            <strong>{formatCurrency(price)}</strong> <span>/ night</span>
          </p>

          <div className="booking-dates">
            <label className="search-field">
              <span className="field-label">Check in</span>
              <input type="date" value={dates.checkIn} min={new Date().toISOString().split('T')[0]}
                onChange={e => setDates(d => ({ ...d, checkIn: e.target.value }))} required />
            </label>
            <label className="search-field">
              <span className="field-label">Check out</span>
              <input type="date" value={dates.checkOut} min={dates.checkIn || new Date().toISOString().split('T')[0]}
                onChange={e => setDates(d => ({ ...d, checkOut: e.target.value }))} required />
            </label>
          </div>

          <label className="search-field" style={{ borderRadius: 8, border: '1px solid var(--line)', margin: '0 0 12px' }}>
            <span className="field-label">Guests</span>
            <input type="number" min="1" max={listing.maxGuests || 16} value={guests}
              onChange={e => setGuests(e.target.value)} />
          </label>

          <button className="login-submit reserve-button" type="submit" disabled={booking.status === 'loading'}>
            {booking.status === 'loading' ? 'Reserving…' : 'Reserve'}
          </button>

          {booking.msg && (
            <p className={`login-message ${booking.status}`} role="alert">{booking.msg}</p>
          )}

          <div className="booking-breakdown">
            {n > 0 && (
              <div><span>{formatCurrency(price)} × {n} night{n !== 1 ? 's' : ''}</span><span>{formatCurrency(price * n)}</span></div>
            )}
            <div><span>Cleaning fee</span><span>{formatCurrency(cleaning)}</span></div>
            <div><span>Service fee</span><span>{formatCurrency(service)}</span></div>
            <div className="booking-total"><span>Total (ZAR)</span><span>{formatCurrency(total)}</span></div>
          </div>
        </form> : (
          <div className="booking-card">
            <p className="listing-detail-facts">Only guest accounts can reserve a stay.</p>
            <button className="text-link" type="button" onClick={handleShare}>Share listing</button>
          </div>
        )}
      </div>
    </section>
  )
}

function SkeletonDetail() {
  return (
    <div style={{ paddingBottom: 80 }}>
      <div className="skeleton-line wide" style={{ height: 32, marginBottom: 16, borderRadius: 8 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 32 }}>
        <div className="skeleton-img" style={{ borderRadius: 12, aspectRatio: '1' }} />
        <div className="skeleton-img" style={{ borderRadius: 12, aspectRatio: '1' }} />
        <div className="skeleton-img" style={{ borderRadius: 12, aspectRatio: '1' }} />
      </div>
      <div className="skeleton-line wide" style={{ height: 20, marginBottom: 10, borderRadius: 6 }} />
      <div className="skeleton-line narrow" style={{ height: 14, borderRadius: 6 }} />
    </div>
  )
}

export default ListingDetail
