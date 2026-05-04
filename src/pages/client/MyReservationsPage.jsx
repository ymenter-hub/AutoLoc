import { useEffect, useState } from 'react'
import { CalendarDays, Car } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Badge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import styles from './Client.module.css'
import { format } from 'date-fns'

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('reservations')
      .select('*, vehicle:vehicles(brand, model, color, image_url, daily_price)')
      .order('created_at', { ascending: false })
    setReservations(data ?? [])
    setLoading(false)
  }

  function showToast(msg, type = 'info') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function cancelReservation(id) {
    setCancelling(id)
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('status', 'pending') // safety: only cancel if still pending
    if (!error) {
      setReservations(rs => rs.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))
      showToast('Reservation cancelled.', 'info')
    } else {
      showToast('Could not cancel. Try again.', 'error')
    }
    setCancelling(null)
  }

  return (
    <div className="fade-up">
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>My Bookings</h1>
          <p className={styles.sub}>All your reservation history</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}><div className="spinner" /></div>
      ) : reservations.length === 0 ? (
        <div className={styles.empty}>
          <CalendarDays size={36} color="var(--text-muted)" />
          <p>You have no reservations yet.</p>
        </div>
      ) : (
        <div className={styles.resList}>
          {reservations.map(r => (
            <div key={r.id} className={styles.resCard}>
              <div className={styles.resThumb}>
                {r.vehicle?.image_url
                  ? <img src={r.vehicle.image_url} alt="" />
                  : <Car size={24} color="var(--text-muted)" />}
              </div>
              <div className={styles.resInfo}>
                <div className={styles.resTop}>
                  <h3 className={styles.resName}>{r.vehicle?.brand} {r.vehicle?.model}</h3>
                  <Badge status={r.status} />
                </div>
                <div className={styles.resDates}>
                  <CalendarDays size={13} />
                  {r.start_date} → {r.end_date}
                </div>
                {r.notes && <p className={styles.resNotes}>{r.notes}</p>}
                <div className={styles.resFooter}>
                  <span className={styles.resPrice}>{r.total_price} DZD total</span>
                  {r.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={cancelling === r.id}
                      onClick={() => cancelReservation(r.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  )
}
