import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Car, ClipboardList } from 'lucide-react'
import Navbar from './Navbar'
import styles from './Layout.module.css'

const OWNER_LINKS = [
  { to: '/owner/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/owner/vehicles',      label: 'My Fleet',      icon: Car },
  { to: '/owner/reservations',  label: 'Reservations',  icon: ClipboardList },
]

export default function OwnerLayout() {
  return (
    <div className={styles.root}>
      <Navbar links={OWNER_LINKS} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
