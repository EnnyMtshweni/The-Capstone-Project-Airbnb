/**
 * AdminEditListing.jsx
 * Route: /admin/listings/:id/edit
 * Loads existing listing data, pre-fills AdminListingForm, saves changes via PUT.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminUpdateListing, getListing } from '../Lib/api'
import AdminListingForm from './AdminListingForm'

function AdminEditListing() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [listing,   setListing]   = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')

  // Load existing listing
  useEffect(() => {
    getListing(id).then(({ data }) => {
      setListing(data)
      setLoadState('ready')
    }).catch(err => {
      setError(err.message || 'Failed to load listing.')
      setLoadState('error')
    })
  }, [id])

  const handleSubmit = async data => {
    setIsLoading(true)
    setError('')
    setSuccess('')
    try {
      const { data: updated, demo } = await adminUpdateListing(id, data)
      setSuccess(
        demo
          ? 'Changes saved locally (demo mode).'
          : `✅ "${updated.title}" updated successfully!`
      )
      // Refresh local state so form reflects saved values
      setListing(updated)
      setTimeout(() => navigate('/admin/listings'), 1200)
    } catch (err) {
      setError(err.message || 'Failed to update listing.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <Link to="/admin/listings" className="adm-back-link">← Back to Listings</Link>
          <h1>Edit Listing</h1>
          {listing && (
            <p className="adm-page-sub">{listing.title} — {listing.location?.city}</p>
          )}
        </div>
      </div>

      {error   && <p className="adm-alert adm-alert--error"   role="alert">{error}</p>}
      {success && <p className="adm-alert adm-alert--success" role="status">{success}</p>}

      {loadState === 'loading' && <p className="adm-loading">Loading listing data…</p>}

      {loadState === 'ready' && listing && (
        <AdminListingForm
          initialValues={listing}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          isLoading={isLoading}
        />
      )}

      {loadState === 'error' && (
        <div className="adm-empty">
          <p>Could not load this listing.</p>
          <Link to="/admin/listings" className="adm-btn">Back to listings</Link>
        </div>
      )}
    </div>
  )
}

export default AdminEditListing
