import { useState } from 'react'
import { login, setSession } from '../lib/api'

function LoginModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [state, setState] = useState({ status: 'idle', message: '' })

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setState({ status: 'loading', message: '' })
    try {
      const data = await login(form)
      setSession(data)
      setState({ status: 'success', message: `Welcome back, ${data.name || 'there'}` })
      setTimeout(() => onSuccess(data), 900)
    } catch (error) {
      setState({ status: 'error', message: error.message })
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="modal-close" aria-label="Close login" onClick={onClose}>×</button>
        <p className="eyebrow dark">Welcome back</p>
        <h2 id="login-title">Log in to Airbnb</h2>
        <p className="modal-copy">Book your next South African stay and keep your trips together.</p>
        <form onSubmit={handleSubmit}>
          <label>Email<input type="email" value={form.email} onChange={updateField('email')} autoComplete="email" required /></label>
          <label>Password<input type="password" value={form.password} onChange={updateField('password')} autoComplete="current-password" required /></label>
          <button className="login-submit" type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Logging in...' : 'Log in'}</button>
        </form>
        {state.message && <p className={`login-message ${state.status}`}>{state.message}</p>}
        <p className="signup-note">New to Airbnb? <a href="#signup">Create an account</a></p>
      </div>
    </div>
  )
}

export default LoginModal