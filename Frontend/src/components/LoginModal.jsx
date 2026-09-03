import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../Lib/api'
import AirbnbLogo from './AirbnbLogo'

export default function LoginModal({ onClose, onSuccess }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload =
        mode === 'login'
          ? await login({
              email: form.email,
              password: form.password,
              role: 'guest',
            })
          : await register({
              name: form.name,
              email: form.email,
              password: form.password,
              role: 'guest',
            })

      if (payload?.role === 'admin') {
        throw new Error('Admin login is not allowed from this popup.')
      }

      onSuccess?.(payload)

      navigate('/', { replace: true })

      onClose?.()
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="airbnb-auth-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="close-button" aria-label="Close" onClick={onClose}>
          ×
        </button>

        <div className="modal-header">
          <AirbnbLogo className="auth-logo" />
          <span className="auth-logo-word">airbnb</span>
        </div>

        <div className="auth-mode">
          <button
            type="button"
            className={mode === 'login' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => setMode('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="airbnb-auth-form">
          {mode === 'signup' && (
            <div className="field">
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="field">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="airbnb-primary-btn" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'login' ? 'Log in' : 'Create guest account'}
          </button>
        </form>

        <p className="legal-text">
          We’ll email or text you to confirm your details.
        </p>
      </div>
    </div>
  )
}
