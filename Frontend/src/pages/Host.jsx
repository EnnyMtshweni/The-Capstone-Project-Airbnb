import { useEffect, useState } from 'react'
import { getMyListings, createListing, deleteListing, formatCurrency, getToken } from '../Lib/api'

const emptyForm = { title: '', location: '', bedrooms: '1', baths: '1', type: 'Entire home', price_per_night: '', description: '', amenities: '', image_url: '' }

function Host() {
  const [listings, setListings] = useState([])
  const [state, setState] = useState({ status: 'loading', message: '' })
  const [form, setForm] = useState(emptyForm)
  const [formState, setFormState] = useState({ status: 'idle', message: '' })
  const loggedIn = Boolean(getToken())

  const load = async () => {
    setState({ status: 'loading', message: '' })
    const { data, demo } = await getMyListings()
    setListings(data)
    setState({ status: 'success', message: demo ? 'Showing sample listings — backend not connected yet.' : '' })
  }

  useEffect(() => {
    if (loggedIn) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn])

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!form.title || !form.location || !form.price_per_night) {
      setFormState({ status: 'error', message: 'Give the listing a name, location and nightly price.' })
      return
    }
    setFormState({ status: 'loading', message: '' })
    const { data, demo } = await createListing({
      ...form,
      price_per_night: Number(form.price_per_night),
      amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
    })
    setFormState({ status: 'success', message: demo ? `Saved locally as ${data.id} — connect the backend to publish it.` : 'Listing created.' })
    setListings((current) => [{ id: data.id, title: form.title, location: form.location, price_per_night: Number(form.price_per_night), status: data.status || 'live' }, ...current])
    setForm(emptyForm)
  }

  const handleDelete = async (id) => {
    setListings((current) => current.map((listing) => (listing.id === id ? { ...listing, status: 'removing…' } : listing)))
    await deleteListing(id)
    setListings((current) => current.filter((listing) => listing.id !== id))
  }

  if (!loggedIn) {
    return (
      <section className="section container">
        <div className="section-heading"><div><p className="eyebrow dark">Host on Airbnb</p><h2>Airbnb your home</h2></div></div>
        <p className="listing-empty">Log in first to manage listings and create new ones. Use the profile button in the top-right corner.</p>
      </section>
    )
  }

  return (
    <section className="section container host-page">
      <div className="section-heading"><div><p className="eyebrow dark">Host on Airbnb</p><h2>Your listings</h2></div></div>

      {state.message && <p className="search-message success listing-demo-note">{state.message}</p>}
      {state.status === 'loading' && <p className="listing-empty">Loading your listings…</p>}
      {state.status === 'success' && listings.length === 0 && <p className="listing-empty">You haven't listed a place yet — create your first one below.</p>}

      {listings.length > 0 && (
        <table className="reservations-table">
          <thead><tr><th>Property</th><th>Location</th><th>Price / night</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td>{listing.title}</td>
                <td>{listing.location}</td>
                <td>{formatCurrency(listing.price_per_night)}</td>
                <td>{listing.status}</td>
                <td><button className="table-action-button" onClick={() => handleDelete(listing.id)} disabled={String(listing.status).startsWith('remov')}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="create-listing-card">
        <h3>Create Listing</h3>
        <form className="create-listing-form" onSubmit={handleCreate}>
          <div className="create-listing-row">
            <label className="search-field"><span className="field-label">Listing name</span><input value={form.title} onChange={updateField('title')} placeholder="Sandton City Hotel" /></label>
            <label className="search-field"><span className="field-label">Type</span>
              <select value={form.type} onChange={updateField('type')}>
                <option>Entire home</option>
                <option>Private room</option>
                <option>Shared room</option>
              </select>
            </label>
          </div>
          <div className="create-listing-row">
            <label className="search-field"><span className="field-label">Rooms</span><input type="number" min="0" value={form.bedrooms} onChange={updateField('bedrooms')} /></label>
            <label className="search-field"><span className="field-label">Baths</span><input type="number" min="0" value={form.baths} onChange={updateField('baths')} /></label>
            <label className="search-field"><span className="field-label">Price / night (ZAR)</span><input type="number" min="0" value={form.price_per_night} onChange={updateField('price_per_night')} /></label>
          </div>
          <label className="search-field"><span className="field-label">Location</span><input value={form.location} onChange={updateField('location')} placeholder="Sandton, Johannesburg" /></label>
          <label className="search-field"><span className="field-label">Description</span><input value={form.description} onChange={updateField('description')} placeholder="What makes this place great?" /></label>
          <label className="search-field"><span className="field-label">Amenities (comma separated)</span><input value={form.amenities} onChange={updateField('amenities')} placeholder="Wifi, Kitchen, Pool" /></label>
          <label className="search-field"><span className="field-label">Image URL</span><input value={form.image_url} onChange={updateField('image_url')} placeholder="https://…" /></label>

          <div className="create-listing-actions">
            <button className="login-submit create-button" type="submit" disabled={formState.status === 'loading'}>{formState.status === 'loading' ? 'Creating…' : 'Create'}</button>
            <button className="cancel-button" type="button" onClick={() => setForm(emptyForm)}>Cancel</button>
          </div>
          {formState.message && <p className={`login-message ${formState.status}`}>{formState.message}</p>}
        </form>
      </div>
    </section>
  )
}

export default Host