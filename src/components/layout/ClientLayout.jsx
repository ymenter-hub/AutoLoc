import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Car, CalendarDays } from 'lucide-react'
import Navbar from './Navbar'
import styles from './Layout.module.css'

const CLIENT_LINKS = [
  { to: '/client/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/client/vehicles',     label: 'Browse Cars',   icon: Car },
  { to: '/client/reservations', label: 'My Bookings',   icon: CalendarDays },
]

export default function ClientLayout() {
  return (
    <div className={styles.root}>
      <Navbar links={CLIENT_LINKS} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
