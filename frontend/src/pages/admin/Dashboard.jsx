import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/dashboard/stats').then(r => setStats(r.data))
  }, [])

  if (!stats) return <p>Loading…</p>

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Dashboard</h1></div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{stats.doctors}</div><div className="stat-label">Doctors</div></div>
        <div className="stat-card"><div className="stat-value">{stats.receptionists}</div><div className="stat-label">Receptionists</div></div>
        <div className="stat-card"><div className="stat-value">{stats.total_employees}</div><div className="stat-label">Total Employees</div></div>
        <div className="stat-card"><div className="stat-value">{stats.total_patients}</div><div className="stat-label">Patients</div></div>
        <div className="stat-card"><div className="stat-value">₹{stats.total_opd_income}</div><div className="stat-label">Total OPD Income</div></div>
      </div>
    </div>
  )
}
