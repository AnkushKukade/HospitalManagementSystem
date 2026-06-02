import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const entityId = localStorage.getItem('entity_id')
    if (token && role) setUser({ token, role, entityId })
  }, [])

  const login = (tokenData) => {
    localStorage.setItem('token', tokenData.access_token)
    localStorage.setItem('role', tokenData.role)
    localStorage.setItem('entity_id', tokenData.entity_id)
    setUser({ token: tokenData.access_token, role: tokenData.role, entityId: tokenData.entity_id })
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
