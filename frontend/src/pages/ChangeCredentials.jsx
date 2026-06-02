import { useState } from 'react'
import api from '../api/axios'

export default function ChangeCredentials() {
  const [form, setForm] = useState({ new_username: '', new_password: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg(''); setError('')
    try {
      await api.put('/auth/change-credentials', form)
      setMsg('Credentials updated. Please login again.')
      setTimeout(() => { localStorage.clear(); window.location.href = '/login' }, 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed')
    }
  }

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Change Credentials</h1></div>
      <div className="card" style={{ maxWidth: 480 }}>
        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>New Username</label>
            <input value={form.new_username} onChange={e => setForm(f => ({ ...f, new_username: e.target.value }))} required />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>New Password</label>
            <input type="password" value={form.new_password} onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))} required />
          </div>
          <button className="btn btn-primary">Update Credentials</button>
        </form>
      </div>
    </div>
  )
}
