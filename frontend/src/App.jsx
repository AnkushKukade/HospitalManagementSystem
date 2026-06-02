import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Profile from './pages/Profile'
import ChangeCredentials from './pages/ChangeCredentials'

import AdminDashboard from './pages/admin/Dashboard'
import EmployeeList from './pages/admin/EmployeeList'
import EmployeeForm from './pages/admin/EmployeeForm'
import SearchEmployee from './pages/admin/SearchEmployee'

import PatientForm from './pages/receptionist/PatientForm'
import SearchPatient from './pages/receptionist/SearchPatient'
import OpdQueue from './pages/receptionist/OpdQueue'
import PrescriptionQueue from './pages/receptionist/PrescriptionQueue'
import PrescriptionPrint from './pages/receptionist/PrescriptionPrint'

import PatientQueue from './pages/doctor/PatientQueue'
import Prescribe from './pages/doctor/Prescribe'

const A = 'administrator'
const R = 'receptionist'
const D = 'doctor'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Shared */}
          <Route path="/profile" element={<ProtectedRoute roles={[A, R, D]}><Profile /></ProtectedRoute>} />
          <Route path="/change-credentials" element={<ProtectedRoute roles={[A, R, D]}><ChangeCredentials /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={[A]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/employees" element={<ProtectedRoute roles={[A]}><EmployeeList /></ProtectedRoute>} />
          <Route path="/admin/employees/add" element={<ProtectedRoute roles={[A]}><EmployeeForm /></ProtectedRoute>} />
          <Route path="/admin/employees/search" element={<ProtectedRoute roles={[A]}><SearchEmployee /></ProtectedRoute>} />
          <Route path="/admin/employees/:eid/edit" element={<ProtectedRoute roles={[A]}><EmployeeForm /></ProtectedRoute>} />

          {/* Receptionist */}
          <Route path="/receptionist/patients/add" element={<ProtectedRoute roles={[R]}><PatientForm /></ProtectedRoute>} />
          <Route path="/receptionist/patients/search" element={<ProtectedRoute roles={[R]}><SearchPatient /></ProtectedRoute>} />
          <Route path="/receptionist/patients/:pid/edit" element={<ProtectedRoute roles={[R]}><PatientForm /></ProtectedRoute>} />
          <Route path="/receptionist/opd" element={<ProtectedRoute roles={[R]}><OpdQueue /></ProtectedRoute>} />
          <Route path="/receptionist/prescriptions" element={<ProtectedRoute roles={[R]}><PrescriptionQueue /></ProtectedRoute>} />
          <Route path="/receptionist/prescriptions/:opdId" element={<ProtectedRoute roles={[R]}><PrescriptionPrint /></ProtectedRoute>} />

          {/* Doctor */}
          <Route path="/doctor/queue" element={<ProtectedRoute roles={[D]}><PatientQueue /></ProtectedRoute>} />
          <Route path="/doctor/patient/:pid" element={<ProtectedRoute roles={[D]}><Prescribe /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
