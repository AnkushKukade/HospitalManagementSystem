import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function PrescriptionPrint() {
  const { opdId } = useParams()
  const [data, setData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/receptionist/prescriptions/${opdId}`).then(r => setData(r.data))
  }, [opdId])

  const markDone = async () => {
    await api.post(`/receptionist/prescriptions/${opdId}/print-done`)
    navigate('/receptionist/prescriptions')
  }

  if (!data) return <p>Loading…</p>
  const { patient, details, doctor_name } = data

  return (
    <div>
      <div className="page-header no-print">
        <h1 className="page-title">Prescription</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => window.print()}>Print</button>
          <button className="btn btn-success" onClick={markDone}>Mark as Printed</button>
          <button className="btn btn-warning" onClick={() => navigate('/receptionist/prescriptions')}>← Back</button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Hospital Management System</h2>
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: 24 }}>OPD Prescription</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          <div><strong>Patient:</strong> {patient?.first_name} {patient?.last_name}</div>
          <div><strong>Patient ID:</strong> {patient?.pid}</div>
          <div><strong>Gender:</strong> {patient?.gender}</div>
          <div><strong>Blood Group:</strong> {patient?.blood_group}</div>
          <div><strong>Doctor:</strong> {doctor_name}</div>
          <div><strong>Visit Date:</strong> {data.opd?.visit_date}</div>
        </div>

        <hr style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

        {details ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <div><strong>Symptoms:</strong><p>{details.symptoms}</p></div>
            <div><strong>Diagnosis:</strong><p>{details.diagnosis}</p></div>
            <div><strong>Medicines & Dosage:</strong><p style={{ whiteSpace: 'pre-line' }}>{details.medicines_dose}</p></div>
            {details.dos && <div><strong>Do's:</strong><p>{details.dos}</p></div>}
            {details.donts && <div><strong>Don'ts:</strong><p>{details.donts}</p></div>}
            {details.investigations && <div><strong>Investigations:</strong><p>{details.investigations}</p></div>}
            {details.followup_date && <div><strong>Follow-up Date:</strong><p>{details.followup_date}</p></div>}
            <div><strong>Fees:</strong> ₹{details.fees}</div>
          </div>
        ) : <p>No prescription details found.</p>}
      </div>
    </div>
  )
}
