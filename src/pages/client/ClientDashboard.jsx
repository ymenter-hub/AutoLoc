import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Car, CalendarDays, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Badge } from '../../components/ui/Badge'
import styles from './Client.module.css'

export default function ClientDashboard() {
  const { profile } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('reservations')
        .select('*, vehicle:vehicles(brand, model, image_url)')
        .order('created_at', { ascending: false })
        .limit(5)
      setReservations(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const counts = {
    pending:   reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    rejected:  reservations.filter(r => r.status === 'rejected').length,
  }

  return (
    <div className="fade-up">
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Good to see you, {profile?.full_name?.split(' ')[0]} 👋</h1>
          <p className={styles.sub}>Here's a summary of your rental activity.</p>
        </div>
        <Link to="/client/vehicles" className={styles.ctaLink}>Browse Cars →</Link>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <Clock size={20} color="var(--yellow)" />
          <div>
            <span className={styles.statNum}>{counts.pending}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </div>
        <div className={styles.stat}>
          <CheckCircle2 size={20} color="var(--green)" />
          <div>
            <span className={styles.statNum}>{counts.confirmed}</span>
            <span className={styles.statLabel}>Confirmed</span>
          </div>
        </div>
        <div className={styles.stat}>
          <XCircle size={20} color="var(--red)" />
          <div>
            <span className={styles.statNum}>{counts.rejected}</span>
            <span className={styles.statLabel}>Rejected</span>
          </div>
        </div>
      </div>

      {/* Recent reservations */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Bookings</h2>
          <Link to="/client/reservations" className={styles.seeAll}>See all</Link>
        </div>

        {loading ? (
          <div className={styles.empty}><div className="spinner" /></div>
        ) : reservations.length === 0 ? (
          <div className={styles.empty}>
            <Car size={32} color="var(--text-muted)" />
            <p>No bookings yet. <Link to="/client/vehicles" className={styles.switchLink}>Find a car</Link></p>
          </div>
        ) : (
          <div className={styles.list}>
            {reservations.map(r => (
              <div key={r.id} className={styles.listItem}>
                <div className={styles.vehicleThumb}>
                  {r.vehicle?.image_url
                    ? <img src={r.vehicle.image_url} alt="" />
                    : <Car size={20} color="var(--text-muted)" />}
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{r.vehicle?.brand} {r.vehicle?.model}</span>
                  <span className={styles.itemDates}>{r.start_date} → {r.end_date}</span>
                </div>
                <div className={styles.itemRight}>
                  <Badge status={r.status} />
                  <span className={styles.itemPrice}>{r.total_price} DZD</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
