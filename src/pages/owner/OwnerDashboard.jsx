import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Car, ClipboardList, Clock, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Badge } from '../../components/ui/Badge'
import styles from './Owner.module.css'

export default function OwnerDashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ vehicles: 0, pending: 0, confirmed: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Count vehicles
      const { count: vCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)

      // Get reservations on owner's vehicles
      const { data: resData } = await supabase
        .from('reservations')
        .select('*, vehicle:vehicles!inner(brand, model, owner_id), client:profiles(full_name)')
        .eq('vehicle.owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6)

      const pending   = (resData ?? []).filter(r => r.status === 'pending').length
      const confirmed = (resData ?? []).filter(r => r.status === 'confirmed').length

      setStats({ vehicles: vCount ?? 0, pending, confirmed })
      setRecent(resData ?? [])
      setLoading(false)
    }
    load()
  }, [user.id])

  return (
    <div className="fade-up">
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Agency Dashboard</h1>
          <p className={styles.sub}>Welcome back, {profile?.full_name}</p>
        </div>
        <Link to="/owner/vehicles" className={styles.ctaLink}>+ Add Vehicle</Link>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <Car size={22} color="var(--red)" />
          <div>
            <span className={styles.statNum}>{stats.vehicles}</span>
            <span className={styles.statLabel}>Vehicles</span>
          </div>
        </div>
        <div className={styles.stat}>
          <Clock size={22} color="var(--yellow)" />
          <div>
            <span className={styles.statNum}>{stats.pending}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </div>
        <div className={styles.stat}>
          <CheckCircle2 size={22} color="var(--green)" />
          <div>
            <span className={styles.statNum}>{stats.confirmed}</span>
            <span className={styles.statLabel}>Confirmed</span>
          </div>
        </div>
      </div>

      {/* Recent reservations */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Latest Requests</h2>
          <Link to="/owner/reservations" className={styles.seeAll}>Manage all →</Link>
        </div>

        {loading ? (
          <div className={styles.empty}><div className="spinner" /></div>
        ) : recent.length === 0 ? (
          <div className={styles.empty}>
            <ClipboardList size={32} color="var(--text-muted)" />
            <p>No reservations yet.</p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Client</span>
              <span>Vehicle</span>
              <span>Dates</span>
              <span>Price</span>
              <span>Status</span>
            </div>
            {recent.map(r => (
              <div key={r.id} className={styles.tableRow}>
                <span className={styles.clientName}>{r.client?.full_name}</span>
                <span>{r.vehicle?.brand} {r.vehicle?.model}</span>
                <span className={styles.dates}>{r.start_date} → {r.end_date}</span>
                <span>{r.total_price} DZD</span>
                <Badge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
