import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'

const EMPTY = {
  first_name: '', middle_name: '', last_name: '', birthdate: '', gender: 'Male',
  email_id: '', mobile_no: '', adhar_no: '', country: 'India', state: '', city: '',
  residential_address: '', permanent_address: '', role: 'doctor',
  qualification: '', specialization: '',
}

export default function EmployeeForm() {
  const { eid } = useParams()
  const isEdit = Boolean(eid)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (isEdit) {
      api.get(`/admin/employees/${eid}`).then(r => {
        const d = r.data
        setForm({ ...d, mobile_no: String(d.mobile_no), adhar_no: String(d.adhar_no), email_id: d.email_id || '' })
      })
    }
  }, [eid])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const payload = { ...form, mobile_no: Number(form.mobile_no), adhar_no: Number(form.adhar_no) }
    try {
      if (isEdit) {
        await api.put(`/admin/employees/${eid}`, payload)
        setSuccess('Employee updated successfully')
      } else {
        const res = await api.post('/admin/employees', payload)
        const eid = res.data.eid
        setSuccess(`Employee added. Username: ${eid} | Default password is their Aadhar number.`)
        setForm(EMPTY)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Operation failed')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Employee' : 'Add Employee'}</h1>
        <button className="btn btn-warning" onClick={() => navigate('/admin/employees')}>← Back</button>
      </div>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
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
            <div className="form-group"><label>Role *</label>
              <select value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="doctor">Doctor</option>
                <option value="receptionist">Receptionist</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
            <div className="form-group"><label>Mobile No *</label><input value={form.mobile_no} onChange={e => set('mobile_no', e.target.value)} required /></div>
            <div className="form-group"><label>Aadhar No *</label><input value={form.adhar_no} onChange={e => set('adhar_no', e.target.value)} required /></div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email_id} onChange={e => set('email_id', e.target.value)} /></div>
            <div className="form-group"><label>Qualification *</label><input value={form.qualification} onChange={e => set('qualification', e.target.value)} required /></div>
            <div className="form-group"><label>Specialization</label><input value={form.specialization} onChange={e => set('specialization', e.target.value)} /></div>
            <div className="form-group"><label>Country</label><input value={form.country} onChange={e => set('country', e.target.value)} /></div>
            <div className="form-group"><label>State</label><input value={form.state} onChange={e => set('state', e.target.value)} /></div>
            <div className="form-group"><label>City</label><input value={form.city} onChange={e => set('city', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Residential Address</label><textarea value={form.residential_address} onChange={e => set('residential_address', e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Permanent Address</label><textarea value={form.permanent_address} onChange={e => set('permanent_address', e.target.value)} /></div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary">{isEdit ? 'Update Employee' : 'Add Employee'}</button>
            <button type="button" className="btn btn-warning" onClick={() => navigate('/admin/employees')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
