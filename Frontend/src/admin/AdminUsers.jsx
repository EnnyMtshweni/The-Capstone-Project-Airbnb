/**
 * AdminUsers.jsx
 * Route: /admin/users
 * Users table with name, email, role, joined date, and inline role-change control.
 */
import { useEffect, useState } from 'react'
import { adminGetUsers, adminUpdateUserRole, getStoredUser } from '../Lib/api'

const ROLES = ['guest', 'host', 'admin']

const fmtDate = d =>
  d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

function AdminUsers() {
  const [users,  setUsers]  = useState([])
  const [status, setStatus] = useState('loading')
  const [search, setSearch] = useState('')
  const currentUser = getStoredUser()

  useEffect(() => {
    adminGetUsers().then(({ data }) => {
      setUsers(data)
      setStatus('ready')
    })
  }, [])

  const handleRoleChange = async (id, role) => {
    setUsers(prev => prev.map(u => u._id === id ? { ...u, _updating: true } : u))
    const { data } = await adminUpdateUserRole(id, role)
    setUsers(prev => prev.map(u =>
      u._id === id ? { ...u, role: data?.role || role, _updating: false } : u
    ))
  }

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  )

  const counts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {})

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1>Users</h1>
          <p className="adm-page-sub">
            {users.length} registered users —&nbsp;
            {counts.admin || 0} admin{(counts.admin || 0) !== 1 ? 's' : ''},&nbsp;
            {counts.host  || 0} host{(counts.host  || 0) !== 1 ? 's' : ''},&nbsp;
            {counts.guest || 0} guest{(counts.guest || 0) !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ── Role summary cards ────────────── */}
      <div className="adm-user-summary">
        {ROLES.map(r => (
          <div key={r} className={`adm-user-chip adm-user-chip--${r}`}>
            <span className="adm-user-chip-count">{counts[r] || 0}</span>
            <span>{r.charAt(0).toUpperCase() + r.slice(1)}s</span>
          </div>
        ))}
      </div>

      {/* ── Search ───────────────────────── */}
      <div className="adm-search-bar">
        <input
          type="search"
          placeholder="Search name, email or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="adm-search-input"
        />
      </div>

      {status === 'loading' && <p className="adm-loading">Loading users…</p>}

      {status === 'ready' && filtered.length === 0 && (
        <div className="adm-empty"><p>No users match your search.</p></div>
      )}

      {status === 'ready' && filtered.length > 0 && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Change role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const isMe = u._id === currentUser?._id
                return (
                  <tr key={u._id} style={{ opacity: u._updating ? 0.5 : 1 }}>
                    <td className="adm-row-num">{i + 1}</td>
                    <td className="adm-table-name">
                      {u.name}
                      {isMe && <span className="adm-you-badge">you</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`adm-badge adm-badge--role-${u.role}`}>{u.role}</span>
                    </td>
                    <td>{fmtDate(u.createdAt)}</td>
                    <td>
                      {isMe ? (
                        <span className="adm-table-note">Cannot change own role</span>
                      ) : (
                        <select
                          className="adm-status-select"
                          value={u.role}
                          disabled={u._updating}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          aria-label={`Change role for ${u.name}`}
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>
                              {r.charAt(0).toUpperCase() + r.slice(1)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
