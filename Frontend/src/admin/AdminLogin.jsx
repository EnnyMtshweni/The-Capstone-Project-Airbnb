/**
 * AdminLogin.jsx
 * Standalone login page for the admin dashboard (/admin/login).
 * Validates email + password, calls /api/auth/login, checks role === 'admin',
 * stores session, then redirects to /admin.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession, login, register, setSession } from '../Lib/api'
import AirbnbLogo from '../components/AirbnbLogo'

function AdminLogin({ onLoggedIn }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [accountType, setAccountType] = useState('admin')
  const [mode, setMode] = useState('login')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [msg, setMsg] = useState('')

  const validate = () => {
    const nextErrors = {}

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.'
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }

    return nextErrors
  }

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setStatus('error')
      setMsg('Please fix the highlighted fields.')
      return
    }

    setStatus('loading')
    setMsg('')

    try {
      const data = mode === 'signup'
        ? await register({ name: form.name, email: form.email, password: form.password, role: 'host' })
        : await login({ email: form.email, password: form.password, role: accountType })

      if (mode === 'signup') {
        clearSession()
        setMode('login')
        setMsg('Host account created. Log in to open your listing dashboard.')
        return
      }

      if (data?.role !== accountType) {
        throw new Error(`This account is not a ${accountType} account.`)
      }

      setSession(data)
      onLoggedIn?.(data)
      navigate('/admin', { replace: true })
    } catch (error) {
      setStatus('error')
      setMsg(error.message || 'Admin login failed.')
    } finally {
      setStatus(current => current === 'loading' ? 'idle' : current)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <AirbnbLogo className="admin-login-logo-image" />
          <span className="admin-logo-text">airbnb</span>
          <span className="admin-login-badge">Admin</span>
        </div>

          <h1 className="admin-login-title">{mode === 'signup' ? 'Create host account' : 'Sign in to Dashboard'}</h1>
        <p className="admin-login-sub">
          {mode === 'signup' ? 'Create a host account before managing your listing.' : 'Choose a role and sign in to continue.'}
        </p>

        <div className="admin-role-switch" role="group" aria-label="Login type">
          <button type="button" className={accountType === 'admin' && mode === 'login' ? 'active' : ''} onClick={() => { setAccountType('admin'); setMode('login'); setMsg('') }}>Admin login</button>
          <button type="button" className={accountType === 'host' ? 'active' : ''} onClick={() => { setAccountType('host'); setMode('login'); setMsg('') }}>Host login</button>
          <button type="button" className={accountType === 'guest' ? 'active' : ''} onClick={() => navigate('/login')}>Guest login</button>
        </div>

        {accountType === 'host' && (
          <button type="button" className="admin-host-signup-toggle" onClick={() => { setMode(value => value === 'signup' ? 'login' : 'signup'); setMsg('') }}>
            {mode === 'signup' ? 'Already have a host account? Log in' : 'New host? Sign up first'}
          </button>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="adm-field">
              <label htmlFor="adm-name">Full name</label>
              <input id="adm-name" type="text" value={form.name} onChange={handleFieldChange('name')} required />
            </div>
          )}
          <div className={`adm-field${errors.email ? ' has-error' : ''}`}>
            <label htmlFor="adm-email">Email address</label>
            <input
              id="adm-email"
              type="email"
              value={form.email}
              onChange={handleFieldChange('email')}
              placeholder={accountType === 'host' ? 'host@example.com' : 'admin@airbnb-sa.com'}
              autoComplete="email"
              autoFocus
            />
            {errors.email && <span className="adm-field-error">{errors.email}</span>}
          </div>

          <div className={`adm-field${errors.password ? ' has-error' : ''}`}>
            <label htmlFor="adm-password">Password</label>
            <input
              id="adm-password"
              type="password"
              value={form.password}
              onChange={handleFieldChange('password')}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && <span className="adm-field-error">{errors.password}</span>}
          </div>

          {status === 'error' && msg && (
            <p className="adm-form-error" role="alert">
              {msg}
            </p>
          )}

          <button className="adm-login-btn" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Please wait…' : mode === 'signup' ? 'Create host account' : `Sign in as ${accountType}`}
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
