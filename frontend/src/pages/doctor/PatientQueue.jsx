import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function PatientQueue() {
  const [queue, setQueue] = useState([])
  const navigate = useNavigate()

  const load = () => api.get('/doctor/queue').then(r => setQueue(r.data))
  useEffect(() => { load() }, [])

  const remove = async (pid) => {
    if (!confirm('Remove patient from your queue?')) return
    await api.delete(`/doctor/queue/${pid}`)
    load()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Patient Queue</h1>
        <button className="btn btn-primary" onClick={load}>Refresh</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>OPD ID</th><th>Patient ID</th><th>Patient Name</th><th>Visit Date</th><th>Actions</th></tr></thead>
            <tbody>
              {queue.map(q => (
                <tr key={q.opd_id}>
                  <td>{q.opd_id}</td>
                  <td>{q.pid}</td>
                  <td>{q.patient_name}</td>
                  <td>{q.visit_date}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/doctor/patient/${q.pid}`)}>View & Prescribe</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(q.pid)}>Remove</button>
                  </td>
                </tr>
              ))}
              {queue.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#718096' }}>No patients in queue</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
