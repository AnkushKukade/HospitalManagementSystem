import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function PrescriptionQueue() {
  const [queue, setQueue] = useState([])
  const navigate = useNavigate()

  const load = () => api.get('/receptionist/prescriptions').then(r => setQueue(r.data))
  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Prescription Queue</h1>
        <button className="btn btn-primary" onClick={load}>Refresh</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>OPD ID</th><th>Patient ID</th><th>Patient Name</th><th>Action</th></tr></thead>
            <tbody>
              {queue.map(q => (
                <tr key={q.opd_id}>
                  <td>{q.opd_id}</td>
                  <td>{q.pid}</td>
                  <td>{q.patient_name}</td>
                  <td><button className="btn btn-primary btn-sm" onClick={() => navigate(`/receptionist/prescriptions/${q.opd_id}`)}>View & Print</button></td>
                </tr>
              ))}
              {queue.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#718096' }}>No prescriptions pending</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
