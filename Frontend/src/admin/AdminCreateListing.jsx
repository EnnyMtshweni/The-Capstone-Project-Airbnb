/**
 * AdminCreateListing.jsx
 * Route: /admin/listings/new
 * Uses the shared AdminListingForm. On success redirects to /admin/listings.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createListing, getStoredUser } from '../Lib/api'
import AdminListingForm from './AdminListingForm'

function AdminCreateListing() {
  const navigate          = useNavigate()
  const user              = getStoredUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') navigate('/admin/listings', { replace: true })
  }, [user, navigate])

  if (user?.role !== 'admin') return null

  const handleSubmit = async data => {
    setIsLoading(true)
    setError('')
    try {
      const { data: created, demo } = await createListing(data)
      setSuccess(
        demo
          ? `Listing saved locally (demo mode). ID: ${created._id || created.id}`
          : `✅ Listing "${created.title}" created successfully!`
      )
      setTimeout(() => navigate('/admin/listings'), 1200)
    } catch (err) {
      setError(err.message || 'Failed to create listing.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <Link to="/admin/listings" className="adm-back-link">← Back to Listings</Link>
          <h1>Create New Listing</h1>
          <p className="adm-page-sub">Add a new South African property to the platform.</p>
        </div>
      </div>

      {error   && <p className="adm-alert adm-alert--error"   role="alert">{error}</p>}
      {success && <p className="adm-alert adm-alert--success" role="status">{success}</p>}

      <AdminListingForm
        onSubmit={handleSubmit}
        submitLabel="Create Listing"
        isLoading={isLoading}
      />
    </div>
  )
}

export default AdminCreateListing
