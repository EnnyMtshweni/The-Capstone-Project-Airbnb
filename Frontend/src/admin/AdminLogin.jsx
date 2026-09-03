/**
 * AdminLogin.jsx
 * Standalone login page for the admin dashboard (/admin/login).
 * Validates email + password, calls /api/auth/login, checks role === 'admin',
 * stores session, then redirects to /admin.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, setSession } from '../Lib/api'

function AdminLogin() {
  const navigate = useNavigate()
  const [form,   setForm]   = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [msg,    setMsg]    = useState('')

  /* ── Validation ────────────────────────────────────────────── */
  const validate = () => {
    const e = {}
    if (!form.email.trim())
      e.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = 'Enter a valid email address.'
    if (!form.password)
      e.password = 'Password is required.'
    else if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters.'
    return e
  }

  const set = field => e => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    // Clear field error on change
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setStatus('loading')
    setMsg('')
    try {
      const data = await login({ email: form.email, password: form.password })
      if (data.role !== 'admin') {
        setStatus('error')
        setMsg('Access denied. This dashboard is for admins only.')
        return
      }
      setSession(data)
      setStatus('idle')
      navigate('/admin')
    } catch (err) {
      setStatus('error')
      setMsg(err.message || 'Login failed. Check your credentials.')
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Logo */}
        <div className="admin-login-logo">
          <span className="admin-logo-text">airbnb</span>
          <span className="admin-login-badge">Admin</span>
        </div>

        <h1 className="admin-login-title">Sign in to Dashboard</h1>
        <p className="admin-login-sub">
          Use your administrator credentials to access the management console.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className={`adm-field${errors.email ? ' has-error' : ''}`}>
            <label htmlFor="adm-email">Email address</label>
            <input
              id="adm-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="admin@airbnb-sa.com"
              autoComplete="email"
              autoFocus
            />
            {errors.email && <span className="adm-field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className={`adm-field${errors.password ? ' has-error' : ''}`}>
            <label htmlFor="adm-password">Password</label>
            <input
              id="adm-password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && <span className="adm-field-error">{errors.password}</span>}
          </div>

          {/* Global error */}
          {status === 'error' && msg && (
            <p className="adm-form-error" role="alert">{msg}</p>
          )}

          <button
            className="adm-login-btn"
            type="submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="admin-login-hint">
          <strong>Demo:</strong> admin@airbnb-sa.com / Admin@1234
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
