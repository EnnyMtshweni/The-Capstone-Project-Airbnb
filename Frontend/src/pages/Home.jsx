import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchListings, formatCurrency } from '../lib/api'

const heroImg = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1800&q=85'
const fallbackListingImages = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=85',
]

const listingImage = (listing, index = 0) => listing.image || listing.image_url || listing.images?.[0]?.url || listing.images?.[0] || fallbackListingImages[index % fallbackListingImages.length]

function Home() {
  const [search, setSearch] = useState({ destination: '', checkIn: '', checkOut: '', guests: '2' })
  const [searchState, setSearchState] = useState({ status: 'idle', message: '' })
  const [listings, setListings] = useState([])

  const updateSearch = (field) => (event) => setSearch((current) => ({ ...current, [field]: event.target.value }))

  const runSearch = async (query = search.destination || 'South Africa') => {
    setSearchState({ status: 'loading', message: '' })
    const { data, demo } = await searchListings({ query, checkIn: search.checkIn, checkOut: search.checkOut, adults: search.guests })
    setListings(data)
    setSearchState({ status: 'success', message: `${data.length} stays found${demo ? ' (sample data — backend not connected yet)' : ''}` })
  }

  const fetchListings = (event) => {
    event?.preventDefault()
    runSearch()
  }

  useEffect(() => {
    runSearch('South Africa')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <section className="hero container" id="top">
        <img src={heroImg} alt="Modern home surrounded by trees at sunset" />
        <div className="hero-overlay">
          <p className="eyebrow">South Africa, waiting for you</p>
          <h1>Find a place<br />to belong.</h1>
          <p className="hero-copy">Discover homes, stays and experiences hosted by people who know the best parts of South Africa.</p>
          <a className="light-button" href="#stays">Explore South Africa <span>↗</span></a>
        </div>
        <div className="hero-credit">A quiet place to land <span>01 / 04</span></div>
      </section>

      <form className="search-panel container" aria-label="Search for a stay" onSubmit={fetchListings}>
        <label className="search-field"><span className="field-label">Where</span><input value={search.destination} onChange={updateSearch('destination')} placeholder="Search South Africa" /></label>
        <label className="search-field"><span className="field-label">Check in</span><input type="date" value={search.checkIn} onChange={updateSearch('checkIn')} /></label>
        <label className="search-field"><span className="field-label">Check out</span><input type="date" value={search.checkOut} onChange={updateSearch('checkOut')} /></label>
        <label className="search-field guests"><span className="field-label">Guests</span><input type="number" min="1" max="16" value={search.guests} onChange={updateSearch('guests')} /></label>
        <button className="search-button" aria-label="Search stays" disabled={searchState.status === 'loading'}>⌕</button>
        {searchState.message && <p className={`search-message ${searchState.status}`}>{searchState.message}</p>}
      </form>

      <section className="section container" id="stays">
        <div className="section-heading"><div><p className="eyebrow dark">Explore South Africa</p><h2>Live like a local.</h2></div><a className="text-link" href="#all-stays">Show all homes <span>→</span></a></div>
        <div className="category-row" id="inspiration">
          {['All homes', 'Cape Town', 'Kruger', 'Garden Route', 'KwaZulu-Natal'].map((category, index) => <button className={index === 0 ? 'category active' : 'category'} key={category}>{category}</button>)}
        </div>
        {listings.length > 0 && <div className="listing-grid api-results">
          {listings.map((listing, index) => (
            <Link className="listing-card" to={`/listing/${listing.id || index}`} key={listing.id || listing.url || index}>
              <div className="listing-image api-image" style={{ backgroundImage: `url(${listingImage(listing, index)})` }}>
                <button aria-label={`Save ${listing.title || 'stay'}`} onClick={(event) => event.preventDefault()}>♡</button>
              </div>
              <div className="listing-meta">
                <div><h3>{listing.title || listing.name || 'Airbnb stay'}</h3><p>{listing.location?.name || listing.location || listing.city || 'South Africa'}</p></div>
                <strong>{formatCurrency(listing.price?.amount || listing.price_per_night?.amount || listing.price_per_night || listing.price)} <small>night</small></strong>
              </div>
            </Link>
          ))}
        </div>}
        {listings.length === 0 && searchState.status !== 'loading' && <p className="listing-empty">Search to see live Airbnb homes across South Africa, with every price shown in rands.</p>}
      </section>

      <section className="editorial container" id="hosting"><div><p className="eyebrow dark">Host on Airbnb</p><h2>Open your door to a world of travel.</h2><p>Share your space and earn while guests discover South Africa.</p><Link className="dark-button" to="/host">Learn about hosting <span>↗</span></Link></div><div className="editorial-mark">⌂</div></section>
    </>
  )
}

export default Home