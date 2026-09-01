import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchListings, formatCurrency } from '../Lib/api'

const fallbackListingImages = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=85',
]

const inspirationLocations = [
  { title: 'Cape Town', caption: 'Coastal escapes', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85' },
  { title: 'Kruger National Park', caption: 'Wild safari days', image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=85' },
  { title: 'Garden Route', caption: 'Forest and coastline', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=85' },
  { title: 'Durban', caption: 'Sun, surf and spice', image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=85' },
]

const tripCards = [
  { title: 'Things to do on a trip', text: 'Plan adventures, tasting tours, and coastal drives across South Africa.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85' },
  { title: 'Things to do at home', text: 'Bring the travel mood home with cozy hosting, slow mornings, and local rituals.', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=85' },
]

const listingImage = (listing, index = 0) => listing.image || listing.image_url || listing.images?.[0]?.url || listing.images?.[0] || fallbackListingImages[index % fallbackListingImages.length]

function Home() {
  const [search, setSearch] = useState({ destination: 'South Africa', checkIn: '', checkOut: '', guests: '2' })
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
      <section className="landing-hero container">
        <div className="hero-card">
          <div className="hero-copy-block">
            <p className="eyebrow dark">South Africa stays</p>
            <h1>Find a place<br />to feel at home.</h1>
            <p className="hero-copy">From beach escapes to safari breaks, discover thoughtful stays in the country’s most loved destinations.</p>
            <Link className="light-button" to="#all-stays">Explore stays</Link>
          </div>
          <div className="hero-visual" aria-label="Featured stay in South Africa">
            <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=85" alt="Beautiful modern home" />
          </div>
        </div>
      </section>

      <section className="container section" id="stay-search">
        <form className="search-panel alt-search" aria-label="Search for a stay" onSubmit={fetchListings}>
          <label className="search-field"><span className="field-label">Where</span><input value={search.destination} onChange={updateSearch('destination')} placeholder="Search South Africa" /></label>
          <label className="search-field"><span className="field-label">Check in</span><input type="date" value={search.checkIn} onChange={updateSearch('checkIn')} /></label>
          <label className="search-field"><span className="field-label">Check out</span><input type="date" value={search.checkOut} onChange={updateSearch('checkOut')} /></label>
          <label className="search-field guests"><span className="field-label">Who</span><input type="number" min="1" max="16" value={search.guests} onChange={updateSearch('guests')} /></label>
          <button className="search-button" aria-label="Search stays" disabled={searchState.status === 'loading'} type="submit">Search</button>
          {searchState.message && <p className={`search-message ${searchState.status}`}>{searchState.message}</p>}
        </form>
      </section>

      <section className="section container" id="inspiration">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">Inspiration for your next trip</p>
            <h2>Popular destinations</h2>
          </div>
          <Link className="text-link" to="#all-stays">Show all <span>→</span></Link>
        </div>

        <div className="inspiration-grid">
          {inspirationLocations.map((place) => (
            <article className="inspiration-card" key={place.title}>
              <img src={place.image} alt={place.title} />
              <div className="inspiration-copy">
                <h3>{place.title}</h3>
                <p>{place.caption}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section container" id="experiences">
        <div className="trip-grid">
          {tripCards.map((card) => (
            <article className="trip-card" key={card.title}>
              <img src={card.image} alt={card.title} />
              <div className="trip-copy">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <Link to="#all-stays">Explore</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container section gift-section" id="gifts">
        <div className="gift-card">
          <div className="gift-card-copy">
            <p className="eyebrow dark">Airbnb gift cards</p>
            <h2>Shop Airbnb gift cards</h2>
            <p>Give the gift of unforgettable stays.</p>
            <Link className="dark-button" to="#all-stays">Shop now</Link>
          </div>
          <div className="gift-visual" aria-hidden="true">
            <div className="gift-box">
              <span className="gift-band" />
            </div>
          </div>
        </div>
      </section>

      <section className="section container" id="all-stays">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">Live stays</p>
            <h2>Explore homes across South Africa</h2>
          </div>
        </div>

        {listings.length > 0 ? (
          <div className="listing-grid api-results">
            {listings.map((listing, index) => (
              <Link className="listing-card" to={`/listing/${listing.id || index}`} key={listing.id || listing.url || index}>
                <div className="listing-image api-image" style={{ backgroundImage: `url(${listingImage(listing, index)})` }}>
                  <button aria-label={`Save ${listing.title || 'stay'}`} onClick={(event) => event.preventDefault()}>♡</button>
                </div>
                <div className="listing-meta">
                  <div>
                    <h3>{listing.title || listing.name || 'Airbnb stay'}</h3>
                    <p>{listing.location?.name || listing.location || listing.city || 'South Africa'}</p>
                  </div>
                  <strong>{formatCurrency(listing.price?.amount || listing.price_per_night?.amount || listing.price_per_night || listing.price)} <small>night</small></strong>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="listing-empty">Search to see live Airbnb homes across South Africa, with every price shown in rands.</p>
        )}
      </section>
    </>
  )
}

export default Home