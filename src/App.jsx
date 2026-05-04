import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'

// Client pages
import ClientLayout from './components/layout/ClientLayout'
import ClientDashboard from './pages/client/ClientDashboard'
import VehiclesPage from './pages/client/VehiclesPage'
import MyReservationsPage from './pages/client/MyReservationsPage'

// Owner pages
import OwnerLayout from './components/layout/OwnerLayout'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import ManageVehiclesPage from './pages/owner/ManageVehiclesPage'
import ManageReservationsPage from './pages/owner/ManageReservationsPage'

// Shared
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
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!session ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Smart redirect based on role */}
      <Route
        path="/dashboard"
        element={
          !session ? <Navigate to="/login" /> :
          profile?.role === 'owner' ? <Navigate to="/owner/dashboard" /> :
          <Navigate to="/client/dashboard" />
        }
      />

      {/* CLIENT routes */}
      <Route
        path="/client"
        element={
          session && profile?.role === 'client'
            ? <ClientLayout />
            : <Navigate to="/login" />
        }
      >
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="reservations" element={<MyReservationsPage />} />
      </Route>

      {/* OWNER routes */}
      <Route
        path="/owner"
        element={
          session && profile?.role === 'owner'
            ? <OwnerLayout />
            : <Navigate to="/login" />
        }
      >
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="vehicles" element={<ManageVehiclesPage />} />
        <Route path="reservations" element={<ManageReservationsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
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
