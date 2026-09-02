// ─────────────────────────────────────────────────────────────────────────────
// api.js  — all frontend ↔ backend communication
// Calls our own Express backend (/api/accommodations, /api/reservations, /api/auth)
// Falls back to rich SA demo data when the backend is unreachable.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = '' // Vite proxies /api → http://localhost:5000

// ── Session helpers ──────────────────────────────────────────────────────────
export const getToken       = () => localStorage.getItem('token')
export const getStoredUser  = () => { try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null } }
export const setSession     = (data) => {
  const user = data?.data ?? data
  if (user?.token) localStorage.setItem('token', user.token)
  if (user)        localStorage.setItem('user',  JSON.stringify(user))
}
export const clearSession   = () => { localStorage.removeItem('token'); localStorage.removeItem('user') }

const authHeaders = () => {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(path, { method = 'GET', body, auth = false } = {}) {
  const res  = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(auth ? authHeaders() : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let payload
  try { payload = text ? JSON.parse(text) : {} } catch { payload = { message: `Service unavailable (${res.status})` } }
  if (!res.ok) {
    const err = new Error(payload.message || payload.detail || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  // Unwrap { success, data } envelope
  return payload.data !== undefined ? payload : payload
}

// ── SA demo fallbacks ────────────────────────────────────────────────────────
const SA_DEMO = [
  { _id: 'd1', title: 'Clifton Beachfront Villa',         location: { city: 'Cape Town',     country: 'South Africa' }, pricePerNight: 4200, images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85'], maxGuests: 8, bedrooms: 4, bathrooms: 3, amenities: ['Pool','Braai','WiFi','Beach access'], description: 'Atlantic views from above Clifton 4th Beach.' },
  { _id: 'd2', title: 'Stellenbosch Wine Estate Cottage', location: { city: 'Stellenbosch',  country: 'South Africa' }, pricePerNight: 1850, images: ['https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=85'], maxGuests: 4, bedrooms: 2, bathrooms: 1, amenities: ['Wine tasting','WiFi','Fireplace','Kitchen'], description: 'Vineyard cottage in the Cape Winelands.' },
  { _id: 'd3', title: 'Sandton Luxury Apartment',         location: { city: 'Sandton',       country: 'South Africa' }, pricePerNight: 1650, images: ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=85'], maxGuests: 4, bedrooms: 2, bathrooms: 2, amenities: ['Gym','Pool','WiFi','Parking'], description: 'Skyline views in Africa\'s richest square mile.' },
  { _id: 'd4', title: 'Kruger Bush Lodge',                location: { city: 'Hoedspruit',    country: 'South Africa' }, pricePerNight: 3800, images: ['https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=85'], maxGuests: 6, bedrooms: 3, bathrooms: 3, amenities: ['Game drives','Pool','All meals','WiFi'], description: 'Thatched lodge on the Klaserie Private Reserve.' },
  { _id: 'd5', title: 'Umhlanga Beachfront Suite',        location: { city: 'Umhlanga',      country: 'South Africa' }, pricePerNight: 1980, images: ['https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=85'], maxGuests: 4, bedrooms: 2, bathrooms: 2, amenities: ['Ocean views','Pool','WiFi','Aircon'], description: 'Steps from the Umhlanga Promenade.' },
  { _id: 'd6', title: 'Drakensberg Mountain Retreat',     location: { city: 'Drakensberg',   country: 'South Africa' }, pricePerNight: 1350, images: ['https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=85'], maxGuests: 6, bedrooms: 3, bathrooms: 2, amenities: ['Hiking','Stargazing','Firepit','Kitchen'], description: 'Off-grid cabin in the uKhahlamba World Heritage Site.' },
]

const withFallback = async (fn, fallback) => {
  try   { return await fn() }
  catch (e) { console.warn('[api] fallback:', e.message); return { data: fallback, demo: true } }
}

// ── Normalise a raw Accommodation doc into the shape the UI expects ───────────
export const normaliseAccommodation = (a) => {
  if (!a) return null
  // images may come back as a space-separated string from PowerShell display — re-split
  const rawImages = Array.isArray(a.images) ? a.images
    : typeof a.images === 'string' ? a.images.split(' ').filter(Boolean)
    : []
  return {
    ...a,
    id:             a._id || a.id,
    title:          a.title,
    location:       typeof a.location === 'object' ? a.location : { city: a.location, country: 'South Africa' },
    pricePerNight:  a.pricePerNight || a.price_per_night || 0,
    images:         rawImages,
    amenities:      Array.isArray(a.amenities) ? a.amenities
                    : typeof a.amenities === 'string' ? a.amenities.split(' ').filter(Boolean) : [],
    host:           a.host || {},
  }
}

// ── Listings ─────────────────────────────────────────────────────────────────
export const searchListings = ({ query = '', city = '', guests = '', minPrice = '', maxPrice = '' } = {}) =>
  withFallback(async () => {
    const params = new URLSearchParams()
    const cityQ = city || query
    if (cityQ)    params.set('city',     cityQ)
    if (guests)   params.set('guests',   guests)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    const payload = await request(`/api/accommodations?${params}`)
    const list = Array.isArray(payload) ? payload : (payload.data ?? [])
    return { data: list.map(normaliseAccommodation), demo: false }
  }, SA_DEMO)

export const getListing = (id) =>
  withFallback(async () => {
    const payload = await request(`/api/accommodations/${id}`)
    const raw = payload.data ?? payload
    return { data: normaliseAccommodation(raw), demo: false }
  }, normaliseAccommodation(SA_DEMO.find(d => d._id === id) || SA_DEMO[0]))

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = async (credentials) => {
  const payload = await request('/api/auth/login', { method: 'POST', body: credentials })
  return payload.data ?? payload
}
export const register = async (body) => {
  const payload = await request('/api/auth/register', { method: 'POST', body })
  return payload.data ?? payload
}

// ── Reservations ──────────────────────────────────────────────────────────────
export const createBooking = (body) =>
  withFallback(async () => {
    const payload = await request('/api/reservations', { method: 'POST', auth: true, body })
    return { data: payload.data ?? payload, demo: false }
  }, { _id: `demo_${Date.now()}`, status: 'confirmed (demo)', ...body })

export const getMyBookings = () =>
  withFallback(async () => {
    const payload = await request('/api/reservations/mine', { auth: true })
    const list = Array.isArray(payload) ? payload : (payload.data ?? [])
    return { data: list, demo: false }
  }, [
    { _id: 'bk1', accommodation: { title: 'Clifton Beachfront Villa',     location: { city: 'Cape Town' } }, checkIn: '2026-10-10', checkOut: '2026-10-14', numGuests: 2, totalPrice: 16800, status: 'confirmed' },
    { _id: 'bk2', accommodation: { title: 'Sandton Luxury Apartment',     location: { city: 'Sandton'   } }, checkIn: '2026-11-01', checkOut: '2026-11-03', numGuests: 2, totalPrice:  3300, status: 'confirmed' },
    { _id: 'bk3', accommodation: { title: 'Kruger Bush Lodge',            location: { city: 'Hoedspruit'} }, checkIn: '2026-12-20', checkOut: '2026-12-25', numGuests: 4, totalPrice: 19000, status: 'pending'   },
  ])

export const cancelBooking = (id) =>
  withFallback(async () => {
    const payload = await request(`/api/reservations/${id}`, { method: 'DELETE', auth: true })
    return { data: payload.data ?? payload, demo: false }
  }, { id, status: 'cancelled' })

// ── Host ──────────────────────────────────────────────────────────────────────
export const getMyListings = () =>
  withFallback(async () => {
    const payload = await request('/api/accommodations?mine=true', { auth: true })
    // Backend filters by host via token; we use a dedicated host endpoint
    const payload2 = await request('/api/tapline/host/listings', { auth: true })
    const list = Array.isArray(payload2) ? payload2 : (payload2.data ?? [])
    return { data: list.map(normaliseAccommodation), demo: false }
  }, SA_DEMO.slice(0, 2).map(d => ({ ...d, status: 'live' })))

export const createListing = (body) =>
  withFallback(async () => {
    const payload = await request('/api/accommodations', { method: 'POST', auth: true, body })
    return { data: normaliseAccommodation(payload.data ?? payload), demo: false }
  }, { _id: `demo_${Date.now()}`, ...body, status: 'draft (demo)' })

export const deleteListing = (id) =>
  withFallback(async () => {
    const payload = await request(`/api/accommodations/${id}`, { method: 'DELETE', auth: true })
    return { data: payload.data ?? payload, demo: false }
  }, { id, status: 'removed (demo)' })

// ── Currency ──────────────────────────────────────────────────────────────────
export const formatCurrency = (amount, currency = 'ZAR') => {
  const v = Number(String(amount ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(v) && v > 0
    ? new Intl.NumberFormat('en-ZA', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v)
    : 'Price on request'
}
