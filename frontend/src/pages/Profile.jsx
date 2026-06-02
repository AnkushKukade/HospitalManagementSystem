import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Profile() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    api.get('/auth/me').then(r => setProfile(r.data))
  }, [])

  if (!profile) return <p>Loading…</p>

  return (
    <div>
      <div className="page-header"><h1 className="page-title">My Profile</h1></div>
      <div className="card">
        <div className="form-grid">
          {Object.entries(profile).map(([key, val]) => (
            <div className="form-group" key={key}>
              <label>{key.replace(/_/g, ' ')}</label>
              <input value={val ?? '—'} readOnly />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
