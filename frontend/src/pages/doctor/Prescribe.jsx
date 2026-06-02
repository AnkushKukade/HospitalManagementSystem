import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const EMPTY_RX = { symptoms: '', diagnosis: '', medicines_dose: '', dos: '', donts: '', investigations: '', followup_date: '', fees: '' }

export default function Prescribe() {
  const { pid } = useParams()
  const [patient, setPatient] = useState(null)
  const [history, setHistory] = useState([])
  const [rx, setRx] = useState(EMPTY_RX)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/doctor/patient/${pid}`).then(r => setPatient(r.data.patient))
    api.get(`/doctor/patient/${pid}/history`).then(r => setHistory(r.data))
  }, [pid])

  const set = (k, v) => setRx(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    try {
      await api.post(`/doctor/patient/${pid}/prescribe`, { ...rx, fees: Number(rx.fees) || 0 })
      setSuccess('Prescription saved. Patient moved to print queue.')
      setTimeout(() => navigate('/doctor/queue'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save prescription')
    }
  }

  if (!patient) return <p>Loading…</p>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Observe & Prescribe</h1>
        <button className="btn btn-warning" onClick={() => navigate('/doctor/queue')}>← Back to Queue</button>
      </div>

      <div className="card">
        <div className="card-title">Patient Details</div>
        <div className="form-grid">
          <div className="form-group"><label>Patient ID</label><input value={patient.pid} readOnly /></div>
          <div className="form-group"><label>Name</label><input value={`${patient.first_name} ${patient.last_name}`} readOnly /></div>
          <div className="form-group"><label>Gender</label><input value={patient.gender} readOnly /></div>
          <div className="form-group"><label>Blood Group</label><input value={patient.blood_group} readOnly /></div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Chronic Diseases</label><input value={patient.chronic_diseases || '—'} readOnly /></div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Medicine Allergies</label><input value={patient.medicine_allergy || '—'} readOnly /></div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="card">
          <div className="card-title">Past OPD History</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Doctor</th><th>Diagnosis</th><th>Fees</th></tr></thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.opd_id}>
                    <td>{h.visit_date}</td>
                    <td>{h.doctor_name}</td>
                    <td>{h.details?.diagnosis || '—'}</td>
                    <td>₹{h.details?.fees || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Write Prescription</div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Symptoms *</label><textarea value={rx.symptoms} onChange={e => set('symptoms', e.target.value)} required /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Diagnosis *</label><textarea value={rx.diagnosis} onChange={e => set('diagnosis', e.target.value)} required /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Medicines & Dosage *</label><textarea value={rx.medicines_dose} onChange={e => set('medicines_dose', e.target.value)} required placeholder="e.g. Paracetamol 500mg - 1 tablet twice daily for 5 days" /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Do's</label><textarea value={rx.dos} onChange={e => set('dos', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Don'ts</label><textarea value={rx.donts} onChange={e => set('donts', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Investigations</label><textarea value={rx.investigations} onChange={e => set('investigations', e.target.value)} /></div>
            <div className="form-group"><label>Follow-up Date</label><input type="date" value={rx.followup_date} onChange={e => set('followup_date', e.target.value)} /></div>
            <div className="form-group"><label>Fees (₹)</label><input type="number" value={rx.fees} onChange={e => set('fees', e.target.value)} min="0" /></div>
          </div>
          <div className="form-actions">
            <button className="btn btn-success">Save Prescription</button>
          </div>
        </form>
      </div>
    </div>
  )
}
