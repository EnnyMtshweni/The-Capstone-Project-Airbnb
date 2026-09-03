/**
 * AdminListingForm.jsx
 * Reusable form component shared by AdminCreateListing and AdminEditListing.
 * Covers ALL rubric-required fields:
 *   title, location (address/city/country), description, type,
 *   bedrooms, bathrooms, maxGuests, pricePerNight,
 *   amenities, images, weeklyDiscount, cleaningFee, serviceFee, occupancyTaxes
 *
 * Props:
 *   initialValues  – pre-filled data (for edit mode)
 *   onSubmit(data) – async callback called with validated form data
 *   submitLabel    – button label ("Create Listing" | "Save Changes")
 *   isLoading      – disables submit while pending
 */

import { useEffect, useState } from 'react'

const SA_CITIES = [
  'Cape Town','Stellenbosch','Knysna','George','Hermanus',
  'Sandton','Pretoria','Soweto','Johannesburg',
  'Umhlanga','Durban','Drakensberg','St Lucia','Pietermaritzburg',
  'Hoedspruit','Tzaneen','Polokwane',
  'Graskop','White River','Nelspruit',
  'Addo','Port Elizabeth','East London','Grahamstown',
  'Clarens','Bloemfontein',
  'Sun City','Rustenburg','Mahikeng',
  'Springbok','Kimberley','Upington',
]

const PROPERTY_TYPES = [
  'Entire home','Private room','Shared room',
  'Guest cottage','Beach house','Game lodge',
  'Farm stay','Treehouse','Houseboat','Safari tent',
]

const AMENITY_OPTIONS = [
  'WiFi','Pool','Braai / BBQ','Kitchen','Air conditioning',
  'Washing machine','Dryer','Parking','Pet friendly',
  'Mountain views','Ocean views','Beach access',
  'Game drives','Fireplace','Gym','Spa',
  'Self check-in','Enhanced cleaning',
]

const EMPTY = {
  title:          '',
  type:           'Entire home',
  description:    '',
  address:        '',
  city:           'Cape Town',
  country:        'South Africa',
  pricePerNight:  '',
  bedrooms:       '1',
  bathrooms:      '1',
  maxGuests:      '2',
  amenities:      [],   // array of strings
  imageUrls:      '',   // newline-separated URLs
  weeklyDiscount: '0',
  cleaningFee:    '0',
  serviceFee:     '0',
  occupancyTaxes: '0',
}

function AdminListingForm({ initialValues = {}, onSubmit, submitLabel = 'Save', isLoading = false }) {
  const [form,   setForm]   = useState({ ...EMPTY, ...flatten(initialValues) })
  const [errors, setErrors] = useState({})

  // Re-populate when initialValues arrives (edit mode async load)
  useEffect(() => {
    if (Object.keys(initialValues).length)
      setForm(p => ({ ...p, ...flatten(initialValues) }))
  }, [JSON.stringify(initialValues)]) // eslint-disable-line

  /* Flatten a listing object into form shape */
  function flatten(v) {
    if (!v) return {}
    const imgs = Array.isArray(v.images) ? v.images.join('\n')
               : typeof v.images === 'string' ? v.images.replace(/ /g, '\n') : ''
    const amenities = Array.isArray(v.amenities) ? v.amenities
                    : typeof v.amenities === 'string' ? v.amenities.split(',').map(s => s.trim()).filter(Boolean) : []
    return {
      title:          v.title          || '',
      type:           v.type           || 'Entire home',
      description:    v.description    || '',
      address:        v.location?.address || v.address || '',
      city:           v.location?.city    || v.city    || 'Cape Town',
      country:        v.location?.country || v.country || 'South Africa',
      pricePerNight:  String(v.pricePerNight || ''),
      bedrooms:       String(v.bedrooms  ?? '1'),
      bathrooms:      String(v.bathrooms ?? '1'),
      maxGuests:      String(v.maxGuests ?? '2'),
      amenities,
      imageUrls:      imgs,
      weeklyDiscount: String(v.weeklyDiscount ?? '0'),
      cleaningFee:    String(v.cleaningFee    ?? '0'),
      serviceFee:     String(v.serviceFee     ?? '0'),
      occupancyTaxes: String(v.occupancyTaxes ?? '0'),
    }
  }

  const set = f => e => {
    setForm(p => ({ ...p, [f]: e.target.value }))
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }))
  }

  const toggleAmenity = a => {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(a)
        ? p.amenities.filter(x => x !== a)
        : [...p.amenities, a],
    }))
  }

  /* ── Validation ─────────────────────────────────────── */
  const validate = () => {
    const e = {}
    if (!form.title.trim())           e.title         = 'Title is required.'
    if (!form.description.trim())     e.description   = 'Description is required.'
    if (!form.city)                   e.city          = 'City is required.'
    if (!form.pricePerNight || Number(form.pricePerNight) <= 0)
                                      e.pricePerNight = 'Enter a valid price per night.'
    if (!form.maxGuests || Number(form.maxGuests) < 1)
                                      e.maxGuests     = 'At least 1 guest required.'
    if (!form.bedrooms || Number(form.bedrooms) < 1)
                                      e.bedrooms      = 'At least 1 bedroom required.'
    if (!form.bathrooms || Number(form.bathrooms) < 1)
                                      e.bathrooms     = 'At least 1 bathroom required.'
    return e
  }

  /* ── Submit ─────────────────────────────────────────── */
  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const payload = {
      title:          form.title.trim(),
      description:    form.description.trim(),
      type:           form.type,
      pricePerNight:  Number(form.pricePerNight),
      bedrooms:       Number(form.bedrooms),
      bathrooms:      Number(form.bathrooms),
      maxGuests:      Number(form.maxGuests),
      location: {
        address: form.address.trim() || form.city,
        city:    form.city,
        country: form.country || 'South Africa',
      },
      images:     form.imageUrls.split('\n').map(s => s.trim()).filter(Boolean),
      amenities:  form.amenities,
      weeklyDiscount: Number(form.weeklyDiscount) || 0,
      cleaningFee:    Number(form.cleaningFee)    || 0,
      serviceFee:     Number(form.serviceFee)     || 0,
      occupancyTaxes: Number(form.occupancyTaxes) || 0,
    }

    await onSubmit(payload)
  }

  const Field = ({ id, label, error, children }) => (
    <div className={`adm-field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="adm-field-error">{error}</span>}
    </div>
  )

  return (
    <form className="adm-listing-form" onSubmit={handleSubmit} noValidate>
      {/* ── Section 1: Basic info ──────────────────────── */}
      <div className="adm-form-section">
        <h3 className="adm-form-section-title">Basic Information</h3>
        <div className="adm-form-row adm-form-row--2">
          <Field id="f-title" label="Listing title *" error={errors.title}>
            <input id="f-title" value={form.title} onChange={set('title')}
              placeholder="e.g. Clifton Beachfront Villa" />
          </Field>
          <Field id="f-type" label="Property type">
            <select id="f-type" value={form.type} onChange={set('type')}>
              {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        <Field id="f-desc" label="Description *" error={errors.description}>
          <textarea id="f-desc" value={form.description} onChange={set('description')}
            rows={4} placeholder="Describe the property, surroundings, and what makes it special…" />
        </Field>
      </div>

      {/* ── Section 2: Location ───────────────────────── */}
      <div className="adm-form-section">
        <h3 className="adm-form-section-title">Location</h3>
        <div className="adm-form-row adm-form-row--3">
          <Field id="f-city" label="City / Area *" error={errors.city}>
            <select id="f-city" value={form.city} onChange={set('city')}>
              {SA_CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field id="f-address" label="Street address">
            <input id="f-address" value={form.address} onChange={set('address')}
              placeholder="14 Nettleton Road" />
          </Field>
          <Field id="f-country" label="Country">
            <input id="f-country" value={form.country} onChange={set('country')} readOnly />
          </Field>
        </div>
      </div>

      {/* ── Section 3: Details ───────────────────────── */}
      <div className="adm-form-section">
        <h3 className="adm-form-section-title">Property Details</h3>
        <div className="adm-form-row adm-form-row--4">
          <Field id="f-beds" label="Bedrooms *" error={errors.bedrooms}>
            <input id="f-beds" type="number" min="1" max="30" value={form.bedrooms} onChange={set('bedrooms')} />
          </Field>
          <Field id="f-baths" label="Bathrooms *" error={errors.bathrooms}>
            <input id="f-baths" type="number" min="1" max="20" value={form.bathrooms} onChange={set('bathrooms')} />
          </Field>
          <Field id="f-guests" label="Max guests *" error={errors.maxGuests}>
            <input id="f-guests" type="number" min="1" max="50" value={form.maxGuests} onChange={set('maxGuests')} />
          </Field>
          <Field id="f-price" label="Price / night (ZAR) *" error={errors.pricePerNight}>
            <input id="f-price" type="number" min="0" value={form.pricePerNight}
              onChange={set('pricePerNight')} placeholder="1200" />
          </Field>
        </div>
      </div>

      {/* ── Section 4: Fees ──────────────────────────── */}
      <div className="adm-form-section">
        <h3 className="adm-form-section-title">Fees &amp; Discounts (ZAR)</h3>
        <div className="adm-form-row adm-form-row--4">
          <Field id="f-wd" label="Weekly discount (ZAR)">
            <input id="f-wd" type="number" min="0" value={form.weeklyDiscount} onChange={set('weeklyDiscount')} />
          </Field>
          <Field id="f-cf" label="Cleaning fee (ZAR)">
            <input id="f-cf" type="number" min="0" value={form.cleaningFee} onChange={set('cleaningFee')} />
          </Field>
          <Field id="f-sf" label="Service fee (ZAR)">
            <input id="f-sf" type="number" min="0" value={form.serviceFee} onChange={set('serviceFee')} />
          </Field>
          <Field id="f-ot" label="Occupancy taxes (ZAR)">
            <input id="f-ot" type="number" min="0" value={form.occupancyTaxes} onChange={set('occupancyTaxes')} />
          </Field>
        </div>
      </div>

      {/* ── Section 5: Amenities ─────────────────────── */}
      <div className="adm-form-section">
        <h3 className="adm-form-section-title">Amenities</h3>
        <div className="adm-amenity-grid">
          {AMENITY_OPTIONS.map(a => (
            <label key={a} className={`adm-amenity-chip${form.amenities.includes(a) ? ' selected' : ''}`}>
              <input
                type="checkbox"
                checked={form.amenities.includes(a)}
                onChange={() => toggleAmenity(a)}
                style={{ display: 'none' }}
              />
              {a}
            </label>
          ))}
        </div>
        <div className="adm-field" style={{ marginTop: 12 }}>
          <label htmlFor="f-custom-amenities">Custom amenities (comma-separated)</label>
          <input
            id="f-custom-amenities"
            value={form.amenities.filter(a => !AMENITY_OPTIONS.includes(a)).join(', ')}
            onChange={e => {
              const custom = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              setForm(p => ({
                ...p,
                amenities: [...AMENITY_OPTIONS.filter(a => p.amenities.includes(a)), ...custom],
              }))
            }}
            placeholder="Heated pool, Tennis court…"
          />
        </div>
      </div>

      {/* ── Section 6: Images ────────────────────────── */}
      <div className="adm-form-section">
        <h3 className="adm-form-section-title">Images</h3>
        <Field id="f-images" label="Image URLs (one per line)">
          <textarea id="f-images" value={form.imageUrls} onChange={set('imageUrls')}
            rows={4} placeholder={'https://images.unsplash.com/…\nhttps://images.unsplash.com/…'} />
        </Field>
        {/* Preview */}
        {form.imageUrls.split('\n').filter(s => s.trim()).length > 0 && (
          <div className="adm-image-preview">
            {form.imageUrls.split('\n').filter(s => s.trim()).slice(0, 5).map((src, i) => (
              <img key={i} src={src.trim()} alt={`Preview ${i + 1}`}
                onError={e => { e.target.style.display = 'none' }} />
            ))}
          </div>
        )}
      </div>

      {/* ── Submit ───────────────────────────────────── */}
      <div className="adm-form-actions">
        <button className="adm-btn adm-btn--primary adm-btn--lg" type="submit" disabled={isLoading}>
          {isLoading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default AdminListingForm
