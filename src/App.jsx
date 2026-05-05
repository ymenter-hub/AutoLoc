import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ToastProvider } from './contexts/ToastContext'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'

import ClientLayout from './components/layout/ClientLayout'
import ClientDashboard from './pages/client/ClientDashboard'
import VehiclesPage from './pages/client/VehiclesPage'
import MyReservationsPage from './pages/client/MyReservationsPage'
import NotificationsPageClient from './pages/client/NotificationsPage'

import OwnerLayout from './components/layout/OwnerLayout'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import ManageVehiclesPage from './pages/owner/ManageVehiclesPage'
import ManageReservationsPage from './pages/owner/ManageReservationsPage'
import NotificationsPageOwner from './pages/owner/NotificationsPage'

import LandingPage from './pages/LandingPage'
import ProfilePage from './pages/ProfilePage'

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function AppLoader() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="h-10 w-48 rounded-xl skeleton" />
        <div className="h-6 w-72 rounded-lg skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 rounded-2xl skeleton" />
          <div className="h-32 rounded-2xl skeleton" />
          <div className="h-32 rounded-2xl skeleton" />
        </div>
        <div className="h-48 rounded-2xl skeleton" />
      </div>
    </div>
  )
}

function AppRoutes() {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AppLoader />

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
      {/* Public */}
      <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
      <Route path="/login"    element={!session ? <PageTransition><LoginPage /></PageTransition>    : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!session ? <PageTransition><RegisterPage /></PageTransition> : <Navigate to="/dashboard" replace />} />
      <Route path="/verify-email" element={<PageTransition><VerifyEmailPage /></PageTransition>} />

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
        <Route path="dashboard"     element={<PageTransition><ClientDashboard /></PageTransition>} />
        <Route path="vehicles"      element={<PageTransition><VehiclesPage /></PageTransition>} />
        <Route path="reservations"  element={<PageTransition><MyReservationsPage /></PageTransition>} />
        <Route path="notifications" element={<PageTransition><NotificationsPageClient /></PageTransition>} />
        <Route path="profile"       element={<PageTransition><ProfilePage /></PageTransition>} />
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
        <Route path="dashboard"     element={<PageTransition><OwnerDashboard /></PageTransition>} />
        <Route path="vehicles"      element={<PageTransition><ManageVehiclesPage /></PageTransition>} />
        <Route path="reservations"  element={<PageTransition><ManageReservationsPage /></PageTransition>} />
        <Route path="notifications" element={<PageTransition><NotificationsPageOwner /></PageTransition>} />
        <Route path="profile"       element={<PageTransition><ProfilePage /></PageTransition>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
