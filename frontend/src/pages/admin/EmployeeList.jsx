import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function EmployeeList() {
  const [employees, setEmployees] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const load = () => api.get('/admin/employees').then(r => setEmployees(r.data))
  useEffect(() => { load() }, [])

  const handleDelete = async (eid) => {
    if (!confirm(`Delete employee ${eid}?`)) return
    try {
      await api.delete(`/admin/employees/${eid}`)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Delete failed')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">All Employees</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/employees/add')}>+ Add Employee</button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Role</th><th>Mobile</th><th>Qualification</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.eid}>
                  <td>{emp.eid}</td>
                  <td>{emp.first_name} {emp.last_name}</td>
                  <td><span className="badge badge-pending">{emp.role}</span></td>
                  <td>{emp.mobile_no}</td>
                  <td>{emp.qualification}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-warning btn-sm" onClick={() => navigate(`/admin/employees/${emp.eid}/edit`)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.eid)}>Delete</button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#718096' }}>No employees found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
