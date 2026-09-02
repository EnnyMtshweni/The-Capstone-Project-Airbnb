import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency, searchListings } from '../Lib/api'

// ── SA province + destination data ──────────────────────────────────────────
const SA_PROVINCES = [
  { id: '',              label: 'All SA'          },
  { id: 'Cape Town',     label: 'Western Cape'    },
  { id: 'Sandton',       label: 'Gauteng'         },
  { id: 'Umhlanga',      label: 'KwaZulu-Natal'   },
  { id: 'Hoedspruit',    label: 'Limpopo'         },
  { id: 'Graskop',       label: 'Mpumalanga'      },
  { id: 'Addo',          label: 'Eastern Cape'    },
  { id: 'Clarens',       label: 'Free State'      },
  { id: 'Sun City',      label: 'North West'      },
  { id: 'Springbok',     label: 'Northern Cape'   },
]

const DESTINATIONS = [
  { label: 'Cape Town',   subtitle: 'Western Cape',   query: 'Cape Town',   img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80' },
  { label: 'Johannesburg',subtitle: 'Gauteng',        query: 'Sandton',     img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=500&q=80' },
  { label: 'Kruger Park', subtitle: 'Limpopo',        query: 'Hoedspruit',  img: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=500&q=80' },
  { label: 'Durban',      subtitle: 'KwaZulu-Natal',  query: 'Umhlanga',    img: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=500&q=80' },
  { label: 'Garden Route',subtitle: 'Western Cape',   query: 'Knysna',      img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80' },
  { label: 'Drakensberg', subtitle: 'KwaZulu-Natal',  query: 'Drakensberg', img: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=500&q=80' },
  { label: 'Winelands',   subtitle: 'Western Cape',   query: 'Stellenbosch',img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=500&q=80' },
  { label: 'Panorama Rt', subtitle: 'Mpumalanga',     query: 'Graskop',     img: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=500&q=80' },
]

const EXPERIENCES = [
  { title: 'Safari & Wildlife', img: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=85', query: 'Hoedspruit' },
  { title: 'Beach & Coast',     img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85', query: 'Umhlanga'  },
]

const imgOf = (listing, i = 0) => {
  const imgs = listing?.images
  const src  = Array.isArray(imgs) ? imgs[0] : (typeof imgs === 'string' ? imgs.split(' ')[0] : '')
  return src || [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=85',
  ][i % 4]
}

function SkeletonGrid() {
  return (
    <div className="listings-skeleton">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-img" />
          <div className="skeleton-line wide" />
          <div className="skeleton-line narrow" />
        </div>
      ))}
    </div>
  )
}

function Home({ search, onSearchChange, triggerSearch }) {
  const [listings,   setListings]   = useState([])
  const [status,     setStatus]     = useState('loading')
  const [msg,        setMsg]        = useState('')
  const [province,   setProvince]   = useState('')
  const [saved,      setSaved]      = useState(() => {
    try { return JSON.parse(localStorage.getItem('saved') || '[]') } catch { return [] }
  })

  const runSearch = useCallback(async (cityOverride) => {
    setStatus('loading')
    const city = cityOverride !== undefined ? cityOverride : (province || search?.destination || '')
    const { data, demo } = await searchListings({
      city,
      guests:   search?.guests   || '',
      minPrice: search?.minPrice || '',
      maxPrice: search?.maxPrice || '',
    })
    setListings(data)
    setStatus('success')
    setMsg(
      data.length === 0
        ? 'No stays found — try a different search.'
        : `${data.length} stay${data.length !== 1 ? 's' : ''} found${demo ? ' (demo data)' : ' across South Africa'}`
    )
  }, [search, province])

  // Initial load
  useEffect(() => { runSearch('') }, [])  // eslint-disable-line

  // Nav search trigger
  useEffect(() => { if (triggerSearch > 0) runSearch() }, [triggerSearch])  // eslint-disable-line

  const filterByProvince = (city) => {
    setProvince(city)
    onSearchChange?.('destination', city)
    runSearch(city)
    document.getElementById('all-stays')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const filterByDest = (query) => {
    setProvince(query)
    onSearchChange?.('destination', query)
    runSearch(query)
    document.getElementById('all-stays')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const toggleSave = (e, id) => {
    e.preventDefault()
    setSaved(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem('saved', JSON.stringify(next))
      return next
    })
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero" aria-label="Hero">
        <div className="hero-image-wrap">
          <img src="https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1600&q=90" alt="South Africa landscape" className="hero-img" />
          <div className="hero-overlay" />
        </div>
        <div className="hero-copy container">
          <p className="hero-eyebrow">Discover South Africa</p>
          <h1>Find your perfect<br />South African stay</h1>
          <p className="hero-sub">From Cape Town's beaches to Kruger's bush — all 9 provinces, all in rands.</p>
          <button className="hero-cta" onClick={() => document.getElementById('all-stays')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore stays
          </button>
        </div>
      </section>

      {/* ── Province filter bar ────────────────────────────────────── */}
      <section className="province-bar" aria-label="Filter by province">
        <div className="container province-scroll">
          {SA_PROVINCES.map(p => (
            <button
              key={p.id}
              type="button"
              className={`province-chip${province === p.id ? ' active' : ''}`}
              onClick={() => filterByProvince(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Popular Destinations ───────────────────────────────────── */}
      <section className="container section" id="destinations" aria-label="Popular destinations">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">Inspiration for your next trip</p>
            <h2>Popular SA destinations</h2>
          </div>
          <button type="button" className="text-link" onClick={() => document.getElementById('all-stays')?.scrollIntoView({ behavior: 'smooth' })}>
            Show all <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="dest-grid">
          {DESTINATIONS.map(d => (
            <button key={d.label} type="button" className="dest-card" onClick={() => filterByDest(d.query)} aria-label={`Explore stays in ${d.label}`}>
              <div className="dest-img-wrap"><img src={d.img} alt={d.label} loading="lazy" /></div>
              <div className="dest-copy"><strong>{d.label}</strong><span>{d.subtitle}</span></div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Experiences ────────────────────────────────────────────── */}
      <section className="container section" id="experiences" aria-label="Experiences">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">Unique experiences</p>
            <h2>How do you want to explore?</h2>
          </div>
        </div>
        <div className="exp-grid">
          {EXPERIENCES.map(e => (
            <button key={e.title} type="button" className="exp-card" onClick={() => filterByDest(e.query)} aria-label={e.title}>
              <img src={e.img} alt={e.title} loading="lazy" />
              <div className="exp-copy">
                <h3>{e.title}</h3>
                <span className="exp-cta">Explore →</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Gift Cards ─────────────────────────────────────────────── */}
      <section className="container section" id="gifts" aria-label="Gift cards">
        <div className="gift-banner">
          <div className="gift-banner-copy">
            <p className="eyebrow">Airbnb gift cards</p>
            <h2>Give the gift of<br />South Africa</h2>
            <Link className="gift-btn" to="/host">Shop now</Link>
          </div>
          <div className="gift-banner-visual" aria-hidden="true">
            <div className="gc gc-back" /><div className="gc gc-mid" />
            <div className="gc gc-front"><span className="gc-logo">airbnb</span></div>
          </div>
        </div>
      </section>

      {/* ── Hosting CTA ────────────────────────────────────────────── */}
      <section className="hosting-banner" aria-label="Become a host">
        <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85" alt="Host your SA home" className="hosting-banner-img" />
        <div className="hosting-banner-overlay" />
        <div className="hosting-banner-copy container">
          <p className="eyebrow">Questions about hosting?</p>
          <h2>Airbnb your<br />South African home</h2>
          <p>Join thousands of South African hosts earning extra income by sharing their space.</p>
          <Link className="hosting-btn" to="/host">Learn more</Link>
        </div>
      </section>

      {/* ── Live Listings ──────────────────────────────────────────── */}
      <section className="container section" id="all-stays" aria-label="All stays">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">
              {province
                ? `Stays in ${SA_PROVINCES.find(p => p.id === province)?.label || province}`
                : 'Live stays'}
            </p>
            <h2>South African homes</h2>
          </div>
          {msg && <span className={`search-status-badge ${status}`}>{msg}</span>}
        </div>

        {status === 'loading' && <SkeletonGrid />}

        {status === 'success' && listings.length > 0 && (
          <div className="listing-grid">
            {listings.map((l, i) => {
              const id = l._id || l.id || String(i)
              const city = l.location?.city || l.location || 'South Africa'
              return (
                <Link key={id} className="listing-card" to={`/listing/${id}`} aria-label={l.title}>
                  <div className="listing-img" style={{ backgroundImage: `url(${imgOf(l, i)})` }} role="img" aria-label={l.title}>
                    <button className={`save-btn${saved.includes(id) ? ' saved' : ''}`} aria-label={saved.includes(id) ? 'Unsave' : 'Save'} onClick={e => toggleSave(e, id)}>
                      {saved.includes(id) ? '♥' : '♡'}
                    </button>
                    {l.bedrooms >= 4 && <span className="superhost-badge">Spacious</span>}
                  </div>
                  <div className="listing-meta">
                    <div className="listing-meta-left">
                      <h3>{l.title}</h3>
                      <p>{city}</p>
                      <p className="listing-meta-beds">{l.bedrooms} bed{l.bedrooms !== 1 ? 's' : ''} · {l.bathrooms} bath{l.bathrooms !== 1 ? 's' : ''} · up to {l.maxGuests} guests</p>
                    </div>
                    <div className="listing-meta-right">
                      <strong>{formatCurrency(l.pricePerNight)}</strong>
                      <small>/ night</small>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {status === 'success' && listings.length === 0 && (
          <div className="listing-empty-state">
            <p>No stays found for that search.</p>
            <button type="button" className="gift-btn" onClick={() => filterByProvince('')}>Show all stays</button>
          </div>
        )}
      </section>
    </>
  )
}

export default Home
