import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail'
import Trips from './pages/Trips'
import Host from './pages/Host'
import Login from './pages/Login'
import { clearSession, getStoredUser } from './lib/api'
import './App.css'
import './pages.css'

function App() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [user, setUser] = useState(getStoredUser())

  const handleLoginSuccess = (data) => {
    setUser(data)
    setLoginOpen(false)
  }

  const handleLogout = () => {
    clearSession()
    setUser(null)
  }

  return (
    <main>
      <Nav user={user} onOpenLogin={() => setLoginOpen(true)} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/host" element={<Host />} />
        <Route path="/login" element={<Login onLoggedIn={setUser} />} />
      </Routes>

      <Footer />

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onSuccess={handleLoginSuccess} />}
    </main>
  )
}

export default App