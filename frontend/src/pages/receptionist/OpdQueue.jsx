import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function OpdQueue() {
  const [queue, setQueue] = useState([])

  const load = () => api.get('/receptionist/opd/queue').then(r => setQueue(r.data))
  useEffect(() => { load() }, [])

  const remove = async (pid) => {
    if (!confirm('Remove from OPD queue?')) return
    await api.delete(`/receptionist/opd/${pid}`)
    load()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">OPD Queue</h1>
        <button className="btn btn-primary" onClick={load}>Refresh</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>OPD ID</th><th>Patient ID</th><th>Patient Name</th><th>Doctor</th><th>Visit Date</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {queue.map(q => (
                <tr key={q.opd_id}>
                  <td>{q.opd_id}</td>
                  <td>{q.pid}</td>
                  <td>{q.patient_name}</td>
                  <td>{q.doctor_name}</td>
                  <td>{q.visit_date}</td>
                  <td><span className="badge badge-pending">Pending</span></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => remove(q.pid)}>Remove</button></td>
                </tr>
              ))}
              {queue.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#718096' }}>OPD queue is empty</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
