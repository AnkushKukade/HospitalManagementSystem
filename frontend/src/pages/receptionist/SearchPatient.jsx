import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function SearchPatient() {
  const [by, setBy] = useState('name')
  const [q, setQ] = useState({ first_name: '', last_name: '', pid: '', mobile_no: '', adhar_no: '' })
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [opdMsg, setOpdMsg] = useState({})
  const navigate = useNavigate()

  const search = async (e) => {
    e.preventDefault(); setSearched(true)
    let res
    if (by === 'name') res = await api.get('/receptionist/patients/search/name', { params: { first_name: q.first_name, last_name: q.last_name } })
    else if (by === 'id') res = await api.get('/receptionist/patients/search/id', { params: { pid: q.pid } })
    else if (by === 'mobile') res = await api.get('/receptionist/patients/search/mobile', { params: { mobile_no: q.mobile_no } })
    else res = await api.get('/receptionist/patients/search/adhar', { params: { adhar_no: q.adhar_no } })
    setResults(res.data)
  }

  const addToOpd = async (pid) => {
    const res = await api.post(`/receptionist/opd/${pid}`)
    setOpdMsg(m => ({ ...m, [pid]: res.data.message }))
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Search Patient</h1>
        <button className="btn btn-primary" onClick={() => navigate('/receptionist/patients/add')}>+ Add Patient</button>
      </div>
      <div className="card">
        <div className="form-group" style={{ marginBottom: 16, maxWidth: 240 }}>
          <label>Search By</label>
          <select value={by} onChange={e => setBy(e.target.value)}>
            <option value="name">Name</option><option value="id">Patient ID</option>
            <option value="mobile">Mobile</option><option value="adhar">Aadhar</option>
          </select>
        </div>
        <form onSubmit={search}>
          <div className="search-row">
            {by === 'name' && <>
              <div className="form-group"><label>First Name</label><input value={q.first_name} onChange={e => setQ(f => ({ ...f, first_name: e.target.value }))} /></div>
              <div className="form-group"><label>Last Name</label><input value={q.last_name} onChange={e => setQ(f => ({ ...f, last_name: e.target.value }))} /></div>
            </>}
            {by === 'id' && <div className="form-group"><label>Patient ID</label><input value={q.pid} onChange={e => setQ(f => ({ ...f, pid: e.target.value }))} /></div>}
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
              <thead><tr><th>ID</th><th>Name</th><th>Blood Group</th><th>Mobile</th><th>Doctor ID</th><th>Actions</th></tr></thead>
              <tbody>
                {results.map(p => (
                  <tr key={p.pid}>
                    <td>{p.pid}</td>
                    <td>{p.first_name} {p.last_name}</td>
                    <td>{p.blood_group}</td>
                    <td>{p.mobile_no}</td>
                    <td>{p.doctor_id}</td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn btn-warning btn-sm" onClick={() => navigate(`/receptionist/patients/${p.pid}/edit`)}>Edit</button>
                      <button className="btn btn-success btn-sm" onClick={() => addToOpd(p.pid)}>Add to OPD</button>
                      {opdMsg[p.pid] && <span style={{ fontSize: '0.75rem', color: '#2b6cb0' }}>{opdMsg[p.pid]}</span>}
                    </td>
                  </tr>
                ))}
                {results.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#718096' }}>No results</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
