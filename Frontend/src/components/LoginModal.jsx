import { useState } from 'react'
import { login, register, setSession } from '../Lib/api'

const EMPTY_LOGIN    = { email: '', password: '' }
const EMPTY_REGISTER = { name: '', email: '', password: '', confirm: '' }

function LoginModal({ onClose, onSuccess }) {
  const [tab,      setTab]      = useState('login')   // 'login' | 'register'
  const [loginForm,    setLoginForm]    = useState(EMPTY_LOGIN)
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER)
  const [state, setState] = useState({ status: 'idle', message: '' })

  const updateLogin    = (field) => (e) => setLoginForm   ((p) => ({ ...p, [field]: e.target.value }))
  const updateRegister = (field) => (e) => setRegisterForm((p) => ({ ...p, [field]: e.target.value }))

  const switchTab = (next) => {
    setTab(next)
    setState({ status: 'idle', message: '' })
  }

  /* ── Login ── */
  const handleLogin = async (e) => {
    e.preventDefault()
    setState({ status: 'loading', message: '' })
    try {
      const data = await login(loginForm)
      setSession(data)
      setState({ status: 'success', message: `Welcome back, ${data.name || 'there'} 👋` })
      setTimeout(() => onSuccess(data), 800)
    } catch (err) {
      setState({ status: 'error', message: err.message || 'Login failed. Check your credentials.' })
    }
  }

  /* ── Register ── */
  const handleRegister = async (e) => {
    e.preventDefault()
    if (registerForm.password !== registerForm.confirm) {
      setState({ status: 'error', message: 'Passwords do not match.' })
      return
    }
    if (registerForm.password.length < 6) {
      setState({ status: 'error', message: 'Password must be at least 6 characters.' })
      return
    }
    setState({ status: 'loading', message: '' })
    try {
      const data = await register({
        name:     registerForm.name,
        email:    registerForm.email,
        password: registerForm.password,
      })
      setSession(data)
      setState({ status: 'success', message: `Account created! Welcome, ${data.name || 'there'} 🎉` })
      setTimeout(() => onSuccess(data), 900)
    } catch (err) {
      setState({ status: 'error', message: err.message || 'Registration failed. Try a different email.' })
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>

        {/* ── Tabs ── */}
        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'login'}
            className={`auth-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Log in
          </button>
          <button
            role="tab"
            aria-selected={tab === 'register'}
            className={`auth-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Sign up
          </button>
        </div>

        {/* ── Login form ── */}
        {tab === 'login' && (
          <>
            <p className="modal-copy">
              Good to see you again. Log in to manage your trips.
            </p>
            <form onSubmit={handleLogin} noValidate>
              <label>
                Email
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={updateLogin('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={updateLogin('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </label>
              <button
                className="login-submit"
                type="submit"
                disabled={state.status === 'loading'}
              >
                {state.status === 'loading' ? 'Logging in…' : 'Log in'}
              </button>
            </form>
            <p className="signup-note">
              No account yet?{' '}
              <a href="#signup" onClick={(e) => { e.preventDefault(); switchTab('register') }}>
                Create one
              </a>
            </p>
          </>
        )}

        {/* ── Register form ── */}
        {tab === 'register' && (
          <>
            <p className="modal-copy">
              Join Airbnb and start booking unique stays across South Africa.
            </p>
            <form onSubmit={handleRegister} noValidate>
              <label>
                Full name
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={updateRegister('name')}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={updateRegister('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={updateRegister('password')}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  value={registerForm.confirm}
                  onChange={updateRegister('confirm')}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
              </label>
              <button
                className="login-submit"
                type="submit"
                disabled={state.status === 'loading'}
              >
                {state.status === 'loading' ? 'Creating account…' : 'Create account'}
              </button>
            </form>
            <p className="signup-note">
              Already have an account?{' '}
              <a href="#login" onClick={(e) => { e.preventDefault(); switchTab('login') }}>
                Log in
              </a>
            </p>
          </>
        )}

        {/* ── Status message ── */}
        {state.message && (
          <p className={`login-message ${state.status}`} role="alert">
            {state.message}
          </p>
        )}
      </div>
    </div>
  )
}

export default LoginModal
