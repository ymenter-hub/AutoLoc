import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Car, CalendarDays } from 'lucide-react'
import Navbar from './Navbar'

const CLIENT_LINKS = [
  { to: '/client/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/client/vehicles',     label: 'Browse Cars',   icon: Car },
  { to: '/client/reservations', label: 'My Bookings',   icon: CalendarDays },
]

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <Navbar links={CLIENT_LINKS} />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
