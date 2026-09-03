/**
 * App.jsx — root component
 *
 * Admin routes (/admin, /admin/*) render inside AdminLayout (sidebar + topbar).
 * All public routes render inside the PublicShell (Nav + Footer).
 * Flat <Routes> tree — no nested <Routes> (React Router v7 requirement).
 */
import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'

// Public shell
import Nav        from './components/Nav'
import Footer     from './components/Footer'
import LoginModal from './components/LoginModal'

// Public pages
import Home          from './pages/Home'
import ListingDetail from './pages/ListingDetail'
import Trips         from './pages/Trips'
import Host          from './pages/Host'
import Login         from './pages/Login'

// Admin pages
import AdminLayout        from './admin/AdminLayout'
import AdminLogin         from './admin/AdminLogin'
import AdminDashboard     from './admin/AdminDashboard'
import AdminListings      from './admin/AdminListings'
import AdminCreateListing from './admin/AdminCreateListing'
import AdminEditListing   from './admin/AdminEditListing'
import AdminReservations  from './admin/AdminReservations'
import AdminUsers         from './admin/AdminUsers'

import { clearSession, getStoredUser } from './Lib/api'
import './App.css'
import './pages.css'
import './admin/admin.css'

/**
 * PublicShell — provides Nav, Footer, LoginModal for all public pages.
 * Manages its own auth + search state so admin routes are fully isolated.
 */
function PublicShell() {
  const [loginOpen,     setLoginOpen]  = useState(false)
  const [user,          setUser]       = useState(getStoredUser())
  const [darkMode,      setDarkMode]   = useState(false)
  const [triggerSearch, setTrigger]    = useState(0)
  const [search,        setSearch]     = useState({
    destination: 'South Africa',
    checkIn: '', checkOut: '', guests: '2',
  })

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode)
  }, [darkMode])

  const handleSearchChange = (field, value) =>
    setSearch(p => ({ ...p, [field]: value }))

  const handleLoginSuccess = data => { setUser(data); setLoginOpen(false) }
  const handleLogout       = ()   => { clearSession(); setUser(null) }

  return (
    <main className={darkMode ? 'theme-dark' : 'theme-light'}>
      <Nav
        user={user}
        onOpenLogin={() => setLoginOpen(true)}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(v => !v)}
        searchValues={search}
        onSearchChange={handleSearchChange}
        onSearch={() => setTrigger(n => n + 1)}
      />

      {/* Inner routes rendered here — still a single flat <Routes> at the top level */}
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
        <Route path="/login"       element={<Login onLoggedIn={handleLoginSuccess} />} />
      </Routes>

      <Footer />
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </main>
  )
}

/**
 * App — top-level route split: admin tree vs public shell.
 * The public shell uses its own nested <Routes> which is valid
 * because PublicShell renders inside a catch-all Route.
 */
export default function App() {
  return (
    <Routes>
      {/* ── Admin (no public Nav) ────────────────────── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index                     element={<AdminDashboard />} />
        <Route path="listings"           element={<AdminListings />} />
        <Route path="listings/new"       element={<AdminCreateListing />} />
        <Route path="listings/:id/edit"  element={<AdminEditListing />} />
        <Route path="reservations"       element={<AdminReservations />} />
        <Route path="users"              element={<AdminUsers />} />
      </Route>

      {/* ── Public (Nav + Footer shell) ──────────────── */}
      <Route path="/*" element={<PublicShell />} />
    </Routes>
  )
}
