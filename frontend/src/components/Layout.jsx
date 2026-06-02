import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = {
  administrator: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/employees', label: 'All Employees' },
    { to: '/admin/employees/add', label: 'Add Employee' },
    { to: '/admin/employees/search', label: 'Search Employee' },
    { to: '/profile', label: 'My Profile' },
    { to: '/change-credentials', label: 'Change Credentials' },
  ],
  receptionist: [
    { to: '/receptionist/opd', label: 'OPD Queue' },
    { to: '/receptionist/prescriptions', label: 'Prescription Queue' },
    { to: '/receptionist/patients/add', label: 'Add Patient' },
    { to: '/receptionist/patients/search', label: 'Search Patient' },
    { to: '/profile', label: 'My Profile' },
    { to: '/change-credentials', label: 'Change Credentials' },
  ],
  doctor: [
    { to: '/doctor/queue', label: 'My Patient Queue' },
    { to: '/profile', label: 'My Profile' },
    { to: '/change-credentials', label: 'Change Credentials' },
  ],
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = NAV_LINKS[user?.role] || []

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">🏥 Hospital Management</div>
        <div className="sidebar-role">{user?.role}</div>
        <nav>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? 'active' : ''}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  )
}
