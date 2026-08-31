import { useState } from 'react'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [search, setSearch] = useState({ destination: '', checkIn: '', checkOut: '', guests: '2' })
  const [searchState, setSearchState] = useState({ status: 'idle', message: '' })
  const [taplineListings, setTaplineListings] = useState([])

  const updateSearch = (field) => (event) => setSearch((current) => ({ ...current, [field]: event.target.value }))

  const handleSearch = async (event) => {
    event.preventDefault()
    setSearchState({ status: 'loading', message: '' })

    try {
      const response = await fetch('/api/tapline/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
        },
        body: JSON.stringify({
          query: search.destination || undefined,
          check_in: search.checkIn || undefined,
          check_out: search.checkOut || undefined,
          adults: Number(search.guests) || 2,
          currency: 'ZAR',
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || 'Search could not be completed')
      setTaplineListings(payload.data?.listings || [])
      setSearchState({ status: 'success', message: `${payload.data?.listings?.length || 0} stays found` })
    } catch (error) {
      setSearchState({ status: 'error', message: error.message })
    }
  }

  return (
    <main>
      <nav className="nav container" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="staywell home"><span>✦</span> staywell</a>
        <div className="nav-links">
          <a href="#stays">Find a stay</a>
          <a href="#inspiration">Inspiration</a>
          <a href="#hosting">Host your home</a>
        </div>
        <div className="nav-actions">
          <button className="icon-button" aria-label="Change language">◎</button>
          <button className="profile-button" aria-label="Open profile menu">☰ <span>●</span></button>
        </div>
      </nav>

      <section className="hero container" id="top">
        <img src={heroImg} alt="Modern home surrounded by trees at sunset" />
        <div className="hero-overlay">
          <p className="eyebrow">Stay somewhere memorable</p>
          <h1>Make room<br />for the good stuff.</h1>
          <p className="hero-copy">Homes with a little more character, in places worth taking the long way to.</p>
          <a className="light-button" href="#stays">Explore stays <span>↗</span></a>
        </div>
        <div className="hero-credit">A quiet place to land <span>01 / 04</span></div>
      </section>

      <form className="search-panel container" aria-label="Search for a stay" onSubmit={handleSearch}>
        <label className="search-field"><span className="field-label">Where</span><input value={search.destination} onChange={updateSearch('destination')} placeholder="Search destinations" /></label>
        <label className="search-field"><span className="field-label">Check in</span><input type="date" value={search.checkIn} onChange={updateSearch('checkIn')} /></label>
        <label className="search-field"><span className="field-label">Check out</span><input type="date" value={search.checkOut} onChange={updateSearch('checkOut')} /></label>
        <label className="search-field guests"><span className="field-label">Guests</span><input type="number" min="1" max="16" value={search.guests} onChange={updateSearch('guests')} /></label>
        <button className="search-button" aria-label="Search stays">⌕</button>
        {searchState.message && <p className={`search-message ${searchState.status}`}>{searchState.message}</p>}
      </form>

      <section className="section container" id="stays">
        <div className="section-heading"><div><p className="eyebrow dark">Curated for you</p><h2>Places that feel like a find.</h2></div><a className="text-link" href="#all-stays">See all stays <span>→</span></a></div>
        <div className="category-row" id="inspiration">
          {['All stays', 'Coastal escapes', 'Cabin fever', 'City weekends', 'Slow mornings'].map((category, index) => <button className={index === 0 ? 'category active' : 'category'} key={category}>{category}</button>)}
        </div>
        {taplineListings.length > 0 && <div className="listing-grid api-results">
          {taplineListings.map((listing) => <article className="listing-card" key={listing.id || listing.url}><div className="listing-image api-image" style={{ backgroundImage: `url(${listing.image || listing.images?.[0] || heroImg})` }}><button aria-label={`Save ${listing.title || 'stay'}`}>♡</button></div><div className="listing-meta"><div><h3>{listing.title || listing.name || 'Airbnb stay'}</h3><p>{listing.location || listing.city || 'South Africa'}</p></div><strong>{listing.price || listing.price_per_night || 'Price on request'} <small>night</small></strong></div></article>)}
        </div>}
        <div className="listing-grid">
          <article className="listing-card"><div className="listing-image image-one"><span className="tag">Guest favourite</span><button aria-label="Save Modern retreat">♡</button></div><div className="listing-meta"><div><h3>Modern retreat in the treetops</h3><p>Hazyview, Mpumalanga</p></div><strong>R2,450 <small>night</small></strong></div></article>
          <article className="listing-card"><div className="listing-image image-two"><button aria-label="Save Beach house">♡</button></div><div className="listing-meta"><div><h3>Sun-washed beach house</h3><p>Saint Francis Bay, Eastern Cape</p></div><strong>R3,180 <small>night</small></strong></div></article>
          <article className="listing-card"><div className="listing-image image-three"><button aria-label="Save Farm stay">♡</button></div><div className="listing-meta"><div><h3>A slower kind of weekend</h3><p>Franschhoek, Western Cape</p></div><strong>R1,960 <small>night</small></strong></div></article>
        </div>
      </section>

      <section className="editorial container" id="hosting"><div><p className="eyebrow dark">The staywell edit</p><h2>More than four walls.</h2><p>Find the small details that turn a trip into a story you keep telling.</p><a className="dark-button" href="#journal">Read the journal <span>↗</span></a></div><div className="editorial-mark">✦</div></section>
      <footer className="footer container"><a className="brand" href="#top"><span>✦</span> staywell</a><p>Thoughtful stays, beautifully found.</p><span>© 2026 staywell</span></footer>
    </main>
  )
}

export default App
