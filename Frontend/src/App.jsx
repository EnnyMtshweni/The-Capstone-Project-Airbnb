import { useEffect, useState } from 'react'
import './App.css'

const heroImg = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1800&q=85'
const fallbackListingImages = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=85',
]

const formatRand = (listing) => {
  const rawPrice = listing.price?.amount || listing.price_per_night?.amount || listing.price_per_night || listing.price
  const amount = Number(String(rawPrice || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(amount) && amount > 0
    ? new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(amount)
    : 'Price on request'
}

const listingImage = (listing, index = 0) => listing.image || listing.image_url || listing.images?.[0]?.url || listing.images?.[0] || fallbackListingImages[index % fallbackListingImages.length]

const readApiResponse = async (response) => {
  const text = await response.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return { message: `The search service is unavailable (${response.status})` }
  }
}

function App() {
  const [search, setSearch] = useState({ destination: '', checkIn: '', checkOut: '', guests: '2' })
  const [searchState, setSearchState] = useState({ status: 'idle', message: '' })
  const [taplineListings, setTaplineListings] = useState([])
  const [loginOpen, setLoginOpen] = useState(false)
  const [login, setLogin] = useState({ email: '', password: '' })
  const [loginState, setLoginState] = useState({ status: 'idle', message: '' })

  const updateSearch = (field) => (event) => setSearch((current) => ({ ...current, [field]: event.target.value }))
  const updateLogin = (field) => (event) => setLogin((current) => ({ ...current, [field]: event.target.value }))

  const fetchListings = async (event) => {
    event?.preventDefault()
    setSearchState({ status: 'loading', message: '' })

    try {
      const response = await fetch('/api/tapline/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: search.destination || 'South Africa',
          check_in: search.checkIn || undefined,
          check_out: search.checkOut || undefined,
          adults: Number(search.guests) || 2,
          currency: 'ZAR',
        }),
      })
      const payload = await readApiResponse(response)
      if (!response.ok) throw new Error(payload.message || payload.detail || `Search service unavailable (${response.status})`)
      setTaplineListings(payload.data?.listings || [])
      setSearchState({ status: 'success', message: `${payload.data?.listings?.length || 0} stays found` })
    } catch (error) {
      setSearchState({ status: 'error', message: error.message })
    }
  }

  useEffect(() => {
    const loadListings = async () => {
      setSearchState({ status: 'loading', message: '' })

      try {
        const response = await fetch('/api/tapline/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'South Africa', adults: 2, currency: 'ZAR' }),
        })
        const payload = await readApiResponse(response)
        if (!response.ok) throw new Error(payload.message || payload.detail || `Search service unavailable (${response.status})`)
        setTaplineListings(payload.data?.listings || [])
        setSearchState({ status: 'success', message: `${payload.data?.listings?.length || 0} stays found` })
      } catch (error) {
        setSearchState({ status: 'error', message: error.message })
      }
    }

    loadListings()
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoginState({ status: 'loading', message: '' })

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      })
      const payload = await readApiResponse(response)
      if (!response.ok) throw new Error(payload.message || payload.detail || `Login service unavailable (${response.status})`)
      localStorage.setItem('token', payload.data.token)
      localStorage.setItem('user', JSON.stringify(payload.data))
      setLoginState({ status: 'success', message: `Welcome back, ${payload.data.name}` })
      setTimeout(() => setLoginOpen(false), 900)
    } catch (error) {
      setLoginState({ status: 'error', message: error.message })
    }
  }

  return (
    <main>
      <nav className="nav container" aria-label="Main navigation">
        <a className="brand airbnb-brand" href="#top" aria-label="Airbnb home"><span>⌂</span> airbnb</a>
        <div className="nav-links">
          <a className="nav-tab selected" href="#stays">Stays</a>
          <a className="nav-tab" href="#inspiration">Experiences</a>
          <a className="nav-tab" href="#hosting">Services</a>
        </div>
        <div className="nav-actions">
          <a className="host-link" href="#hosting">Airbnb your home</a>
          <button className="icon-button" aria-label="Change language">◎</button>
          <button className="profile-button" aria-label="Open login menu" onClick={() => setLoginOpen(true)}>☰ <span>●</span></button>
        </div>
      </nav>

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
        <button className="search-button" aria-label="Search stays">⌕</button>
        {searchState.message && <p className={`search-message ${searchState.status}`}>{searchState.message}</p>}
      </form>

      <section className="section container" id="stays">
        <div className="section-heading"><div><p className="eyebrow dark">Explore South Africa</p><h2>Live like a local.</h2></div><a className="text-link" href="#all-stays">Show all homes <span>→</span></a></div>
        <div className="category-row" id="inspiration">
          {['All homes', 'Cape Town', 'Kruger', 'Garden Route', 'KwaZulu-Natal'].map((category, index) => <button className={index === 0 ? 'category active' : 'category'} key={category}>{category}</button>)}
        </div>
        {taplineListings.length > 0 && <div className="listing-grid api-results">
          {taplineListings.map((listing, index) => <article className="listing-card" key={listing.id || listing.url || index}><div className="listing-image api-image" style={{ backgroundImage: `url(${listingImage(listing, index)})` }}><button aria-label={`Save ${listing.title || 'stay'}`}>♡</button></div><div className="listing-meta"><div><h3>{listing.title || listing.name || 'Airbnb stay'}</h3><p>{listing.location?.name || listing.location || listing.city || 'South Africa'}</p></div><strong>{formatRand(listing)} <small>night</small></strong></div></article>)}
        </div>}
        {taplineListings.length === 0 && <p className="listing-empty">Search to see live Airbnb homes across South Africa, with every price shown in rands.</p>}
      </section>

      <section className="editorial container" id="hosting"><div><p className="eyebrow dark">Host on Airbnb</p><h2>Open your door to a world of travel.</h2><p>Share your space and earn while guests discover South Africa.</p><a className="dark-button" href="#journal">Learn about hosting <span>↗</span></a></div><div className="editorial-mark">⌂</div></section>
      <footer className="footer container"><a className="brand airbnb-brand" href="#top"><span>⌂</span> airbnb</a><p>© Airbnb-style capstone project</p><span>South Africa · ZAR</span></footer>

      {loginOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setLoginOpen(false)}>
        <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <button className="modal-close" aria-label="Close login" onClick={() => setLoginOpen(false)}>×</button>
          <p className="eyebrow dark">Welcome back</p>
          <h2 id="login-title">Log in to Airbnb</h2>
          <p className="modal-copy">Book your next South African stay and keep your trips together.</p>
          <form onSubmit={handleLogin}>
            <label>Email<input type="email" value={login.email} onChange={updateLogin('email')} autoComplete="email" required /></label>
            <label>Password<input type="password" value={login.password} onChange={updateLogin('password')} autoComplete="current-password" required /></label>
            <button className="login-submit" type="submit" disabled={loginState.status === 'loading'}>{loginState.status === 'loading' ? 'Logging in...' : 'Log in'}</button>
          </form>
          {loginState.message && <p className={`login-message ${loginState.status}`}>{loginState.message}</p>}
          <p className="signup-note">New to Airbnb? <a href="#signup">Create an account</a></p>
        </div>
      </div>}
    </main>
  )
}

export default App
