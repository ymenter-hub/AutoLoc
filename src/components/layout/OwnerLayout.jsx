import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Car, ClipboardList } from 'lucide-react'
import Navbar from './Navbar'

const OWNER_LINKS = [
  { to: '/owner/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/owner/vehicles',      label: 'My Fleet',      icon: Car },
  { to: '/owner/reservations',  label: 'Reservations',  icon: ClipboardList },
]

export default function OwnerLayout() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <Navbar links={OWNER_LINKS} />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
