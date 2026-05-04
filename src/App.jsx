import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'

import ClientLayout from './components/layout/ClientLayout'
import ClientDashboard from './pages/client/ClientDashboard'
import VehiclesPage from './pages/client/VehiclesPage'
import MyReservationsPage from './pages/client/MyReservationsPage'

import OwnerLayout from './components/layout/OwnerLayout'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import ManageVehiclesPage from './pages/owner/ManageVehiclesPage'
import ManageReservationsPage from './pages/owner/ManageReservationsPage'

import LandingPage from './pages/LandingPage'

function AppRoutes() {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"    element={!session ? <LoginPage />    : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!session ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Smart redirect: wait until profile is known */}
      <Route
        path="/dashboard"
        element={
          !session
            ? <Navigate to="/login" replace />
            : profile?.role === 'owner'
              ? <Navigate to="/owner/dashboard" replace />
              : <Navigate to="/client/dashboard" replace />
        }
      />

      {/* CLIENT */}
      <Route
        path="/client"
        element={
          session && (profile?.role === 'client' || !profile)
            ? <ClientLayout />
            : !session
              ? <Navigate to="/login" replace />
              : <Navigate to="/owner/dashboard" replace />
        }
      >
        <Route path="dashboard"    element={<ClientDashboard />} />
        <Route path="vehicles"     element={<VehiclesPage />} />
        <Route path="reservations" element={<MyReservationsPage />} />
      </Route>

      {/* OWNER */}
      <Route
        path="/owner"
        element={
          session && profile?.role === 'owner'
            ? <OwnerLayout />
            : !session
              ? <Navigate to="/login" replace />
              : <Navigate to="/client/dashboard" replace />
        }
      >
        <Route path="dashboard"    element={<OwnerDashboard />} />
        <Route path="vehicles"     element={<ManageVehiclesPage />} />
        <Route path="reservations" element={<ManageReservationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
