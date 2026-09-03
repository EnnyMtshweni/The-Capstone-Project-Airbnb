/**
 * AdminListings.jsx
 * Route: /admin/listings
 * Full listings table: image, title, location, price/night, beds, status, Edit/Delete actions.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminDeleteListing, adminGetAllListings, formatCurrency, getMyListings, getStoredUser } from '../Lib/api'

const placeholder = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=120&q=70'

function AdminListings() {
  const [listings, setListings] = useState([])
  const [status,   setStatus]   = useState('loading')
  const [search,   setSearch]   = useState('')
  const [confirm,  setConfirm]  = useState(null) // id to confirm-delete

  useEffect(() => {
    const user = getStoredUser()
    const loadListings = user?.role === 'host' ? getMyListings : adminGetAllListings

    loadListings().then(({ data }) => {
      setListings(data)
      setStatus('ready')
    })
  }, [])

  const filtered = listings.filter(l =>
    !search ||
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.location?.city?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async id => {
    setListings(prev => prev.map(l => l._id === id || l.id === id ? { ...l, _deleting: true } : l))
    await adminDeleteListing(id)
    setListings(prev => prev.filter(l => l._id !== id && l.id !== id))
    setConfirm(null)
  }

  const imgSrc = l => {
    const imgs = l.images
    const s = Array.isArray(imgs) ? imgs[0] : typeof imgs === 'string' ? imgs.split(' ')[0] : ''
    return s || placeholder
  }

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1>Property Listings</h1>
          <p className="adm-page-sub">{listings.length} total listings in South Africa</p>
        </div>
        <Link to="/admin/listings/new" className="adm-btn adm-btn--primary">
          + Add Listing
        </Link>
      </div>

      {/* Search */}
      <div className="adm-search-bar">
        <input
          type="search"
          placeholder="Search by title or city…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="adm-search-input"
        />
        {search && (
          <span className="adm-search-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {status === 'loading' && <p className="adm-loading">Loading listings…</p>}

      {status === 'ready' && filtered.length === 0 && (
        <div className="adm-empty">
          <p>{search ? 'No listings match your search.' : 'No listings yet.'}</p>
          {!search && <Link to="/admin/listings/new" className="adm-btn adm-btn--primary">Create first listing</Link>}
        </div>
      )}

      {status === 'ready' && filtered.length > 0 && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 72 }}>Image</th>
                <th>Title</th>
                <th>City</th>
                <th>Price/night</th>
                <th>Beds</th>
                <th>Guests</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => {
                const id = l._id || l.id
                return (
                  <tr key={id} style={{ opacity: l._deleting ? 0.4 : 1 }}>
                    <td>
                      <img
                        src={imgSrc(l)}
                        alt={l.title}
                        className="adm-table-thumb"
                        onError={e => { e.target.src = placeholder }}
                      />
                    </td>
                    <td className="adm-table-title">{l.title}</td>
                    <td>{l.location?.city || '—'}</td>
                    <td className="adm-table-price">{formatCurrency(l.pricePerNight)}</td>
                    <td>{l.bedrooms ?? '—'}</td>
                    <td>{l.maxGuests ?? '—'}</td>
                    <td>
                      <span className={`adm-badge adm-badge--${l.isActive ? 'active' : 'inactive'}`}>
                        {l.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="adm-action-group">
                        <Link
                          to={`/admin/listings/${id}/edit`}
                          className="adm-action-btn adm-action-btn--edit"
                        >
                          Edit
                        </Link>
                        {confirm === id ? (
                          <>
                            <button
                              className="adm-action-btn adm-action-btn--danger"
                              onClick={() => handleDelete(id)}
                              disabled={l._deleting}
                            >
                              {l._deleting ? '…' : 'Confirm'}
                            </button>
                            <button
                              className="adm-action-btn"
                              onClick={() => setConfirm(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className="adm-action-btn adm-action-btn--delete"
                            onClick={() => setConfirm(id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminListings
