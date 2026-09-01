// Thin client around the /api/tapline/* and /api/auth/* proxy endpoints.
// The proxy (built separately) is expected to forward these to the tapline.sh Airbnb API,
// attaching whatever API key / auth the backend needs. Nothing here talks to tapline.sh directly.
//
// Every call degrades gracefully: if the backend isn't wired up yet (network error, 404, 501...)
// it falls back to local sample data so the UI stays fully clickable during frontend development.
// Swap DEMO_MODE handling out once the real backend is live, or just leave it — it only engages
// when a real call fails.

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const getToken = () => localStorage.getItem('token')
export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}
export const setSession = (data) => {
  if (data?.token) localStorage.setItem('token', data.token)
  if (data) localStorage.setItem('user', JSON.stringify(data))
}
export const clearSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

const authHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const readResponse = async (response) => {
  const text = await response.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return { message: `The service is unavailable (${response.status})` }
  }
}

async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  const response = await fetch(path, {
    method,
    headers: { ...JSON_HEADERS, ...(auth ? authHeaders() : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })
  const payload = await readResponse(response)
  if (!response.ok) {
    const message = payload.message || payload.detail || `Request failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    throw error
  }
  return payload.data ?? payload
}

// ---------- Demo fallbacks (used only when the real endpoint isn't reachable yet) ----------

const demoImages = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=85',
]

const demoListing = (id) => ({
  id,
  title: 'Bordeaux Getaway',
  location: 'Bordeaux, France',
  host: { name: 'Ghazal', joined: 'May 2019', reviews: 12, superhost: true },
  price_per_night: 79,
  currency: 'ZAR',
  rating: 4.8,
  review_count: 7,
  guests: 4,
  bedrooms: 2,
  beds: 3,
  baths: 1,
  images: demoImages,
  amenities: ['Garden view', 'Wifi', 'Free washer – in building', 'Central air conditioning', 'Kitchen', 'Pets allowed', 'Dryer', 'Security cameras on property'],
  description: 'A calm stay in the heart of Bordeaux, a short walk from the river and the old town\u2019s cafes and markets.',
  reviews: [
    { name: 'Jos\u00e9', date: 'November 2023', body: 'Great host, very attentive.' },
    { name: 'Shayna', date: 'November 2023', body: 'Wonderful neighborhood, easy access to restaurants and the subway.' },
  ],
})

const demoBookings = [
  { id: 'bk_1', guest_name: 'Johann Coetzee', property: 'Sandton City Hotel', check_in: '2024-06-19', check_out: '2024-06-24', status: 'confirmed' },
  { id: 'bk_2', guest_name: 'Asif Hassam', property: 'Woodmead City Hotel', check_in: '2024-06-18', check_out: '2024-06-19', status: 'confirmed' },
  { id: 'bk_3', guest_name: 'Kago Kola', property: 'Historic City Center Hotel', check_in: '2024-06-25', check_out: '2024-06-30', status: 'confirmed' },
]

const demoHostListings = [
  { id: 'ls_1', title: 'Sandton City Hotel', location: 'Sandton, Johannesburg', price_per_night: 325, status: 'live' },
  { id: 'ls_2', title: 'Woodmead City Hotel', location: 'Woodmead, Johannesburg', price_per_night: 200, status: 'live' },
]

const withFallback = async (fn, fallback) => {
  try {
    return await fn()
  } catch (error) {
    console.warn('[tapline] falling back to demo data:', error.message)
    return { data: fallback, demo: true }
  }
}

// ---------- Public API ----------

export const searchListings = ({ query, checkIn, checkOut, adults = 2, currency = 'ZAR' } = {}) =>
  withFallback(
    () => request('/api/tapline/search', {
      method: 'POST',
      body: { query: query || 'South Africa', check_in: checkIn || undefined, check_out: checkOut || undefined, adults: Number(adults) || 2, currency },
    }).then((data) => ({ data: data.listings || data, demo: false })),
    [],
  )

export const getListing = (id) =>
  withFallback(
    () => request(`/api/tapline/listings/${id}`).then((data) => ({ data, demo: false })),
    demoListing(id),
  )

export const createBooking = (payload) =>
  withFallback(
    () => request('/api/tapline/bookings', { method: 'POST', body: payload, auth: true }).then((data) => ({ data, demo: false })),
    { id: `demo_${Date.now()}`, ...payload, status: 'pending (demo — not yet sent to a backend)' },
  )

export const getMyBookings = () =>
  withFallback(
    () => request('/api/tapline/bookings/mine', { auth: true }).then((data) => ({ data: data.bookings || data, demo: false })),
    demoBookings,
  )

export const cancelBooking = (id) =>
  withFallback(
    () => request(`/api/tapline/bookings/${id}`, { method: 'DELETE', auth: true }).then((data) => ({ data, demo: false })),
    { id, status: 'cancelled (demo)' },
  )

export const getMyListings = () =>
  withFallback(
    () => request('/api/tapline/host/listings', { auth: true }).then((data) => ({ data: data.listings || data, demo: false })),
    demoHostListings,
  )

export const createListing = (payload) =>
  withFallback(
    () => request('/api/tapline/host/listings', { method: 'POST', body: payload, auth: true }).then((data) => ({ data, demo: false })),
    { id: `demo_${Date.now()}`, ...payload, status: 'draft (demo — not yet sent to a backend)' },
  )

export const deleteListing = (id) =>
  withFallback(
    () => request(`/api/tapline/host/listings/${id}`, { method: 'DELETE', auth: true }).then((data) => ({ data, demo: false })),
    { id, status: 'removed (demo)' },
  )

export const login = (credentials) => request('/api/auth/login', { method: 'POST', body: credentials })
export const register = (payload) => request('/api/auth/register', { method: 'POST', body: payload })

export const formatCurrency = (amount, currency = 'ZAR') => {
  const value = Number(String(amount ?? '').toString().replace(/[^0-9.]/g, ''))
  return Number.isFinite(value) && value > 0
    ? new Intl.NumberFormat('en-ZA', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
    : 'Price on request'
}