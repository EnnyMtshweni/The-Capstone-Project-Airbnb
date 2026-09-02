import { useEffect, useRef, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail'
import Trips from './pages/Trips'
import Host from './pages/Host'
import Login from './pages/Login'
import { clearSession, getStoredUser } from './Lib/api'
import './App.css'
import './pages.css'

function App() {
  const [loginOpen, setLoginOpen]   = useState(false)
  const [user, setUser]             = useState(getStoredUser())
  const [darkMode, setDarkMode]     = useState(false)
  const [triggerSearch, setTrigger] = useState(0)
  const [search, setSearch]         = useState({
    destination: 'South Africa',
    checkIn: '',
    checkOut: '',
    guests: '2',
  })

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode)
  }, [darkMode])

  const handleSearchChange = (field, value) =>
    setSearch((prev) => ({ ...prev, [field]: value }))

  const handleSearch = () => setTrigger((n) => n + 1)

  const handleLoginSuccess = (data) => {
    setUser(data)
    setLoginOpen(false)
  }

  const handleLogout = () => {
    clearSession()
    setUser(null)
  }

  return (
    <main className={darkMode ? 'theme-dark' : 'theme-light'}>
      <Nav
        user={user}
        onOpenLogin={() => setLoginOpen(true)}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((v) => !v)}
        searchValues={search}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              search={search}
              onSearchChange={handleSearchChange}
              triggerSearch={triggerSearch}
            />
          }
        />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/trips"       element={<Trips />} />
        <Route path="/host"        element={<Host />} />
        <Route path="/login"       element={<Login onLoggedIn={setUser} />} />
      </Routes>

      <Footer />

      {loginOpen && (
        <LoginModal onClose={() => setLoginOpen(false)} onSuccess={handleLoginSuccess} />
      )}
    </main>
  )
}

export default App
