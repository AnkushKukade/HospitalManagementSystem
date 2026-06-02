import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function SearchEmployee() {
  const [by, setBy] = useState('name')
  const [q, setQ] = useState({ first_name: '', last_name: '', eid: '', mobile_no: '', adhar_no: '' })
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const navigate = useNavigate()

  const search = async (e) => {
    e.preventDefault()
    setSearched(true)
    let res
    if (by === 'name') res = await api.get('/admin/employees/search/name', { params: { first_name: q.first_name, last_name: q.last_name } })
    else if (by === 'id') res = await api.get('/admin/employees/search/id', { params: { eid: q.eid } })
    else if (by === 'mobile') res = await api.get('/admin/employees/search/mobile', { params: { mobile_no: q.mobile_no } })
    else res = await api.get('/admin/employees/search/adhar', { params: { adhar_no: q.adhar_no } })
    setResults(res.data)
  }

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Search Employee</h1></div>
      <div className="card">
        <div className="form-group" style={{ marginBottom: 16, maxWidth: 240 }}>
          <label>Search By</label>
          <select value={by} onChange={e => setBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="id">Employee ID</option>
            <option value="mobile">Mobile Number</option>
            <option value="adhar">Aadhar Number</option>
          </select>
        </div>
        <form onSubmit={search}>
          <div className="search-row">
            {by === 'name' && <>
              <div className="form-group"><label>First Name</label><input value={q.first_name} onChange={e => setQ(f => ({ ...f, first_name: e.target.value }))} /></div>
              <div className="form-group"><label>Last Name</label><input value={q.last_name} onChange={e => setQ(f => ({ ...f, last_name: e.target.value }))} /></div>
            </>}
            {by === 'id' && <div className="form-group"><label>Employee ID</label><input value={q.eid} onChange={e => setQ(f => ({ ...f, eid: e.target.value }))} /></div>}
            {by === 'mobile' && <div className="form-group"><label>Mobile No</label><input value={q.mobile_no} onChange={e => setQ(f => ({ ...f, mobile_no: e.target.value }))} /></div>}
            {by === 'adhar' && <div className="form-group"><label>Aadhar No</label><input value={q.adhar_no} onChange={e => setQ(f => ({ ...f, adhar_no: e.target.value }))} /></div>}
            <button className="btn btn-primary">Search</button>
          </div>
        </form>
      </div>

      {searched && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Mobile</th><th>Action</th></tr></thead>
              <tbody>
                {results.map(emp => (
                  <tr key={emp.eid}>
                    <td>{emp.eid}</td>
                    <td>{emp.first_name} {emp.last_name}</td>
                    <td>{emp.role}</td>
                    <td>{emp.mobile_no}</td>
                    <td><button className="btn btn-warning btn-sm" onClick={() => navigate(`/admin/employees/${emp.eid}/edit`)}>Edit</button></td>
                  </tr>
                ))}
                {results.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#718096' }}>No results</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
