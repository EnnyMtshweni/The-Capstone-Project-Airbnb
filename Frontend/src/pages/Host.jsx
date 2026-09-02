import { useEffect, useState } from 'react'
import { createListing, deleteListing, formatCurrency, getMyListings, getToken } from '../Lib/api'

const SA_CITIES = ['Cape Town','Stellenbosch','Knysna','Sandton','Pretoria','Soweto','Umhlanga','Drakensberg','St Lucia','Hoedspruit','Tzaneen','Graskop','White River','Addo','Port Elizabeth','Clarens','Sun City','Springbok']

const EMPTY = {
  title: '', type: 'Entire home', bedrooms: '1', bathrooms: '1',
  pricePerNight: '', maxGuests: '2', description: '', amenities: '',
  address: '', city: 'Cape Town', country: 'South Africa', image_url: '',
}

function Host() {
  const [listings,   setListings]   = useState([])
  const [loadState,  setLoadState]  = useState('loading')
  const [demoNote,   setDemoNote]   = useState('')
  const [form,       setForm]       = useState(EMPTY)
  const [formState,  setFormState]  = useState({ status: 'idle', msg: '' })
  const [showForm,   setShowForm]   = useState(false)
  const loggedIn = Boolean(getToken())

  const load = async () => {
    setLoadState('loading')
    const { data, demo } = await getMyListings()
    setListings(data)
    setLoadState('success')
    if (demo) setDemoNote('Showing sample listings — log in as a host to manage real ones.')
  }

  useEffect(() => { if (loggedIn) load() }, [loggedIn])  // eslint-disable-line

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title || !form.pricePerNight || !form.city) {
      setFormState({ status: 'error', msg: 'Title, city and nightly price are required.' }); return
    }
    setFormState({ status: 'loading', msg: '' })
    const { data, demo } = await createListing({
      title:          form.title,
      description:    form.description || `${form.type} in ${form.city}`,
      pricePerNight:  Number(form.pricePerNight),
      maxGuests:      Number(form.maxGuests) || 2,
      bedrooms:       Number(form.bedrooms)  || 1,
      bathrooms:      Number(form.bathrooms) || 1,
      location: {
        address: form.address || form.city,
        city:    form.city,
        country: 'South Africa',
      },
      images:    form.image_url ? [form.image_url] : [],
      amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean),
    })
    setFormState({ status: 'success', msg: demo ? `Saved locally (demo) as ${data._id || data.id}` : `Listing "${data.title}" created!` })
    setListings(prev => [data, ...prev])
    setForm(EMPTY)
    setShowForm(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this listing?')) return
    setListings(prev => prev.map(l => (l._id === id || l.id === id) ? { ...l, _deleting: true } : l))
    await deleteListing(id)
    setListings(prev => prev.filter(l => l._id !== id && l.id !== id))
  }

  if (!loggedIn) return (
    <section className="section container">
      <div className="section-heading"><div><p className="eyebrow dark">Host on Airbnb SA</p><h2>Airbnb your SA home</h2></div></div>
      <p className="listing-empty">Please log in (as a host) to manage listings.</p>
    </section>
  )

  return (
    <section className="section container host-page">
      <div className="section-heading">
        <div><p className="eyebrow dark">Host on Airbnb SA</p><h2>Your listings</h2></div>
        <button className="gift-btn" type="button" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ New listing'}
        </button>
      </div>

      {demoNote && <p className="search-message success" style={{ marginBottom: 16 }}>{demoNote}</p>}
      {loadState === 'loading' && <p className="listing-empty">Loading your listings…</p>}
      {loadState === 'success' && listings.length === 0 && !showForm && (
        <p className="listing-empty">No listings yet — create your first South African listing below.</p>
      )}

      {/* Listings table */}
      {listings.length > 0 && (
        <table className="reservations-table">
          <thead>
            <tr><th>Property</th><th>City</th><th>Beds</th><th>Price/night</th><th>Max guests</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {listings.map(l => {
              const id   = l._id || l.id
              const city = l.location?.city || l.location || '—'
              return (
                <tr key={id} style={{ opacity: l._deleting ? 0.4 : 1 }}>
                  <td><strong>{l.title}</strong></td>
                  <td>{city}</td>
                  <td>{l.bedrooms || '—'}</td>
                  <td>{formatCurrency(l.pricePerNight || l.price_per_night)}</td>
                  <td>{l.maxGuests || '—'}</td>
                  <td>
                    <button className="table-action-button" onClick={() => handleDelete(id)} disabled={l._deleting}>
                      {l._deleting ? 'Removing…' : 'Remove'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {/* Create listing form */}
      {showForm && (
        <div className="create-listing-card">
          <h3>New South African Listing</h3>
          {formState.msg && <p className={`login-message ${formState.status}`}>{formState.msg}</p>}
          <form className="create-listing-form" onSubmit={handleCreate}>
            <div className="create-listing-row">
              <label className="search-field"><span className="field-label">Listing name *</span>
                <input value={form.title} onChange={set('title')} placeholder="e.g. Clifton Beachfront Villa" />
              </label>
              <label className="search-field"><span className="field-label">Property type</span>
                <select value={form.type} onChange={set('type')}>
                  {['Entire home','Private room','Shared room','Guest cottage','Game lodge','Beach house','Farm stay'].map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
            </div>
            <div className="create-listing-row">
              <label className="search-field"><span className="field-label">City *</span>
                <select value={form.city} onChange={set('city')}>
                  {SA_CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="search-field"><span className="field-label">Street address</span>
                <input value={form.address} onChange={set('address')} placeholder="14 Nettleton Road" />
              </label>
            </div>
            <div className="create-listing-row">
              <label className="search-field"><span className="field-label">Bedrooms</span>
                <input type="number" min="1" max="20" value={form.bedrooms} onChange={set('bedrooms')} />
              </label>
              <label className="search-field"><span className="field-label">Bathrooms</span>
                <input type="number" min="1" max="20" value={form.bathrooms} onChange={set('bathrooms')} />
              </label>
              <label className="search-field"><span className="field-label">Max guests</span>
                <input type="number" min="1" max="30" value={form.maxGuests} onChange={set('maxGuests')} />
              </label>
              <label className="search-field"><span className="field-label">Price / night (ZAR) *</span>
                <input type="number" min="0" value={form.pricePerNight} onChange={set('pricePerNight')} placeholder="1200" />
              </label>
            </div>
            <label className="search-field"><span className="field-label">Description</span>
              <input value={form.description} onChange={set('description')} placeholder="What makes this place special?" />
            </label>
            <label className="search-field"><span className="field-label">Amenities (comma separated)</span>
              <input value={form.amenities} onChange={set('amenities')} placeholder="WiFi, Pool, Braai, Kitchen" />
            </label>
            <label className="search-field"><span className="field-label">Image URL</span>
              <input value={form.image_url} onChange={set('image_url')} placeholder="https://images.unsplash.com/…" />
            </label>
            <div className="create-listing-actions">
              <button className="login-submit create-button" type="submit" disabled={formState.status === 'loading'}>
                {formState.status === 'loading' ? 'Creating…' : 'Create listing'}
              </button>
              <button className="cancel-button" type="button" onClick={() => { setForm(EMPTY); setShowForm(false) }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default Host
