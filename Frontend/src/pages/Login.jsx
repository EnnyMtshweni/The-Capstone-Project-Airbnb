import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, setSession } from '../Lib/api'

function Login({ onLoggedIn }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [state, setState] = useState({ status: 'idle', message: '' })

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setState({ status: 'loading', message: '' })
    try {
      const data = await login(form)
      setSession(data)
      onLoggedIn?.(data)
      setState({ status: 'success', message: `Welcome back, ${data.name || 'there'}` })
      setTimeout(() => navigate('/'), 700)
    } catch (error) {
      setState({ status: 'error', message: error.message })
    }
  }

  return (
    <section className="section container standalone-login">
      <form className="standalone-login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <label className="search-field"><span className="field-label">Full name or email</span><input value={form.email} onChange={updateField('email')} autoComplete="email" required /></label>
        <label className="search-field"><span className="field-label">Password</span><input type="password" value={form.password} onChange={updateField('password')} autoComplete="current-password" required /></label>
        <p className="forgot-password"><a href="#forgot">Forgot Password ?</a></p>
        <button className="login-submit" type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Logging in…' : 'Login'}</button>
        {state.message && <p className={`login-message ${state.status}`}>{state.message}</p>}
      </form>
    </section>
  )
}

export default Login