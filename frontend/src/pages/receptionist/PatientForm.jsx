import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'

const EMPTY = {
  first_name: '', middle_name: '', last_name: '', birthdate: '', gender: 'Male',
  email_id: '', mobile_no: '', adhar_no: '', country: 'India', state: '', city: '',
  residential_address: '', permanent_address: '', blood_group: 'A+',
  chronic_diseases: '', medicine_allergy: '', doctor_id: '',
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function PatientForm() {
  const { pid } = useParams()
  const isEdit = Boolean(pid)
  const [form, setForm] = useState(EMPTY)
  const [doctors, setDoctors] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newPid, setNewPid] = useState(null)
  const [opdMsg, setOpdMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/receptionist/doctors').then(r => setDoctors(r.data))
    if (isEdit) {
      api.get(`/receptionist/patients/${pid}`).then(r => {
        const d = r.data
        setForm({ ...d, mobile_no: String(d.mobile_no), adhar_no: String(d.adhar_no), email_id: d.email_id || '' })
      })
    }
  }, [pid])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const payload = { ...form, mobile_no: Number(form.mobile_no), adhar_no: Number(form.adhar_no) }
    try {
      if (isEdit) {
        await api.put(`/receptionist/patients/${pid}`, payload)
        setSuccess('Patient updated successfully')
      } else {
        const res = await api.post('/receptionist/patients', payload)
        setNewPid(res.data.pid)
        setSuccess(`Patient registered successfully (ID: ${res.data.pid})`)
        setOpdMsg('')
        setForm(EMPTY)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Operation failed')
    }
  }

  const addToOpd = async () => {
    try {
      const res = await api.post(`/receptionist/opd/${newPid}`)
      setOpdMsg(res.data.message)
      if (res.data.status === 1) setNewPid(null)
    } catch {
      setOpdMsg('Failed to add to OPD queue')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Patient' : 'Add Patient'}</h1>
        <button className="btn btn-warning" onClick={() => navigate('/receptionist/patients/search')}>← Back</button>
      </div>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {newPid && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <button className="btn btn-success" onClick={addToOpd}>+ Add to OPD Queue</button>
            {opdMsg && <span style={{ fontSize: '0.85rem', color: '#2b6cb0' }}>{opdMsg}</span>}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>First Name *</label><input value={form.first_name} onChange={e => set('first_name', e.target.value)} required /></div>
            <div className="form-group"><label>Middle Name</label><input value={form.middle_name} onChange={e => set('middle_name', e.target.value)} /></div>
            <div className="form-group"><label>Last Name *</label><input value={form.last_name} onChange={e => set('last_name', e.target.value)} required /></div>
            <div className="form-group"><label>Birthdate *</label><input type="date" value={form.birthdate} onChange={e => set('birthdate', e.target.value)} required /></div>
            <div className="form-group"><label>Gender *</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-group"><label>Blood Group *</label>
              <select value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Mobile No *</label><input value={form.mobile_no} onChange={e => set('mobile_no', e.target.value)} required /></div>
            <div className="form-group"><label>Aadhar No *</label><input value={form.adhar_no} onChange={e => set('adhar_no', e.target.value)} required /></div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email_id} onChange={e => set('email_id', e.target.value)} /></div>
            <div className="form-group"><label>Assign Doctor *</label>
              <select value={form.doctor_id} onChange={e => set('doctor_id', e.target.value)} required>
                <option value="">-- Select Doctor --</option>
                {doctors.map(d => <option key={d.eid} value={d.eid}>{d.name} ({d.eid})</option>)}
              </select>
            </div>
            <div className="form-group"><label>Country</label><input value={form.country} onChange={e => set('country', e.target.value)} /></div>
            <div className="form-group"><label>State</label><input value={form.state} onChange={e => set('state', e.target.value)} /></div>
            <div className="form-group"><label>City</label><input value={form.city} onChange={e => set('city', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Residential Address</label><textarea value={form.residential_address} onChange={e => set('residential_address', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Chronic Diseases</label><textarea value={form.chronic_diseases} onChange={e => set('chronic_diseases', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Medicine Allergies</label><textarea value={form.medicine_allergy} onChange={e => set('medicine_allergy', e.target.value)} /></div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary">{isEdit ? 'Update Patient' : 'Register Patient'}</button>
            <button type="button" className="btn btn-warning" onClick={() => navigate('/receptionist/patients/search')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
